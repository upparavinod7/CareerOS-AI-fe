import { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, X, Info } from "lucide-react";

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = (message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const contextValue = {
    toast: addToast,
    success: (m) => addToast(m, "success"),
    error: (m) => addToast(m, "error"),
    info: (m) => addToast(m, "info"),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3 pointer-events-none sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              layout
              className="pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-lg border border-slate-200 p-4"
            >
              <div className="flex items-start w-full gap-3">
                <div className="flex-shrink-0">
                  {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                  {t.type === "error" && <XCircle className="h-5 w-5 text-rose-600" />}
                  {t.type === "info" && <Info className="h-5 w-5 text-indigo-600" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium text-slate-800 leading-snug">{t.message}</p>
                </div>
                <button
                  type="button"
                  className="inline-flex rounded-md p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => removeToast(t.id)}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export default ToastContext;

