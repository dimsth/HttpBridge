const express = require("express");
const { getTemporalEntities } = require("../controllers/generalControllers");

const router = express.Router();

router.get("/", getTemporalEntities);

module.exports = router;
