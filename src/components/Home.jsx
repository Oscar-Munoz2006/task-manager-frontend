import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getALLTasks } from "../api/tasks.api";
import { 
  ArrowRight, 
  LayoutDashboard, 
  CheckCircle, 
  Clock, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  PlusCircle, 
  ListTodo 
} from "lucide-react";

function Landing() {
  const navigate = useNavigate();
  return (
    <section className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] min-h-screen text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30 text-white">
          <CheckSquare size={28} />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-5 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Task Manager
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Organiza tus tareas, controla tus prioridades y nunca pierdas una fecha límite.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
        >
          Entrar <ArrowRight size={18} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <LayoutDashboard size={20} />, color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",   title: "Tablero Visual", desc: "Visualiza todas tus tareas en una interfaz clara y ordenada." },
          { icon: <CheckCircle size={20} />,     color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/20",   title: "Control Total",  desc: "Crea, edita y elimina tareas en segundos." },
          { icon: <Clock size={20} />,           color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", title: "Fechas Límite",  desc: "Calendario integrado para no perder ningún vencimiento." },
        ].map((f) => (
          <div key={f.title} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-colors">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border mb-4 ${f.bg} ${f.color}`}>
              {f.icon}
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <footer className="py-8 border-t border-slate-700/40 text-center">
        <p className="text-slate-500 text-xs uppercase tracking-widest">Desarrollado por</p>
        <p className="text-slate-300 font-bold text-sm mt-1">Oscar Eduardo Muñoz</p>
        <p className="text-blue-500 text-xs font-mono mt-0.5">ADSO 2025</p>
      </footer>
    </section>
  );
}

function getDeadlineDate(t) {
  if (t.deadline_time) {
    return new Date(t.deadline + "T" + t.deadline_time);
  }
  return new Date(t.deadline + "T23:59:59");
}

function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username") || "Usuario";
  const hoy = new Date();

  useEffect(() => {
    async function load() {
      try {
        const res = await getALLTasks();
        setTasks(res.data);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const total       = tasks.length;
  const pendientes  = tasks.filter((t) => t.status === "pendiente").length;
  const enProceso   = tasks.filter((t) => t.status === "en_proceso").length;
  const completadas = tasks.filter((t) => t.status === "completada").length;
  const progreso    = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const vencidas = tasks.filter((t) => {
    if (!t.deadline || t.status === "completada") return false;
    return getDeadlineDate(t) < hoy;
  });

  const proximas = tasks
    .filter((t) => {
      if (!t.deadline || t.status === "completada") return false;
      const deadline = getDeadlineDate(t);
      const diffMs = deadline - hoy;
      const diffDias = diffMs / (1000 * 60 * 60 * 24);
      return diffMs > 0 && diffDias <= 7;
    })
    .sort((a, b) => getDeadlineDate(a) - getDeadlineDate(b))
    .slice(0, 4);

  const prioColor = { baja: "bg-blue-500", media: "bg-amber-500", alta: "bg-red-500" };
  const prioBadge = {
    baja:  "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    media: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    alta:  "bg-red-500/10 text-red-400 border border-red-500/20",
  };
  const prioLabel = { baja: "Baja", media: "Media", alta: "Alta" };

  const diasRestantes = (t) => {
    const deadline = getDeadlineDate(t);
    const diffMs = deadline - hoy;
    const diffMin = Math.ceil(diffMs / (1000 * 60));
    const diffH   = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffD   = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin <= 60)  return `En ${diffMin} min`;
    if (diffH   <= 24)  return `En ${diffH}h`;
    if (diffD   === 1)  return "Mañana";
    return `${diffD} días`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center">
        <p className="text-slate-500 text-sm animate-pulse">Cargando...</p>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] min-h-screen text-white p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-7">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">
              Hola, {username} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1 capitalize">
              {hoy.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => navigate("/tasks-create")}
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Nueva tarea
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",       value: total,       color: "text-slate-100",   border: "border-t-slate-500",   icon: <ListTodo size={15} className="text-slate-500" /> },
            { label: "Pendientes",  value: pendientes,  color: "text-amber-400",   border: "border-t-amber-500",   icon: <Clock size={15} className="text-amber-500/60" /> },
            { label: "En progreso", value: enProceso,   color: "text-blue-400",    border: "border-t-blue-500",    icon: <LayoutDashboard size={15} className="text-blue-500/60" /> },
            { label: "Completadas", value: completadas, color: "text-emerald-400", border: "border-t-emerald-500", icon: <CheckCircle size={15} className="text-emerald-500/60" /> },
          ].map((s) => (
            <div key={s.label} className={`bg-slate-800/80 border border-slate-700/40 border-t-2 ${s.border} rounded-2xl px-5 py-4 flex flex-col gap-2`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{s.label}</span>
                {s.icon}
              </div>
              <span className={`text-3xl font-extrabold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Progreso */}
        {total > 0 && (
          <div className="bg-slate-800/80 border border-slate-700/40 rounded-2xl px-6 py-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-300">Progreso general</span>
              <span className="text-sm font-bold text-blue-400">{progreso}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${progreso}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">{completadas} de {total} tareas completadas</p>
          </div>
        )}

        {/* Vencidas + Próximas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <div className="bg-slate-800/80 border border-slate-700/40 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                Tareas vencidas
              </h2>
              {vencidas.length > 0 && (
                <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                  {vencidas.length}
                </span>
              )}
            </div>
            {vencidas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <CheckCircle size={28} className="text-emerald-500/40" />
                <p className="text-slate-500 text-sm">Sin tareas vencidas</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {vencidas.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/tasks/${t.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 hover:bg-slate-700/40 border border-slate-700/30 cursor-pointer transition-all"
                  >
                    <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${prioColor[t.priority] || "bg-slate-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{t.title}</p>
                      <p className="text-xs text-red-400 mt-0.5">
                        Venció el {new Date(t.deadline + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                        {t.deadline_time && ` · ${t.deadline_time.slice(0, 5)}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${prioBadge[t.priority]}`}>
                      {prioLabel[t.priority]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800/80 border border-slate-700/40 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Próximas a vencer
              </h2>
              <span className="text-xs text-slate-500 bg-slate-700/40 border border-slate-700/40 px-2.5 py-1 rounded-full">próximos 7 días</span>
            </div>
            {proximas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <CalendarIcon size={28} className="text-slate-600" />
                <p className="text-slate-500 text-sm">Sin tareas próximas</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {proximas.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/tasks/${t.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 hover:bg-slate-700/40 border border-slate-700/30 cursor-pointer transition-all"
                  >
                    <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${prioColor[t.priority] || "bg-slate-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{t.title}</p>
                      <p className="text-xs text-amber-400 mt-0.5">{diasRestantes(t)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${prioBadge[t.priority]}`}>
                      {prioLabel[t.priority]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Ver tareas",  desc: "Lista completa con filtros",  path: "/tasks",        icon: <ListTodo size={20} />,      iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
            { label: "Calendario",  desc: "Vista por fecha y prioridad", path: "/calendar",     icon: <CalendarIcon size={20} />,  iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
            { label: "Crear tarea", desc: "Agregar una nueva tarea",     path: "/tasks-create", icon: <PlusCircle size={20} />,    iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
          ].map((a) => (
            <button
              key={a.path}
              onClick={() => navigate(a.path)}
              className="bg-slate-800/80 border border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-700/40 rounded-2xl p-5 text-left transition-all group flex items-center gap-4 cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 transition-colors ${a.iconBg}`}>
                {a.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{a.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors" />
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}

export default function Home() {
  const isAuth = localStorage.getItem("isAuth") === "true";
  return isAuth ? <Dashboard /> : <Landing />;
}