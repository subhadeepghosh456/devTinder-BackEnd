const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  const getSecrecrRoomId = (userID, targetUserId) => {
    return crypto
      .createHash("sha256")
      .update([userID, targetUserId].sort().join("_"))
      .digest("hex");
  };

  io.on("connection", (socket) => {
    // handle events
    socket.on("joinChat", ({ userID, targetUserId }) => {
      const roomId = getSecrecrRoomId(userID, targetUserId);
      console.log("Joining room", roomId);
      socket.join(roomId);
    });

    socket.on("typing", ({ userID, targetUserId }) => {
      const roomId = getSecrecrRoomId(userID, targetUserId);
      socket.to(roomId).emit("showTyping", { userID });
    });
    
    socket.on("stopTyping", ({ userID, targetUserId }) => {
      const roomId = getSecrecrRoomId(userID, targetUserId);
      socket.to(roomId).emit("hideTyping", { userID });
    });
    

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, emailId, userID, targetUserId, text }) => {
        // console.log("message", text);

        // save messages to the database

        try {
          const roomId = getSecrecrRoomId(userID, targetUserId);
          let chat = await Chat.findOne({
            participants: { $all: [userID, targetUserId] },
          });
          // console.log("chat", chat);
          if (!chat) {
            chat = new Chat({
              participants: [userID, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userID,
            text,
          });

          const savedMessage = await chat.save();
          // console.log("savedMessage", savedMessage);
          io.to(roomId).emit("receviedMessage", {
            firstName,
            emailId,
            lastName,
            text,
          });
        } catch (error) {
          console.log(error);
        }
      }
    );
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
