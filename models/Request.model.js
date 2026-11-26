const { Schema, model } = require("mongoose");

const requestSchema = new Schema({
  requestId: "String",
  userId: "String",
  gameId: "String",
  availability: {
    start: "Date",
    end: "Date",
  },
  description: "String",
  createdAt: "Date",
  status: "String",
});

const Request = model("Request", requestSchema);

module.exports = Request;
