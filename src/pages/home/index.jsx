import React, { useEffect, useState } from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import InputGroup from "react-bootstrap/InputGroup";

import api from "@src/services/api";
import Auth from "@src/functions/auth";

import Button from "react-bootstrap/esm/Button";
import { useUser } from "../../context/userContext";


import { RiShutDownLine } from "react-icons/ri";
import { FaUserSecret } from "react-icons/fa";
import { IoEllipsisVerticalOutline } from "react-icons/io5";
import { GiCash } from "react-icons/gi";

import { useNavigate } from "react-router-dom";
import Spinner from "react-bootstrap/esm/Spinner";
import { toast } from "react-toastify";
function Home() {
  const { user, token, updateUser, updateToken } = useUser();
  const navigate = useNavigate();
  const [gateways, setGateways] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState("");
  const [ccs, setCcs] = useState("");
  const [loading, setLoading] = useState(false);

  let [approved, setApproved] = useState([]);
  let [rejected, setRejected] = useState([]);

  const Logout = () => {
    localStorage.removeItem("token");
    updateToken(false);
    navigate("/login");
  };

  const handleGate = async (e) => {
    e.preventDefault();
    if (user.balance <= 0) {
      return toast("Você não tem creditos!");
    }
    if (selectedGateway == "") {
      return toast("selecione um gateway!");
    }

    let loop = false;
    let list = ccs.split("\n");
    setLoading(true);
    for (let i = 0; i < list.length; i++) {
      if (user.balance < 1 || loop) {
        toast("Seus creditos acabaram!");
        break;
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      api
        .post(
          "/api/gateways/gateway",
          { lista: list[i], gateway: selectedGateway },
          config
        )
        .then((response) => {
          if (!response.data.cc) {
            loop = true;
          } else {
            if (response.data.cc.includes("LIVE")) {
              setApproved((oldArray) => [
                ...oldArray,
                `<span class="green">${response.data.cc}</span>`,
              ]);
            } else if (response.data.cc.includes("LIVE")) {
              setRejected((oldArray) => [
                ...oldArray,
                `<span class="red">${response.data.cc}</span>`,
              ]);
            }
          }

          updateUser(response.data.user);
        })
        .catch((err) => {
          if (err.response.data.message == "insufficient credits!") {
            loop = true;
          }
        });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!token) {
    navigate("/login");
    return;
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  api.get("/api/users/user", config)
    .then((response) => {
      updateUser(response.data);
    })
    .catch((err) => {
      console.error("Token inválido ou API fora:", err.message);
      // Remove o token e redireciona
      localStorage.removeItem("token");
      updateToken(false);
      navigate("/login");
    });

    api.get("/api/gateways/allgateways", config).then((response) => {
      setGateways(response.data);
    });
  }, [user.balance, token, loading]);
 return (
  <div style={{
    minHeight: "100vh",
    background: "linear-gradient(to right, #000000, #1a1a1a, #000000)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem"
  }}>
    <div style={{
      backgroundColor: "#181818",
      color: "white",
      borderRadius: "0.5rem",
      boxShadow: "0 0 20px rgba(0,0,0,0.5)",
      width: "100%",
      maxWidth: "600px",
      padding: "1.5rem"
    }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
        Olá <span style={{ fontWeight: "bold" }}>{user?.nickname || "Admin"}</span>, você possui <span style={{ color: "limegreen" }}>{user?.balance || 0}</span> Crédito(s).
      </h2>
      <p style={{ color: "limegreen", marginBottom: "1rem" }}>Conectado ✔</p>

      <textarea
        style={{
          backgroundColor: "black",
          color: "white",
          width: "100%",
          height: "8rem",
          borderRadius: "0.5rem",
          padding: "0.5rem",
          marginBottom: "1rem",
          resize: "none",
          border: "none"
        }}
        placeholder="Cole suas CCs aqui..."
        value={ccs}
        onChange={(e) => setCcs(e.target.value)}
      />

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#0f0f0f",
        padding: "0.5rem",
        borderRadius: "0.5rem",
        marginBottom: "1rem"
      }}>
        <select
          style={{
            backgroundColor: "#444",
            color: "white",
            borderRadius: "0.25rem",
            padding: "0.25rem 0.5rem",
            fontSize: "0.75rem",
            fontWeight: "bold",
            border: "none"
          }}
          onChange={(e) => setSelectedGateway(e.target.value)}
          value={selectedGateway}
        >
          <option value="">Selecione um Gateway</option>
          {gateways.map((gateway, index) => (
            <option key={index} value={gateway.gateway}>
              {gateway.gateway}
            </option>
          ))}
        </select>

          
      </div>

      <button
        style={{
          width: "100%",
          backgroundColor: "transparent",
          border: "1px solid white",
          color: "white",
          padding: "0.5rem",
          borderRadius: "0.5rem",
          cursor: "pointer"
        }}
        onClick={handleGate}
        disabled={loading}
      >
        {loading ? <Spinner animation="border" size="sm" /> : "Iniciar"}
      </button>
    </div>
  </div>
);



}

export default Home;
