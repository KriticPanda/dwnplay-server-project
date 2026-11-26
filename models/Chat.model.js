const { Schema, model } = require("mongoose");

const messageSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messageText: { type: String, required: true, trim: true, maxlength: 2000 },
  timestamp: { type: Date, default: Date.now, required: true },
});

const chatSchema = new Schema(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    startedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

chatSchema.index({ requestId: 1, startedBy: 1 }, { unique: true });
chatSchema.index({ participants: 1, updatedAt: -1 });

const Chat = model("Chat", chatSchema);

module.exports = Chat;
