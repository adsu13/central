import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@src/context/userContext";

function Auth() {
  const { token } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);
  return <></>;
}

export default Auth;
