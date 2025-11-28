import { useState } from "react";

export default function FilterBar({
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  filterDate,
  setFilterDate,
  filteredTasks,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Contar filtros activos (sin incluir "todas")
  const activeFiltersCount = [
    filterPriority !== "todas" ? 1 : 0,
    filterDate !== "todas" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const resetFilters = () => {
    setFilterStatus("todas");
    setFilterPriority("todas");
    setFilterDate("todas");
  };

  return (
    <div className="mb-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
        
        {/* Header: Contador + Botón Más filtros */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{filteredTasks.length}</span>
              <span className="text-sm text-gray-400">
                {filteredTasks.length === 1 ? 'tarea' : 'tareas'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all duration-200 text-sm font-medium text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Más filtros
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {activeFiltersCount}
              </span>
            )}
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Nivel 1: Filtro Principal - Estado */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</span>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "todas", label: "Todas", icon: "●" },
              { value: "pendiente", label: "Pendiente", icon: "○" },
              { value: "en_proceso", label: "En proceso", icon: "◐" },
              { value: "completada", label: "Completada", icon: "✓" }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterStatus(option.value)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5
                  ${filterStatus === option.value
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }
                `}
              >
                <span className="text-xs">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nivel 2: Filtros Avanzados (Colapsables) */}
        <div 
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${showAdvanced ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="space-y-4 pt-4 border-t border-gray-700/50">
            
            {/* Prioridad */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Prioridad</span>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "todas", label: "Todas", color: "gray" },
                  { value: "alta", label: "Alta", color: "red" },
                  { value: "media", label: "Media", color: "yellow" },
                  { value: "baja", label: "Baja", color: "green" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterPriority(option.value)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5
                      ${filterPriority === option.value
                        ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                        : "bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      }
                    `}
                  >
                    {option.value !== "todas" && (
                      <span className={`w-2 h-2 rounded-full ${
                        option.color === "red" ? "bg-red-400" :
                        option.color === "yellow" ? "bg-yellow-400" :
                        option.color === "green" ? "bg-green-400" : ""
                      }`}></span>
                    )}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</span>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "todas", label: "Todas", icon: "◈" },
                  { value: "hoy", label: "Hoy", icon: "●" },
                  { value: "mañana", label: "Mañana", icon: "○" },
                  { value: "vencidas", label: "Vencidas", icon: "✕" },
                  { value: "proximas", label: "Próximas", icon: "→" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterDate(option.value)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5
                      ${filterDate === option.value
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                        : "bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      }
                    `}
                  >
                    <span className="text-xs">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón Limpiar Filtros */}
            {(filterStatus !== "todas" || filterPriority !== "todas" || filterDate !== "todas") && (
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 bg-gray-700/30 hover:bg-gray-700/50 text-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Limpiar todos los filtros
              </button>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}