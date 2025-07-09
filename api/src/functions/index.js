const jwt = require("jsonwebtoken");
const fs = require("fs");
const readline = require("readline");

const secretKey =
  "XxXzZcXlalisaxmanobal!@#!#!!xxblackpinkforever#talent@everyonesilent@okay";

const bins = [];

exports.loadBins = () => {
  const leitor = readline.createInterface({
    input: fs.createReadStream("./binsgeral.txt"),
    crlfDelay: Infinity,
  });

  leitor.on("line", (linha) => {
    bins.push(linha);
  });

  leitor.on("close", () => {
    console.log(`loaded ${bins.length} bins.`);
  });
};

exports.jwtToken = (data) => {
  const payload = {
    token: data.token,
    balance: data.balance,
    nickname: data.nickname,
    admin: data.admin,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
  const token = jwt.sign(payload, secretKey);
  return token;
};

exports.newToken = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }

  new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return reject(err);
      }
      req.user = user;
      resolve();
    });
  })
    .then(() => {
      next();
    })
    .catch((err) => {
      console.error("Erro ao verificar o token:", err);
      return res.sendStatus(403);
    });
};

exports.BinCheck = (CurrentBin) => {
  for (let i = 0; i < bins.length; i++) {
    if (bins[i].includes(CurrentBin)) {
      let formated = bins[i];
      return formated.substring(6);
    }
  }
};

exports.Box = async (cc, name) => {
  fs.appendFileSync(`./box/${name}.txt`, cc+"\n");
};
