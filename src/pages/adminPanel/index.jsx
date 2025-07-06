import React, { useEffect, useState } from "react";
import api from "@src/services/api";
import { useUser } from "@src/context/userContext";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { token, user } = useUser();

  // Estados
  const [users, setUsers] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nickname: "",
    balance: 0,
    admin: false,
    threads: 1
  });
  const [gatewayForm, setGatewayForm] = useState({ 
    gateway: "", 
    route: "" 
  });
  const [searchNickname, setSearchNickname] = useState("");
  const [balanceForm, setBalanceForm] = useState({ 
    targetToken: "", 
    amount: 0 
  });
  const [threadsForm, setThreadsForm] = useState({ 
    targetToken: "", 
    threads: 1 
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Redireciona se não for admin
  useEffect(() => {
    if (token && user && !user.admin) {
      navigate("/", { replace: true });
    }
  }, [token, user, navigate]);

  // Busca usuários e gateways
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

  const fetchGateways = async () => {
    try {
      const res = await api.get("/api/gateways/allgateways");
      setGateways(res.data);
    } catch (error) {
      console.error("Erro ao buscar gateways:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchGateways();
    }
  }, [token]);

  if (!token || !user) return null;

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/admin/create-users", form);
      setMessage("Usuário criado com sucesso!");
      setMessageType("success");
      setForm({ nickname: "", balance: 0, admin: false, threads: 1 });
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || "Erro ao criar usuário");
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
      setMessage(error.response?.data?.message || "Erro ao adicionar saldo");
      setMessageType("error");
    }
  };

  const handleUpdateThreads = async (e) => {
    e.preventDefault();
    try {
      await api.put("/api/users/threads", {
        token: threadsForm.targetToken,
        threads: threadsForm.threads
      });
      setMessage("Threads atualizados com sucesso!");
      setMessageType("success");
      setThreadsForm({ targetToken: "", threads: 1 });
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || "Erro ao atualizar threads");
      setMessageType("error");
    }
  };

  const handleCreateGateway = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/gateways/addgateway", gatewayForm);
      setMessage("Gateway criado com sucesso!");
      setMessageType("success");
      setGatewayForm({ gateway: "", route: "" });
      fetchGateways();
    } catch (error) {
      setMessage(error.response?.data?.message || "Erro ao criar gateway");
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
      setMessage(error.response?.data?.message || "Erro ao deletar usuário");
      setMessageType("error");
    }
  };

  const handleDeleteGateway = async (gatewayId) => {
    if (!window.confirm("Tem certeza que deseja deletar este gateway?")) return;
    try {
      await api.delete(`/api/gateways/gateway/${gatewayId}`);
      setMessage("Gateway deletado com sucesso!");
      setMessageType("success");
      fetchGateways();
    } catch (error) {
      setMessage(error.response?.data?.message || "Erro ao deletar gateway");
      setMessageType("error");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛠️ Painel de Administração</h2>

      {/* Seção de Gateways */}
      <section style={styles.section}>
        <h3>📡 Gerenciar Gateways</h3>
        <form onSubmit={handleCreateGateway} style={styles.form}>
          <input
            type="text"
            name="gateway"
            value={gatewayForm.gateway}
            placeholder="Nome do Gateway"
            onChange={(e) => setGatewayForm({ ...gatewayForm, gateway: e.target.value })}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="route"
            value={gatewayForm.route}
            placeholder="Rota"
            onChange={(e) => setGatewayForm({ ...gatewayForm, route: e.target.value })}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.createButton}>
            Criar Gateway
          </button>
        </form>

        <div style={{ marginTop: 20 }}>
          <h4>Gateways Existentes</h4>
          {gateways.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Gateway</th>
                  <th style={styles.th}>Rota</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {gateways.map((gateway) => (
                  <tr key={gateway._id}>
                    <td style={styles.td}>{gateway.gateway}</td>
                    <td style={styles.td}>{gateway.route}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleDeleteGateway(gateway._id)}
                        style={styles.deleteButton}
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nenhum gateway cadastrado</p>
          )}
        </div>
      </section>

      {/* Seção de Usuários */}
      <section style={styles.section}>
        <h3>👤 Criar Novo Usuário</h3>
        <form onSubmit={handleCreateUser} style={styles.form}>
          <input
            type="text"
            name="nickname"
            value={form.nickname}
            placeholder="Nickname"
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="number"
            name="balance"
            value={form.balance}
            onChange={handleChange}
            placeholder="Saldo"
            required
            style={{ ...styles.input, width: 120 }}
          />
          <input
            type="number"
            name="threads"
            value={form.threads}
            onChange={handleChange}
            placeholder="Threads"
            min="1"
            max="10"
            required
            style={{ ...styles.input, width: 120 }}
          />
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="admin"
              checked={form.admin}
              onChange={handleChange}
            />
            Admin
          </label>
          <button type="submit" style={styles.createButton}>
            Criar
          </button>
        </form>
      </section>

      <section style={styles.section}>
        <h3>🔍 Buscar Usuário</h3>
        <div style={styles.searchContainer}>
          <input
            type="text"
            value={searchNickname}
            onChange={(e) => setSearchNickname(e.target.value)}
            placeholder="Digite o apelido"
            style={styles.input}
          />
          <button
            onClick={() => fetchUsers(searchNickname)}
            style={styles.searchButton}
          >
            Buscar
          </button>
          <button
            onClick={() => {
              setSearchNickname("");
              fetchUsers();
            }}
            style={styles.resetButton}
          >
            Resetar
          </button>
        </div>
      </section>

      <section style={styles.section}>
        <h3>💰 Adicionar Saldo</h3>
        <form onSubmit={handleAddBalance} style={styles.form}>
          <input
            type="text"
            name="targetToken"
            value={balanceForm.targetToken}
            placeholder="Token do usuário"
            onChange={(e) => setBalanceForm({ ...balanceForm, targetToken: e.target.value })}
            required
            style={styles.input}
          />
          <input
            type="number"
            name="amount"
            value={balanceForm.amount}
            onChange={(e) => setBalanceForm({ ...balanceForm, amount: Number(e.target.value) })}
            placeholder="Valor"
            required
            style={{ ...styles.input, width: 120 }}
          />
          <button type="submit" style={styles.balanceButton}>
            Adicionar
          </button>
        </form>
      </section>

      <section style={styles.section}>
        <h3>🧵 Gerenciar Threads</h3>
        <form onSubmit={handleUpdateThreads} style={styles.form}>
          <input
            type="text"
            name="targetToken"
            value={threadsForm.targetToken}
            placeholder="Token do usuário"
            onChange={(e) => setThreadsForm({ ...threadsForm, targetToken: e.target.value })}
            required
            style={styles.input}
          />
          <input
            type="number"
            name="threads"
            value={threadsForm.threads}
            onChange={(e) => setThreadsForm({ ...threadsForm, threads: Number(e.target.value) })}
            placeholder="Threads"
            min="1"
            max="10"
            required
            style={{ ...styles.input, width: 120 }}
          />
          <button type="submit" style={styles.threadsButton}>
            Atualizar
          </button>
        </form>
      </section>

      {message && (
        <p
          style={{
            color: messageType === "success" ? "limegreen" : "red",
            fontWeight: "bold",
            margin: "16px 0",
          }}
        >
          {message}
        </p>
      )}

      <h3>📋 Lista de Usuários</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Nickname</th>
                <th style={styles.th}>Saldo</th>
                <th style={styles.th}>Threads</th>
                <th style={styles.th}>Admin</th>
                <th style={styles.th}>Token</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={styles.td}>{u.nickname}</td>
                  <td style={styles.td}>{u.balance}</td>
                  <td style={styles.td}>{u.threads}</td>
                  <td style={styles.td}>{u.admin ? "✅" : "❌"}</td>
                  <td style={{ ...styles.td, fontSize: 12 }}>{u.token}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleDeleteUser(u.token)}
                      style={styles.deleteButton}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Estilos
const styles = {
  container: {
    padding: 24,
    fontFamily: "Arial, sans-serif",
    background: "linear-gradient(to right, #000000, #1a1a1a, #000000)",
    color: "rgb(190, 237, 245)",
    minHeight: "100vh",
  },
  title: {
    marginBottom: 24,
    fontSize: "1.8rem",
    borderBottom: "1px solid #444",
    paddingBottom: 8,
  },
  section: {
    marginBottom: 32,
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 8,
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },
  form: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  input: {
    padding: 8,
    backgroundColor: "#2b2b2b",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: 4,
    minWidth: 200,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginRight: 12,
  },
  createButton: {
    padding: "8px 16px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  searchContainer: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  searchButton: {
    padding: "8px 16px",
    backgroundColor: "orange",
    color: "#000",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  resetButton: {
    padding: "8px 16px",
    backgroundColor: "#666",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  balanceButton: {
    padding: "8px 16px",
    backgroundColor: "#2196F3",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  threadsButton: {
    padding: "8px 16px",
    backgroundColor: "#9C27B0",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  tableContainer: {
    overflowX: "auto",
    marginTop: 20,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#181818",
  },
  tableHeader: {
    backgroundColor: "#1f1f1f",
  },
  th: {
    padding: 12,
    border: "1px solid #333",
    textAlign: "left",
  },
  td: {
    padding: 10,
    border: "1px solid #333",
  },
  deleteButton: {
    padding: "6px 12px",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
};

export default AdminPanel;