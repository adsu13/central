const db = require("../models");
const Users = db.users;
const functions = require("../functions");
module.exports = {
    addBalance: async (req, res) => {
        try {
            const adminUser = await Users.findOne({ token: req.user.token });
            if (!adminUser || !adminUser.admin) {
                return res.status(403).json({ message: "Acesso negado. Requer privilégios de admin." });
            }
            const { targetToken, amount } = req.body;
            if (!targetToken || !amount || amount <= 0) {
                return res.status(400).json({ message: "Forneça um token válido e um valor positivo." });
            }
            const targetUser = await Users.findOneAndUpdate(
                { token: targetToken },
                { $inc: { balance: amount } },
                { new: true }
            );
            if (!targetUser) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }
            res.json({
                message: `Saldo adicionado com sucesso. Novo saldo: ${targetUser.balance}`,
                newBalance: targetUser.balance
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    updateUserByToken: async (req, res) => {
        try {
            const adminUser = await Users.findOne({ token: req.user.token });
            if (!adminUser || !adminUser.admin) {
                return res.status(403).json({ message: "Acesso negado. Requer privilégios de admin." });
            }
            const { targetToken } = req.body;
            if (!targetToken) {
                return res.status(400).json({ message: "Token do usuário alvo é obrigatório!" });
            }
            const forbiddenFields = ['_id', 'createdAt', 'updatedAt', 'token'];
            const updateData = { ...req.body };
            forbiddenFields.forEach(field => delete updateData[field]);
            delete updateData.targetToken;
            const updatedUser = await Users.findOneAndUpdate(
                { token: targetToken },
                updateData,
                { new: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }
            res.json({
                message: "Usuário atualizado com sucesso!",
                user: updatedUser
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    listAllUsers: async (req, res) => {
        try {
            const adminUser = await Users.findOne({ token: req.user.token });
            if (!adminUser || !adminUser.admin) {
                return res.status(403).json({ message: "Acesso negado. Requer privilégios de admin." });
            }
            const { page = 1, limit = 10, nickname, admin, token } = req.query;
            const filter = {};
            if (nickname) filter.nickname = new RegExp(nickname, 'i');
            if (admin) filter.admin = admin === 'true';
            if (token) filter.token = token;
            const users = await Users.find(filter)
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .sort({ createdAt: -1 });
            const total = await Users.countDocuments(filter);
            res.json({
                page: Number(page),
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                users: users
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }

    },
    createUser: async (req, res) => {
        try {
            const adminUser = await Users.findOne({ token: req.user.token });
            if (!adminUser || !adminUser.admin) {
                return res.status(403).json({ message: "Acesso negado. Requer privilégios de admin." });
            }
            const { nickname, balance = 0, admin = false } = req.body;
            if (!nickname) {
                return res.status(400).json({ message: "Nickname é obrigatório!" });
            }
            let token = functions.newToken(32);
            const newUser = new Users({
                token: token,
                nickname: nickname,
                balance: Number(balance),
                admin: Boolean(admin)
            });
            const savedUser = await newUser.save();
            res.status(201).json({
                message: "Usuário criado com sucesso!",
                user: {
                    _id: savedUser._id,
                    nickname: savedUser.nickname,
                    balance: savedUser.balance,
                    admin: savedUser.admin,
                    createdAt: savedUser.createdAt
                },
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({
                    message: "Nickname ou token já existe!",
                    error: error.keyValue
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const adminUser = await Users.findOne({ token: req.user.token });
            if (!adminUser || !adminUser.admin) {
                return res.status(403).json({ message: "Acesso negado. Requer privilégios de admin." });
            }
            const targetToken = req.params.token;
            if (!targetToken) {
                return res.status(400).json({ message: "Token do usuário é obrigatório." });
            }
            const deleted = await Users.findOneAndDelete({ token: targetToken });
            if (!deleted) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }
            res.json({ message: "Usuário deletado com sucesso!" });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar usuário.", error: error.message });
        }
    }
};