export function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
        <p className="text-gray-800 text-center text-lg font-medium">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-semibold"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}