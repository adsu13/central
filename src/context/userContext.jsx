import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@src/services/api";
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
      const res = await api.get("/api/admin/me");
      updateUser(res.data.user);
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
      loadUserData();
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