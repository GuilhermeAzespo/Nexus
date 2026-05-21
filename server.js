const path = require('path');
const http = require('http');
const { Server } = require("socket.io");

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.HOSTNAME || '0.0.0.0';

let nextServer;
let handle;

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_DEV_CUSTOM) {
  // Production Standalone mode: requires no webpack / build dependencies
  process.env.NEXT_RUNTIME = 'nodejs';
  const currentDir = path.join(__dirname);
  const requiredFiles = require(path.join(currentDir, '.next/required-server-files.json'));
  const NextServer = require('next/dist/server/next-server').default;

  nextServer = new NextServer({
    hostname,
    port,
    dir: currentDir,
    dev: false,
    config: requiredFiles.config,
    minimalMode: true
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
      
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
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
