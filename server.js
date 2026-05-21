const path = require('path');
const http = require('http');
const { Server } = require("socket.io");

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.HOSTNAME || '0.0.0.0';
const currentDir = path.join(__dirname);

let nextServer;
let handle;

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_DEV_CUSTOM) {
  // Production Standalone mode: requires no webpack / build dependencies
  process.env.NEXT_RUNTIME = 'nodejs';
  const requiredFiles = require(path.join(currentDir, '.next/required-server-files.json'));
  const NextServer = require('next/dist/server/next-server').default;

  nextServer = new NextServer({
    hostname,
    port,
    dir: currentDir,
    dev: false,
    conf: requiredFiles.config,
    minimalMode: false
  });
  handle = nextServer.getRequestHandler();
  startServer();
} else {
  // Local development / fallback mode: requires standard next setup
  const next = require("next");
  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev, hostname, port });
  handle = app.getRequestHandler();
  
  app.prepare().then(() => {
    startServer();
  });
}

function startServer() {
  const server = http.createServer((req, res) => {
    try {
      // Attach io to res.socket.server so Next.js pages API routes can access it
      res.socket.server.io = io;
      
      const { parse } = require("url");
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;
      const fs = require('fs');

      // 1. Manually serve Next.js compiled static files
      if (pathname && pathname.startsWith("/_next/static/")) {
        const decodedPathname = decodeURIComponent(pathname);
        const relativePath = decodedPathname.replace("/_next/static/", "");
        const filePath = path.join(currentDir, ".next/static", relativePath);
        const exists = fs.existsSync(filePath);
        
        console.log(`[Static Intercept] Path: ${pathname} | Decoded: ${decodedPathname} | Resolves: ${filePath} | Exists: ${exists}`);
        
        if (exists) {
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            let contentType = "application/octet-stream";
            if (decodedPathname.endsWith(".js")) contentType = "application/javascript";
            else if (decodedPathname.endsWith(".css")) contentType = "text/css";
            else if (decodedPathname.endsWith(".json")) contentType = "application/json";
            else if (decodedPathname.endsWith(".png")) contentType = "image/png";
            else if (decodedPathname.endsWith(".jpg") || decodedPathname.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (decodedPathname.endsWith(".svg")) contentType = "image/svg+xml";
            else if (decodedPathname.endsWith(".woff")) contentType = "font/woff";
            else if (decodedPathname.endsWith(".woff2")) contentType = "font/woff2";
            else if (decodedPathname.endsWith(".ttf")) contentType = "font/ttf";
            else if (decodedPathname.endsWith(".otf")) contentType = "font/otf";

            res.writeHead(200, {
              "Content-Type": contentType,
              "Content-Length": stat.size,
              "Cache-Control": "public, max-age=31536000, immutable"
            });

            const readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
            return;
          }
        }
      }

      // 2. Manually serve public directory files
      if (pathname && pathname !== "/") {
        const decodedPathname = decodeURIComponent(pathname);
        const publicFilePath = path.join(currentDir, "public", decodedPathname);
        const exists = fs.existsSync(publicFilePath);
        
        if (exists) {
          const stat = fs.statSync(publicFilePath);
          if (stat.isFile()) {
            let contentType = "application/octet-stream";
            if (decodedPathname.endsWith(".js")) contentType = "application/javascript";
            else if (decodedPathname.endsWith(".css")) contentType = "text/css";
            else if (decodedPathname.endsWith(".json")) contentType = "application/json";
            else if (decodedPathname.endsWith(".png")) contentType = "image/png";
            else if (decodedPathname.endsWith(".jpg") || decodedPathname.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (decodedPathname.endsWith(".svg")) contentType = "image/svg+xml";
            else if (decodedPathname.endsWith(".ico")) contentType = "image/x-icon";

            res.writeHead(200, {
              "Content-Type": contentType,
              "Content-Length": stat.size,
              "Cache-Control": "public, max-age=3600"
            });

            const readStream = fs.createReadStream(publicFilePath);
            readStream.pipe(res);
            return;
          }
        }
      }

      handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(server, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Track users in voice channels in-memory
  const socketToUser = new Map();
  const channelUsers = new Map();

  io.on("connection", (socket) => {
    // Send current state to newly connected client on request
    socket.on("request-voice-state", () => {
      const state = {};
      channelUsers.forEach((usersMap, channelId) => {
        state[channelId] = Array.from(usersMap.entries()).map(([userId, userName]) => ({
          userId,
          userName,
        }));
      });
      socket.emit("voice-state-update", state);
    });

    socket.on("join-voice", ({ channelId, serverId, userId, userName }) => {
      socketToUser.set(socket.id, { channelId, serverId, userId, userName });

      if (!channelUsers.has(channelId)) {
        channelUsers.set(channelId, new Map());
      }
      channelUsers.get(channelId).set(userId, userName);

      // Broadcast general state update
      const state = {};
      channelUsers.forEach((usersMap, cId) => {
        state[cId] = Array.from(usersMap.entries()).map(([uId, uName]) => ({
          userId: uId,
          userName: uName,
        }));
      });
      io.emit("voice-state-update", state);
    });

    socket.on("leave-voice", ({ channelId, userId }) => {
      socketToUser.delete(socket.id);

      if (channelUsers.has(channelId)) {
        channelUsers.get(channelId).delete(userId);
        if (channelUsers.get(channelId).size === 0) {
          channelUsers.delete(channelId);
        }
      }

      // Broadcast general state update
      const state = {};
      channelUsers.forEach((usersMap, cId) => {
        state[cId] = Array.from(usersMap.entries()).map(([uId, uName]) => ({
          userId: uId,
          userName: uName,
        }));
      });
      io.emit("voice-state-update", state);
    });

    socket.on("disconnect", () => {
      const userData = socketToUser.get(socket.id);
      if (userData) {
        const { channelId, userId } = userData;
        socketToUser.delete(socket.id);

        if (channelUsers.has(channelId)) {
          channelUsers.get(channelId).delete(userId);
          if (channelUsers.get(channelId).size === 0) {
            channelUsers.delete(channelId);
          }
        }

        // Broadcast general state update
        const state = {};
        channelUsers.forEach((usersMap, cId) => {
          state[cId] = Array.from(usersMap.entries()).map(([uId, uName]) => ({
            userId: uId,
            userName: uName,
          }));
        });
        io.emit("voice-state-update", state);
      }
    });
  });

  server.once("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}
