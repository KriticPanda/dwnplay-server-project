const { Schema, model } = require("mongoose");

const availabilitySchema = new Schema(
  {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  { _id: false }
);

const requestSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gameId: { type: Number, required: true, min: 1 },
    gameTitle: { type: String, required: true, trim: true },
    availability: { type: availabilitySchema, required: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  {
    timestamps: true,
  }
);

const Request = model("Request", requestSchema);

module.exports = Request;
