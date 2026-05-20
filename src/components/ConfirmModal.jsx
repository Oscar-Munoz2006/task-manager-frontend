import { AlertTriangle, Save } from "lucide-react";

export function ConfirmModal({ message, onConfirm, onCancel, variant = "danger" }) {
  const config = {
    danger: {
      icon: <AlertTriangle size={22} />,
      iconBg: "bg-red-500/10 border-red-500/20 text-red-400",
      btn: "bg-red-600 hover:bg-red-500 shadow-red-900/20",
    },
    success: {
      icon: <Save size={22} />,
      iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      btn: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20",
    },
  };

  const { icon, iconBg, btn } = config[variant];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 p-6 w-full max-w-sm flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">

        <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>

        <p className="text-slate-200 text-center text-sm font-medium leading-relaxed px-2">
          {message || "¿Estás seguro de realizar esta acción?"}
        </p>

        <div className="flex gap-2.5 w-full mt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors font-semibold text-xs uppercase tracking-wider cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white shadow-lg transition-colors font-semibold text-xs uppercase tracking-wider cursor-pointer ${btn}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}