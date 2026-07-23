import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  createQuestion,
  createSession,
  deleteAllFeedbackRecords,
  deleteFeedbackRecord,
  deleteQuestion,
  deleteSession,
  fetchQuestions,
  fetchSessions,
  fetchYears,
  toggleYearOpen,
  updateQuestion,
  updateSession
} from "../services/feedbackService";
import type { FeedbackRecord, QuestionItem, SessionItem, YearItem } from "../types";
import { MagneticButton } from "./MagneticButton";
import { CoordinatorManager } from "./CoordinatorManager";
import { QuestionBuilder } from "./QuestionBuilder";
import { SessionManager } from "./SessionManager";
import { YearAccessControl } from "./YearAccessControl";

interface AdminDashboardProps {
  records: FeedbackRecord[];
  onLogout: () => void;
}

const RATING_BAR_COLORS = [
  "#F43F5E", // 1 Star - Rose Red
  "#FB923C", // 2 Star - Amber Orange
  "#FACC15", // 3 Star - Bright Yellow
  "#38BDF8", // 4 Star - Sky Cyan
  "#34D399"  // 5 Star - Emerald Green
];

const PIE_COLORS = ["#34D399", "#38BDF8", "#FACC15", "#F43F5E"];

type AdminTab = "analytics" | "years" | "sessions" | "questions" | "coordinators";

const BarCustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const val = data.value || 0;
    if (val === 0) return null;

    return (
      <div className="rounded-xl border border-white/20 bg-slate-900/95 px-4 py-2.5 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold text-cyan-300">
          {data.payload.rating} Rating
        </p>
        <p className="mt-1 text-sm font-bold text-emerald-400">
          Responses: <span className="text-white">{val}</span>
        </p>
      </div>
    );
  }
  return null;
};

const PieCustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-xl border border-white/20 bg-slate-900/95 px-4 py-2.5 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold text-cyan-300">
          {data.name} Experience
        </p>
        <p className="mt-1 text-sm font-bold text-emerald-400">
          Count: <span className="text-white">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomizedPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
  value
}: any) => {
  if (!percent || percent <= 0) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#38bdf8"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

export function AdminDashboard({ records, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [years, setYears] = useState<YearItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  const [search, setSearch] = useState("");
  const [recommendationFilter, setRecommendationFilter] = useState<"All" | "Yes" | "Maybe" | "No">("All");
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [showExportModal, setShowExportModal] = useState(false);

  const [exportYearSelect, setExportYearSelect] = useState<"FY" | "SY" | "TY" | "BTECH">("FY");
  const [exportSessionTitleSelect, setExportSessionTitleSelect] = useState<string>("");

  // Option 4 State: Year-Filtered Guidance Session Export
  const [option4YearSelect, setOption4YearSelect] = useState<"FY" | "SY" | "TY" | "BTECH">("FY");
  const [option4SessionSelect, setOption4SessionSelect] = useState<string>("");

  const reloadAdminData = async () => {
    try {
      const yData = await fetchYears();
      setYears(yData);

      const sData = await fetchSessions();
      setSessions(sData);

      const qData = await fetchQuestions();
      setQuestions(qData);
    } catch {}
  };

  useEffect(() => {
    void reloadAdminData();
  }, []);

  const availableSessionTitles = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.sessionTitle) set.add(r.sessionTitle);
      else if (r.mostUsefulTopic) set.add(r.mostUsefulTopic);
    });
    return Array.from(set);
  }, [records]);

  useEffect(() => {
    if (availableSessionTitles.length > 0 && !exportSessionTitleSelect) {
      setExportSessionTitleSelect(availableSessionTitles[0]);
    }
  }, [availableSessionTitles, exportSessionTitleSelect]);

  // Guidance Sessions filtered specifically under Option 4 selected Academic Year
  const option4FilteredSessions = useMemo(() => {
    const yearCode = option4YearSelect.toUpperCase();
    const titleSet = new Set<string>();

    records.forEach((r) => {
      const recYear = (r.yearCode || "").toUpperCase();
      if (recYear === yearCode || (r.yearId || "").toUpperCase().includes(yearCode)) {
        if (r.sessionTitle) titleSet.add(r.sessionTitle);
        else if (r.mostUsefulTopic) titleSet.add(r.mostUsefulTopic);
      }
    });

    sessions.forEach((s) => {
      const yearMatch = years.find((y) => y.id === s.yearId);
      if (yearMatch && yearMatch.code?.toUpperCase() === yearCode) {
        titleSet.add(s.title);
      }
    });

    return Array.from(titleSet);
  }, [records, sessions, years, option4YearSelect]);

  useEffect(() => {
    if (option4FilteredSessions.length > 0) {
      setOption4SessionSelect(option4FilteredSessions[0]);
    } else {
      setOption4SessionSelect("");
    }
  }, [option4FilteredSessions]);

  const handleToggleYearOpen = async (yearId: string, isOpen: boolean) => {
    await toggleYearOpen(yearId, isOpen);
    await reloadAdminData();
  };

  const handleCreateSession = async (data: Partial<SessionItem>) => {
    await createSession(data);
    await reloadAdminData();
  };

  const handleUpdateSession = async (id: string, data: Partial<SessionItem>) => {
    await updateSession(id, data);
    await reloadAdminData();
  };

  const handleDeleteSession = async (id: string) => {
    await deleteSession(id);
    await reloadAdminData();
  };

  const handleCreateQuestion = async (data: Partial<QuestionItem>) => {
    await createQuestion(data);
    await reloadAdminData();
  };

  const handleUpdateQuestion = async (id: string, data: Partial<QuestionItem>) => {
    await updateQuestion(id, data);
    await reloadAdminData();
  };

  const handleDeleteQuestion = async (id: string) => {
    await deleteQuestion(id);
    await reloadAdminData();
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this student response?")) return;
    await deleteFeedbackRecord(id);
    window.location.reload();
  };

  const handleDeleteAllRecords = async () => {
    if (!window.confirm("CAUTION: Are you sure you want to delete ALL filled student feedback data? This cannot be undone.")) return;
    await deleteAllFeedbackRecords();
    window.location.reload();
  };

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const bySearch =
        !search ||
        record.name.toLowerCase().includes(search.toLowerCase()) ||
        record.message.toLowerCase().includes(search.toLowerCase()) ||
        (record.mostUsefulTopic || "").toLowerCase().includes(search.toLowerCase());
      const byRecommendation = recommendationFilter === "All" || record.recommendation === recommendationFilter;
      const recYear = (record.yearCode || "").toUpperCase();
      const targetFilter = yearFilter.toUpperCase();
      const byYear =
        targetFilter === "ALL" ||
        recYear === targetFilter ||
        (record.yearId || "").toUpperCase().includes(targetFilter) ||
        (targetFilter === "FY" && (recYear === "FY" || record.yearId === "year-fy")) ||
        (targetFilter === "SY" && (recYear === "SY" || record.yearId === "year-sy")) ||
        (targetFilter === "TY" && (recYear === "TY" || record.yearId === "year-ty")) ||
        (targetFilter === "BTECH" && (recYear === "BTECH" || record.yearId === "year-btech"));
      return bySearch && byRecommendation && byYear;
    });
  }, [records, search, recommendationFilter, yearFilter]);

  const ratingDistribution = useMemo(() => {
    return [1, 2, 3, 4, 5].map((value) => ({
      rating: `${value} ★`,
      count: filtered.filter((record) => record.rating === value).length
    }));
  }, [filtered]);

  const experienceDistribution = useMemo(() => {
    const options: FeedbackRecord["overallExperience"][] = ["Excellent", "Good", "Average", "Poor"];
    return options
      .map((label) => ({
        name: label,
        value: filtered.filter((record) => record.overallExperience === label).length
      }))
      .filter((item) => item.value > 0);
  }, [filtered]);

  const averageRating = filtered.length
    ? (filtered.reduce((sum, item) => sum + item.rating, 0) / filtered.length).toFixed(2)
    : "0.00";

  const recommendPercentage = useMemo(() => {
    if (!filtered.length) return "0.0%";
    const yesCount = filtered.filter((r) => r.recommendation === "Yes" || r.wouldRecommend).length;
    return `${((yesCount / filtered.length) * 100).toFixed(1)}%`;
  }, [filtered]);

  const positiveSentimentPercentage = useMemo(() => {
    if (!filtered.length) return "0.0%";
    const highRating = filtered.filter((r) => r.rating >= 4).length;
    return `${((highRating / filtered.length) * 100).toFixed(1)}%`;
  }, [filtered]);

  const mostSelectedTopic = useMemo(() => {
    if (!filtered.length) return "N/A";
    const count = new Map<string, number>();
    filtered.forEach((record) => {
      const topic = record.mostUsefulTopic || record.sessionTitle || "Session";
      count.set(topic, (count.get(topic) || 0) + 1);
    });
    return Array.from(count.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }, [filtered]);

  const conclusion = useMemo(() => {
    if (!filtered.length) return "No feedback submitted yet for the selected filters.";
    const positive = filtered.filter((record) => record.rating >= 4).length;
    const sentiment = positive / filtered.length >= 0.6 ? "positively" : "with mixed reactions";
    return `Most students found the session useful and rated it ${sentiment}.`;
  }, [filtered]);

  // ADVANCED MULTI-TAB & SELECTABLE EXCEL GENERATOR
  const generateExcelWorkbook = async (options: {
    yearTarget: "ALL" | "FY" | "SY" | "TY" | "BTECH";
    structureMode: "multi-tab-years" | "single-sheet" | "single-session";
    sessionTitleTarget?: string;
  }) => {
    if (!records.length) return;

    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "COMPESA Student Feedback System";
    workbook.created = new Date();

    const formatSheet = (sheet: any, rowsData: FeedbackRecord[], sheetTitle: string) => {
      sheet.addRow([`COMPESA Student Feedback Report - ${sheetTitle}`]);
      sheet.getRow(1).font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
      sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };

      const totalCount = rowsData.length;
      const avgRating = totalCount
        ? (rowsData.reduce((s, r) => s + r.rating, 0) / totalCount).toFixed(2)
        : "0.00";

      sheet.addRow([`Total Responses: ${totalCount}`, `Average Rating: ${avgRating} / 5.0`]);
      sheet.getRow(2).font = { italic: true, size: 10, color: { argb: "FF38BDF8" } };

      sheet.addRow([]); // Empty line

      const headerRow = sheet.addRow([
        "Academic Year",
        "Session Title",
        "Student Name",
        "Division",
        "Roll No",
        "Overall Rating",
        "Experience Level",
        "Recommendation",
        "Feedback / Answers",
        "Submitted Date"
      ]);

      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };

      rowsData.forEach((rec) => {
        sheet.addRow([
          rec.yearCode || "FY",
          rec.sessionTitle || rec.mostUsefulTopic || "Session Guidance",
          rec.name,
          rec.division || "A",
          rec.rollNo || "—",
          `${rec.rating} ★`,
          rec.overallExperience || "Good",
          rec.recommendation || "Yes",
          rec.message || "",
          new Date(rec.createdAt).toLocaleString()
        ]);
      });

      sheet.columns = [
        { width: 15 },
        { width: 32 },
        { width: 24 },
        { width: 12 },
        { width: 14 },
        { width: 14 },
        { width: 16 },
        { width: 16 },
        { width: 55 },
        { width: 24 }
      ];
    };

    if (options.structureMode === "multi-tab-years") {
      // 1. All Responses Sheet
      const overviewSheet = workbook.addWorksheet("All Responses");
      formatSheet(overviewSheet, records, "All Academic Years (FY/SY/TY/BTech)");

      // 2. FY Sheet
      const fyRecords = records.filter((r) => (r.yearCode || "").toUpperCase() === "FY" || r.yearId === "year-fy");
      if (fyRecords.length > 0) {
        const fySheet = workbook.addWorksheet("First Year (FY)");
        formatSheet(fySheet, fyRecords, "First Year (FY)");
      }

      // 3. SY Sheet
      const syRecords = records.filter((r) => (r.yearCode || "").toUpperCase() === "SY" || r.yearId === "year-sy");
      if (syRecords.length > 0) {
        const sySheet = workbook.addWorksheet("Second Year (SY)");
        formatSheet(sySheet, syRecords, "Second Year (SY)");
      }

      // 4. TY Sheet
      const tyRecords = records.filter((r) => (r.yearCode || "").toUpperCase() === "TY" || r.yearId === "year-ty");
      if (tyRecords.length > 0) {
        const tySheet = workbook.addWorksheet("Third Year (TY)");
        formatSheet(tySheet, tyRecords, "Third Year (TY)");
      }

      // 5. BTECH Sheet
      const btechRecords = records.filter((r) => (r.yearCode || "").toUpperCase() === "BTECH" || r.yearId === "year-btech");
      if (btechRecords.length > 0) {
        const btechSheet = workbook.addWorksheet("B.Tech (BTECH)");
        formatSheet(btechSheet, btechRecords, "B.Tech (BTECH)");
      }
    } else if (options.structureMode === "single-session" && options.sessionTitleTarget) {
      const sessRecords = records.filter(
        (r) => (r.sessionTitle || r.mostUsefulTopic || "") === options.sessionTitleTarget
      );
      const cleanTitle = options.sessionTitleTarget.replace(/[\\/*?:[\]]/g, "").slice(0, 28);
      const sheet = workbook.addWorksheet(cleanTitle || "Session Feedback");
      formatSheet(sheet, sessRecords, `Session: ${options.sessionTitleTarget}`);
    } else {
      let targetRecords = records;
      if (options.yearTarget !== "ALL") {
        targetRecords = records.filter(
          (r) => (r.yearCode || "").toUpperCase() === options.yearTarget || (r.yearId || "").toUpperCase().includes(options.yearTarget)
        );
      }
      const sheet = workbook.addWorksheet(`Feedback-${options.yearTarget}`);
      formatSheet(sheet, targetRecords, `Academic Year: ${options.yearTarget}`);
    }

    const data = await workbook.xlsx.writeBuffer();
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;

    let fileName = `COMPESA-Feedback-All-Years-${new Date().toISOString().split("T")[0]}.xlsx`;
    if (options.structureMode === "single-sheet") {
      fileName = `COMPESA-Feedback-${options.yearTarget}-${new Date().toISOString().split("T")[0]}.xlsx`;
    } else if (options.structureMode === "single-session") {
      fileName = `COMPESA-Feedback-Session-${new Date().toISOString().split("T")[0]}.xlsx`;
    }

    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  return (
    <section className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-panel p-4 shadow-glass backdrop-blur-xl">
        <h2 className="text-2xl font-semibold text-white">Admin Control Center</h2>
        <div className="flex flex-wrap gap-2">
          <MagneticButton onClick={() => setShowExportModal(true)} disabled={!records.length}>
            📊 Download .xlsx
          </MagneticButton>
          <button
            type="button"
            onClick={() => void handleDeleteAllRecords()}
            disabled={!records.length}
            className="rounded-xl border border-rose-500/30 bg-rose-500/20 px-4 py-2 text-xs font-bold text-rose-200 transition hover:bg-rose-500/40 disabled:opacity-30"
          >
            🗑️ Clear All Responses
          </button>
          <MagneticButton onClick={onLogout}>Logout</MagneticButton>
        </div>
      </div>

      {/* EXPORT OPTIONS MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📊</span> Export Feedback to Excel (.xlsx)
              </h3>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Choose how you would like to download your feedback data (.xlsx):
            </p>

            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Option 1: Multi-Tab All Years */}
              <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-200 text-sm">1. 📦 All Academic Years (Multi-Tab Workbook)</span>
                  <span className="rounded bg-cyan-400/20 px-2 py-0.5 text-xs text-cyan-300 font-semibold">Recommended</span>
                </div>
                <p className="text-xs text-slate-300">
                  Exports 1 Excel file with separate worksheets for <strong>All Responses</strong>, <strong>FY</strong>, <strong>SY</strong>, <strong>TY</strong>, and <strong>B.Tech</strong>.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => void generateExcelWorkbook({ yearTarget: "ALL", structureMode: "multi-tab-years" })}
                    className="rounded-lg bg-cyan-300 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-200 transition"
                  >
                    Download All Years (.xlsx)
                  </button>
                </div>
              </div>

              {/* Option 2: Selectable Academic Year (FY / SY / TY / BTech) */}
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-200 text-sm">2. 🎓 Selectable Academic Year Export</span>
                  <span className="rounded bg-emerald-400/20 px-2 py-0.5 text-xs text-emerald-300 font-semibold">Select Year</span>
                </div>
                <p className="text-xs text-slate-300">
                  Select a specific academic year to download its Excel sheet:
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={exportYearSelect}
                    onChange={(e) => setExportYearSelect(e.target.value as any)}
                    className="flex-1 rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:ring focus:ring-emerald-300"
                  >
                    <option value="FY">First Year (FY)</option>
                    <option value="SY">Second Year (SY)</option>
                    <option value="TY">Third Year (TY)</option>
                    <option value="BTECH">B.Tech (BTECH)</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => void generateExcelWorkbook({ yearTarget: exportYearSelect, structureMode: "single-sheet" })}
                    className="rounded-lg bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-300 transition"
                  >
                    Download {exportYearSelect} (.xlsx)
                  </button>
                </div>
              </div>

              {/* Option 3: Selectable Specific Session */}
              <div className="rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-200 text-sm">3. 📅 All Sessions Global Export</span>
                  <span className="rounded bg-blue-400/20 px-2 py-0.5 text-xs text-blue-300 font-semibold">All Sessions</span>
                </div>
                <p className="text-xs text-slate-300">
                  Select any workshop/session from all academic years to download its feedback Excel sheet:
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={exportSessionTitleSelect}
                    onChange={(e) => setExportSessionTitleSelect(e.target.value)}
                    className="flex-1 rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:ring focus:ring-blue-300"
                  >
                    {availableSessionTitles.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                    {!availableSessionTitles.length && <option value="">No sessions available</option>}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      void generateExcelWorkbook({
                        yearTarget: "ALL",
                        structureMode: "single-session",
                        sessionTitleTarget: exportSessionTitleSelect
                      })
                    }
                    disabled={!exportSessionTitleSelect}
                    className="rounded-lg bg-blue-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-blue-300 transition disabled:opacity-40"
                  >
                    Download Session (.xlsx)
                  </button>
                </div>
              </div>

              {/* Option 4: Year-Filtered Guidance Session Export (Under FY, SY, TY, BTech) */}
              <div className="rounded-xl border border-purple-400/30 bg-purple-400/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-200 text-sm">4. 🎯 Academic Year Guidance Session Export</span>
                  <span className="rounded bg-purple-400/20 px-2 py-0.5 text-xs text-purple-300 font-semibold">Year & Session</span>
                </div>
                <p className="text-xs text-slate-300">
                  Select an Academic Year (FY, SY, TY, B.Tech) to filter and choose its specific Guidance Session:
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">1. Academic Year:</label>
                    <select
                      value={option4YearSelect}
                      onChange={(e) => setOption4YearSelect(e.target.value as any)}
                      className="w-full rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:ring focus:ring-purple-300"
                    >
                      <option value="FY">First Year (FY)</option>
                      <option value="SY">Second Year (SY)</option>
                      <option value="TY">Third Year (TY)</option>
                      <option value="BTECH">B.Tech (BTECH)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">2. Select Guidance Session:</label>
                    <select
                      value={option4SessionSelect}
                      onChange={(e) => setOption4SessionSelect(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:ring focus:ring-purple-300"
                    >
                      {option4FilteredSessions.map((title) => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))}
                      {!option4FilteredSessions.length && <option value="">No sessions for {option4YearSelect}</option>}
                    </select>
                  </div>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      void generateExcelWorkbook({
                        yearTarget: option4YearSelect,
                        structureMode: "single-session",
                        sessionTitleTarget: option4SessionSelect
                      })
                    }
                    disabled={!option4SessionSelect}
                    className="w-full rounded-lg bg-purple-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-purple-300 transition disabled:opacity-40"
                  >
                    Download {option4YearSelect} Guidance Session (.xlsx)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/15 bg-panel p-2 shadow-glass backdrop-blur-xl">
        {[
          { id: "analytics", label: "📊 Overview & Analytics" },
          { id: "years", label: "🔒 Year Access Control" },
          { id: "sessions", label: "📅 Session Manager" },
          { id: "questions", label: "✏️ Question Builder" },
          { id: "coordinators", label: "👔 Coordinator Management" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === tab.id
                ? "bg-cyan-300 text-slate-950 shadow-glow"
                : "bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* FILTER BAR */}
          <div className="grid gap-4 rounded-2xl border border-white/15 bg-panel p-4 shadow-glass backdrop-blur-xl md:grid-cols-4">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student name or feedback..."
              className="rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
            />
            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none focus:ring focus:ring-cyan-300/60"
            >
              <option value="All">All Years (FY/SY/TY/BTech)</option>
              <option value="FY">First Year (FY)</option>
              <option value="SY">Second Year (SY)</option>
              <option value="TY">Third Year (TY)</option>
              <option value="BTECH">B.Tech</option>
            </select>
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
            <div className="rounded-xl border border-white/15 bg-slate-900/60 px-4 py-3 text-sm text-cyan-100 flex items-center justify-center">
              Showing {filtered.length} of {records.length} responses
            </div>
          </div>

          {/* KPI CARDS (KEY PERFORMANCE INDICATORS) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total Submissions */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-panel p-5 shadow-glass backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-cyan-500/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Submissions</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-lg text-cyan-300">
                  📝
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">{filtered.length}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Feedback Entries</span>
              </div>
            </div>

            {/* Card 2: Average Rating */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-panel p-5 shadow-glass backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-emerald-500/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Rating</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-lg text-emerald-300">
                  ⭐
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-white">{averageRating}</p>
                <span className="text-sm text-slate-400">/ 5.0</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-cyan-300">
                <span>{positiveSentimentPercentage} positive sentiment</span>
              </div>
            </div>

            {/* Card 3: Recommendation Rate */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-panel p-5 shadow-glass backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-blue-500/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recommendation Rate</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-400/10 text-lg text-blue-300">
                  👍
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">{recommendPercentage}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-blue-300">
                <span>Would recommend session</span>
              </div>
            </div>

            {/* Card 4: Top Topic */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-panel p-5 shadow-glass backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-amber-500/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Performing Topic</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-lg text-amber-300">
                  🚀
                </div>
              </div>
              <p className="mt-3 text-lg font-bold text-white truncate">{mostSelectedTopic}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-amber-300">
                <span>Highest student engagement</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* RATINGS BAR CHART */}
            <div className="rounded-2xl border border-white/15 bg-panel p-5 shadow-glass backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                <p className="text-sm font-bold tracking-wide text-cyan-200 uppercase">Ratings Distribution</p>
                <span className="text-xs text-slate-400">Rating Breakdown</span>
              </div>
              <div className="w-full h-[270px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                  <BarChart data={ratingDistribution} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="rating" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} tickLine={false} />
                    <Tooltip content={<BarCustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.04)" }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      <LabelList
                        dataKey="count"
                        position="top"
                        fill="#38BDF8"
                        fontSize={13}
                        fontWeight="bold"
                        formatter={(val: any) => (val > 0 ? val : "")}
                      />
                      {ratingDistribution.map((entry, idx) => (
                        <Cell
                          key={`bar-${entry.rating}`}
                          fill={RATING_BAR_COLORS[idx % RATING_BAR_COLORS.length]}
                          fillOpacity={entry.count > 0 ? 1 : 0.15}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* EXPERIENCE DONUT CHART */}
            <div className="rounded-2xl border border-white/15 bg-panel p-5 shadow-glass backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                <p className="text-sm font-bold tracking-wide text-cyan-200 uppercase">Experience Levels</p>
                <span className="text-xs text-slate-400">Satisfaction Breakdown</span>
              </div>

              {experienceDistribution.length > 0 ? (
                <div className="w-full h-[270px]">
                  <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                    <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                      <Pie
                        data={experienceDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        cornerRadius={6}
                        label={renderCustomizedPieLabel}
                        labelLine={{ stroke: "#38bdf8", strokeWidth: 1.5 }}
                      >
                        {experienceDistribution.map((entry, index) => (
                          <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#0f172a" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieCustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[270px] items-center justify-center text-center text-sm text-slate-400">
                  No experience feedback data available for selected year filter.
                </div>
              )}
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
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Div / Roll</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Feedback / Answers</th>
                  <th className="px-4 py-3">Recommendation</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id || record.createdAt} className="border-b border-white/5">
                    <td className="px-4 py-3 font-semibold text-cyan-300">{record.yearCode || "FY"}</td>
                    <td className="px-4 py-3">{record.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">
                      Div {record.division || "A"} / #{record.rollNo || "—"}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-300">{record.rating} ★</td>
                    <td className="max-w-md truncate px-4 py-3 text-xs text-slate-300">{record.message}</td>
                    <td className="px-4 py-3">{record.recommendation}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void handleDeleteRecord(record.id || "")}
                        className="rounded-lg bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/40 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                      No feedback records found matching selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: YEAR ACCESS CONTROL */}
      {activeTab === "years" && (
        <div className="rounded-2xl border border-white/15 bg-panel p-6 shadow-glass backdrop-blur-xl">
          <YearAccessControl years={years} onToggleOpen={handleToggleYearOpen} />
        </div>
      )}

      {/* TAB 3: SESSION MANAGER */}
      {activeTab === "sessions" && (
        <div className="rounded-2xl border border-white/15 bg-panel p-6 shadow-glass backdrop-blur-xl">
          <SessionManager
            years={years}
            sessions={sessions}
            onCreateSession={handleCreateSession}
            onUpdateSession={handleUpdateSession}
            onDeleteSession={handleDeleteSession}
          />
        </div>
      )}

      {/* TAB 4: QUESTION BUILDER */}
      {activeTab === "questions" && (
        <div className="rounded-2xl border border-white/15 bg-panel p-6 shadow-glass backdrop-blur-xl">
          <QuestionBuilder
            years={years}
            questions={questions}
            onCreateQuestion={handleCreateQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        </div>
      )}

      {/* TAB 5: COORDINATOR MANAGEMENT */}
      {activeTab === "coordinators" && (
        <div className="rounded-2xl border border-white/15 bg-panel p-6 shadow-glass backdrop-blur-xl">
          <CoordinatorManager />
        </div>
      )}
    </section>
  );
}
