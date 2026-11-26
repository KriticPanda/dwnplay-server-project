const mongoose = require("mongoose");
const router = require("express").Router();
const Request = require("../models/Request.model");
const GameList = require("../models/GamesList.model");
const { verifyToken } = require("../middlewares/auth.middlewares");

function getAvailability(availability) {
  if (
    !availability ||
    typeof availability !== "object" ||
    Array.isArray(availability) ||
    typeof availability.start !== "string" ||
    typeof availability.end !== "string"
  ) {
    return null;
  }

  const start = new Date(availability.start);
  const end = new Date(availability.end);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return null;
  }

  return { start, end };
}

function isValidDescription(description) {
  return (
    typeof description === "string" &&
    description.trim().length > 0 &&
    description.trim().length <= 1000
  );
}

router.use(verifyToken);

router.get("/search", async (req, res, next) => {
  const gameId = Number(req.query.gameId);

  if (
    typeof req.query.gameId !== "string" ||
    !Number.isInteger(gameId) ||
    gameId < 1
  ) {
    return res.status(400).json({ message: "Provide a valid gameId query parameter" });
  }

  try {
    const requests = await Request.find({
      gameId,
      status: "open",
      userId: { $ne: req.payload.userId },
    })
      .select("gameId gameTitle availability description status createdAt userId")
      .populate("userId", "username avatarUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const requests = await Request.find({ userId: req.payload.userId })
      .sort({ createdAt: -1 });
    return res.status(200).json({ requests });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ message: "A JSON object is required" });
  }

  const availability = getAvailability(body.availability);
  const status = body.status === undefined ? "open" : body.status;

  if (
    !Number.isInteger(body.gameId) ||
    body.gameId < 1 ||
    !availability ||
    !isValidDescription(body.description) ||
    !["open", "closed"].includes(status)
  ) {
    return res.status(400).json({
      message: "Provide a valid gameId, availability, description, and status",
    });
  }

  try {
    const game = await GameList.findOne({ gameId: body.gameId }).select("gameTitle");
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const request = await Request.create({
      userId: req.payload.userId,
      gameId: body.gameId,
      gameTitle: game.gameTitle,
      availability,
      description: body.description.trim(),
      status,
    });

    return res.status(201).json({ request });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:requestId", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.requestId)) {
    return res.status(400).json({ message: "Invalid request ID" });
  }

  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ message: "A JSON object is required" });
  }

  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, "gameId")) {
    if (!Number.isInteger(body.gameId) || body.gameId < 1) {
      return res.status(400).json({ message: "gameId must be a positive integer" });
    }

    try {
      const game = await GameList.findOne({ gameId: body.gameId }).select("gameTitle");
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      updates.gameTitle = game.gameTitle;
    } catch (error) {
      return next(error);
    }

    updates.gameId = body.gameId;
  }

  if (Object.prototype.hasOwnProperty.call(body, "availability")) {
    const availability = getAvailability(body.availability);
    if (!availability) {
      return res.status(400).json({ message: "Availability dates are invalid" });
    }
    updates.availability = availability;
  }

  if (Object.prototype.hasOwnProperty.call(body, "description")) {
    if (!isValidDescription(body.description)) {
      return res.status(400).json({ message: "Description is invalid" });
    }
    updates.description = body.description.trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    if (!["open", "closed"].includes(body.status)) {
      return res.status(400).json({ message: "Status must be open or closed" });
    }
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "Provide fields to update" });
  }

  try {
    const request = await Request.findOneAndUpdate(
      { _id: req.params.requestId, userId: req.payload.userId },
      updates,
      { returnDocument: "after", runValidators: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    return res.status(200).json({ request });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:requestId", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.requestId)) {
    return res.status(400).json({ message: "Invalid request ID" });
  }

  try {
    const request = await Request.findOneAndDelete({
      _id: req.params.requestId,
      userId: req.payload.userId,
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
