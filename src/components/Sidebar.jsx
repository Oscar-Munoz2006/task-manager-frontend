import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import FilterBar from "./FilterBar/FilterBar";
import { useFilters } from "../contexts/FilterContext";

export default function Sidebar() {
  const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();
  const {
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filterDate,
    setFilterDate,
  } = useFilters();

  useEffect(() => {
    const checkAuth = () => {
      setIsAuth(localStorage.getItem("isAuth") === "true");
    };
    checkAuth();
    const interval = setInterval(checkAuth, 1000); // Verificar cada segundo
    return () => clearInterval(interval);
  }, []);

  if (!isAuth || location.pathname !== "/tasks") return null;

  return (
    <aside className="bg-gradient-to-br from-[#000000] via-[#0d0d0d] to-[#1a1a1f] text-white min-h-screen w-64 h-screen fixed left-0 top-16 px-4 overflow-y-auto">
      <nav className="flex flex-col gap-4 pt-4">
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `px-3 py-2 rounded transition ${
              isActive ? "bg-blue-600" : "hover:bg-gray-800"
            }`
          }
        >
           Tareas
        </NavLink>

        <NavLink
          to="/tasks-create"
          className={({ isActive }) =>
            `px-3 py-2 rounded transition ${
              isActive ? "bg-blue-600" : "hover:bg-gray-800"
            }`
          }
        >
          Crear tarea
        </NavLink>
      </nav>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <FilterBar
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          filteredTasks={[]} // No necesitamos pasar filteredTasks aquí, ya que se calcula en TaskPage
        />
      </div>
    </aside>
  );
}
