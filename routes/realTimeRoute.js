const express = require("express");
const { getTemporalEntities } = require("../controllers/temporalController");

const router = express.Router();

router.get("/", getTemporalEntities);

module.exports = router;
