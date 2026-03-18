import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import type { FeedbackRecord } from "../types";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface DashboardProps {
  records: FeedbackRecord[];
}

function extractTopWords(records: FeedbackRecord[]) {
  const stopWords = new Set(["the", "and", "for", "this", "that", "with", "was", "are", "but"]);
  const map = new Map<string, number>();

  records.forEach((r) => {
    r.message
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .forEach((word) => map.set(word, (map.get(word) || 0) + 1));
  });

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16);
}

export function Dashboard({ records }: DashboardProps) {
  const average = records.length
    ? (records.reduce((sum, item) => sum + item.rating, 0) / records.length).toFixed(2)
    : "0.00";

  const sentimentCounts = {
    Positive: records.filter((r) => r.sentiment === "Positive").length,
    Neutral: records.filter((r) => r.sentiment === "Neutral").length,
    Negative: records.filter((r) => r.sentiment === "Negative").length
  };

  const focusAreas = {
    "Programming Basics": records.filter((r) => r.category === "UX").length,
    "Projects & GitHub": records.filter((r) => r.category === "Performance").length,
    "Competitive Programming": records.filter((r) => r.category === "Features").length,
    "Career Prep": records.filter((r) => r.category === "Support").length
  };

  const wouldRecommend = records.filter((r) => r.wouldRecommend).length;
  const recommendPercent = records.length ? ((wouldRecommend / records.length) * 100).toFixed(0) : "0";

  const topWords = extractTopWords(records);

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr_1fr]" aria-label="Session feedback analytics">
      <div className="rounded-2xl border border-white/15 bg-panel p-5 shadow-glass backdrop-blur-xl">
        <h3 className="mb-4 text-xl font-semibold text-white">Live Session Insights</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 overflow-hidden rounded-xl bg-slate-950/30 p-2">
            <Bar
              data={{
                labels: ["Programming", "Projects", "Competitive", "Career"],
                datasets: [
                  {
                    label: "Student Focus Areas",
                    data: [
                      focusAreas["Programming Basics"],
                      focusAreas["Projects & GitHub"],
                      focusAreas["Competitive Programming"],
                      focusAreas["Career Prep"]
                    ],
                    backgroundColor: ["#27F4F1", "#3F7DFF", "#7CFF7C", "#FF5B9E"]
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: "#e5e7eb" } }
                },
                scales: {
                  x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.08)" } },
                  y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.08)" } }
                }
              }}
            />
          </div>
          <div className="h-72 overflow-hidden rounded-xl bg-slate-950/30 p-2">
            <Doughnut
              data={{
                labels: ["Positive", "Neutral", "Needs Work"],
                datasets: [
                  {
                    data: [sentimentCounts.Positive, sentimentCounts.Neutral, sentimentCounts.Negative],
                    backgroundColor: ["#7CFF7C", "#27F4F1", "#FF5B9E"],
                    borderWidth: 1,
                    borderColor: "rgba(10,10,20,0.8)"
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: "#e5e7eb" }, position: "bottom" } },
                cutout: "62%"
              }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/15 bg-panel p-5 shadow-glass backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white">Key Metrics</h3>
        <p className="mt-3 text-sm text-slate-300">Average Session Rating</p>
        <p className="text-4xl font-bold text-cyan-200">{average}/5</p>
        <p className="mt-5 text-sm text-slate-300">Would Recommend</p>
        <p className="text-3xl font-bold text-emerald-300">{recommendPercent}%</p>
        <p className="mt-5 text-sm text-slate-300">Responses</p>
        <p className="text-2xl font-bold text-blue-300">{records.length}</p>
      </div>
    </section>
  );
}
