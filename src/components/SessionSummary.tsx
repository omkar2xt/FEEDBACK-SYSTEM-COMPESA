export function SessionSummary() {
  return (
    <section className="rounded-2xl border border-white/15 bg-panel p-6 shadow-glass backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">First Year Programming Roadmap</h2>
          <p className="mt-1 text-sm text-slate-400">Session guidance and recommendations</p>
        </div>
        <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          7 Key Tips
        </span>
      </div>

      <div className="space-y-3 text-sm text-slate-300">
        <div className="flex gap-3">
          <span className="text-cyan-300">1.</span>
          <p><strong>Build strong basics</strong> in programming and problem solving. Focus on skills over marks.</p>
        </div>
        <div className="flex gap-3">
          <span className="text-cyan-300">2.</span>
          <p><strong>Start mini projects early</strong> and keep improving them to build a real portfolio.</p>
        </div>
        <div className="flex gap-3">
          <span className="text-cyan-300">3.</span>
          <p><strong>Learn and use GitHub</strong> to store and showcase your work professionally.</p>
        </div>
        <div className="flex gap-3">
          <span className="text-cyan-300">4.</span>
          <p><strong>Build a professional presence</strong> on LinkedIn to connect with the tech community.</p>
        </div>
        <div className="flex gap-3">
          <span className="text-cyan-300">5.</span>
          <p><strong>Practice on LeetCode and CodeChef</strong> to strengthen your DSA and competitive skills.</p>
        </div>
        <div className="flex gap-3">
          <span className="text-cyan-300">6.</span>
          <p><strong>Participate in clubs, hackathons, and internships</strong> to gain real-world experience.</p>
        </div>
        <div className="flex gap-3">
          <span className="text-cyan-300">7.</span>
          <p><strong>Start early to stay ahead</strong> – consistency is the key to success.</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-emerald-300/25 bg-emerald-400/5 p-4">
        <p className="text-sm font-semibold text-emerald-200">💡 Key Takeaway:</p>
        <p className="mt-1 text-sm text-emerald-100">
          "Start small, stay consistent, and your future will be strong."
        </p>
      </div>
    </section>
  );
}
