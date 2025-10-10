import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api/login.api";

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
      const res = await loginRequest(username, password);
      if (res.data?.success) {
        localStorage.setItem("isAuth", "true");
        navigate("/tasks");
      } else {
        setError(res.data?.error || "Credenciales inválidas");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error en el servidor");
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#000000] via-[#0d0d0d] to-[#1a1a1f] min-h-screen flex items-center justify-center">
    <div className="w-full max-w-sm p-8 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-lg shadow-2xl shadow-black/50 border border-white/10">
      <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        Bienvenido
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={username}
          placeholder="Usuario"
          onChange={(e) => setUsername(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-zinc-500"
        />
        <input
          type="password"
          value={password}
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-zinc-500"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg shadow-blue-500/20"
        >
          Iniciar sesión
        </button>
      </form>
      {error && <p className="text-red-400 mt-4 text-center text-sm">{error}</p>}
    </div>
  </section>
  );
}
