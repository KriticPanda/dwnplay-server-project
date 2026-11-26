const { Schema, model } = require("mongoose");

const chatSchema = new Schema({
  chatId: "String",
  participants: ["String"],
  messages: [
    {
      senderId: "String",
      messageText: "String",
      timestamp: "Date",
    },
  ],
  lastUpdated: "Date",
});

const Chat = model("Chat", chatSchema);

module.exports = Chat;
