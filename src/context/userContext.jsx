import React, { createContext, useContext, useEffect, useState } from "react";
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
    if (newUser != false)
      newUser['balanceFormated'] = newUser.balance.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    setUser(newUser);
  };

  const loadToken = () => {
    let localToken =
      localStorage.getItem("token") !== null
        ? localStorage.getItem("token")
        : false;
    if (localToken) setToken(localToken);
  };

  useEffect(() => {
    loadToken();
  }, [token, user.token]);
  
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
