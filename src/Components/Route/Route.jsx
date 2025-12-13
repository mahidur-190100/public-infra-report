// router.jsx
import { createBrowserRouter } from "react-router-dom";
import HomeLayout from "../Layout/Home/HomeLayout";
import Home from "../Home/Home";
import AuthLayout from "../Layout/AuthLayout/AuthLayout";
import Login from "../Login/Login";
import Signup from "../SignUp/Signup";
import About from "../About/About";
import ContactUs from "../ContactUs/ContactUs";
import AllIssues from "../AllIssues/AllIssues";
import IssueDetails from "../IssueDetails.jsx/IssueDetails";
import DashboardLayout from "../Dashboard/DashboardLayout";
import DashboardHome from "../Dashboard/DashboardHome";
import SubmitIssue from "../SubmitIssue/SubmitIssue";
import MyIssue from "../MyIssue/MyIssue";
import PremiumSubscription from "../../PremiumSubscription/PremiumSubscription";
import PaymentSuccess from "../../PaymentSuccess/PaymentSuccess";
import ViewPayment from "../../ViewPayment/ViewPayment";
import AssignStaff from "../../AssignStaff/AssignStaff";
import ManageStaff from "../../ManageStaff/ManageStaff";


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
        loader: async () => {
          try {
            const response = await fetch('http://localhost:3000/issues');
            const data = await response.json();

            // Handle both old and new formats
            if (data.success && Array.isArray(data.issues)) {
              return data;
            } else if (Array.isArray(data)) {
              return { success: true, issues: data };
            } else if (data.issues && Array.isArray(data.issues)) {
              return data;
            }

            return { success: true, issues: [] };
          } catch (error) {
            console.error("Error in router loader:", error);
            return { success: false, issues: [], error: error.message };
          }
        }
      },
      {
        path: "issues/:id",
        element: <IssueDetails />,
        loader: ({ params }) => fetch(`http://localhost:3000/issues/${params.id}`)
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
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/signup",
        element: <Signup />
      }
    ]
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardHome />
      },
      // User routes
      {
        path: '/dashboard/submit-issue',
        element: <SubmitIssue />
      },
      {
        path: '/dashboard/my-issues',
        element: <MyIssue />
      },
      {
        path: '/dashboard/premium',
        element: <PremiumSubscription> </PremiumSubscription>
      },
      {
        path: '/dashboard/payment-success',
        element: <PaymentSuccess> </PaymentSuccess>
      },

      // Admin routes
      // {
      //   path: '/dashboard/admin/issues',
      //   element: <div className="p-6">Admin: View All Issues Page (TODO)</div>
      // },

      // admin
    
      {
        path: '/dashboard/admin/assign-staff',
        element: <AssignStaff> </AssignStaff>
      },
      // {
      //   path: '/dashboard/admin/reject-issues',
      //   element: <div className="p-6">Admin: Reject Issues Page (TODO)</div>
      // },
      {
        path: '/dashboard/admin/manage-staff',
        element: <ManageStaff> </ManageStaff>
      },
      // {
      //   path: '/dashboard/admin/manage-citizens',
      //   element: <div className="p-6">Admin: Manage Citizens Page (TODO)</div>
      // },
      {
        path: '/dashboard/admin/payments',
        element: <ViewPayment> </ViewPayment>
      },
    ]
  }
]);