import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const isAuth = localStorage.getItem("isAuth") === "true";

  const handleLogout = () => {
    localStorage.removeItem("isAuth");
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-[#000000] via-[#0d0d0d] to-[#1a1a1f] text-white px-6 py-4 flex justify-between items-center shadow-lg shadow-black/50 border-b border-white/5">
      <div className="font-bold text-xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        Task Manager
      </div>

      <div className="flex gap-6">
        {/* Si el usuario está autenticado */}
        {isAuth ? (
          <>
            <Link
              to="/tasks"
              className="hover:text-blue-400 transition-colors duration-200 font-medium"
            >
              Tareas
            </Link>
            <Link
              to="/tasks-create"
              className="hover:text-blue-400 transition-colors duration-200 font-medium"
            >
              Crear tarea
            </Link>
            <button
              onClick={handleLogout}
              className="hover:text-red-400 transition-colors duration-200 font-medium"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          // Si NO está autenticado
          <>
            <Link
              to="/login"
              className="hover:text-blue-400 transition-colors duration-200 font-medium"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="hover:text-blue-400 transition-colors duration-200 font-medium"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
