import React, { useEffect, useState, useRef } from "react";
import Accordion from "react-bootstrap/Accordion";
import Spinner from "react-bootstrap/esm/Spinner";
import api from "@src/services/api";
import { useUser } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaRegCopy } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
function Home() {
  const { user, token, updateUser, updateToken } = useUser();
  const navigate = useNavigate();
  const [gateways, setGateways] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState("");
  const [ccs, setCcs] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const shouldStopRef = useRef(false);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [errors, setErrors] = useState([]);
  const handleStartStop = async (e) => {
    e.preventDefault();
    if (isRunning) {
      shouldStopRef.current = true;
      setIsRunning(false);
      return;
    }
    shouldStopRef.current = false;
    if (user.balance <= 0) {
      toast.error("Você não tem créditos suficientes para realizar esta ação!", {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    }
    if (selectedGateway === "") {
      toast.warn("Selecione um gateway!");
      return;
    }
    const list = ccs.split("\n").filter((l) => l.trim() !== "");
    if (list.length === 0) {
      toast.warn("Cole suas CCs para processar.");
      return;
    }
    setApproved([]);
    setRejected([]);
    setErrors([]);
    setIsRunning(true);
    const maxThreads = user.threads || 1;
    async function processItem(item) {
      if (user.balance < 1 || shouldStopRef.current) {
        if (shouldStopRef.current) {
          toast.info("Processo parado pelo usuário!");
        } else {
          toast.info("Seus créditos acabaram!");
        }
        shouldStopRef.current = true;
        return;
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
          { lista: item, gateway: JSON.parse(selectedGateway) },
          config
        );
        const cc = response.data.cc || "";
        const status = cc.toUpperCase();
        const normalizedStatus = status.toLowerCase();
        if (!cc) {
          shouldStopRef.current = true;
        } else if (normalizedStatus.includes("aprov") || normalizedStatus.includes("live")) {
          setApproved((prev) => [...prev, cc]);
        } else if (normalizedStatus.includes("reprov") || normalizedStatus.includes("die")) {
          setRejected((prev) => [...prev, cc]);
        } else {
          setErrors((prev) => [...prev, `[ERRO] ${item}`]);
        }
        updateUser(response.data.user);
      } catch (err) {
        if (err.response?.data?.message === "insufficient credits!") {
          shouldStopRef.current = true;
          toast.info("Créditos insuficientes!");
        } else {
          setErrors((prev) => [...prev, `Erro em: ${item}`]);
        }
      }
    }
    async function processWithThreads(items, threadLimit) {
      let index = 0;
      const executing = [];
      async function enqueue() {
        if (shouldStopRef.current) return;
        if (index === items.length) return;
        const item = items[index++];
        const p = processItem(item).finally(() => {
          executing.splice(executing.indexOf(p), 1);
        });
        executing.push(p);
        if (executing.length >= threadLimit) {
          await Promise.race(executing);
        }
        return enqueue();
      }
      await enqueue();
      await Promise.all(executing);
      setIsRunning(false);
    }
    await processWithThreads(list, maxThreads);
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
  }, [user.balance, token, isRunning]);
  const copyToClipboard = (items, label) => {
    const text = items.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      toast(
        <div style={{
          color: "#999999",
          fontWeight: "bold",
          textAlign: "center",
          fontSize: "0.9rem",
        }}>
          ✅ {label} copiadas para a área de transferência!
        </div>,
        {
          position: "top-rigth",
          autoClose: 3000,
          style: {
            background: "transparent",
            boxShadow: "none",
            padding: 0,
            margin: 0,
          }
        }
      );

    });
  };
  return (
    <div style={styles.container}>
      <style>{css}</style>
      <div style={styles.card}>
        <h2 style={styles.title}>
          Olá <span style={{ fontWeight: "bold" }}>{user?.nickname || "Admin"}</span>, você possui{" "}
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
          onClick={handleStartStop}
          disabled={isRunning && shouldStopRef.current}
        >
          {isRunning ? (
            shouldStopRef.current ? (
              "Parando..."
            ) : (
              <>
                <Spinner animation="border" size="sm" /> Parar
              </>
            )
          ) : (
            "Iniciar"
          )}
        </button>
        <Accordion defaultActiveKey={["0"]} alwaysOpen style={styles.accordion}>
          <Accordion.Item eventKey="0" style={styles.accordionItem}>
            <Accordion.Header className="approved">
              <span>Aprovadas ({approved.length})</span>
              <FaRegCopy
                style={{ cursor: "pointer", marginLeft: "auto" }}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(approved, "Aprovadas");
                }}
                title="Copiar aprovadas"
              />
            </Accordion.Header>
            <Accordion.Body>
              <div style={styles.approvedText}>
                {approved.map((item, i) => (
                  <div key={i} className="green">
                    {item}
                  </div>
                ))}
              </div>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1" style={styles.accordionItem}>
            <Accordion.Header className="rejected">
              <span>Reprovadas ({rejected.length})</span>
              <FaRegCopy
                style={{ cursor: "pointer", marginLeft: "auto" }}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(rejected, "Reprovadas");
                }}
                title="Copiar reprovadas"
              />
            </Accordion.Header>
            <Accordion.Body>
              <div style={styles.rejectedText}>
                {rejected.map((item, i) => (
                  <div key={i} className="red">
                    {item}
                  </div>
                ))}
              </div>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2" style={styles.accordionItem}>
            <Accordion.Header className="errors">
              <span>Erros ({errors.length})</span>
              <FaRegCopy
                style={{ cursor: "pointer", marginLeft: "auto" }}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(errors, "Erros");
                }}
                title="Copiar erros"
              />
            </Accordion.Header>
            <Accordion.Body>
              <div style={styles.errorText}>
                {errors.map((item, i) => (
                  <div key={i} className="orange">
                    {item}
                  </div>
                ))}
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}
export default Home;
const css = `
.Toastify__progress-bar {
  background: white !important;
}

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

.accordion-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #111 !important;
  color: #fff !important;
  font-weight: bold;
  transition: background-color 0.2s ease-in-out;
  border: none !important;
}

.accordion-button:not(.collapsed) {
  background-color: #1f1f1f !important;
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

.accordion-button::after {
  display: none !important;
}

.accordion-body {
  background-color: #0f0f0f !important;
  color: white !important;
  border-top: 1px solid #333;
}

button:focus {
  outline: none !important;
  box-shadow: none !important;
  border-color: white !important;
}
`;

// ======================
// Estilos inline
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem"
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
    fontFamily: "monospace",
    lineHeight: "1.5rem",
  },
  rejectedText: {
    whiteSpace: "pre-wrap",
    fontFamily: "monospace",
    lineHeight: "1.5rem",
  },
  errorText: {
    whiteSpace: "pre-wrap",
    fontFamily: "monospace",
    lineHeight: "1.5rem",
  },
};