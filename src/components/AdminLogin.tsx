import { useState } from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "./MagneticButton";

interface AdminLoginProps {
  onLogin: (username: string, password: string) => boolean;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const ok = onLogin(username.trim(), password);
    if (!ok) {
      setError("Invalid admin credentials.");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-md rounded-2xl border border-white/15 bg-panel p-6 shadow-glass backdrop-blur-xl"
    >
      <h2 className="text-2xl font-semibold text-white">Admin Login</h2>
      <p className="mt-2 text-sm text-slate-300">Use authorized credentials to access analytics and downloads.</p>

      <div className="mt-5 space-y-3">
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
        />
      </div>

      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

      <div className="mt-5">
        <MagneticButton onClick={submit}>Login</MagneticButton>
      </div>
    </motion.section>
  );
}
