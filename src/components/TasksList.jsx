import { useEffect, useState } from "react";
import { getALLTasks } from "../api/tasks.api";
import { TaskCard } from "./TaskCard";
import { useNavigate } from "react-router-dom";
import { Search, FolderOpen, SlidersHorizontal, Plus } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Mis tareas</h1>
            <p className="text-slate-400 text-sm mt-0.5">{total} tareas registradas en total</p>
          </div>
          <button
            onClick={() => navigate("/tasks-create")}
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Plus size={16} /> Nueva tarea
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",       value: total,       color: "text-slate-200",  bg: "bg-slate-800/40 border-slate-700/40" },
            { label: "Pendientes",  value: pendientes,  color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
            { label: "En progreso", value: enProceso,   color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
            { label: "Completadas", value: completadas, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border px-5 py-4 flex flex-col gap-1 backdrop-blur-sm ${s.bg}`}>
              <span className="text-xs text-slate-400 font-medium">{s.label}</span>
              <span className={`text-2xl font-extrabold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 bg-slate-800/30 p-3 rounded-2xl border border-slate-700/30 backdrop-blur-sm">
          {/* Buscador con icono integrado */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Selectores estilizados */}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900/60 border border-slate-700/50 text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer min-w-[150px] flex-1 sm:flex-none"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Progreso</option>
              <option value="completada">Completada</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-900/60 border border-slate-700/50 text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer min-w-[150px] flex-1 sm:flex-none"
            >
              <option value="all">Todas las prioridades</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        {/* Lista de Tareas / Estado Vacío */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-700/60 bg-slate-800/10 rounded-2xl gap-3">
            <div className="p-4 rounded-full bg-slate-800 text-slate-500">
              <FolderOpen size={32} />
            </div>
            <div className="text-center">
              <p className="text-slate-300 text-base font-semibold">No se encontraron tareas</p>
              <p className="text-slate-500 text-xs mt-0.5">Prueba cambiando los filtros o agregando un nuevo registro.</p>
            </div>
            {search || filterStatus !== "all" || filterPriority !== "all" ? (
              <button
                onClick={() => { setSearch(""); setFilterStatus("all"); setFilterPriority("all"); }}
                className="text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors mt-2 flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                <SlidersHorizontal size={12} /> Limpiar filtros
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