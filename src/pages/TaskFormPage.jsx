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
    <div className=" relative bg-gradient-to-br from-[#000000] via-[#0d0d0d] to-[#1a1a1f]  min-h-screen flex items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">
          {params.id ? "Editar tarea" : "Crear tarea"}
        </h2>
        <input
          type="text"
          placeholder="Título"
          {...register("title", { required: true })}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {errors.title && (
          <span className="text-red-500 text-sm">Este campo es requerido</span>
        )}
        <textarea
          rows="3"
          placeholder="Descripción"
          {...register("description", { required: true })}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        ></textarea>
        {errors.description && (
          <span className="text-red-500 text-sm">Este campo es requerido</span>
        )}
        <label className="font-semibold">Estado</label>
        <select
          {...register("status")}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En Progreso</option>
          <option value="completada">Completada</option>
        </select>
        <label className="font-semibold">Prioridad</label>
        <select
          {...register("priority")}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
        <label className="font-semibold">Fecha límite</label>
        <input
          type="date"
          {...register("deadline")}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors font-semibold"
        >
          Guardar
        </button>
       {params.id && (
  <button
    type="button"
    onClick={() => setShowConfirm(true)}
    className="bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors font-semibold mt-2"
  >
    Eliminar
  </button>
  
        )}
      </form>
      {showConfirm && (
  <div className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <div className="bg-white border rounded-lg shadow-xl p-6 w-80">
      <h3 className="text-lg font-bold mb-3">Confirmar eliminación</h3>
      <p className="mb-4 text-sm text-gray-600">
        ¿Estás seguro de eliminar esta tarea?
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowConfirm(false)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancelar
        </button>

        <button
          onClick={async () => {
            await deleteTask(params.id);
            navigate("/tasks");
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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