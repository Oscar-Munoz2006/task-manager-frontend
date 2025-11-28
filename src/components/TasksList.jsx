import { useEffect, useState } from "react";
import { getALLTasks } from "../api/tasks.api";
import { TaskCard } from "./TaskCard";

export default function TasksList({ tasks }) { // 👈 Aquí recibimos las tareas por props
  const [localTasks, setLocalTasks] = useState([]);

  useEffect(() => {
    async function loadTasks() {
      if (tasks && tasks.length > 0) {
        // Si vienen tareas filtradas por props (desde TaskPage)
        setLocalTasks(tasks);
      } else {
        // Si no, cárgalas desde la API
        const res = await getALLTasks();
        setLocalTasks(res.data);
      }
    }
    loadTasks();
  }, [tasks]); // 👈 vuelve a cargar si cambia el filtro

  return (
    <div className="bg-gradient-to-br from-[#000000] via-[#0d0d0d] to-[#1a1a1f] text-white min-h-screen flex justify-center items-start p-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {localTasks.length > 0 ? (
          localTasks.map((task) => ( // 👈 cambiaste "tasks" por "task"
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <p>No hay tareas disponibles</p>
        )}
      </div>
    </div>
  );
}
