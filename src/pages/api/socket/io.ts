import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponse } from "next";

export type NextApiResponseServerIo = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

// Module-level in-memory state of voice channel users
// Map: socketId -> { channelId, serverId, userId, userName }
const socketToUser = new Map<string, { channelId: string; serverId: string; userId: string; userName: string }>();

// Map: channelId -> Map of userId -> userName
const channelUsers = new Map<string, Map<string, string>>();

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      // Send current state to newly connected client on request
      socket.on("request-voice-state", () => {
        const state: Record<string, Array<{ userId: string; userName: string }>> = {};
        channelUsers.forEach((usersMap, channelId) => {
          state[channelId] = Array.from(usersMap.entries()).map(([userId, userName]) => ({
            userId,
            userName,
          }));
        });
        socket.emit("voice-state-update", state);
      });

      socket.on("join-voice", ({ channelId, serverId, userId, userName }) => {
        // Track the user socket connection
        socketToUser.set(socket.id, { channelId, serverId, userId, userName });

        if (!channelUsers.has(channelId)) {
          channelUsers.set(channelId, new Map());
        }
        channelUsers.get(channelId)!.set(userId, userName);

        // Broadcast general state update
        const state: Record<string, Array<{ userId: string; userName: string }>> = {};
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
          channelUsers.get(channelId)!.delete(userId);
          if (channelUsers.get(channelId)!.size === 0) {
            channelUsers.delete(channelId);
          }
        }

        // Broadcast general state update
        const state: Record<string, Array<{ userId: string; userName: string }>> = {};
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
            channelUsers.get(channelId)!.delete(userId);
            if (channelUsers.get(channelId)!.size === 0) {
              channelUsers.delete(channelId);
            }
          }

          // Broadcast general state update
          const state: Record<string, Array<{ userId: string; userName: string }>> = {};
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

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
