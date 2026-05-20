import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateTask, deleteTask } from "../api/tasks.api";
import toast from "react-hot-toast";

const TASK_SAVED_EVENT = "task:saved";

function notifyTaskSaved() {
  window.dispatchEvent(new CustomEvent(TASK_SAVED_EVENT));
}

const statusStyles = {
  pendiente:  { label: "Pendiente",   class: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30" },
  en_proceso: { label: "En Progreso", class: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
  completada: { label: "Completada",  class: "bg-green-500/15 text-green-400 border border-green-500/30" },
};

const priorityStyles = {
  baja:  { label: "Baja",  class: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
  media: { label: "Media", class: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  alta:  { label: "Alta",  class: "bg-red-500/15 text-red-400 border border-red-500/30" },
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
      className={`relative bg-[#1e293b] border rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-all overflow-hidden
        ${isCompleted ? "border-white/5 opacity-70" : "border-white/10 hover:border-white/20 hover:bg-[#243047]"}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${bar} ${isCompleted ? "opacity-20" : ""}`} />

      <div className="pl-2 flex flex-col gap-3">

        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-semibold text-base leading-snug flex-1 ${isCompleted ? "line-through text-slate-500" : "text-slate-100"}`}>
            {currentTask.title}
          </h3>

          <div ref={menuRef} className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors text-lg leading-none"
            >
              ⋯
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-50 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                <button
                  onClick={handleToggleComplete}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors text-left"
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isCompleted ? "bg-green-500 border-green-500" : "border-slate-500"}`}>
                    {isCompleted && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {isCompleted ? "Marcar pendiente" : "Marcar completada"}
                </button>

                <div className="border-t border-white/5" />

                <button
                  onClick={handleEdit}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors text-left"
                >
                  <span>✏️</span>
                  Editar
                </button>

                <div className="border-t border-white/5" />

                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <span>🗑️</span>
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
          {currentTask.description}
        </p>

        <div className="flex flex-wrap gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.class}`}>
            {status.label}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priority.class}`}>
            ⚑ {priority.label}
          </span>
        </div>

        {currentTask.deadline && (
          <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? "text-red-400 font-semibold" : "text-slate-500"}`}>
            <span>{isOverdue ? "⚠" : "📅"}</span>
            <span>
              {new Date(currentTask.deadline + "T00:00:00").toLocaleDateString("es-CO", {
                year: "numeric", month: "short", day: "numeric",
              })}
            </span>
            {formattedTime && (
              <>
                <span className="text-slate-600">·</span>
                <span>🕐 {formattedTime}</span>
              </>
            )}
            {isOverdue && <span className="ml-1">Vencida</span>}
          </div>
        )}

      </div>
    </div>
  );
}