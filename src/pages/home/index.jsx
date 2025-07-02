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

import { Container, RawCC, Welcome } from "./styles";

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
    if (!token) return;

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    api.get("/api/users/user", config).then((response) => {
      updateUser(response.data);
    });

    api.get("/api/gateways/allgateways", config).then((response) => {
      setGateways(response.data);
    });
  }, [user.balance, token, loading]);

  return (
    <Container>
      <Auth />
      <Form data-bs-theme="dark" onSubmit={handleGate}>
        <Welcome>
          <img src="./logo.png" alt="logo" />
          <div>
            <FaUserSecret />
            <b>
              {user.nickname == undefined ? (
                <Spinner animation="border" variant="primary" />
              ) : (
                user.nickname
              )}
            </b>
            <IoEllipsisVerticalOutline />
            <GiCash />
            <b>
              {user.balance == undefined ? (
                <Spinner animation="border" variant="primary" />
              ) : (
                user.balanceFormated
              )}
            </b>
          </div>
          <Button onClick={Logout} variant="primary">
            <RiShutDownLine />
          </Button>
        </Welcome>

        <Form.Control
          disabled={loading}
          as="textarea"
          value={ccs}
          onChange={(e) => setCcs(e.target.value)}
          placeholder="CC'S"
        />
        <InputGroup className="mb-3">
          <DropdownButton
            variant="outline-secondary"
            title="GATEWAY"
            id="input-group-dropdown-1"
          >
            {gateways.length <= 0 && <Spinner />}
            {gateways.map((g, index) => (
              <Dropdown.Item
                key={index}
                href="#"
                onClick={() =>
                  setSelectedGateway({ name: g.gateway, route: g.route })
                }
              >
                {g.gateway}
              </Dropdown.Item>
            ))}
          </DropdownButton>
          <Form.Control
            readOnly
            defaultValue={selectedGateway.name}
            aria-label="Text input with dropdown button"
          />
          <Button disabled={loading} type="submit">
            {loading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Iniciar"
            )}
          </Button>
        </InputGroup>
      </Form>
      <Accordion data-bs-theme="dark" defaultActiveKey={["0"]} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header className="approved">
            Aprovadas {approved.length}
          </Accordion.Header>
          <Accordion.Body>
            <RawCC
              contentEditable
              dangerouslySetInnerHTML={{ __html: approved.join(" ") }}
            />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header className="rejected">
            Reprovadas {rejected.length}
          </Accordion.Header>
          <Accordion.Body>
            <RawCC
              contentEditable
              dangerouslySetInnerHTML={{ __html: rejected.join(" ") }}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}

export default Home;
