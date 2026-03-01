import { motion } from 'framer-motion';

export default function QuantumGlobe() {
  return (
    <div className="relative w-32 h-32 mx-auto">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0"
      >
        <div className="w-full h-full rounded-full border-4 border-blue-500/30 border-t-blue-500" />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-2"
      >
        <div className="w-full h-full rounded-full border-4 border-purple-500/30 border-r-purple-500" />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="text-4xl">⚛️</div>
      </motion.div>
    </div>
  );
}
