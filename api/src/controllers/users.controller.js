const db = require("../models");
const Users = db.users;
const functions = require("../functions");

exports.create = (req, res) => {
  if (!req.body.nickname) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  let token = functions.newToken(32);

  const newuser = new Users({
    token: token,
    nickname: req.body.nickname,
    balance: req.body.balance,
    admin: req.body.admin,
  });

  newuser
    .save(newuser)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Users.",
      });
    });
};

exports.findUser = (req, res) => {
  if (!req.body.token) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  Users.findOne({ token: req.body.token })
    .then((user) => {
      if (user) {
        let token = functions.jwtToken(user);
        res.send(token);
      } else {
        res.status(400).send({ message: "invalid token!" });
      }
    })
    .catch((err) => console.error("Erro ao encontrar o usuário:", err));
};


exports.seed = (req, res) => {
  let token = functions.newToken(32);

  const newuser = new Users({
    token: token,
    nickname: "Lalisa",
    balance: 0,
    admin: true,
  });

  newuser
    .save(newuser)
    .then((data) => {
      res.send(token);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Users.",
      });
    });
};

exports.getUser = (req, res) => {
  if (!req.user) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  Users.findOne({ token: req.user.token })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        res.status(400).send({ message: "invalid token!" });
      }
    })
    .catch((err) => console.error("Erro ao encontrar o usuário:", err));
};
