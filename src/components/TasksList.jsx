import { useEffect, useState } from "react";
import { getALLTasks } from "../api/tasks.api";
import { TaskCard } from "./TaskCard";
import { useNavigate } from "react-router-dom";

export default function TasksList() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    async function LoadTask() {
      const res = await getALLTasks();
      setTasks(res.data);
    }
    LoadTask();
  }, []);

  const handleUpdate = (id, updatedTask) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
  };

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filtered = tasks.filter((task) => {
    const matchSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || task.status === filterStatus;
    const matchPriority = filterPriority === "all" || task.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const total       = tasks.length;
  const pendientes  = tasks.filter((t) => t.status === "pendiente").length;
  const enProceso   = tasks.filter((t) => t.status === "en_proceso").length;
  const completadas = tasks.filter((t) => t.status === "completada").length;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Mis tareas</h1>
            <p className="text-slate-400 text-sm mt-0.5">{total} tareas en total</p>
          </div>
          <button
            onClick={() => navigate("/tasks-create")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
          >
            + Nueva tarea
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",       value: total,       color: "text-slate-300",  bg: "bg-slate-700/30 border-slate-600/30" },
            { label: "Pendientes",  value: pendientes,  color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
            { label: "En progreso", value: enProceso,   color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
            { label: "Completadas", value: completadas, color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border px-4 py-3 flex flex-col gap-1 ${s.bg}`}>
              <span className="text-xs text-slate-400">{s.label}</span>
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[#1e293b] border border-white/10 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#1e293b] border border-white/10 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Progreso</option>
            <option value="completada">Completada</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#1e293b] border border-white/10 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="all">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-4xl">📭</span>
            <p className="text-slate-400 text-base">No se encontraron tareas</p>
            {search || filterStatus !== "all" || filterPriority !== "all" ? (
              <button
                onClick={() => { setSearch(""); setFilterStatus("all"); setFilterPriority("all"); }}
                className="text-blue-400 text-sm hover:underline"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}