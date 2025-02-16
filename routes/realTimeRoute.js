const express = require("express");
const { getRealTimeEntities } = require("../controllers/generalControllers");

const router = express.Router();

router.get("/", getRealTimeEntities);

module.exports = router;
