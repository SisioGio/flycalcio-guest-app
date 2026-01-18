import React, { useEffect } from "react";
import { Loader2 } from "lucide-react"; // Or any spinner icon you prefer
import { motion, AnimatePresence } from "framer-motion";
const FullScreenLoader = ({loading}) => {


    useEffect(() => {
        console.log("Loading:", loading);
    },[loading]);
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mb-4" />
           
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenLoader;
