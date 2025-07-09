import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "@pages/home";
import Login from "@pages/login";
import AdminPanel from "@pages/adminPanel";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "login",
    element: <Login/>
  },
    { path: "/admin", element: <AdminPanel /> },

]);
const Routes = () => {
  return <RouterProvider router={router} />;
};
export default Routes;
