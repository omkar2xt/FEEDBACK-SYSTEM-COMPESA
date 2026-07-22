import { useState } from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "./MagneticButton";

interface AdminLoginProps {
  onLogin: (username: string, password: string) => Promise<boolean> | boolean;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const ok = await onLogin(username.trim(), password);
      if (!ok) {
        setError("Invalid admin credentials.");
      }
    } catch {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="mt-5 space-y-3"
      >
        <div>
          <label htmlFor="admin-username" className="sr-only">
            Username
          </label>
          <input
            id="admin-username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="sr-only">
            Password
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
          />
        </div>

        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

        <div className="mt-5">
          <MagneticButton onClick={() => void submit()}>
            {loading ? "Authenticating..." : "Login"}
          </MagneticButton>
        </div>
      </form>
    </motion.section>
  );
}
