import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createTask, deleteTask, updateTask, getTask } from "../api/tasks.api";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { ConfirmModal } from "../components/ConfirmModal";

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
      {modal && (
        <ConfirmModal
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal(null)}
        />
      )}
      <form
        onSubmit={onSubmit}
        className="bg-[#1e293b] border border-white/10 p-8 rounded-2xl w-full max-w-md flex flex-col gap-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              {params.id ? "Editar tarea" : "Nueva tarea"}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {params.id ? "Modifica los campos que necesites" : "Completa los campos para crear tu tarea"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(preselectedDate ? "/calendar" : "/tasks")}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <div className="border-t border-white/10" />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Título</label>
          <input
            type="text"
            placeholder="Ej: Entregar informe"
            {...register("title", { required: "El título es requerido" })}
            className="bg-[#0f172a] border border-white/10 text-slate-200 placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {errors.title && <span className="text-red-400 text-xs">{errors.title.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Descripción</label>
          <textarea
            rows="3"
            placeholder="Describe la tarea..."
            {...register("description", { required: "La descripción es requerida" })}
            className="bg-[#0f172a] border border-white/10 text-slate-200 placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
          {errors.description && <span className="text-red-400 text-xs">{errors.description.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Estado</label>
            <select
              {...register("status")}
              className="bg-[#0f172a] border border-white/10 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Progreso</option>
              <option value="completada">Completada</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Prioridad</label>
            <select
              {...register("priority")}
              className="bg-[#0f172a] border border-white/10 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Fecha límite</label>
            <input
              type="date"
              {...register("deadline")}
              style={{ colorScheme: "dark" }}
              className="bg-[#0f172a] border border-white/10 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              Hora <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <input
              type="time"
              {...register("deadline_time")}
              style={{ colorScheme: "dark" }}
              className="bg-[#0f172a] border border-white/10 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="border-t border-white/10" />

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isSubmitting
                ? "bg-blue-800 text-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
            }`}
          >
            {isSubmitting ? "Guardando..." : "Guardar tarea"}
          </button>

          {params.id && (
            <button
              type="button"
              onClick={() => {
                setModal({
                  message: "¿Estás seguro de que quieres eliminar esta tarea?",
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
                });
              }}
              className="w-full py-2.5 rounded-xl font-semibold text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
            >
              Eliminar tarea
            </button>
          )}
        </div>
      </form>
    </div>
  );
}