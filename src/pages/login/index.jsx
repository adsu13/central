import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@src/context/userContext";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { toast } from "react-toastify";
import api from "@src/services/api";
import { MdOutlineKey } from "react-icons/md";
import { CiLogin } from "react-icons/ci";
import { GlobalStyle } from "../../styles/globalStyles";
import { Container } from "./styles";
function Login() {
  const [loginToken, setLoginToken] = useState("");
  const [isLoading, setLoading] = useState(false);
  const { saveToken, token } = useUser();
  const navigate = useNavigate();
  const handleSumit = (e) => {
    e.preventDefault();
    setLoading(true);
    if (
      loginToken.length <= 0 ||
      loginToken.length < 32 ||
      loginToken.length > 32
    ) {
      toast("seu token não pode ser inválido");
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      return;
    }
    api
      .post("/api/users/login", { token: loginToken })
      .then((response) => {
        saveToken(response.data);
        navigate("/");
      })
      .catch((err) => {
        toast("Token inválido!");
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      });
  };
  useEffect(() => {
    if (token) navigate("/");
  }, [token, isLoading]);
  return (
    <Container>
      <GlobalStyle></GlobalStyle>
      <img src="./logo.png" alt="logo" />
      <Form data-bs-theme="dark" className="container" onSubmit={handleSumit}>
        <InputGroup className="mb-3 mw1">
          <InputGroup.Text id="basic-addon1">
            <MdOutlineKey />
          </InputGroup.Text>
          <Form.Control
            placeholder="Seu token de usuário."
            aria-label="Username"
            aria-describedby="basic-addon1"
            value={loginToken}
            onChange={(e) => setLoginToken(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <CiLogin />
            )}
          </Button>
        </InputGroup>
      </Form>
    </Container>
  );
}
export default Login;