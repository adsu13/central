const db = require("../models");
const Users = db.users;
const Gateways = db.gateways;
const Config = require("../config/db.config.js");
const api = require("../servicers/api.js");
const functions = require("../functions/index.js");

exports.gateways = (req, res) => {
  if (!req.user) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  Gateways.find({}, (err, gateways) => {
    if (err) {
      console.error(err);
    } else {
      if (gateways.length <= 0) {
        let data = new Gateways({
          gateway: "0Auth",
          route: "/0auth.php",
        });

        data.save();
      }

      res.send(gateways);
    }
  });
};

exports.gateway = async (req, res) => {
  if (!req.user) {
    return res.status(400).send({ message: "Content can not be empty!" });
  }

  if (!req.body.gateway || !req.body.lista) {
    return res.status(400).send({ message: "Content can not be empty!" });
  }

  try {
    const response = await api.get(`${req.body.gateway.route}?lista=${req.body.lista}`);
    console.log("Resposta da API:", response.data);

    const data = response.data;
    let card;

    // Construir a string visível do cartão
    if (typeof data === "object" && data.cartao && data.mensagem) {
      card = `${data.status || "?"} - ${data.cartao} - ${data.mensagem}`;
    } else if (typeof data === "string") {
      card = data;
    } else {
      return res.status(400).send({
        message: "Unexpected response format from gateway",
        raw: response.data
      });
    }

    const user = await Users.findOne({ token: req.user.token });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    let bin;

    const isLive = card.includes("LIVE") || data.status === "LIVE" || data.status === "Aprovada";
    const isApproved = card.includes("Aprovada") || data.status === "Aprovada";

    if (isLive) {
      bin = functions.BinCheck(card.slice(10, 16));
      card = card.replace("SecurityChecker", `${bin} by SecurityChecker`);
      await functions.Box(card, "live");
    } else {
      bin = functions.BinCheck(card.slice(11, 16));
      card = card.replace("SecurityChecker", `${bin} by SecurityChecker`);
      await functions.Box(card, "die");
    }

    if (user.balance < Config.payment) {
      return res.status(400).send({ message: "insufficient credits!" });
    }

    if (isApproved) {
      user.balance -= 1;
      await user.save();
    }

    return res.send({ user, cc: card });

  } catch (error) {
    console.error("Erro ao consultar gateway:", error);
    return res.status(500).send({ message: "Erro ao consultar gateway" });
  }
};
exports.createGateway = async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  if (!req.body.gateway || !req.body.route) {
    return res.status(400).send({ message: "Gateway and route are required" });
  }

  try {
    const newGateway = new Gateways({
      gateway: req.body.gateway,
      route: req.body.route,
    });

    const savedGateway = await newGateway.save();
    res.status(201).send(savedGateway);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error creating gateway" });
  }
};
exports.deleteGateway = async (req, res) => {
  const gatewayId = req.params.id;

  if (!req.user) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  try {
    const result = await Gateways.findByIdAndDelete(gatewayId);
    if (!result) {
      return res.status(404).send({ message: "Gateway não encontrado" });
    }
    res.status(200).send({ message: "Gateway deletado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Erro ao deletar gateway" });
  }
};
