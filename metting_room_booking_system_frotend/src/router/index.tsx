import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import PasswordPage from "../pages/PasswordPage";
import ProfilePage from "../pages/ProfilePage";
import HomePage from "../pages/HomePage";
import AuthGuard from "../components/AuthGuard";
import HistoryPage from "../pages/HistoryPage";
import MeetingRoomListPage from "../pages/MeetingRoomListPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGuard>
        <HomePage />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/meeting-rooms" replace />,
      },
      {
        path: "meeting-rooms",
        element: <MeetingRoomListPage />,
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/update-password",
    element: <PasswordPage />,
  },
]);

export default router;
