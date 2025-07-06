import React, { useEffect, useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import Spinner from "react-bootstrap/esm/Spinner";
import api from "@src/services/api";
import { useUser } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Home() {
  const { user, token, updateUser, updateToken } = useUser();
  const navigate = useNavigate();
  const [gateways, setGateways] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState("");
  const [ccs, setCcs] = useState("");
  const [loading, setLoading] = useState(false);

  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [errors, setErrors] = useState([]);

  const handleGate = async (e) => {
    e.preventDefault();
    if (user.balance <= 0) {
      return toast("Você não tem creditos!");
    }
    if (selectedGateway === "") {
      return toast("Selecione um gateway!");
    }

    let loop = false;
    const list = ccs.split("\n").filter((l) => l.trim() !== "");
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

      try {
        const response = await api.post(
          "/api/gateways/gateway",
          { lista: list[i], gateway: JSON.parse(selectedGateway) },
          config
        );

        const cc = response.data.cc || "";
        const status = cc.toUpperCase();

        if (!cc) {
          loop = true;
        } else if (status.includes("Reprovada") || status.includes("LIVE")) {
          setApproved((prev) => [
            ...prev,
            `<span class="green">${cc}<br></span>`,
          ]);
        } else if (status.includes("Reprovada") || status.includes("DIE")){
          setRejected((prev) => [
            ...prev,
            `<span class="red">${cc}<br></span>`,
          ]);
        }else{
          setErrors((prev) => [
            ...prev,
            `<span class="orange">[ERRO]${list[i]}<br></span>`,
          ]);
        }

        updateUser(response.data.user);
      } catch (err) {
        if (err.response?.data?.message === "insufficient credits!") {
          loop = true;
        } else {
          setErrors((prev) => [
            ...prev,
            `<span class="orange">Erro em: ${list[i]}<br></span>`,
          ]);
        }
      }

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

    api
      .get("/api/users/user", config)
      .then((res) => updateUser(res.data))
      .catch((err) => {
        console.error("Token inválido:", err.message);
        localStorage.removeItem("token");
        updateToken(false);
        navigate("/login");
      });

    api.get("/api/gateways/allgateways", config).then((res) => {
      setGateways(res.data);
    });
  }, [user.balance, token, loading]);

  return (
    <div style={styles.container}>
      <style>{css}</style>
      <div style={styles.card}>
        <h2 style={styles.title}>
          Olá{" "}
          <span style={{ fontWeight: "bold" }}>{user?.nickname || "Admin"}</span>, você possui{" "}
          <span style={{ color: "limegreen" }}>{user?.balance || 0}</span> Crédito(s).
        </h2>
        <p style={{ color: "limegreen", marginBottom: "1rem" }}>Conectado ✔</p>

        <textarea
          style={styles.textarea}
          placeholder="Cole suas CCs aqui..."
          value={ccs}
          onChange={(e) => setCcs(e.target.value)}
        />

        <div style={styles.gatewayContainer}>
          <select
            style={styles.select}
            onChange={(e) => setSelectedGateway(e.target.value)}
            value={selectedGateway}
          >
            <option value="">Selecione um Gateway</option>
            {gateways.map((gateway, index) => (
              <option key={index} value={JSON.stringify(gateway)}>
                {gateway.gateway}
              </option>
            ))}
          </select>
        </div>

        <button
          style={styles.button}
          onClick={handleGate}
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : "Iniciar"}
        </button>

        <Accordion
          data-bs-theme="dark"
          defaultActiveKey={["0"]}
          alwaysOpen
          style={styles.accordion}
        >
          <Accordion.Item eventKey="0" style={styles.accordionItem}>
            <Accordion.Header className="approved">Aprovadas ({approved.length})</Accordion.Header>
            <Accordion.Body>
              <div
                contentEditable
                dangerouslySetInnerHTML={{ __html: approved.join(" ") }}
                style={styles.approvedText}
              />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1" style={styles.accordionItem}>
            <Accordion.Header className="rejected">Reprovadas ({rejected.length})</Accordion.Header>
            <Accordion.Body>
              <div
                contentEditable
                dangerouslySetInnerHTML={{ __html: rejected.join(" ") }}
                style={styles.rejectedText}
              />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="2" style={styles.accordionItem}>
            <Accordion.Header className="errors">Erros ({errors.length})</Accordion.Header>
            <Accordion.Body>
              <div
                contentEditable
                dangerouslySetInnerHTML={{ __html: errors.join(" ") }}
                style={styles.errorText}
              />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}

export default Home;

// ======================
// ✅ CSS embutido
// ======================

const css = `
.green {
  color: limegreen;
  font-weight: bold;
}
.red {
  color: crimson;
  font-weight: bold;
}
.orange {
  color: orange;
  font-weight: bold;
}
textarea, button, select, .accordion-button {
  outline: none !important;
  box-shadow: none !important;
}
.accordion-button:not(.collapsed) {
  background-color: #0f0f0f !important;
  color: white !important;
  box-shadow: none !important;
}
.accordion-button:focus {
  box-shadow: none !important;
  border-color: transparent !important;
  outline: none !important;
}
.accordion-button:hover {
  background-color: #1a1a1a !important;
  color: white !important;
}
button:focus {
  outline: none !important;
  box-shadow: none !important;
  border-color: white !important;
}
.accordion-button::after {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 5.646a.5.5 0 0 1 .708 0L8 11.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 1rem;
  transform: rotate(0deg);
}
`;

// ======================
// ✅ Estilos inline
// ======================

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #000000, #1a1a1a, #000000)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
  },
  card: {
    backgroundColor: "#181818",
    color: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
    width: "100%",
    maxWidth: "600px",
    padding: "1.5rem",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  textarea: {
    backgroundColor: "black",
    color: "white",
    width: "100%",
    height: "8rem",
    borderRadius: "0.5rem",
    padding: "0.5rem",
    marginBottom: "1rem",
    resize: "none",
    border: "none",
  },
  gatewayContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
  },
  select: {
    backgroundColor: "#444",
    color: "white",
    borderRadius: "0.25rem",
    padding: "0.25rem 0.5rem",
    fontSize: "0.75rem",
    fontWeight: "bold",
    border: "none",
  },
  button: {
    width: "100%",
    backgroundColor: "transparent",
    border: "1px solid white",
    color: "white",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
  },
  accordion: {
    marginTop: "1rem",
    backgroundColor: "#0f0f0f",
    borderRadius: "0.5rem",
  },
  accordionItem: {
    backgroundColor: "#0f0f0f",
    color: "white",
    border: "none",
  },
  approvedText: {
    whiteSpace: "pre-wrap",
    color: "limegreen",
    fontFamily: "monospace",
  },
  rejectedText: {
    whiteSpace: "pre-wrap",
    color: "crimson",
    fontFamily: "monospace",
  },
  errorText: {
    whiteSpace: "pre-wrap",
    color: "orange",
    fontFamily: "monospace",
  },
};
