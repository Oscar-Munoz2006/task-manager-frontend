import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { getALLTasks } from "../api/tasks.api";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { es },
});

const priorityColors = {
  baja:  "#3b82f6",
  media: "#f59e0b",
  alta:  "#ef4444",
};

const priorityLabels = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

const statusLabels = {
  pendiente: "Pendiente",
  en_proceso: "En Progreso",
  completada: "Completada",
};

const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 3 + i);

const calendarStyles = `
  .rbc-calendar { font-family: inherit; }
  .rbc-header { background: #1e293b; color: #60a5fa; border-color: #ffffff15; padding: 8px 0; font-weight: 600; font-size: 0.8rem; letter-spacing: 0.05em; text-transform: uppercase; }
  .rbc-month-view, .rbc-time-view, .rbc-agenda-view { background: #1e293b; border-color: #ffffff15; }
  .rbc-day-bg { background: #1e293b; transition: background 0.15s; }
  .rbc-day-bg:hover { background: #263548; }
  .rbc-off-range-bg { background: #162032; }
  .rbc-today { background: #1d4ed820 !important; border-top: 2px solid #3b82f6 !important; }
  .rbc-date-cell { color: #94a3b8; padding: 6px 8px; font-size: 0.82rem; }
  .rbc-date-cell.rbc-now { color: #60a5fa; font-weight: 700; }
  .rbc-month-row { border-color: #ffffff15; min-height: 90px; }
  .rbc-toolbar { background: #0f172a; padding: 14px 16px; margin-bottom: 0; border-bottom: 1px solid #ffffff15; }
  .rbc-toolbar button { color: #94a3b8; background: #1e293b; border: 1px solid #ffffff15; border-radius: 8px; padding: 6px 16px; transition: all 0.2s; font-size: 0.85rem; }
  .rbc-toolbar button:hover { background: #334155; color: #e2e8f0; border-color: #ffffff25; }
  .rbc-toolbar button.rbc-active { background: #2563eb; color: white; border-color: #2563eb; }
  .rbc-toolbar-label { color: #f1f5f9; font-weight: 700; font-size: 1.1rem; }
  .rbc-agenda-table { background: #1e293b; color: #cbd5e1; border-color: #ffffff15; }
  .rbc-agenda-date-cell, .rbc-agenda-time-cell { color: #60a5fa; border-color: #ffffff15; background: #162032; }
  .rbc-show-more { color: #60a5fa; background: transparent; font-size: 0.75rem; font-weight: 600; padding: 2px 4px; }
  .rbc-event { padding: 0 !important; margin: 1px 2px !important; border: none !important; }
  .rbc-row-segment { padding: 1px 2px !important; }
`;

export default function TaskCalendar() {
  const [events, setEvents] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // guardamos todas las tareas para el modal
  const [dayModal, setDayModal] = useState(null);
  const [taskModal, setTaskModal] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const res = await getALLTasks();
      setAllTasks(res.data); // guardar raw para usar en el modal
      const mapped = res.data
        .filter((t) => t.deadline)
        .map((t) => {
          const timeStr = t.deadline_time ? t.deadline_time.slice(0, 5) : "08:00";
          const [h, m] = timeStr.split(":").map(Number);
          const start = new Date(t.deadline + "T" + timeStr + ":00");
          const end = new Date(start);
          end.setHours(h + 1, m);
          return {
            id: t.id,
            title: t.title,
            start,
            end,
            priority: t.priority,
            status: t.status,
            deadline_time: t.deadline_time,
            allDay: !t.deadline_time,
          };
        });
      setEvents(mapped);
    }
    load();
  }, []);

  // Obtiene TODAS las tareas de un día dado (no solo las que caben en el calendario)
  function getTasksForDay(date) {
    return events.filter(
      (e) => e.start.toDateString() === date.toDateString()
    );
  }

  const handleSelectSlot = ({ start }) => {
    const tasksOnDay = getTasksForDay(start);
    setDayModal({ date: start, tasks: tasksOnDay });
  };

  const handleSelectEvent = (event) => setTaskModal(event);

  // ✅ FIX: onShowMore — cuando el usuario hace click en "+N more"
  // recibe el array de events de ese día y la fecha
  const handleShowMore = (eventsOnDay, date) => {
    // eventsOnDay ya viene con TODOS los eventos del día desde react-big-calendar
    setDayModal({ date, tasks: eventsOnDay });
  };

  const formatDate = (date) =>
    date.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  function formatTime(timeStr) {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  }

  return (
    <section className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] min-h-screen text-white p-8">
      <style>{calendarStyles}</style>

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-lg shadow-lg shadow-blue-500/30">
            📅
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 leading-tight">
              Calendario de tareas
            </h1>
            <p className="text-slate-400 text-sm">Visualiza y gestiona tus tareas por fecha</p>
          </div>
        </div>

        {/* Leyenda + Selector */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div className="flex flex-wrap gap-3">
            {Object.entries(priorityColors).map(([key, color]) => (
              <span
                key={key}
                className="flex items-center gap-2 text-sm px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: color + "18",
                  borderColor: color + "40",
                  color: color,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                {priorityLabels[key]}
              </span>
            ))}
            <span className="flex items-center gap-2 text-sm px-3 py-1 rounded-full border border-slate-600/40 bg-slate-700/20 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-500 opacity-50" />
              Completada
            </span>
          </div>

          {/* Selector de mes y año */}
          <div className="flex gap-2">
            <select
              value={currentDate.getMonth()}
              onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), Number(e.target.value), 1))}
              className="bg-slate-800 border border-slate-600/50 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm hover:border-slate-500 transition-colors"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={currentDate.getFullYear()}
              onChange={(e) => setCurrentDate(new Date(Number(e.target.value), currentDate.getMonth(), 1))}
              className="bg-slate-800 border border-slate-600/50 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm hover:border-slate-500 transition-colors"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendario */}
        <div className="rounded-2xl border border-slate-600/30 overflow-hidden shadow-2xl shadow-black/40">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 650 }}
            culture="es"
            selectable
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            defaultView="month"
            views={["month", "agenda"]}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Tarea",
              noEventsInRange: "No hay tareas en este rango.",
              showMore: (total) => `+${total} más`,
            }}
            components={{
              event: ({ event }) => (
                <div
                  style={{
                    backgroundColor: priorityColors[event.priority],
                    opacity: event.status === "completada" ? 0.4 : 1,
                    borderRadius: "6px",
                    padding: "3px 7px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    minWidth: 0,
                  }}
                >
                  <span style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.7)", flexShrink: 0,
                  }} />
                  <span style={{
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "700",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flex: 1,
                  }}>
                    {event.title}
                  </span>
                  {!event.allDay && (
                    <span style={{
                      color: "rgba(255,255,255,0.75)",
                      fontSize: "10px",
                      flexShrink: 0,
                      marginLeft: "2px",
                    }}>
                      {event.start.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              ),
            }}
            eventPropGetter={() => ({
              style: { background: "transparent", padding: 0, border: "none" },
            })}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onShowMore={handleShowMore} // ✅ conectado
          />
        </div>
      </div>

      {/* Modal: click en día o en "+N más" */}
      {dayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600/40 rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-100 capitalize">{formatDate(dayModal.date)}</h3>
                <p className="text-sm text-slate-400 mt-0.5">{dayModal.tasks.length} tarea(s) este día</p>
              </div>
              <button
                onClick={() => setDayModal(null)}
                className="text-slate-500 hover:text-slate-200 text-xl font-bold transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Lista scrolleable de tareas */}
            {dayModal.tasks.length > 0 && (
              <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                {dayModal.tasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => { setDayModal(null); navigate(`/tasks/${t.id}`); }}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                    style={{
                      backgroundColor: priorityColors[t.priority] + "15",
                      border: `1px solid ${priorityColors[t.priority]}30`,
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: priorityColors[t.priority] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{t.title}</p>
                      {t.deadline_time && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          🕐 {formatTime(t.deadline_time)}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                      style={{
                        backgroundColor: priorityColors[t.priority] + "25",
                        color: priorityColors[t.priority],
                      }}
                    >
                      {priorityLabels[t.priority]}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                const d = dayModal.date;
                const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                setDayModal(null);
                navigate("/tasks-create", { state: { date: formatted } });
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 flex-shrink-0"
            >
              + Crear tarea para este día
            </button>
          </div>
        </div>
      )}

      {/* Modal: click en tarea */}
      {taskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600/40 rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-slate-100 pr-4">{taskModal.title}</h3>
              <button
                onClick={() => setTaskModal(null)}
                className="text-slate-500 hover:text-slate-200 text-xl font-bold transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <span
                className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{
                  backgroundColor: priorityColors[taskModal.priority] + "25",
                  color: priorityColors[taskModal.priority],
                  border: `1px solid ${priorityColors[taskModal.priority]}40`,
                }}
              >
                ⚑ {priorityLabels[taskModal.priority]}
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-slate-700 text-slate-300 border border-slate-600/50">
                {statusLabels[taskModal.status]}
              </span>
            </div>

            <p className="text-sm text-slate-400">
              📅 {formatDate(taskModal.start)}
              {taskModal.deadline_time && (
                <span className="ml-2">🕐 {formatTime(taskModal.deadline_time)}</span>
              )}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => { setTaskModal(null); navigate(`/tasks/${taskModal.id}`); }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/20"
              >
                Editar tarea
              </button>
              <button
                onClick={() => setTaskModal(null)}
                className="flex-1 border border-slate-600/50 text-slate-300 hover:bg-slate-700 py-2.5 rounded-xl font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}