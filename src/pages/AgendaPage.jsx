import { useEffect, useRef, useState, useCallback } from "react";
import { getALLTasks } from "../api/tasks.api";

const DEFAULT_MINUTES = 10;
const HISTORY_KEY = "notif_history";
const DISMISSED_KEY = "notif_dismissed";

export const TASK_SAVED_EVENT = "task:saved";

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}

function saveHistory(h) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

function loadDismissed() {
  try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]")); }
  catch { return new Set(); }
}

function saveDismissed(set) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
}

export function useNotifications() {
  const [permission, setPermission]       = useState(Notification.permission);
  const [minutesBefore, setMinutesBefore] = useState(() =>
    parseInt(localStorage.getItem("notif_minutes") || DEFAULT_MINUTES)
  );
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory]   = useState(loadHistory);
  const [now, setNow]           = useState(new Date());

  const timersRef       = useRef([]);
  const scheduledWarn   = useRef(new Set());
  const scheduledExpire = useRef(new Set());
  const dismissedRef    = useRef(loadDismissed());
  // Ref espejo del historial — siempre sincronizada con el state,
  // para leerla síncronamente dentro de loadAndSchedule sin depender de localStorage
  const historyRef      = useRef(loadHistory());

  // Refresca contador cada 30s para los countdowns en vivo
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(tick);
  }, []);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const updateMinutesBefore = (mins) => {
    setMinutesBefore(mins);
    localStorage.setItem("notif_minutes", mins);
    timersRef.current.forEach(clearTimeout);
    timersRef.current     = [];
    scheduledWarn.current   = new Set();
    scheduledExpire.current = new Set();
  };

  // Helper interno: actualiza state + ref + localStorage en un solo lugar
  const setHistorySync = useCallback((updater) => {
    setHistory((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      historyRef.current = next;
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    const ids = historyRef.current.map((h) => h.id);
    const newDismissed = new Set([...dismissedRef.current, ...ids]);

    dismissedRef.current = newDismissed;
    saveDismissed(newDismissed);
    historyRef.current = [];
    setHistory([]);
    saveHistory([]);

    ids.forEach((id) => {
      scheduledExpire.current.delete(id);
      scheduledWarn.current.delete(id);
    });
  }, []);

  const addToHistory = useCallback((task, expiredAt) => {
    if (dismissedRef.current.has(task.id)) return;
    setHistorySync((prev) => {
      if (prev.find((h) => h.id === task.id)) return prev;
      return [
        { id: task.id, title: task.title, expiredAt: expiredAt || new Date().toISOString() },
        ...prev,
      ].slice(0, 20);
    });
  }, [setHistorySync]);

  const loadAndSchedule = useCallback(async () => {
    if (permission !== "granted") return;
    try {
      const res = await getALLTasks();
      const tasks = res.data;
      const current = new Date();

      // FIX: leer historial desde historyRef (siempre fresco, no depende de localStorage)
      // Si una tarea estaba vencida pero el usuario la editó y le puso hora futura,
      // sacarla del historial y reprogramar su timer con la nueva hora.
      if (historyRef.current.length > 0) {
        const historyIds = new Set(historyRef.current.map((h) => h.id));
        tasks.forEach((t) => {
          if (!historyIds.has(t.id)) return;
          if (!t.deadline_time) return;
          const d = new Date(t.deadline + "T" + t.deadline_time);
          // Si ahora es futura → sacarla del historial
          if (d > current) {
            setHistorySync((prev) => prev.filter((h) => h.id !== t.id));
            dismissedRef.current.delete(t.id);
            saveDismissed(dismissedRef.current);
            scheduledExpire.current.delete(t.id);
            scheduledWarn.current.delete(t.id);
          }
        });
      }

      // Tareas ya vencidas → historial
      tasks
        .filter((t) => {
          if (!t.deadline_time || t.status === "completada") return false;
          if (dismissedRef.current.has(t.id)) return false;
          const d = new Date(t.deadline + "T" + t.deadline_time);
          return d < current;
        })
        .forEach((task) => {
          const taskTime = new Date(task.deadline + "T" + task.deadline_time);
          addToHistory(task, taskTime.toISOString());
          scheduledExpire.current.add(task.id);
          scheduledWarn.current.add(task.id);
        });

      // Tareas futuras en las próximas 24h
      const futureTasks = tasks.filter((t) => {
        if (!t.deadline_time || t.status === "completada") return false;
        const d = new Date(t.deadline + "T" + t.deadline_time);
        const diff = d - current;
        return diff > 0 && diff < 24 * 60 * 60 * 1000;
      });

      setUpcoming(futureTasks);

      futureTasks.forEach((task) => {
        const taskTime = new Date(task.deadline + "T" + task.deadline_time);

        if (!scheduledWarn.current.has(task.id)) {
          const notifTime = new Date(taskTime.getTime() - minutesBefore * 60 * 1000);
          const delay = notifTime - current;
          if (delay > 0) {
            scheduledWarn.current.add(task.id);
            const t = setTimeout(() => {
              new Notification(`⏰ ${task.title}`, {
                body: `Vence en ${minutesBefore} minutos. Ábrela en la app para completarla, editarla o eliminarla.`,
                icon: "/favicon.ico",
                requireInteraction: true,
              });
            }, delay);
            timersRef.current.push(t);
          }
        }

        if (!scheduledExpire.current.has(task.id)) {
          const delay = taskTime - current;
          if (delay > 0) {
            scheduledExpire.current.add(task.id);
            const t = setTimeout(() => {
              dismissedRef.current.delete(task.id);
              saveDismissed(dismissedRef.current);
              addToHistory(task, new Date().toISOString());
              setUpcoming((prev) => prev.filter((u) => u.id !== task.id));
              new Notification(`🚨 Tarea vencida: ${task.title}`, {
                body: `Esta tarea venció y no fue completada.\nÁbrela en la app para editarla o eliminarla.`,
                icon: "/favicon.ico",
                requireInteraction: true,
              });
            }, delay);
            timersRef.current.push(t);
          }
        }
      });
    } catch {
      //
    }
  }, [permission, minutesBefore, addToHistory, setHistorySync]);

  // Polling cada 1 minuto como respaldo
  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current     = [];
    scheduledWarn.current   = new Set();
    scheduledExpire.current = new Set();

    loadAndSchedule();
    const interval = setInterval(loadAndSchedule, 1 * 60 * 1000);
    return () => {
      timersRef.current.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [loadAndSchedule]);

  // Escuchar "task:saved": recarga inmediata sin resetear timers existentes
  useEffect(() => {
    const handleTaskSaved = () => {
      loadAndSchedule();
    };
    window.addEventListener(TASK_SAVED_EVENT, handleTaskSaved);
    return () => window.removeEventListener(TASK_SAVED_EVENT, handleTaskSaved);
  }, [loadAndSchedule]);

  return {
    permission, requestPermission,
    minutesBefore, updateMinutesBefore,
    upcoming, history, clearHistory, now,
  };
}