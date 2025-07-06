const { authenticateToken } = require("../functions/index.js");

module.exports = app => {
  const gateways = require("../controllers/gateways.controller.js");

  var router = require("express").Router();

  router.post("/gateway", authenticateToken, gateways.gateway);

  router.get("/allgateways", authenticateToken, gateways.gateways);
  router.post('/addgateway', authenticateToken, gateways.createGateway);
  router.delete("/gateway/:id", authenticateToken, gateways.deleteGateway);

  app.use("/api/gateways", router);
};