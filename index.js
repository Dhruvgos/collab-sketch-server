import http from "http";
import { Server } from "socket.io";

// Create an HTTP server
const server = http.createServer();

// Create a Socket.IO server by passing the HTTP server instance
const io = new Server(server, { cors: "*" });
let rname = "";
let userSocketMap = new Map();
io.on("connection", (socket) => {
  // console.log(socket.id, " connected");

  socket.on("client-ready", (roomName) => {});

  socket.on('send-user', (username) => {
    userSocketMap.set(username.name, username.sid);
    // emitOnlineUsers();
    // console.log("Updated userSocketMap:", userSocketMap);

});

  socket.emit("sid", socket.id);
  socket.on("join-room", (roomname,messages) => {
    socket.join(roomname);
    // console.log(messages)
    const socketsInRoom = io.sockets.adapter.rooms.get(roomname); // Get all sockets in the room
    const socketIds = socketsInRoom ? Array.from(socketsInRoom) : []; // Extract socket IDs
    io.to(roomname).emit("sockets-in-room", socketIds); // Emit the array of socket


    io.to(socketIds[0]).emit("get-canvas-state", roomname);
    io.to(socketIds[0]).emit("get-messages",roomname);
    
    // console.log(socket.id, "joined", roomname);
  });

  socket.on("canvas-state", (state) => {
    if (state && state.roomName && state.socketsByRoom) {
      const i = state.socketsByRoom.length - 1;
      socket
        .to(state.socketsByRoom[i])
        .emit("canvas-state-from-server", state.url);
    }
  });
  socket.on("message-array", (state) => {
    if (state && state.messages && state.roomname) {
      // const i = state.socketsByRoom.length - 1;
      console.log(state)
      socket
        .to(state.id)
        .emit("message-state-from-server", state.messages);
    }
  });

  socket.on("leave-room", (roomName) => {
    userSocketMap.forEach((value, key) => {
      if (value === socket.id) {
          userSocketMap.delete(key);
      }
  });
    socket.leave(roomName);
  });

  socket.on("draw", (data) => {
    socket.to(data.roomName).emit("draw", data);
  });

  socket.on("write", (data) => {
    io.to(data.roomName).emit("write", data);
  });

  socket.on("rectangle", (data) => {
    socket.to(data.roomName).emit("rectangle", data);
  });
  socket.on("circle", (data) => {
    socket.to(data.roomName).emit("circle", data);
  });
  socket.on("message", (data) => {
    // console.log(data)
    socket.to(data.roomName).emit("message", data);
  });

  socket.on("clear", (roomName) => io.to(roomName).emit("clear"));
  socket.on("disconnect", () => {
    // console.log(socket.id, " disconnected");
  });
  socket.on('getChatHistory', () => {
    
 
  });

});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
