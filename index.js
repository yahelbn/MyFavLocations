const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const fs = require("fs");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/locations", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to DB");
});

const locationSchema = new mongoose.Schema({
  title: String,
  imgSrc: String,
  description: String,
});
const Location = mongoose.model("Location", locationSchema);

const rawFavoriteLocationData = fs.readFileSync("./favoriteLocations.json");
const { favoriteLocations } = JSON.parse(rawFavoriteLocationData);

favoriteLocations.forEach((favoriteLocation) => {
  const location = new Location(favoriteLocation);
  location.save((err) => {
    if (err) return console.error(err);
    console.log(`Saved ${favoriteLocation.title}`);
  });
});

const app = express();
app.use(cors({ origin: true }));
app.use(bodyparser.json());

app.get("/locations", async (_req, res) => {
  const locations = await Location.find();
  res.send(locations);
});

app.get("/locations/:id", async (req, res) => {
  const id = req.params.id;
  const locations = await Location.findOne({ _id: id });
  res.send(locations);
});

app.post("/locations", async (req, res) => {
  const { title, imgSrc, description } = req.body;
  const { _id } = await Location.create({ title, imgSrc, description });
  res.send({ _id });
});

app.post("/locations/delete", async (req, res) => {
  await Location.deleteOne({ _id: req.body.id });
  res.send(true);
});

app.listen(5000, () => console.log("Express Server Up"));
