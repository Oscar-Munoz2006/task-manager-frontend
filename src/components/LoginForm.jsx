import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api/login.api";
import { toast } from "react-hot-toast";
import { CheckSquare, User, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await fetch("https://task-manager-backend-production-6faf.up.railway.app/api/v1/login/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        localStorage.setItem("isAuth", "true");
        localStorage.setItem("username", username);
        toast.success(`¡Bienvenido, ${username}!`);
        navigate("/tasks");
      } else {
        setError("Credenciales inválidas");
      }
    } catch (err) {
      setError("Error en el servidor");
      console.log(err);
    }
  };
  return (
    <section className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Cabecera / Identidad */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 text-white">
            <CheckSquare size={24} />
          </div>
          <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Task Manager
          </h1>
          <p className="text-slate-400 text-sm max-w-xs">
            Organiza tus proyectos diarios y controla tus prioridades en un solo lugar.
          </p>
        </div>

        {/* Card del Formulario */}
        <div className="w-full p-8 bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/30 border border-slate-700/50">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-100">Iniciar sesión</h2>
            <p className="text-slate-400 text-xs mt-0.5">Ingresa tus datos para acceder a tu tablero</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Input Usuario */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <User size={18} />
              </span>
              <input
                type="text"
                value={username}
                placeholder="Usuario"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/60 text-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-slate-500 transition-all"
              />
            </div>

            {/* Input Contraseña */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                placeholder="Contraseña"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/60 text-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-slate-500 transition-all"
              />
            </div>

            {/* Botón de Acción */}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/10 cursor-pointer mt-2"
            >
              Entrar al gestor
            </button>
          </form>

          {/* Alertas de error humanas y discretas */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl mt-4 px-4 py-3 flex items-center gap-2.5">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Soporte */}
        <p className="text-center text-slate-500 text-xs mt-8">
          ¿Problemas para ingresar? Contacta al soporte técnico del sistema.
        </p>
      </div>
    </section>
  );
}