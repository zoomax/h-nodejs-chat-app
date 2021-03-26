import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { getUser, getUsersInRoom, removeUser, addUser } from "./users/user";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});
app.use(cors());
const io = new Server(server, {
  cors: {
    origin: "https://605d3c689e891912877b89c8--h-react-chat.netlify.app/",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  console.log("you've created a connection with the server");
  // when a new user joins our a room
  socket.on("join", ({ username, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    if (user) {
      socket.join(user.room);
      // when the user is completely valid
      // a message is sent to her/him in this room
      socket.emit("message", {
        username: "admin",
        text: `welcome to ${user.room} room`,
      });
      // this to braodcats that this socket instance has emitted an event
      socket.broadcast.to(user.room).emit("message", {
        username: "admin",
        text: `${user.username} has joined`,
      });

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room).users,
      });
    }
  });

  socket.on("disconnect", ({room}) => {
    const data = removeUser(socket.id);
    if (data) {
      io.to(data.user.room).emit("message", {
        username: "admin",
        text: `${data.user.username} had left `,
      });
      io.to(data.user.room).emit("roomData", {
        room: data.user.room,
        users: getUsersInRoom(data.user.room).users,
      });
    }else { 
        io.to(room).emit("roomData", {
            room , 
            users: getUsersInRoom(room).users,
          });
    }
  });
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    // this to notify all room memebers with the sent message from the main socket server
    io.to(user.room).emit("message", {
      username: user.username,
      text: message,
    });
    callback();
  });
});
app.get("/" , (req, res , next)=>{
  res.send("welcome to our chat backend")
})
// RUNNING THE SERVER
server.listen(PORT, () => {
  console.log("server is runnign on the port " + PORT);
});
