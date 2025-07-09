const express = require("express");
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken } = require("../functions/index.js");
const db = require("../models");
const Users = db.users;
router.put('/add-balance', authenticateToken, adminController.addBalance);
router.put('/update-user', authenticateToken, adminController.updateUserByToken);
router.get('/list-users', authenticateToken, adminController.listAllUsers);
router.post('/create-users', authenticateToken, adminController.createUser);
router.delete('/users/:token', authenticateToken, adminController.deleteUser);
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await Users.findOne({ token: req.user.token });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.json({
      user: {
        nickname: user.nickname,
        balance: user.balance,
        admin: user.admin,
        token: user.token,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar o usuário.", error: error.message });
  }
});

module.exports = router;