const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/getRestaurants", async (req, res) => {
  try {
    const result = await db.query(
      "select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(Avg(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id;"
    );
    res.status(200).json({
      status: "success",
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/restaurants/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query(
      "select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(Avg(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id where id = $1;",
      [req.params.id]
    );

    const reviews = await db.query(
      "SELECT * FROM reviews WHERE restaurant_id = $1",
      [req.params.id]
    );
    res.status(200).json({
      status: "success",
      data: result.rows[0],
      reviews: reviews.rows,
    });
  } catch (error) {
    res.json({ error });
  }
});

router.post("/restaurants/", async (req, res) => {
  try {
    const { name, location, price_range } = req.body;
    const result = await db.query(
      "INSERT INTO restaurants(name, location,price_range) values($1, $2, $3)  RETURNING *",
      [name, location, price_range]
    );
    res.status(201).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    res.json({ error });
  }
});

router.put("/restaurants/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { location, name, price_range } = req.body;

    const result = await db.query(
      "UPDATE restaurants SET location = $1, name = $2 ,price_range = $3 where id = $4 RETURNING *",
      [location, name, price_range, id]
    );

    res.status(201).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    res.json(error);
  }
});

router.delete("/restaurants/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await db.query("DELETE FROM restaurants where id = $1 ", [id]);
    res.status(204).json({
      status: "success",
      data: "Deleted successfully",
    });
  } catch (error) {
    res.json(error);
  }
});

router.post("/restaurants/:id/addReview", async (req, res) => {
  try {
    const id = req.params.id;

    const res = await db.query(
      "INSERT INTO reviews(restaurant_id, name, review, rating) values($1, $2, $3, $4) returning *",
      [id, req.body.name, req.body.review, req.body.rating]
    );

    res.status(201).json({
      status: "success",
      data: {
        review: res.rows[0],
      },
    });
  } catch (error) {}
});

module.exports = router;
