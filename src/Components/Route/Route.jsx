import { createBrowserRouter } from "react-router-dom";
import HomeLayout from "../Layout/Home/HomeLayout";

import Home from "../Home/Home";
import AuthLayout from "../Layout/AuthLayout/AuthLayout";
import Login from "../Login/Login";
import Signup from "../SignUp/Signup";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },
    ]
  },
  {
    element: <AuthLayout />, // This layout will have a simplified navbar
    children: [
      {
        path: "/login",
        element: <Login> </Login>
       
      },
      {
        path: "/signup",
        element: <Signup> </Signup>
       
      }
    ]
  }
]);