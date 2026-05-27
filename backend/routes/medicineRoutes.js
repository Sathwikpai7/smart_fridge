const express = require("express");

const {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/medicinecontroller");

const router = express.Router();

router.get("/", getMedicines);

router.get("/:id", getMedicine);

router.post("/", createMedicine);

router.put("/:id", updateMedicine);

router.delete("/:id", deleteMedicine);

module.exports = router;