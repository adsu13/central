const { authenticateToken } = require("../functions/index.js");
module.exports = app => {
  const users = require("../controllers/users.controller.js");
  var router = require("express").Router();
  router.get("/user", authenticateToken, users.getUser);
  router.post("/seed", users.seed);
  router.post("/login", users.findUser);
  router.put("/threads", authenticateToken, users.updateThreads); 
  app.use("/api/users", router);
};