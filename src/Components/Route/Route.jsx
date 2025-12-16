// router.jsx
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
import AdminLayout from "../Dashboard/AdminLayout"; 
import StaffLayout from "../Dashboard/StaffLayout"; 
import StaffDashboard from "../Dashboard/StaffDashboard";
import ResolvedIssues from "../ResolvedIssues/ResolvedIssues";
import PendingIssues from "../PendingIssues/PendingIssues";
import AssignedIssue from "../AssignedIssue/AssignedIssue";
import RejectIssue from "../../RejectIssue/RejectIssue";
import ManageCitizens from "../ManageCitizens/ManageCitizens";
import ProtectedRoute from "../../ProtectedRoute/ProtectedRoute";


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
            const response = await fetch('https://public-infra-report-server.vercel.app/issues');
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
      
        element:
        <ProtectedRoute> 
          <IssueDetails />
        </ProtectedRoute>,
        loader: ({ params }) => fetch(`https://public-infra-report-server.vercel.app/issues/${params.id}`)
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
  // Regular Dashboard Layout (for users/citizens)
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
        path: 'submit-issue',
        element: <SubmitIssue />
      },
      {
        path: 'my-issues',
        element: <MyIssue />
      },
      {
        path: 'premium',
        element: <PremiumSubscription />
      },
      {
        path: 'payment-success',
        element: <PaymentSuccess />
      },
    ]
  },
  // Admin routes with AdminLayout
  {
    path: '/dashboard/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardHome />
      },
      {
        path: 'assign-staff',
        element: <AssignStaff />
      },
      {
        path: 'manage-staff',
        element: <ManageStaff />
      },
      {
        path: 'payments',
        element: <ViewPayment />
      },
      {
        path: "reject-issues",
        element: <RejectIssue></RejectIssue>
      },
      {
        path: 'manage-citizens',
        element: <ManageCitizens></ManageCitizens>
      }
    ]
  },
  // Staff routes with StaffLayout
  {
    path: '/dashboard/staff',
    element: <StaffLayout />,
    children: [
      {
        index: true,
        element: <StaffDashboard />
      },
      {
        path: 'my-issues',
        element: <AssignedIssue></AssignedIssue> // You need to create this component
      },
      {
        path: 'pending-issues',
        element: <PendingIssues /> // You need to create this component
      },
      {
        path: 'resolved-issues',
        element: <ResolvedIssues /> // You need to create this component
      },
      // {
      //   path: 'today-tasks',
      //   element: <TodayTasks /> // You need to create this component
      // },
      // {
      //   path: 'rejected-issues',
      //   element: <RejectedIssues /> // You need to create this component
      // },
    ]
  }
]);