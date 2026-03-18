import { motion } from "framer-motion";

interface LiquidProgressProps {
  progress: number;
}

export function LiquidProgress({ progress }: LiquidProgressProps) {
  return (
    <div className="relative h-4 w-full overflow-hidden rounded-full border border-cyan-400/30 bg-slate-900/70">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
      <motion.div
        className="absolute inset-y-0 left-0 w-14 bg-white/30 blur-md"
        animate={{ x: [`-20%`, `${progress}%`] }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
    </div>
  );
}
