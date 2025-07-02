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
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  if (!req.body.gateway) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  if (!req.body.lista) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  api
    .get(`${req.body.gateway.route}?lista=${req.body.lista}`)
    .then(async (response) => {
      Users.findOne({ token: req.user.token }, async (err, user) => {
        let bin;

        let card = response.data;
        

        if (response.data.includes("LIVE")) {
          bin = functions.BinCheck(response.data.slice(10, 16));
          card = card.replace("SecurityChecker", `${bin} by SecurityChecker`);
          await functions.Box(card, "live");
        } else {
          bin = functions.BinCheck(response.data.slice(11, 16))
          card = card.replace("SecurityChecker", `${bin} by SecurityChecker`);
          await functions.Box(card, "die");
        }

        
       
        if (!err) {
          if (user.balance < Config.payment)
            return res.status(400).send({ message: "insufficient credits!" });

          if (response.data.includes("Aprovada")) {
            user.balance = user.balance - 1;

            await user.save();

            res.send({ user: user, cc: card });
          } else {
            if (user.balance < Config.payment)
              return res.status(400).send({ message: "insufficient credits!" });
            else {
              res.send({ user: user, cc: card });
            }
          }
        }
      });
    });
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