import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createTask, deleteTask, updateTask, getTask } from "../api/tasks.api";
import { useNavigate, useParams } from "react-router-dom";

export default function TaskFormPage() {
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      await updateTask(params.id, data);
    } else {
      await createTask(data);
    }
    
    navigate("/tasks");
  });
  useEffect(() => {
    async function LoadTask() {
      if (params.id) {
        const { data } = await getTask(params.id);
        setValue("title", data.title);
        setValue("description", data.description);
        setValue("status", data.status);
        setValue("priority", data.priority);
        setValue("deadline", data.deadline);
      }
    }
    LoadTask();
  }, [params.id]);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">

      <form
  onSubmit={onSubmit}
  className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 flex flex-col gap-4"
>
  {/* Header */}
  <div className="border-b pb-3">
    <h2 className="text-xl font-semibold">
      {params.id ? "Editar tarea" : "Nueva tarea"}
    </h2>
  </div>

  {/* Título */}
  <input
    type="text"
    placeholder="Título"
    {...register("title", { required: true })}
    className="text-lg font-medium outline-none border-b py-2 focus:border-black"
  />
  {errors.title && (
    <span className="text-red-500 text-sm">Este campo es requerido</span>
  )}

  {/* Descripción */}
  <textarea
    rows="3"
    placeholder="Descripción"
    {...register("description", { required: true })}
    className="resize-none outline-none border rounded-lg p-3"
  />
  {errors.description && (
    <span className="text-red-500 text-sm">Este campo es requerido</span>
  )}

  {/* Opciones */}
  <div className="flex flex-wrap gap-2">
    <select {...register("priority")} className="border rounded-lg px-3 py-2">
      <option value="baja">Baja</option>
      <option value="media">Media</option>
      <option value="alta">Alta</option>
    </select>

    <select {...register("status")} className="border rounded-lg px-3 py-2">
      <option value="pendiente">Pendiente</option>
      <option value="en_proceso">En Progreso</option>
      <option value="completada">Completada</option>
    </select>

    <input
      type="date"
      {...register("deadline")}
      className="border rounded-lg px-3 py-2"
    />
  </div>

  {/* Footer */}
  <div className="flex justify-between items-center pt-4 border-t">
    {params.id && (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="text-red-500 hover:underline"
      >
        Eliminar
      </button>
    )}

    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => navigate("/tasks")}
        className="px-4 py-2 rounded-lg border"
      >
        Cancelar
      </button>

      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-black text-white"
      >
        Guardar
      </button>
    </div>
  </div>
</form>
     {showConfirm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl p-6 w-80">
      <h3 className="text-lg font-semibold mb-2">Eliminar tarea</h3>
      <p className="text-sm text-gray-600 mb-4">
        ¿Seguro que deseas eliminar esta tarea?
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowConfirm(false)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancelar
        </button>

        <button
          onClick={async () => {
            await deleteTask(params.id);
            navigate("/tasks");
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}