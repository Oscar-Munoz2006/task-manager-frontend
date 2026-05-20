import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getALLTasks } from "../api/tasks.api";
 
const HABITS_KEY  = "agenda_habits";
const CHECKED_KEY = "agenda_checked";
 
const DAYS_ES   = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAYS_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
 
const REPEAT_OPTIONS = [
  { value: "daily",    label: "Diario"        },
  { value: "weekly",   label: "Semanal"       },
  { value: "weekdays", label: "Lun–Vie"       },
  { value: "weekend",  label: "Fin de semana" },
];
 
const HABIT_COLORS = [
  { value: "blue",   bg: "bg-blue-500",   ring: "ring-blue-500",   text: "text-blue-400",   light: "bg-blue-500/10 border-blue-500/20"    },
  { value: "cyan",   bg: "bg-cyan-500",   ring: "ring-cyan-500",   text: "text-cyan-400",   light: "bg-cyan-500/10 border-cyan-500/20"    },
  { value: "green",  bg: "bg-green-500",  ring: "ring-green-500",  text: "text-green-400",  light: "bg-green-500/10 border-green-500/20"  },
  { value: "amber",  bg: "bg-amber-500",  ring: "ring-amber-500",  text: "text-amber-400",  light: "bg-amber-500/10 border-amber-500/20"  },
  { value: "red",    bg: "bg-red-500",    ring: "ring-red-500",    text: "text-red-400",    light: "bg-red-500/10 border-red-500/20"      },
  { value: "purple", bg: "bg-purple-500", ring: "ring-purple-500", text: "text-purple-400", light: "bg-purple-500/10 border-purple-500/20" },
];
 
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
 
function loadHabits() {
  try { return JSON.parse(localStorage.getItem(HABITS_KEY) || "[]"); }
  catch { return []; }
}
 
function saveHabits(h) { localStorage.setItem(HABITS_KEY, JSON.stringify(h)); }
 
function loadChecked() {
  try { return JSON.parse(localStorage.getItem(CHECKED_KEY) || "{}"); }
  catch { return {}; }
}
 
function saveChecked(c) { localStorage.setItem(CHECKED_KEY, JSON.stringify(c)); }
 
function getDeadlineDate(t) {
  if (t.deadline_time) return new Date(t.deadline + "T" + t.deadline_time);
  return new Date(t.deadline + "T23:59:59");
}
 
function formatHour(date) {
  return date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}
 
function isHabitActiveToday(habit) {
  const dow = new Date().getDay();
  if (habit.repeat === "daily")    return true;
  if (habit.repeat === "weekdays") return dow >= 1 && dow <= 5;
  if (habit.repeat === "weekend")  return dow === 0 || dow === 6;
  if (habit.repeat === "weekly")   return habit.weekDay === dow;
  return false;
}
 
function getWeekDays() {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
 
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}
 
export default function AgendaPage() {
  const navigate   = useNavigate();
  const [tasks,    setTasks]    = useState([]);
  const [habits,   setHabits]   = useState(loadHabits);
  const [checked,  setChecked]  = useState(loadChecked);
  const [tab,      setTab]      = useState("day");
  const [showForm, setShowForm] = useState(false);
  const [editHabit,setEditHabit]= useState(null);
  const [now,      setNow]      = useState(new Date());
 
  const today    = new Date();
  const weekDays = getWeekDays();
  const key      = todayKey();
 
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
 
  useEffect(() => {
    getALLTasks().then((res) => setTasks(res.data)).catch(() => {});
  }, []);
 
  const todayTasks = tasks
    .filter((t) => t.deadline && isSameDay(new Date(t.deadline + "T00:00:00"), today))
    .sort((a, b) => (a.deadline_time || "23:59").localeCompare(b.deadline_time || "23:59"));
 
  const todayHabits  = habits.filter(isHabitActiveToday);
  const checkedToday = checked[key] || {};
  const habitsDone   = todayHabits.filter((h) => checkedToday[h.id]).length;
 
  const toggleHabit = (id) => {
    const next = { ...checked, [key]: { ...checkedToday, [id]: !checkedToday[id] } };
    setChecked(next);
    saveChecked(next);
  };
 
  const saveHabit = (habit) => {
    const next = habit.id
      ? habits.map((h) => h.id === habit.id ? habit : h)
      : [...habits, { ...habit, id: Date.now().toString() }];
    setHabits(next);
    saveHabits(next);
    setShowForm(false);
    setEditHabit(null);
  };
 
  const deleteHabit = (id) => {
    const next = habits.filter((h) => h.id !== id);
    setHabits(next);
    saveHabits(next);
  };
 
  const tasksByDay = weekDays.map((day) =>
    tasks.filter((t) => t.deadline && isSameDay(new Date(t.deadline + "T00:00:00"), day))
  );
 
  const prioColor = { baja: "bg-blue-500", media: "bg-amber-500", alta: "bg-red-500" };
  const prioText  = { baja: "text-blue-400", media: "text-amber-400", alta: "text-red-400" };
  const prioLabel = { baja: "Baja", media: "Media", alta: "Alta" };
  const statusBadge = {
    pendiente:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    en_proceso: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completada: "bg-green-500/10 text-green-400 border-green-500/20",
  };
  const statusLabel = { pendiente: "Pendiente", en_proceso: "En progreso", completada: "Completada" };
 
  return (
    <section className="bg-gradient-to-br from-[#080c14] via-[#0f172a] to-[#080c14] min-h-screen text-white p-6 md:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
 
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-lg shadow-lg shadow-blue-500/30">
              🗓
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-100 leading-tight">Mi Agenda</h1>
              <p className="text-slate-500 text-xs capitalize">
                {today.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          {tab === "habits" && (
            <button
              onClick={() => { setEditHabit(null); setShowForm(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              + Rutina
            </button>
          )}
          {tab === "day" && (
            <button
              onClick={() => navigate("/tasks-create", { state: { date: todayKey() } })}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              + Tarea
            </button>
          )}
        </div>
 
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/60 border border-white/5 rounded-xl p-1">
          {[
            { id: "day",    label: "📋 Hoy"    },
            { id: "habits", label: "🔁 Rutinas" },
            { id: "week",   label: "📆 Semana"  },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
 
        {/* TAB: HOY */}
        {tab === "day" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Tareas hoy",  value: todayTasks.length,                                    color: "text-blue-400"   },
                { label: "Completadas", value: todayTasks.filter(t=>t.status==="completada").length,  color: "text-green-400"  },
                { label: "Rutinas",     value: `${habitsDone}/${todayHabits.length}`,                color: "text-purple-400" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-900/60 border border-white/5 rounded-xl px-4 py-3 text-center">
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
 
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-200">Timeline de hoy</h2>
                <span className="text-xs text-slate-500">{formatHour(now)}</span>
              </div>
              {todayTasks.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12">
                  <span className="text-3xl">✨</span>
                  <p className="text-slate-500 text-sm">Sin tareas para hoy</p>
                  <button
                    onClick={() => navigate("/tasks-create", { state: { date: todayKey() } })}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    + Crear una tarea para hoy
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {todayTasks.map((t) => {
                    const deadline  = getDeadlineDate(t);
                    const isOverdue = deadline < now && t.status !== "completada";
                    const isDone    = t.status === "completada";
                    return (
                      <div
                        key={t.id}
                        onClick={() => navigate(`/tasks/${t.id}`)}
                        className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-all hover:bg-white/5 ${isDone ? "opacity-50" : ""}`}
                      >
                        <div className="w-14 flex-shrink-0 text-right">
                          <p className={`text-xs font-mono font-semibold ${isOverdue ? "text-red-400" : "text-slate-500"}`}>
                            {t.deadline_time ? t.deadline_time.slice(0,5) : "—"}
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                          <div className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 ${
                            isDone    ? "bg-green-500 border-green-500" :
                            isOverdue ? "bg-red-500 border-red-500"     :
                                        `${prioColor[t.priority] || "bg-slate-500"} border-transparent`
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold leading-snug ${isDone ? "line-through text-slate-500" : "text-slate-100"}`}>
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusBadge[t.status]}`}>
                              {statusLabel[t.status]}
                            </span>
                            <span className={`text-xs font-medium ${prioText[t.priority]}`}>
                              ⚑ {prioLabel[t.priority]}
                            </span>
                            {isOverdue && <span className="text-xs text-red-400 font-semibold">⚠ Vencida</span>}
                          </div>
                        </div>
                        <span className="text-slate-600 text-xs flex-shrink-0 pt-1">→</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
 
            {todayHabits.length > 0 && (
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-200">Rutinas de hoy</h2>
                  <button onClick={() => setTab("habits")} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Ver todas →
                  </button>
                </div>
                <div className="divide-y divide-white/5">
                  {todayHabits.map((h) => {
                    const color = HABIT_COLORS.find((c) => c.value === h.color) || HABIT_COLORS[0];
                    const done  = !!checkedToday[h.id];
                    return (
                      <div key={h.id} className="flex items-center gap-4 px-5 py-3">
                        <button
                          onClick={() => toggleHabit(h.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            done ? `${color.bg} border-transparent` : "border-slate-600"
                          }`}
                        >
                          {done && <span className="text-white text-xs">✓</span>}
                        </button>
                        <span className={`text-sm font-medium flex-1 ${done ? "line-through text-slate-500" : "text-slate-200"}`}>
                          {h.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color.light} ${color.text}`}>
                          {REPEAT_OPTIONS.find((r) => r.value === h.repeat)?.label || h.repeat}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
 
        {/* TAB: RUTINAS */}
        {tab === "habits" && (
          <div className="flex flex-col gap-4">
            {todayHabits.length > 0 && (
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl px-5 py-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-300">Progreso de hoy</span>
                  <span className="text-sm text-slate-500">{habitsDone} / {todayHabits.length}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: todayHabits.length > 0 ? `${(habitsDone/todayHabits.length)*100}%` : "0%" }}
                  />
                </div>
              </div>
            )}
 
            {habits.length === 0 ? (
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col items-center gap-3 py-14">
                <span className="text-4xl">🔁</span>
                <p className="text-slate-400 font-semibold text-sm">Sin rutinas creadas</p>
                <p className="text-slate-600 text-xs text-center max-w-xs">
                  Las rutinas son hábitos que se repiten y se marcan cada día
                </p>
                <button
                  onClick={() => { setEditHabit(null); setShowForm(true); }}
                  className="mt-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all"
                >
                  Crear primera rutina
                </button>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {habits.map((h) => {
                  const color       = HABIT_COLORS.find((c) => c.value === h.color) || HABIT_COLORS[0];
                  const activeToday = isHabitActiveToday(h);
                  const done        = !!checkedToday[h.id];
                  return (
                    <div key={h.id} className="flex items-center gap-4 px-5 py-4">
                      <button
                        onClick={() => activeToday && toggleHabit(h.id)}
                        disabled={!activeToday}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          !activeToday ? "border-slate-700 cursor-not-allowed opacity-40" :
                          done         ? `${color.bg} border-transparent shadow-lg` :
                                         "border-slate-600"
                        }`}
                      >
                        {done && <span className="text-white text-xs font-bold">✓</span>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${done ? "line-through text-slate-500" : "text-slate-100"}`}>
                          {h.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color.light} ${color.text}`}>
                            {REPEAT_OPTIONS.find((r) => r.value === h.repeat)?.label}
                            {h.repeat === "weekly" ? ` · ${DAYS_FULL[h.weekDay]}` : ""}
                          </span>
                          {!activeToday && <span className="text-xs text-slate-600">No aplica hoy</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => { setEditHabit(h); setShowForm(true); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-colors text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteHabit(h.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
 
        {/* TAB: SEMANA */}
        {tab === "week" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map((day, i) => {
                const isToday = isSameDay(day, today);
                const count   = tasksByDay[i].length;
                return (
                  <div
                    key={i}
                    className={`rounded-xl p-2.5 text-center border transition-all ${
                      isToday ? "bg-blue-600/20 border-blue-500/40" : "bg-slate-900/60 border-white/5"
                    }`}
                  >
                    <p className={`text-xs font-semibold ${isToday ? "text-blue-400" : "text-slate-500"}`}>
                      {DAYS_ES[day.getDay()]}
                    </p>
                    <p className={`text-lg font-extrabold mt-0.5 ${isToday ? "text-blue-300" : "text-slate-200"}`}>
                      {day.getDate()}
                    </p>
                    {count > 0 && (
                      <div className={`mt-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mx-auto ${
                        isToday ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-300"
                      }`}>
                        {count}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
 
            <div className="flex flex-col gap-3">
              {weekDays.map((day, i) => {
                const isToday  = isSameDay(day, today);
                const dayTasks = tasksByDay[i];
                if (dayTasks.length === 0 && !isToday) return null;
                return (
                  <div
                    key={i}
                    className={`bg-slate-900/60 border rounded-2xl overflow-hidden ${
                      isToday ? "border-blue-500/30" : "border-white/5"
                    }`}
                  >
                    <div className={`px-5 py-3 border-b flex items-center justify-between ${
                      isToday ? "border-blue-500/20 bg-blue-500/5" : "border-white/5"
                    }`}>
                      <div className="flex items-center gap-2">
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />}
                        <span className={`text-sm font-bold ${isToday ? "text-blue-300" : "text-slate-300"}`}>
                          {DAYS_FULL[day.getDay()]} {day.getDate()} de {MONTHS_ES[day.getMonth()]}
                        </span>
                        {isToday && (
                          <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
                            Hoy
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{dayTasks.length} tarea(s)</span>
                    </div>
                    {dayTasks.length === 0 ? (
                      <p className="text-slate-600 text-xs text-center py-4">Sin tareas</p>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {dayTasks
                          .sort((a, b) => (a.deadline_time || "23:59").localeCompare(b.deadline_time || "23:59"))
                          .map((t) => {
                            const deadline  = getDeadlineDate(t);
                            const isOverdue = deadline < now && t.status !== "completada";
                            const isDone    = t.status === "completada";
                            return (
                              <div
                                key={t.id}
                                onClick={() => navigate(`/tasks/${t.id}`)}
                                className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-white/5 transition-all"
                              >
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  isDone    ? "bg-green-500" :
                                  isOverdue ? "bg-red-500"   :
                                              prioColor[t.priority] || "bg-slate-500"
                                }`} />
                                <span className={`flex-1 text-sm font-medium truncate ${isDone ? "line-through text-slate-500" : "text-slate-200"}`}>
                                  {t.title}
                                </span>
                                {t.deadline_time && (
                                  <span className={`text-xs font-mono flex-shrink-0 ${isOverdue ? "text-red-400" : "text-slate-500"}`}>
                                    {t.deadline_time.slice(0,5)}
                                  </span>
                                )}
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${statusBadge[t.status]}`}>
                                  {statusLabel[t.status]}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
 
      </div>
 
      {showForm && (
        <HabitForm
          initial={editHabit}
          onSave={saveHabit}
          onCancel={() => { setShowForm(false); setEditHabit(null); }}
        />
      )}
    </section>
  );
}
 
function HabitForm({ initial, onSave, onCancel }) {
  const [name,    setName]    = useState(initial?.name    || "");
  const [repeat,  setRepeat]  = useState(initial?.repeat  || "daily");
  const [weekDay, setWeekDay] = useState(initial?.weekDay ?? 1);
  const [color,   setColor]   = useState(initial?.color   || "blue");
 
  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: initial?.id, name: name.trim(), repeat, weekDay: Number(weekDay), color });
  };
 
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">
            {initial ? "Editar rutina" : "Nueva rutina"}
          </h3>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-200 transition-colors w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700">
            ✕
          </button>
        </div>
 
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Hacer ejercicio"
            className="bg-slate-800/60 border border-white/10 text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
 
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frecuencia</label>
          <div className="grid grid-cols-2 gap-2">
            {REPEAT_OPTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRepeat(r.value)}
                className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                  repeat === r.value
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-800/60 border-white/10 text-slate-400 hover:text-slate-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
 
        {repeat === "weekly" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Día</label>
            <div className="grid grid-cols-7 gap-1">
              {DAYS_ES.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setWeekDay(i)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    weekDay === i
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800/60 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}
 
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Color</label>
          <div className="flex gap-2">
            {HABIT_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                  color === c.value
                    ? `ring-2 ring-offset-2 ring-offset-slate-900 ${c.ring} scale-110`
                    : "opacity-60 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        </div>
 
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 text-sm font-semibold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
          >
            {initial ? "Guardar" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}