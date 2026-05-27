const express = require("express");

const router = express.Router();

const {
  getFoodItems,
  getFoodItem,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  deleteAllFoodItems
} = require("../controllers/foodController");

router.get("/", getFoodItems);

router.get("/:id", getFoodItem);

router.post("/", createFoodItem);

router.put("/:id", updateFoodItem);

router.delete("/:id", deleteFoodItem);

router.delete("/", deleteAllFoodItems);
module.exports = router;