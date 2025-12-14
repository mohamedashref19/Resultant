const fs = require("fs");
const mongoose = require("mongoose");
const nodenv = require("dotenv");
const Meal = require("./../model/mealsModel");

nodenv.config({ path: `./config.env` });
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(() => console.log("DB connection successful! 🟢"));
const meals = JSON.parse(fs.readFileSync(`${__dirname}/meal.json`, "utf-8"));

const importDate = async () => {
  try {
    await Meal.create(meals);
    console.log("data is import correctly!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteDate = async () => {
  try {
    await Meal.deleteMany();
    console.log("data is delete correctly!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importDate();
} else if (process.argv[2] === "--delete") {
  deleteDate();
}
//node .\dev-data\data\import-data.js --import
