import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@src/services/api"; // adicione essa importação

const UserContext = createContext();

export function UserProvider({ children }) {
  const [token, setToken] = useState(false);
  const [user, setUser] = useState(false);

  const updateToken = (newToken) => {
    setToken(newToken);
  };

  const saveToken = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const updateUser = (newUser) => {
    if (newUser !== false) {
      newUser["balanceFormated"] = newUser.balance.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    }
    setUser(newUser);
  };

  const loadToken = () => {
    const localToken = localStorage.getItem("token");
    if (localToken) setToken(localToken);
  };

  const loadUserData = async () => {
    if (!token) return;

    try {
      const res = await api.get("/api/admin/me"); // essa rota deve retornar os dados do usuário atual
      updateUser(res.data.user);        // ou res.data, dependendo do que sua API retorna
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      updateUser(false);
    }
  };

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserData(); // quando token muda, buscar dados do usuário
    }
  }, [token]);

  return (
    <UserContext.Provider
      value={{ token, updateToken, saveToken, user, updateUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
