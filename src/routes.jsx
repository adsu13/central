import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "@pages/home";
import Login from "@pages/login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "login",
    element: <Login/>
  }
]);

const Routes = () => {
  return <RouterProvider router={router} />;
};

export default Routes;
