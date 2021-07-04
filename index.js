const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const allRestaurant = require("./route/index");
app.use("/api/v1", allRestaurant);

app.listen(PORT, () => console.log("Application running on port " + PORT));
