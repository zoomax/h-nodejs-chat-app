"use strict";

var _express = _interopRequireDefault(require("express"));

var _http = _interopRequireDefault(require("http"));

var _socket = require("socket.io");

var _cors = _interopRequireDefault(require("cors"));

var _user = require("./users/user");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();

var server = _http["default"].createServer(app);

var PORT = process.env.PORT || 5000;
var io = new _socket.Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
app.use((0, _cors["default"])());
io.on("connection", function (socket) {
  console.log("you've created a connection with the server"); // when a new user joins our a room

  socket.on("join", function (_ref, callback) {
    var username = _ref.username,
        room = _ref.room;

    var _addUser = (0, _user.addUser)({
      id: socket.id,
      username: username,
      room: room
    }),
        user = _addUser.user,
        error = _addUser.error;

    if (error) {
      return callback(error);
    }

    if (user) {
      socket.join(user.room); // when the user is completely valid
      // a message is sent to her/him in this room

      socket.emit("message", {
        username: "admin",
        text: "welcome to ".concat(user.room, " room")
      }); // this to braodcats that this socket instance has emitted an event

      socket.broadcast.to(user.room).emit("message", {
        username: "admin",
        text: "".concat(user.username, " has joined")
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: (0, _user.getUsersInRoom)(user.room).users
      });
    }
  });
  socket.on("disconnect", function (_ref2) {
    var room = _ref2.room;
    var data = (0, _user.removeUser)(socket.id);

    if (data) {
      io.to(data.user.room).emit("message", {
        username: "admin",
        text: "".concat(data.user.username, " had left ")
      });
      io.to(data.user.room).emit("roomData", {
        room: data.user.room,
        users: (0, _user.getUsersInRoom)(data.user.room).users
      });
    } else {
      io.to(room).emit("roomData", {
        room: room,
        users: (0, _user.getUsersInRoom)(room).users
      });
    }
  });
  socket.on("sendMessage", function (message, callback) {
    var user = (0, _user.getUser)(socket.id); // this to notify all room memebers with the sent message from the main socket server

    io.to(user.room).emit("message", {
      username: user.username,
      text: message
    });
    callback();
  });
});
app.get("/", function (req, res, next) {
  res.send("welcome to our chat backend");
}); // RUNNING THE SERVER

server.listen(PORT, function () {
  console.log("server is runnign on the port " + PORT);
});