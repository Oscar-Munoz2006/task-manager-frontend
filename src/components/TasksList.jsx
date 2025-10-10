import { useEffect, useState } from "react";
import { getALLTasks } from "../api/tasks.api";
import { TaskCard } from "./TaskCard";

export default function TasksList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function LoadTask() {
      const res = await getALLTasks();
      setTasks(res.data);
    }
    LoadTask();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-start p-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
