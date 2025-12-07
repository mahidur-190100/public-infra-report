import { createBrowserRouter } from "react-router-dom";
import HomeLayout from "../Layout/Home/HomeLayout";

import Home from "../Home/Home";
import AuthLayout from "../Layout/AuthLayout/AuthLayout";
import Login from "../Login/Login";
import Signup from "../SignUp/Signup";
import About from "../About/About";
import ContactUs from "../ContactUs/ContactUs";
import AllIssues from "../AllIssues/AllIssues";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "/issues",
        element: <AllIssues />,
        loader: () => fetch('http://localhost:3000/issues')
      },
      {
        path: "/about",
        element: <About />
      },
      {
        path: "/contact",
        element: <ContactUs />
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