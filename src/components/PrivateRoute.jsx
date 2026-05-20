import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const isAuth = localStorage.getItem("isAuth") === "true";
  return isAuth ? children : <Navigate to="/login" />;
}