const db = require("../models");
const Users = db.users;
const functions = require("../functions");
module.exports = {
    // Adicionar saldo a um usuário (por token)
    addBalance: async (req, res) => {
        try {
            // 1. Verificar se o solicitante é admin
            const adminUser = await Users.findOne({ token: req.user.token });
            if (!adminUser || !adminUser.admin) {
                return res.status(403).json({ message: "Acesso negado. Requer privilégios de admin." });
            }

            // 2. Validar os dados de entrada
            const { targetToken, amount } = req.body;
            if (!targetToken || !amount || amount <= 0) {
                return res.status(400).json({ message: "Forneça um token válido e um valor positivo." });
            }

            // 3. Atualizar o saldo
            const targetUser = await Users.findOneAndUpdate(
                { token: targetToken },
                { $inc: { balance: amount } }, // Incrementa o saldo
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

    // Atualizar qualquer campo de um usuário (por token)
    updateUserByToken: async (req, res) => {
        try {
            // 1. Verificar se o solicitante é admin
            const adminUser = await Users.findOne({ token: req.user.token });
            if (!adminUser || !adminUser.admin) {
                return res.status(403).json({ message: "Acesso negado. Requer privilégios de admin." });
            }

            // 2. Validar os dados de entrada
            const { targetToken } = req.body;
            if (!targetToken) {
                return res.status(400).json({ message: "Token do usuário alvo é obrigatório!" });
            }

            // 3. Preparar dados para atualização
            const forbiddenFields = ['_id', 'createdAt', 'updatedAt', 'token'];
            const updateData = { ...req.body };

            forbiddenFields.forEach(field => delete updateData[field]);
            delete updateData.targetToken;

            // 4. Executar a atualização
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

    // Listar todos os usuários (apenas admin)
    listAllUsers: async (req, res) => {
        try {
            // Verificar se é admin
            const adminUser = await Users.findOne({ token: req.user.token });
            if (!adminUser || !adminUser.admin) {
                return res.status(403).json({ message: "Acesso negado. Requer privilégios de admin." });
            }

            // Configuração de paginação e filtros
            const { page = 1, limit = 10, nickname, admin, token } = req.query;
            const filter = {};

            if (nickname) filter.nickname = new RegExp(nickname, 'i');
            if (admin) filter.admin = admin === 'true';
            if (token) filter.token = token; // Busca exata pelo token

            // Consulta com paginação
            const users = await Users.find(filter)
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .sort({ createdAt: -1 });

            // Contagem total para paginação
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
            // 1. Verificar se o solicitante é admin
            const adminUser = await Users.findOne({ token: req.user.token });
            if (!adminUser || !adminUser.admin) {
                return res.status(403).json({ message: "Acesso negado. Requer privilégios de admin." });
            }

            // 2. Validar dados de entrada
            const { nickname, balance = 0, admin = false } = req.body;

            if (!nickname) {
                return res.status(400).json({ message: "Nickname é obrigatório!" });
            }

            // 3. Gerar token único
            let token = functions.newToken(32); // Usando sua função existente

            // 4. Criar novo usuário
            const newUser = new Users({
                token: token,
                nickname: nickname,
                balance: Number(balance),
                admin: Boolean(admin)
            });

            // 5. Salvar no banco
            const savedUser = await newUser.save();

            // 6. Retornar resposta (sem o token se quiser mais segurança)
            res.status(201).json({
                message: "Usuário criado com sucesso!",
                user: {
                    _id: savedUser._id,
                    nickname: savedUser.nickname,
                    balance: savedUser.balance,
                    admin: savedUser.admin,
                    createdAt: savedUser.createdAt
                },
                // token: token // Opcional: retornar o token apenas se necessário
            });

        } catch (error) {
            // Tratar erros de duplicação (nickname ou token)
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
    // Verificar se quem está deletando é admin
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