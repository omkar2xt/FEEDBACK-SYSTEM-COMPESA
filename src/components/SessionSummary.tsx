export function SessionSummary() {
  return (
    <section className="rounded-2xl border border-white/15 bg-panel p-6 shadow-glass backdrop-blur-xl">
      <div className="mb-5 border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🎓</span> Engineering Success Roadmap
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-300">
          Session Guidance & Career Recommendations
        </p>
      </div>

      <div className="space-y-3.5 text-sm text-slate-200">
        <div className="flex gap-3">
          <span className="font-bold text-cyan-300">1.</span>
          <p>
            <strong className="text-white">Build Strong Fundamentals</strong> – Master programming, problem-solving, and core engineering concepts before chasing advanced technologies.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="font-bold text-cyan-300">2.</span>
          <p>
            <strong className="text-white">Practice Consistently</strong> – Spend time every day improving coding, communication, aptitude, and technical knowledge.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="font-bold text-cyan-300">3.</span>
          <p>
            <strong className="text-white">Build Real-World Projects</strong> – Create meaningful projects that solve real problems and showcase your practical skills.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="font-bold text-cyan-300">4.</span>
          <p>
            <strong className="text-white">Use GitHub Professionally</strong> – Maintain clean repositories, document your work, and build a strong development portfolio.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="font-bold text-cyan-300">5.</span>
          <p>
            <strong className="text-white">Strengthen Your Online Presence</strong> – Keep your LinkedIn profile updated, network with professionals, and share your achievements.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="font-bold text-cyan-300">6.</span>
          <p>
            <strong className="text-white">Participate Beyond the Classroom</strong> – Join hackathons, workshops, technical clubs, internships, research activities, and open-source projects.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="font-bold text-cyan-300">7.</span>
          <p>
            <strong className="text-white">Never Stop Learning</strong> – Stay curious, adapt to new technologies, and continuously improve your technical and personal skills.
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <p className="text-sm font-semibold text-emerald-300 flex items-center gap-1.5">
          <span>💡</span> Key Takeaway
        </p>
        <p className="mt-2 text-sm italic text-slate-200 pl-4 border-l-2 border-emerald-400">
          "Learn consistently, build confidently, collaborate openly, and success will follow."
        </p>
      </div>
    </section>
  );
}
