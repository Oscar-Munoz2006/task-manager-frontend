import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateTask, deleteTask } from "../api/tasks.api";
import toast from "react-hot-toast";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Flag, 
  Check 
} from "lucide-react";

const TASK_SAVED_EVENT = "task:saved";

function notifyTaskSaved() {
  window.dispatchEvent(new CustomEvent(TASK_SAVED_EVENT));
}

const statusStyles = {
  pendiente:  { label: "Pendiente",   class: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  en_proceso: { label: "En Progreso", class: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  completada: { label: "Completada",  class: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
};

const priorityStyles = {
  baja:  { label: "Baja",  class: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  media: { label: "Media", class: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  alta:  { label: "Alta",  class: "bg-red-500/10 text-red-400 border border-red-500/20" },
};

const priorityBar = {
  baja:  "bg-blue-500",
  media: "bg-amber-500",
  alta:  "bg-red-500",
};

function formatTime(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function TaskCard({ task, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const [currentTask, setCurrentTask] = useState(task);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  const isCompleted = currentTask.status === "completada";
  const status   = statusStyles[currentTask.status] || statusStyles.pendiente;
  const priority = priorityStyles[currentTask.priority] || priorityStyles.media;
  const bar      = priorityBar[currentTask.priority] || "bg-blue-500";

  const isOverdue =
    currentTask.deadline &&
    new Date(currentTask.deadline + "T23:59:59") < new Date() &&
    !isCompleted;

  const formattedTime = formatTime(currentTask.deadline_time);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (loading) return;
    const newStatus = isCompleted ? "pendiente" : "completada";
    setLoading(true);
    try {
      const updated = { ...currentTask, status: newStatus };
      if (!updated.deadline_time) delete updated.deadline_time;
      await updateTask(currentTask.id, updated);
      setCurrentTask(updated);
      onUpdate?.(currentTask.id, updated);
      notifyTaskSaved();
      toast.success(newStatus === "completada" ? "Tarea completada ✓" : "Tarea reabierta");
    } catch {
      toast.error("No se pudo actualizar la tarea");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    navigate(`/tasks/${currentTask.id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (loading) return;
    setLoading(true);
    try {
      await deleteTask(currentTask.id);
      onDelete?.(currentTask.id);
      notifyTaskSaved();
      toast.success("Tarea eliminada");
    } catch {
      toast.error("No se pudo eliminar la tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/tasks/${currentTask.id}`)}
      className={`relative bg-slate-800/40 border rounded-2xl p-5 flex flex-col gap-3.5 cursor-pointer transition-all overflow-hidden backdrop-blur-sm group
        ${isCompleted ? "border-slate-800/40 opacity-60" : "border-slate-700/50 hover:border-slate-600/60 hover:bg-slate-700/40 shadow-sm"}`}
    >
      {/* Indicador lateral de prioridad */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${bar} ${isCompleted ? "opacity-20" : "opacity-90"}`} />

      <div className="pl-1.5 flex flex-col gap-3 flex-1 justify-between">
        
        {/* Fila del Título y Menú */}
        <div className="flex items-start justify-between gap-4">
          <h3 className={`font-bold text-base leading-snug flex-1 tracking-tight group-hover:text-white transition-colors ${isCompleted ? "line-through text-slate-500" : "text-slate-100"}`}>
            {currentTask.title}
          </h3>

          <div ref={menuRef} className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-50 w-48 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden py-1">
                <button
                  onClick={handleToggleComplete}
                  disabled={loading}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                >
                  <span className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${isCompleted ? "bg-emerald-600 border-emerald-500 text-white" : "border-slate-500"}`}>
                    {isCompleted && <Check size={10} strokeWidth={4} />}
                  </span>
                  {isCompleted ? "Marcar pendiente" : "Marcar completada"}
                </button>

                <div className="border-t border-slate-800 my-1" />

                <button
                  onClick={handleEdit}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                >
                  <Pencil size={13} className="text-slate-400" />
                  Editar tarea
                </button>

                <div className="border-t border-slate-800 my-1" />

                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <Trash2 size={13} className="text-red-400" />
                  Eliminar tarea
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Descripción */}
        {currentTask.description && (
          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
            {currentTask.description}
          </p>
        )}

        {/* Badges de Estado y Prioridad */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          <span className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold tracking-wide uppercase ${status.class}`}>
            {status.label}
          </span>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold tracking-wide uppercase flex items-center gap-1 ${priority.class}`}>
            <Flag size={10} strokeWidth={2.5} /> {priority.label}
          </span>
        </div>

        {/* Tiempos y Fechas Límite */}
        {currentTask.deadline && (
          <div className={`flex items-center flex-wrap gap-1.5 text-[11px] mt-2 pt-2 border-t border-slate-800/60 ${isOverdue ? "text-red-400 font-semibold" : "text-slate-500"}`}>
            <span className="flex items-center justify-center">
              {isOverdue ? <AlertTriangle size={12} className="text-red-400" /> : <Calendar size={12} />}
            </span>
            <span>
              {new Date(currentTask.deadline + "T00:00:00").toLocaleDateString("es-CO", {
                year: "numeric", month: "short", day: "numeric",
              })}
            </span>
            {formattedTime && (
              <>
                <span className="text-slate-700 font-bold">·</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {formattedTime}
                </span>
              </>
            )}
            {isOverdue && <span className="ml-auto font-bold uppercase tracking-wider text-[9px] bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md">Vencida</span>}
          </div>
        )}

      </div>
    </div>
  );
}