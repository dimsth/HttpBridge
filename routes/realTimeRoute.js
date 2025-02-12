const express = require("express");
const { getRealTimeEntities } = require("../controllers/temporalController");

const router = express.Router();

router.get("/", getRealTimeEntities);

module.exports = router;
