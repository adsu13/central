// src/pages/adminPanel.jsx
import React, { useEffect, useState } from "react";
import api from "@src/services/api";
import { useUser } from "@src/context/userContext";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const navigate = useNavigate();

  const { token, user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nickname: "", balance: 0, admin: false });
  const [searchNickname, setSearchNickname] = useState("");
  const [balanceForm, setBalanceForm] = useState({ targetToken: "", amount: 0 });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const fetchUsers = async (nickname = "") => {
    try {
      const res = await api.get("/api/admin/list-users", {
        params: nickname ? { nickname } : {},
      });
      setUsers(res.data.users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUsers();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/admin/create-users", form);
      setMessage("Usuário criado com sucesso!");
      setMessageType("success");
      setForm({ nickname: "", balance: 0, admin: false });
      fetchUsers();
    } catch (error) {
      console.error("Erro ao criar usuário:", error.response?.data || error.message);
      setMessage("Erro ao criar usuário.");
      setMessageType("error");
    }
  };

  const handleAddBalance = async (e) => {
    e.preventDefault();
    try {
      await api.put("/api/admin/add-balance", balanceForm);
      setMessage("Saldo adicionado com sucesso!");
      setMessageType("success");
      setBalanceForm({ targetToken: "", amount: 0 });
      fetchUsers();
    } catch (error) {
      console.error("Erro ao adicionar saldo:", error.response?.data || error.message);
      setMessage("Erro ao adicionar saldo.");
      setMessageType("error");
    }
  };

  const handleDeleteUser = async (tokenToDelete) => {
    if (!window.confirm("Tem certeza que deseja deletar este usuário?")) return;
    try {
      await api.delete(`/api/admin/users/${tokenToDelete}`);
      setMessage("Usuário deletado com sucesso!");
      setMessageType("success");
      fetchUsers();
    } catch (error) {
      console.error("Erro ao deletar usuário:", error.response?.data || error.message);
      setMessage("Erro ao deletar usuário.");
      setMessageType("error");
    }
  };

  const handleSearch = () => {
    fetchUsers(searchNickname);
  };

 if (!token) {
  return null; // ou redirecione para login
}

if (!user) {
  return null; // espera o user carregar
}

if (!user.admin) {
  navigate("/", { replace: true });
  return null;
}

  return (
    <div
      style={{
        padding: 24,
        fontFamily: 'Arial, sans-serif',
        background: 'linear-gradient(to right, #000000, #1a1a1a, #000000)',
        color: 'rgb(190, 237, 245)',
        minHeight: '100vh',
      }}
    >
      <h2 style={{ marginBottom: 24 }}>🛠️ Painel de Administração</h2>

      <section style={{ marginBottom: 32 }}>
        <h3>👤 Criar Novo Usuário</h3>
        <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            name="nickname"
            value={form.nickname}
            placeholder="Nickname"
            onChange={handleChange}
            required
            style={{ padding: 8, flex: '1', backgroundColor: '#2b2b2b', color: '#fff', border: '1px solid #555' }}
          />
          <input
            type="number"
            name="balance"
            value={form.balance}
            onChange={handleChange}
            placeholder="Saldo"
            required
            style={{ padding: 8, width: 120, backgroundColor: '#2b2b2b', color: '#fff', border: '1px solid #555' }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="checkbox"
              name="admin"
              checked={form.admin}
              onChange={handleChange}
            />
            Admin
          </label>
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4 }}>Criar</button>
        </form>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h3>🔍 Buscar Usuário</h3>
        <input
          type="text"
          value={searchNickname}
          onChange={(e) => setSearchNickname(e.target.value)}
          placeholder="Digite o apelido"
          style={{ padding: 8, marginRight: 8, backgroundColor: '#2b2b2b', color: '#fff', border: '1px solid #555' }}
        />
        <button onClick={handleSearch} style={{ padding: '8px 16px', backgroundColor: 'orange', color: '#000', border: 'none', borderRadius: 4 }}>Buscar</button>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h3>💰 Adicionar Saldo</h3>
        <form onSubmit={handleAddBalance} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            name="targetToken"
            value={balanceForm.targetToken}
            placeholder="Token do usuário"
            onChange={(e) => setBalanceForm({ ...balanceForm, targetToken: e.target.value })}
            required
            style={{ padding: 8, flex: '1', backgroundColor: '#2b2b2b', color: '#fff', border: '1px solid #555' }}
          />
          <input
            type="number"
            name="amount"
            value={balanceForm.amount}
            onChange={(e) => setBalanceForm({ ...balanceForm, amount: Number(e.target.value) })}
            placeholder="Valor"
            required
            style={{ padding: 8, width: 120, backgroundColor: '#2b2b2b', color: '#fff', border: '1px solid #555' }}
          />
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: 4 }}>Adicionar</button>
        </form>
      </section>

      {message && (
        <p style={{ color: messageType === 'success' ? 'limegreen' : 'red', fontWeight: 'bold' }}>{message}</p>
      )}

      <h3>📋 Lista de Usuários</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20, backgroundColor: '#181818' }}>
          <thead>
            <tr style={{ backgroundColor: '#1f1f1f' }}>
              <th style={{ padding: 10, border: '1px solid #333' }}>Nickname</th>
              <th style={{ padding: 10, border: '1px solid #333' }}>Saldo</th>
              <th style={{ padding: 10, border: '1px solid #333' }}>Admin</th>
              <th style={{ padding: 10, border: '1px solid #333' }}>Token</th>
              <th style={{ padding: 10, border: '1px solid #333' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td style={{ padding: 8, border: '1px solid #333' }}>{u.nickname}</td>
                <td style={{ padding: 8, border: '1px solid #333' }}>{u.balance}</td>
                <td style={{ padding: 8, border: '1px solid #333' }}>{u.admin ? "Sim" : "Não"}</td>
                <td style={{ padding: 8, border: '1px solid #333', fontSize: 12 }}>{u.token}</td>
                <td style={{ padding: 8, border: '1px solid #333' }}>
                  <button
                    onClick={() => handleDeleteUser(u.token)}
                    style={{ padding: '6px 12px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: 4 }}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPanel;