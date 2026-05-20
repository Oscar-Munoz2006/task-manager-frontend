import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createTask, deleteTask, updateTask, getTask } from "../api/tasks.api";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { ConfirmModal } from "../components/ConfirmModal";
import { X, Save, Trash2, PlusCircle } from "lucide-react";

const TASK_SAVED_EVENT = "task:saved";

function notifyTaskSaved() {
  window.dispatchEvent(new CustomEvent(TASK_SAVED_EVENT));
}

export default function TaskFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const preselectedDate = location.state?.date;
  const [modal, setModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) return;
    if (!data.deadline_time) delete data.deadline_time;

    if (params.id) {
      setModal({
        message: "¿Guardar los cambios en esta tarea?",
        variant: "success",
        onConfirm: async () => {
          setModal(null);
          try {
            await updateTask(params.id, data);
            notifyTaskSaved();
            toast.success("Tarea actualizada correctamente");
            setTimeout(() => navigate("/tasks"), 1000);
          } catch {
            toast.error("Ocurrió un error, intenta de nuevo");
          }
        },
      });
    } else {
      try {
        setIsSubmitting(true);
        await createTask(data);
        notifyTaskSaved();
        toast.success("Tarea creada correctamente");
        setTimeout(() => navigate(preselectedDate ? "/calendar" : "/tasks"), 1000);
      } catch {
        toast.error("Ocurrió un error, intenta de nuevo");
        setIsSubmitting(false);
      }
    }
  });

  useEffect(() => {
    async function LoadTask() {
      if (params.id) {
        try {
          const { data } = await getTask(params.id);
          setValue("title", data.title);
          setValue("description", data.description);
          setValue("status", data.status);
          setValue("priority", data.priority);
          setValue("deadline", data.deadline);
          setValue("deadline_time", data.deadline_time);
        } catch {
          toast.error("No se pudo cargar la tarea");
        }
      } else if (preselectedDate) {
        setValue("deadline", preselectedDate);
      }
    }
    LoadTask();
  }, [params.id, preselectedDate]);

  const inputClass =
    "bg-slate-900/80 border border-slate-700/50 text-slate-200 placeholder-slate-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4">
      {modal && (
        <ConfirmModal
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal(null)}
          variant={modal.variant}
        />
      )}
      <form
        onSubmit={onSubmit}
        className="bg-slate-800/80 border border-slate-700/40 p-8 rounded-2xl w-full max-w-md flex flex-col gap-5 shadow-2xl shadow-black/40"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              params.id
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
            }`}>
              {params.id ? <Save size={18} /> : <PlusCircle size={18} />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {params.id ? "Editar tarea" : "Nueva tarea"}
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {params.id ? "Modifica los campos que necesites" : "Completa los campos para crear tu tarea"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(preselectedDate ? "/calendar" : "/tasks")}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="border-t border-slate-700/40" />

        {/* Título */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Título</label>
          <input
            type="text"
            placeholder="Ej: Entregar informe"
            {...register("title", { required: "El título es requerido" })}
            className={inputClass}
          />
          {errors.title && <span className="text-red-400 text-xs">{errors.title.message}</span>}
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Descripción</label>
          <textarea
            rows="3"
            placeholder="Describe la tarea..."
            {...register("description", { required: "La descripción es requerida" })}
            className={`${inputClass} resize-none`}
          />
          {errors.description && <span className="text-red-400 text-xs">{errors.description.message}</span>}
        </div>

        {/* Estado + Prioridad */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</label>
            <select {...register("status")} className={inputClass}>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Progreso</option>
              <option value="completada">Completada</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prioridad</label>
            <select {...register("priority")} className={inputClass}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        {/* Fecha + Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha límite</label>
            <input
              type="date"
              {...register("deadline")}
              style={{ colorScheme: "dark" }}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Hora <span className="text-slate-600 normal-case font-normal">(opcional)</span>
            </label>
            <input
              type="time"
              {...register("deadline_time")}
              style={{ colorScheme: "dark" }}
              className={inputClass}
            />
          </div>
        </div>

        <div className="border-t border-slate-700/40" />

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isSubmitting
                ? "bg-blue-900/50 text-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
            }`}
          >
            <Save size={15} />
            {isSubmitting ? "Guardando..." : "Guardar tarea"}
          </button>

          {params.id && (
            <button
              type="button"
              onClick={() =>
                setModal({
                  message: "¿Estás seguro de que quieres eliminar esta tarea?",
                  variant: "danger",
                  onConfirm: async () => {
                    setModal(null);
                    try {
                      await deleteTask(params.id);
                      notifyTaskSaved();
                      toast.success("Tarea eliminada");
                      setTimeout(() => navigate("/tasks"), 1000);
                    } catch {
                      toast.error("No se pudo eliminar la tarea");
                    }
                  },
                })
              }
              className="w-full py-2.5 rounded-xl font-semibold text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 size={15} />
              Eliminar tarea
            </button>
          )}
        </div>
      </form>
    </div>
  );
}