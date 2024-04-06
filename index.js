const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socket = require("socket.io");
const app=express()


app.use(cors())
require("dotenv").config();

const userRoutes=require("./routes/userRoutes");
const messageRoutes = require("./routes/messages");
app.use(express.json());
const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);


app.use("/api/auth",userRoutes)
app.use("/api/messages", messageRoutes);


mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });
  
const io = socket(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  console.log("one user")
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    console.log("dsdsaads",data)
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.message,data.from,data.to);
    }
  });
  socket.on("typingModeOn", (data) => {
    console.log("dsdsaads",data.head)
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("typingrecieve", data.head,data.from,data.to);
      console.log("send")
    }
  });
  socket.on("typingModeOff", (data) => {
    console.log("dsdsaads",data.head)
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("typingrecieveoff", data.head);
      console.log("send")
    }
  });

});

