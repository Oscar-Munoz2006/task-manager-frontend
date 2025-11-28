import { useEffect, useState } from "react";
import { TaskCard } from "../components/TaskCard";
import { getALLTasks } from "../api/tasks.api";
import FilterBar from "../components/FilterBar/FilterBar";

export default function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("todas");
  const [filterPriority, setFilterPriority] = useState("todas");
  const [filterDate, setFilterDate] = useState("todas");

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
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Lista de tareas</h1>
      <FilterBar
  filterStatus={filterStatus}
  setFilterStatus={setFilterStatus}
  filterPriority={filterPriority}
  setFilterPriority={setFilterPriority}
  filterDate={filterDate}
  setFilterDate={setFilterDate}
  filteredTasks={filteredTasks}
/>

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