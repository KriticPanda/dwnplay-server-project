const { Schema, model } = require("mongoose");

const gameListSchema = new Schema({
  gameId: Number,
  gameTitle: String,
  gameGenre: String,
  gamePlatform: String,
  releaseDate: Date,
  image: String,
});

const GameList = model("GameList", gameListSchema);

module.exports = GameList;
