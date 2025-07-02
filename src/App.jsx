import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Routes from "./routes";
import { UserProvider } from "@src/context/userContext";
import { GlobalStyle } from "@src/styles/globalStyles";

function App() {
  return (
    <>
      <UserProvider>
        <Routes />
        <GlobalStyle />
        <ToastContainer theme="dark" />
      </UserProvider>
    </>
  );
}

export default App;
