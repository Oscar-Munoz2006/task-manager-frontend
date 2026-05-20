import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import { Bell, BellOff, CheckCheck, Pencil, Trash2, ChevronRight } from "lucide-react";

const MINUTES_OPTIONS = [5, 10, 15, 30];

function formatCountdown(taskTime, now) {
  const diffMs = taskTime - now;
  if (diffMs <= 0) return { text: "Venció", urgent: true };
  const diffMin = Math.ceil(diffMs / (1000 * 60));
  if (diffMin < 60) return { text: `En ${diffMin} min`, urgent: diffMin <= 15 };
  const diffH = Math.floor(diffMin / 60);
  const remMin = diffMin % 60;
  return { text: remMin > 0 ? `En ${diffH}h ${remMin}m` : `En ${diffH}h`, urgent: false };
}

function urgencyDot(diffMin) {
  if (diffMin <= 15) return "bg-red-500";
  if (diffMin <= 30) return "bg-amber-500";
  return "bg-green-500";
}

function formatExpiredAt(isoString) {
  const d = new Date(isoString);
  return (
    d.toLocaleDateString("es-CO", { day: "numeric", month: "short" }) +
    " · " +
    d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
  );
}

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const isAuth    = localStorage.getItem("isAuth") === "true";
  const username  = localStorage.getItem("username") || "Usuario";
  const initial   = username.charAt(0).toUpperCase();

  const [notifOpen, setNotifOpen] = useState(false);
  const [tab, setTab]             = useState("upcoming");
  const notifRef = useRef(null);

  const {
    permission, requestPermission,
    minutesBefore, updateMinutesBefore,
    enabled, toggleEnabled,
    upcoming, history, clearHistory, now,
  } = useNotifications();

  const handleLogout = () => {
    localStorage.removeItem("isAuth");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    navigate("/");
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive  = (path) => location.pathname === path;
  const isActive2 = enabled && permission === "granted";
  const totalBadge = isActive2 ? upcoming.length + history.length : 0;

  const navLink = (to, label) => (
    <Link
      to={to}
      className="relative text-sm font-medium transition-colors duration-200 group flex flex-col items-center gap-0.5"
    >
      <span className={isActive(to) ? "text-white" : "text-zinc-500 group-hover:text-zinc-200"}>
        {label}
      </span>
      <span className={`h-0.5 rounded-full transition-all duration-200 ${isActive(to) ? "w-full bg-blue-500" : "w-0 bg-blue-500 group-hover:w-full"}`} />
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-[#000000] via-[#0d0d0d] to-[#1a1a1f] text-white px-6 py-4 flex justify-between items-center shadow-lg shadow-black/50 border-b border-white/5 sticky top-0 z-40">

      <Link to="/" className="flex items-center">
        <img src="/favicon.svg" alt="Task Manager" className="h-14" />
      </Link>

      {isAuth ? (
        <div className="flex items-center gap-6">
          {navLink("/", "Inicio")}
          {navLink("/tasks", "Tareas")}
          {navLink("/calendar", "Calendario")}
          {navLink("/agenda", "Agenda")}

          {/* Campanita */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                isActive2
                  ? "text-zinc-400 hover:text-white hover:bg-white/10"
                  : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
              }`}
            >
              {isActive2 ? <Bell size={18} /> : <BellOff size={18} />}
              {totalBadge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {totalBadge > 9 ? "9+" : totalBadge}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 bg-[#0d0d0d] border border-white/8 rounded-2xl shadow-2xl shadow-black/70 overflow-hidden z-50">

                {/* Header */}
                <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-100">Recordatorios</p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {!isActive2 ? "Notificaciones desactivadas" : `Aviso ${minutesBefore} min antes`}
                    </p>
                  </div>
                  {permission === "granted" && (
                    <button
                      onClick={toggleEnabled}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 border ${
                        enabled ? "bg-blue-600 border-blue-500" : "bg-zinc-800 border-zinc-700"
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${enabled ? "left-6" : "left-1"}`} />
                    </button>
                  )}
                </div>

                {/* Activar permisos */}
                {permission !== "granted" && (
                  <div className="px-4 py-4 flex flex-col gap-2 border-b border-white/8">
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Activa los permisos del navegador para recibir recordatorios de tus tareas.
                    </p>
                    <button
                      onClick={requestPermission}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Activar notificaciones
                    </button>
                  </div>
                )}

                {/* Anticipación */}
                {isActive2 && (
                  <div className="px-4 py-3 border-b border-white/8">
                    <p className="text-xs text-zinc-500 mb-2">Avisarme con anticipación de:</p>
                    <div className="flex gap-2">
                      {MINUTES_OPTIONS.map((min) => (
                        <button
                          key={min}
                          onClick={() => updateMinutesBefore(min)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            minutesBefore === min
                              ? "bg-blue-600 text-white"
                              : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
                          }`}
                        >
                          {min}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Desactivadas */}
                {permission === "granted" && !enabled && (
                  <div className="px-4 py-8 flex flex-col items-center gap-2">
                    <BellOff size={28} className="text-zinc-700" />
                    <p className="text-zinc-600 text-sm text-center">
                      Las notificaciones están desactivadas.<br />Actívalas con el botón de arriba.
                    </p>
                  </div>
                )}

                {/* Tabs */}
                {isActive2 && (
                  <>
                    <div className="flex border-b border-white/8">
                      <button
                        onClick={() => setTab("upcoming")}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                          tab === "upcoming"
                            ? "text-blue-400 border-b-2 border-blue-500"
                            : "text-zinc-600 hover:text-zinc-300"
                        }`}
                      >
                        Próximas {upcoming.length > 0 && `(${upcoming.length})`}
                      </button>
                      <button
                        onClick={() => setTab("history")}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                          tab === "history"
                            ? "text-red-400 border-b-2 border-red-500"
                            : "text-zinc-600 hover:text-zinc-300"
                        }`}
                      >
                        Vencidas {history.length > 0 && `(${history.length})`}
                      </button>
                    </div>

                    {/* Próximas */}
                    {tab === "upcoming" && (
                      <div className="max-h-72 overflow-y-auto">
                        {upcoming.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 py-8">
                            <CheckCheck size={28} className="text-zinc-700" />
                            <p className="text-zinc-600 text-sm">Sin tareas próximas hoy</p>
                          </div>
                        ) : (
                          upcoming.map((t) => {
                            const taskTime  = new Date(t.deadline + "T" + t.deadline_time);
                            const diffMin   = Math.ceil((taskTime - now) / (1000 * 60));
                            const countdown = formatCountdown(taskTime, now);
                            return (
                              <div key={t.id} className="border-b border-white/5 last:border-0">
                                <div className="flex items-start gap-3 px-4 pt-3 pb-2">
                                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${urgencyDot(diffMin)}`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-200 truncate">{t.title}</p>
                                    <p className={`text-xs mt-0.5 font-semibold ${countdown.urgent ? "text-red-400" : "text-zinc-500"}`}>
                                      {countdown.text}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2 px-4 pb-3">
                                  <button
                                    onClick={() => { setNotifOpen(false); navigate(`/tasks/${t.id}`); }}
                                    className="flex-1 text-xs py-1.5 rounded-lg bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Pencil size={11} /> Editar
                                  </button>
                                  <button
                                    onClick={() => { setNotifOpen(false); navigate(`/tasks/${t.id}`); }}
                                    className="flex-1 text-xs py-1.5 rounded-lg bg-green-600/15 text-green-400 hover:bg-green-600/25 font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <CheckCheck size={11} /> Completar
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* Historial */}
                    {tab === "history" && (
                      <div className="max-h-72 overflow-y-auto">
                        {history.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 py-8">
                            <CheckCheck size={28} className="text-zinc-700" />
                            <p className="text-zinc-600 text-sm">Sin tareas vencidas</p>
                          </div>
                        ) : (
                          history.map((h) => (
                            <div key={h.id} className="flex items-start gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                              <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-300 truncate">{h.title}</p>
                                <p className="text-xs text-zinc-600 mt-0.5">Venció: {formatExpiredAt(h.expiredAt)}</p>
                              </div>
                              <button
                                onClick={() => { setNotifOpen(false); navigate(`/tasks/${h.id}`); }}
                                className="text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0 cursor-pointer"
                              >
                                <ChevronRight size={15} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <div className="px-4 py-3 border-t border-white/8 flex items-center justify-between">
                      <button
                        onClick={() => { setNotifOpen(false); navigate("/tasks"); }}
                        className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        Ver todas <ChevronRight size={12} />
                      </button>
                      {tab === "history" && history.length > 0 && (
                        <button
                          onClick={clearHistory}
                          className="text-xs text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={11} /> Limpiar historial
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Usuario + logout */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
                {initial}
              </div>
              <span className="text-xs text-zinc-500 hidden sm:block">{username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-zinc-500 hover:text-red-400 border border-white/8 hover:border-red-500/30 hover:bg-red-500/5 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-zinc-500 hover:text-white transition-colors font-medium">
            Iniciar sesión
          </Link>
        </div>
      )}
    </nav>
  );
}