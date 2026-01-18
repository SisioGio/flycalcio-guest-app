import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [message, setMessage] = useState(null);

  const showNotification = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, 10000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {message && <Notification message={message} />}
    </NotificationContext.Provider>
  );
};



const Notification = ({ message }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        exit={{ y: -100, opacity: 0, x: "-50%" }}
        transition={{ duration: 0.4 }}
       className={`fixed top-4 left-1/2 max-w-[90vw] break-words text-left ${
            message?.error ? "bg-red-600" : "bg-green-600"
          } text-white px-6 py-3 rounded-xl shadow-lg z-50 text-sm font-medium`}
        >
        {message.text}
      </motion.div>
    </AnimatePresence>
  );
};

