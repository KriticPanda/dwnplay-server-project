const mongoose = require("mongoose");
const router = require("express").Router();
const Chat = require("../models/Chat.model");
const Request = require("../models/Request.model");
const { verifyToken } = require("../middlewares/auth.middlewares");

router.use(verifyToken);

router.post("/", async (req, res, next) => {
  const { requestId } = req.body || {};

  if (!mongoose.isValidObjectId(requestId)) {
    return res.status(400).json({ message: "Provide a valid requestId" });
  }

  try {
    const request = await Request.findById(requestId).select("userId status");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "open") {
      return res.status(409).json({ message: "Cannot start a chat for a closed request" });
    }

    const userId = req.payload.userId;
    if (request.userId.toString() === userId) {
      return res.status(403).json({ message: "You cannot start a chat with yourself" });
    }

    const existingChat = await Chat.findOne({ requestId, startedBy: userId });
    if (existingChat) {
      return res.status(200).json({ chat: existingChat });
    }

    const chat = await Chat.create({
      requestId,
      startedBy: userId,
      participants: [request.userId, userId],
    });

    return res.status(201).json({ chat });
  } catch (error) {
    if (error.code === 11000) {
      try {
        const existingChat = await Chat.findOne({ requestId, startedBy: req.payload.userId });
        if (existingChat) {
          return res.status(200).json({ chat: existingChat });
        }
      } catch (lookupError) {
        return next(lookupError);
      }
    }

    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.payload.userId })
      .select("-messages")
      .populate("participants", "username avatarUrl")
      .populate("requestId", "gameId gameTitle description status")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ chats });
  } catch (error) {
    return next(error);
  }
});

router.get("/:chatId", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.chatId)) {
    return res.status(400).json({ message: "Invalid chat ID" });
  }

  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.payload.userId,
    })
      .populate("participants", "username avatarUrl")
      .populate("requestId", "gameId gameTitle description status");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json({ chat });
  } catch (error) {
    return next(error);
  }
});

router.post("/:chatId/messages", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.chatId)) {
    return res.status(400).json({ message: "Invalid chat ID" });
  }

  const messageText =
    req.body && typeof req.body.messageText === "string"
      ? req.body.messageText.trim()
      : "";

  if (!messageText || messageText.length > 2000) {
    return res.status(400).json({
      message: "messageText must be between 1 and 2000 characters",
    });
  }

  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.payload.userId,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.messages.push({
      senderId: req.payload.userId,
      messageText,
    });
    await chat.save();

    return res.status(201).json({
      message: chat.messages[chat.messages.length - 1],
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
