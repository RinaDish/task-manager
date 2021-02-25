const express = require("express");
const marked = require("marked");
const fs = require("fs");

const router = new express.Router();

router.get("/", async (req, res) => {
  // render readme
  try {
    const readme = fs.readFileSync("README.md", "utf-8");
    const convertedReadme = await marked(readme);

    res.send(convertedReadme);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
