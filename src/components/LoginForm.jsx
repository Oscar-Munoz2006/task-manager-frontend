import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api/login.api";
import { toast } from "react-hot-toast";

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
      const data = await loginRequest(username, password);

      if (data.access) {
        localStorage.setItem("token", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("isAuth", "true");
        
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
    <section className="bg-gradient-to-br from-[#000000] via-[#0d0d0d] to-[#1a1a1f] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Bloque de contexto/bienvenida */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Task Manager
          </h1>
          <p className="text-zinc-400 text-sm">
            Gestiona tus proyectos, organiza tus tareas diarias <br />
            y aumenta tu productividad en un solo lugar.
          </p>
        </div>

        {/* Card del Formulario */}
        <div className="w-full p-8 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl shadow-2xl shadow-black/50 border border-white/10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Iniciar sesión</h2>
            <p className="text-zinc-500 text-xs">Ingresa tus datos para acceder a tu tablero</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={username}
              placeholder="Usuario"
              onChange={(e) => setUsername(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-zinc-500 transition-all"
            />
            <input
              type="password"
              value={password}
              placeholder="Contraseña"
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-zinc-500 transition-all"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              Entrar al gestor
            </button>
          </form>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md mt-4 py-2">
               <p className="text-red-400 text-center text-xs font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Footer simple */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          ¿Problemas para ingresar? Contacta soporte técnico.
        </p>
      </div>
    </section>
  );
}