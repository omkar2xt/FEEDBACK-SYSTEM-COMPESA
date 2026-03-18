import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { FeedbackRecord } from "../types";
import { MagneticButton } from "./MagneticButton";

interface AdminDashboardProps {
  records: FeedbackRecord[];
  onLogout: () => void;
}

const BAR_COLORS = ["#27F4F1", "#3F7DFF", "#7CFF7C", "#FF5B9E", "#C084FC"];

export function AdminDashboard({ records, onLogout }: AdminDashboardProps) {
  const [search, setSearch] = useState("");
  const [recommendationFilter, setRecommendationFilter] = useState<"All" | "Yes" | "Maybe" | "No">("All");

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const bySearch =
        !search ||
        record.name.toLowerCase().includes(search.toLowerCase()) ||
        record.message.toLowerCase().includes(search.toLowerCase()) ||
        record.mostUsefulTopic.toLowerCase().includes(search.toLowerCase());
      const byRecommendation = recommendationFilter === "All" || record.recommendation === recommendationFilter;
      return bySearch && byRecommendation;
    });
  }, [records, search, recommendationFilter]);

  const ratingDistribution = useMemo(() => {
    return [1, 2, 3, 4, 5].map((value) => ({
      rating: value,
      count: filtered.filter((record) => record.rating === value).length
    }));
  }, [filtered]);

  const experienceDistribution = useMemo(() => {
    const options: FeedbackRecord["overallExperience"][] = ["Excellent", "Good", "Average", "Poor"];
    return options.map((label) => ({
      name: label,
      value: filtered.filter((record) => record.overallExperience === label).length
    }));
  }, [filtered]);

  const averageRating = filtered.length
    ? (filtered.reduce((sum, item) => sum + item.rating, 0) / filtered.length).toFixed(2)
    : "0.00";

  const mostSelectedTopic = useMemo(() => {
    if (!filtered.length) return "N/A";
    const count = new Map<string, number>();
    filtered.forEach((record) => {
      count.set(record.mostUsefulTopic, (count.get(record.mostUsefulTopic) || 0) + 1);
    });
    return Array.from(count.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }, [filtered]);

  const conclusion = useMemo(() => {
    if (!filtered.length) return "No feedback submitted yet.";
    const positive = filtered.filter((record) => record.rating >= 4).length;
    const sentiment = positive / filtered.length >= 0.6 ? "positively" : "with mixed reactions";
    return `Most students found the session useful and rated it ${sentiment}.`;
  }, [filtered]);

  const downloadExcel = async () => {
    if (!filtered.length) return;

    const ExcelJS = await import("exceljs");
    const rows = filtered.map((record) => ({
      Name: record.name,
      Experience: record.overallExperience,
      Rating: record.rating,
      Topic: record.mostUsefulTopic,
      Clarity: record.clarity,
      Engagement: record.engagement,
      Speaker: record.speakerSupport,
      Feedback: record.message,
      Suggestions: record.suggestions || "",
      Recommendation: record.recommendation,
      SubmittedAt: new Date(record.createdAt).toLocaleString()
    }));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Feedback");

    sheet.columns = [
      { header: "Name", key: "Name", width: 24 },
      { header: "Experience", key: "Experience", width: 14 },
      { header: "Rating", key: "Rating", width: 10 },
      { header: "Topic", key: "Topic", width: 22 },
      { header: "Clarity", key: "Clarity", width: 10 },
      { header: "Engagement", key: "Engagement", width: 12 },
      { header: "Speaker", key: "Speaker", width: 10 },
      { header: "Feedback", key: "Feedback", width: 42 },
      { header: "Suggestions", key: "Suggestions", width: 32 },
      { header: "Recommendation", key: "Recommendation", width: 16 },
      { header: "SubmittedAt", key: "SubmittedAt", width: 24 }
    ];

    rows.forEach((row) => {
      sheet.addRow(row);
    });

    const data = await workbook.xlsx.writeBuffer();
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `student-feedback-${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-panel p-4 shadow-glass backdrop-blur-xl">
        <h2 className="text-2xl font-semibold text-white">Admin Panel</h2>
        <div className="flex flex-wrap gap-2">
          <MagneticButton onClick={downloadExcel} disabled={!filtered.length}>Download .xlsx</MagneticButton>
          <MagneticButton onClick={onLogout}>Logout</MagneticButton>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/15 bg-panel p-4 shadow-glass backdrop-blur-xl md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, feedback, or topic"
          className="rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
        />
        <select
          value={recommendationFilter}
          onChange={(event) => setRecommendationFilter(event.target.value as "All" | "Yes" | "Maybe" | "No")}
          className="rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
        >
          <option value="All">All Recommendations</option>
          <option value="Yes">Yes</option>
          <option value="Maybe">Maybe</option>
          <option value="No">No</option>
        </select>
        <div className="rounded-xl border border-white/15 bg-slate-900/60 px-4 py-3 text-sm text-cyan-100">
          Showing {filtered.length} of {records.length} responses
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/15 bg-panel p-4 shadow-glass backdrop-blur-xl">
          <p className="text-sm text-slate-300">Average Rating</p>
          <p className="text-4xl font-bold text-cyan-200">{averageRating}</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-panel p-4 shadow-glass backdrop-blur-xl">
          <p className="text-sm text-slate-300">Total Responses</p>
          <p className="text-4xl font-bold text-blue-200">{filtered.length}</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-panel p-4 shadow-glass backdrop-blur-xl">
          <p className="text-sm text-slate-300">Most Selected Topic</p>
          <p className="text-2xl font-semibold text-emerald-200">{mostSelectedTopic}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-80 rounded-2xl border border-white/15 bg-panel p-4 shadow-glass backdrop-blur-xl">
          <p className="mb-2 text-sm text-slate-300">Ratings Distribution</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={ratingDistribution}>
              <XAxis dataKey="rating" stroke="#CBD5E1" />
              <YAxis stroke="#CBD5E1" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count">
                {ratingDistribution.map((entry, idx) => (
                  <Cell key={`${entry.rating}`} fill={BAR_COLORS[idx]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-80 rounded-2xl border border-white/15 bg-panel p-4 shadow-glass backdrop-blur-xl">
          <p className="mb-2 text-sm text-slate-300">Experience Levels</p>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={experienceDistribution} dataKey="value" nameKey="name" outerRadius={100} label>
                {experienceDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-white/15 bg-panel p-4 shadow-glass backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white">Conclusion</h3>
        <p className="mt-2 text-slate-200">{conclusion}</p>
      </div>

      <div className="overflow-auto rounded-2xl border border-white/15 bg-panel shadow-glass backdrop-blur-xl">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="border-b border-white/10 bg-slate-900/60 text-xs uppercase tracking-wide text-cyan-200">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Feedback</th>
              <th className="px-4 py-3">Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record.id || record.createdAt} className="border-b border-white/5">
                <td className="px-4 py-3">{record.name}</td>
                <td className="px-4 py-3">{record.rating}</td>
                <td className="px-4 py-3">{record.overallExperience}</td>
                <td className="px-4 py-3">{record.mostUsefulTopic}</td>
                <td className="max-w-md truncate px-4 py-3">{record.message}</td>
                <td className="px-4 py-3">{record.recommendation}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No feedback records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
