import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";

const MINUTES_OPTIONS = [5, 10, 15, 30];

function BellIcon({ muted }) {
  return muted ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 9.172a4 4 0 015.656 0M3 3l18 18M10.5 21a1.5 1.5 0 003 0m-9-4h12l-1.405-1.405A2.032 2.032 0 0114 14.158V11a6 6 0 00-1.5-4" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

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
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" }) +
    " · " + d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth   = localStorage.getItem("isAuth") === "true";
  const username = localStorage.getItem("username") || "Usuario";

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

  const isActive = (path) => location.pathname === path;
  const navLink  = (to, label) => (
    <Link to={to} className={`text-sm font-medium transition-colors duration-200 ${isActive(to) ? "text-blue-400" : "text-zinc-400 hover:text-white"}`}>
      {label}
    </Link>
  );

  const isActive2 = enabled && permission === "granted";
  const totalBadge = isActive2 ? upcoming.length + history.length : 0;

  return (
    <nav className="bg-gradient-to-r from-[#000000] via-[#0d0d0d] to-[#1a1a1f] text-white px-6 py-4 flex justify-between items-center shadow-lg shadow-black/50 border-b border-white/5 sticky top-0 z-40">

      <Link to="/" className="flex items-center">
  <img src="/favicon.svg" alt="Task Manager" className="h-14" />
</Link>
      {isAuth ? (
        <div className="flex items-center gap-5">
          {navLink("/", "Inicio")}
          {navLink("/tasks", "Tareas")}
          {navLink("/calendar", "Calendario")}

          {/* Campanita */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isActive2 ? "text-zinc-400 hover:text-white hover:bg-white/10" : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"}`}
            >
              <BellIcon muted={!isActive2} />
              {totalBadge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {totalBadge > 9 ? "9+" : totalBadge}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">

                {/* Header con toggle */}
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-200">Recordatorios</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {!isActive2 ? "Notificaciones desactivadas" : `Aviso ${minutesBefore} min antes`}
                    </p>
                  </div>
                  {/* Toggle ON/OFF */}
                  {permission === "granted" && (
                    <button
                      onClick={toggleEnabled}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? "bg-blue-600" : "bg-zinc-700"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${enabled ? "left-6" : "left-1"}`} />
                    </button>
                  )}
                </div>

                {/* Activar permisos del navegador */}
                {permission !== "granted" && (
                  <div className="px-4 py-4 flex flex-col gap-2 border-b border-white/10">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Activa los permisos del navegador para recibir recordatorios de tus tareas.
                    </p>
                    <button
                      onClick={requestPermission}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                    >
                      Activar notificaciones
                    </button>
                  </div>
                )}

                {/* Anticipación — solo si están activas */}
                {isActive2 && (
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-xs text-slate-400 mb-2">Avisarme con anticipación de:</p>
                    <div className="flex gap-2">
                      {MINUTES_OPTIONS.map((min) => (
                        <button
                          key={min}
                          onClick={() => updateMinutesBefore(min)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${minutesBefore === min ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                        >
                          {min}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mensaje si están desactivadas */}
                {permission === "granted" && !enabled && (
                  <div className="px-4 py-6 flex flex-col items-center gap-2">
                    <span className="text-3xl">🔕</span>
                    <p className="text-slate-500 text-sm text-center">Las notificaciones están desactivadas.<br/>Actívalas con el botón de arriba.</p>
                  </div>
                )}

                {/* Tabs — solo si están activas */}
                {isActive2 && (
                  <>
                    <div className="flex border-b border-white/10">
                      <button
                        onClick={() => setTab("upcoming")}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === "upcoming" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-500 hover:text-slate-300"}`}
                      >
                        Próximas {upcoming.length > 0 && `(${upcoming.length})`}
                      </button>
                      <button
                        onClick={() => setTab("history")}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === "history" ? "text-red-400 border-b-2 border-red-400" : "text-slate-500 hover:text-slate-300"}`}
                      >
                        Vencidas {history.length > 0 && `(${history.length})`}
                      </button>
                    </div>

                    {/* Tab Próximas */}
                    {tab === "upcoming" && (
                      <div className="max-h-72 overflow-y-auto">
                        {upcoming.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 py-8">
                            <span className="text-2xl">✅</span>
                            <p className="text-slate-500 text-sm">Sin tareas próximas hoy</p>
                          </div>
                        ) : (
                          upcoming.map((t) => {
                            const taskTime = new Date(t.deadline + "T" + t.deadline_time);
                            const diffMin  = Math.ceil((taskTime - now) / (1000 * 60));
                            const countdown = formatCountdown(taskTime, now);
                            return (
                              <div key={t.id} className="border-b border-white/5 last:border-0">
                                <div className="flex items-start gap-3 px-4 pt-3 pb-2">
                                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${urgencyDot(diffMin)}`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-200 truncate">{t.title}</p>
                                    <p className={`text-xs mt-0.5 font-semibold ${countdown.urgent ? "text-red-400" : "text-slate-400"}`}>
                                      {countdown.text}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2 px-4 pb-3">
                                  <button
                                    onClick={() => { setNotifOpen(false); navigate(`/tasks/${t.id}`); }}
                                    className="flex-1 text-xs py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 font-medium transition-colors"
                                  >
                                    ✏️ Editar
                                  </button>
                                  <button
                                    onClick={() => { setNotifOpen(false); navigate(`/tasks/${t.id}`); }}
                                    className="flex-1 text-xs py-1.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 font-medium transition-colors"
                                  >
                                    ✓ Completar
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* Tab Historial */}
                    {tab === "history" && (
                      <div className="max-h-72 overflow-y-auto">
                        {history.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 py-8">
                            <span className="text-2xl">🎉</span>
                            <p className="text-slate-500 text-sm">Sin tareas vencidas</p>
                          </div>
                        ) : (
                          history.map((h) => (
                            <div key={h.id} className="flex items-start gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                              <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-300 truncate">{h.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Venció: {formatExpiredAt(h.expiredAt)}</p>
                              </div>
                              <button
                                onClick={() => { setNotifOpen(false); navigate(`/tasks/${h.id}`); }}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
                              >
                                Ver →
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => { setNotifOpen(false); navigate("/tasks"); }}
                        className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Ver todas →
                      </button>
                      {tab === "history" && history.length > 0 && (
                        <button
                          onClick={clearHistory}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          🗑 Limpiar historial
                        </button>
                      )}
                    </div>
                  </>
                )}

              </div>
            )}
          </div>

          {/* Usuario + logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <span className="text-xs text-slate-400 hidden sm:block">{username}</span>
            <button
              onClick={handleLogout}
              className="bg-zinc-800 hover:bg-red-500/10 hover:text-red-400 border border-zinc-700 px-3 py-1.5 rounded-lg transition-all text-sm font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition-colors font-medium">
            Iniciar sesión
          </Link>
        </div>
      )}
    </nav>
  );
}