import { motion } from "motion/react";

export default function JarvisHUD({ active }: { active: boolean }) {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer Glow Ring */}
      <motion.div
        className="absolute w-full h-full border-4 border-jarvis-blue rounded-full opacity-20"
        animate={{
          scale: active ? [0.95, 1.05, 0.95] : 1,
          rotate: 360,
        }}
        transition={{
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        }}
      />

      {/* Main Pulse Ring */}
      <motion.div
        className="absolute w-56 h-56 border-2 border-jarvis-blue rounded-full opacity-40 shadow-[0_0_20px_var(--color-jarvis-glow)]"
        animate={{
          rotate: -360,
          opacity: active ? [0.4, 0.8, 0.4] : 0.4,
        }}
        transition={{
          rotate: { duration: 15, repeat: Infinity, ease: "linear" },
          opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Interrupted Ring */}
      <div className="absolute w-48 h-48 rounded-full border-2 border-dashed border-jarvis-blue opacity-30 animate-[spin_10s_linear_infinite]" />

      {/* Inner Core */}
      <motion.div
        className="relative w-12 h-12 bg-jarvis-blue rounded-full shadow-[0_0_30px_var(--color-jarvis-blue)]"
        animate={active ? {
          scale: [1, 1.5, 1],
          opacity: [0.7, 1, 0.7]
        } : {}}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="absolute inset-0 bg-white rounded-full opacity-20 blur-sm" />
      </motion.div>

      {/* Data Arcs */}
      <svg className="absolute w-full h-full rotate-[-90deg]">
        <motion.circle
          cx="128"
          cy="128"
          r="100"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="10 30"
          className="text-jarvis-blue opacity-50"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          cx="128"
          cy="128"
          r="80"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="5 50"
          className="text-jarvis-blue opacity-30"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </svg>
      
      {/* Scanning status */}
      <div className="absolute -bottom-12 font-mono text-[10px] tracking-widest uppercase opacity-60">
        {active ? "Processing Audio..." : "System Idle"}
      </div>
    </div>
  );
}
