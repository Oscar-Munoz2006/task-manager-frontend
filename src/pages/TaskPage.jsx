import { useEffect, useState } from "react";
import { TaskCard } from "../components/TaskCard";
import { getALLTasks } from "../api/tasks.api";
import { useFilters } from "../contexts/FilterContext";

export default function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const { filterStatus, filterPriority, filterDate } = useFilters();

  useEffect(() => {
    async function loadTasks() {
      const res = await getALLTasks();
      setTasks(res.data);
    }
    loadTasks();
  }, []);

  // 🔍 Lógica de filtrado (igual que antes)
  const filteredTasks = tasks.filter((task) => {
    const estado = task.status?.toLowerCase().trim();
    const prioridad = task.priority?.toLowerCase().trim();
    const fecha = task.deadline ? task.deadline.split("T")[0] : null;

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const matchEstado =
      filterStatus === "todas" || estado === filterStatus.toLowerCase();
    const matchPrioridad =
      filterPriority === "todas" || prioridad === filterPriority.toLowerCase();

    let matchFecha = true;
    if (filterDate === "hoy") matchFecha = fecha === today;
    else if (filterDate === "mañana") matchFecha = fecha === tomorrowStr;
    else if (filterDate === "vencidas") matchFecha = fecha < today;
    else if (filterDate === "proximas") matchFecha = fecha > tomorrowStr;

    return matchEstado && matchPrioridad && matchFecha;
  });

  return (
   <div className="p-6 bg-gradient-to-br from-[#000000] via-[#0d0d0d] to-[#1a1a1f] text-white min-h-screen ml-64 mt-16 h-[calc(100vh-4rem)] overflow-y-auto">

      <h1 className="text-3xl font-bold mb-6 text-center">Lista de tareas</h1>
      
      {filteredTasks.length === 0 ? (
        <p className="text-center text-gray-400">
          No hay tareas que coincidan con los filtros
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
