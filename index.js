import http from 'http';
import { Server } from 'socket.io';

// Create an HTTP server
const server = http.createServer()

// Create a Socket.IO server by passing the HTTP server instance
const io = new Server(server,{cors:'*'});
let rname= ''
io.on('connection', (socket) => {
  console.log( socket.id ,' connected');

  socket.on('client-ready', (roomName) => {
    console.log("done jaa rha")
    // io.to(roomName).emit('get-canvas-state',roomName) 
    // socket.emit('get-canvas-state',roomName)          
    // io.to(roomName).emit('get-canvas-state')
  })
  socket.emit('sid',socket.id);
  socket.on('join-room',(roomname)=>{
    // console.log(sg)
    socket.join(roomname)
    const socketsInRoom = io.sockets.adapter.rooms.get(roomname); // Get all sockets in the room
    const socketIds = socketsInRoom ? Array.from(socketsInRoom) : []; // Extract socket IDs
    io.to(roomname).emit('sockets-in-room', socketIds); // Emit the array of socket
    
    // socket.to(roomname).emit('get-canvas-state',roomname)
    io.to(socketIds[0]).emit('get-canvas-state',roomname)
    // socket.to(roomname).emit('get-canvas-state',roomname);
    console.log(socket.id,"joined",roomname)
  })
 
  
  // socket.on('canvas-state', (state) => {
  //   console.log('received canvas state')
    
  //   // console.log("line 29",state.roomName)
  //   if(state.roomName){
  //     //  io.to(state.roomName).emit('canvas-state-from-server',state.url);
  //     console.log("is socekt ki bat",socket.id)
  //     console.log(state.socketsByRoom)
  //     socket.to(state.roomName).except(state.socketsByRoom).emit('canvas-state-from-server',state.url)   ///i guess logic yaha lgega kyuki at this point wo sare sockets jinhone state di h wwo unko hi state bej rhe hai
  //     // io.to(state.roomName).emit('canvas-state-from-server',state.url)   ///i guess logic yaha lgega kyuki at this point wo sare sockets jinhone state di h wwo unko hi state bej rhe hai
  //     // socket.emit('canvas-state-from-server',state.url)
  //   }
  // })
  socket.on('canvas-state', (state) => {
    console.log('received canvas state');
    
    // Ensure that the state object contains the necessary properties
    if (state && state.roomName && state.socketsByRoom) {
        console.log("Current socket ID:", socket.id);
        console.log("Sockets in the room:", state.socketsByRoom);

        // Emit the canvas state to all sockets in the room except the sender
        // state.socketsByRoom.forEach((socketId) => {
        //     if (socketId !== socket.id) {
          const i = state.socketsByRoom.length-1;
          socket.to(state.socketsByRoom[i]).emit('canvas-state-from-server', state.url)
                // socket.to(state.roomName).except(state.socketsByRoom).emit('canvas-state-from-server', state.url);
            // }
        // });
    }
});


  socket.on('leave-room',roomName=>{
    socket.leave(roomName)
    console.log(socket.id,"leaves",roomName)
  })

  socket.on('draw', (data) => {
    // console.log("line 34",data)
    // socket.broadcast.emit('draw', data); // Broadcast to other clients
    console.log("the roomanme is : ", data.roomName)
    io.to(data.roomName).emit('draw',data);
    
  });
  
  socket.on('write',(data)=>{
    console.log(data)
    // io.to(data.roomName).emit('write',data);
    io.to(data.roomName).emit('write',data)
  })

  socket.on('clear', (roomName) => io.to(roomName).emit('clear'))
  socket.on('disconnect', () => {
    console.log( socket.id, ' disconnected');
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
