import { Link, useNavigate } from "react-router-dom";

export default function Navigation() {
  const navigate = useNavigate();
  const isAuth = localStorage.getItem("isAuth") === "true";
  const handleLogout = () => {
    localStorage.removeItem("isAuth");
    navigate("/login");
  };
  return (
    <div>
      {/* {!isAuth && <Link to="/login">Login</Link>}
      {isAuth && (
        <>
          <Link to="/tasks">Tasks</Link>
          <Link to="/tasks-create">Create Task</Link>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </>
      )} */}
    </div>
  );
}
