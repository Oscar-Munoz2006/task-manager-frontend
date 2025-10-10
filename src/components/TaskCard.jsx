import { useNavigate } from "react-router-dom";

export function TaskCard({ task }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/tasks/${task.id}`)}
      className="bg-gray-800 text-white p-4 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
    >
      <h1 className="text-xl font-bold mb-2">{task.title}</h1>
      <p className="text-gray-300">{task.description}</p>
      <span className="text-sm text-blue-400">Haz clic para editar</span>
    </div>
  );
}