import { useEffect, useState } from "react";
import {
  createCoordinator,
  deleteCoordinator,
  fetchAllCoordinatorsAdmin,
  toggleCoordinatorStatus,
  updateCoordinator
} from "../services/feedbackService";
import type { CoordinatorItem } from "../types";

export function CoordinatorManager() {
  const [coordinators, setCoordinators] = useState<CoordinatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CoordinatorItem>>({
    name: "",
    role: "Student Coordinator",
    email: "",
    phone: "",
    linkedinUrl: "",
    githubUrl: "",
    photoUrl: "",
    displayOrder: 1,
    isActive: true
  });

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllCoordinatorsAdmin();
      setCoordinators(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      role: "Student Coordinator",
      email: "",
      phone: "",
      linkedinUrl: "",
      githubUrl: "",
      photoUrl: "",
      displayOrder: coordinators.length + 1,
      isActive: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (coord: CoordinatorItem) => {
    setEditingId(coord.id);
    setFormData({
      name: coord.name,
      role: coord.role,
      email: coord.email,
      phone: coord.phone,
      linkedinUrl: coord.linkedinUrl,
      githubUrl: coord.githubUrl,
      photoUrl: coord.photoUrl,
      displayOrder: coord.displayOrder,
      isActive: coord.isActive
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        await updateCoordinator(editingId, formData);
      } else {
        await createCoordinator(formData);
      }
      setShowModal(false);
      await loadData();
    } catch {}
    setSaving(false);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await toggleCoordinatorStatus(id, !current);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coordinator?")) return;
    await deleteCoordinator(id);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>👔</span> Coordinator Management
          </h3>
          <p className="text-xs text-slate-300">
            Add, edit, or toggle coordinators shown on the student Contact Us page.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-200 transition shadow-glow"
        >
          + Add New Coordinator
        </button>
      </div>

      {/* COORDINATOR TABLE */}
      {loading ? (
        <div className="py-8 text-center text-sm text-slate-400">Loading coordinators...</div>
      ) : coordinators.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
          No coordinators found. Click "+ Add New Coordinator" to create one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/15 bg-slate-900/60 shadow-glass">
          <table className="w-full text-left text-sm text-slate-200">
            <thead className="border-b border-white/10 bg-slate-900/80 text-xs uppercase tracking-wider text-cyan-300">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Photo & Name</th>
                <th className="px-4 py-3">Role / Designation</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Socials</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coordinators.map((coord) => (
                <tr key={coord.id} className="hover:bg-white/5 transition">
                  <td className="px-4 py-3 font-bold text-cyan-300">{coord.displayOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {coord.photoUrl ? (
                        <img
                          src={coord.photoUrl}
                          alt={coord.name}
                          className="h-10 w-10 rounded-xl object-cover border border-white/15"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 font-bold text-cyan-300 text-xs border border-white/10">
                          {coord.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold text-white">{coord.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 text-xs text-cyan-300 font-semibold">
                      {coord.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs space-y-0.5">
                    <p className="text-slate-300">{coord.email || "—"}</p>
                    <p className="text-slate-400">{coord.phone || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs space-x-2">
                    {coord.linkedinUrl && (
                      <a href={coord.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        LinkedIn
                      </a>
                    )}
                    {coord.githubUrl && (
                      <a href={coord.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:underline">
                        GitHub
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void handleToggleActive(coord.id, coord.isActive)}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase transition ${
                        coord.isActive
                          ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                          : "bg-slate-800 border border-white/10 text-slate-400"
                      }`}
                    >
                      {coord.isActive ? "🟢 Active" : "🔴 Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(coord)}
                      className="rounded-lg bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 hover:bg-blue-500/40 transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(coord.id)}
                      className="rounded-lg bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/40 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-lg font-bold text-white">
                {editingId ? "Edit Coordinator" : "Add New Coordinator"}
              </h4>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleSave(e)} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Omkar Gurav"
                  className="w-full rounded-xl border border-white/20 bg-slate-800 px-3.5 py-2.5 text-white outline-none focus:ring focus:ring-cyan-300"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role / Designation *</label>
                <input
                  required
                  value={formData.role || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                  placeholder="e.g. Student Coordinator, Faculty Lead"
                  className="w-full rounded-xl border border-white/20 bg-slate-800 px-3.5 py-2.5 text-white outline-none focus:ring focus:ring-cyan-300"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="omkar@email.com"
                    className="w-full rounded-xl border border-white/20 bg-slate-800 px-3.5 py-2.5 text-white outline-none focus:ring focus:ring-cyan-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    value={formData.phone || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-white/20 bg-slate-800 px-3.5 py-2.5 text-white outline-none focus:ring focus:ring-cyan-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Profile Photo URL</label>
                <input
                  value={formData.photoUrl || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, photoUrl: e.target.value }))}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full rounded-xl border border-white/20 bg-slate-800 px-3.5 py-2.5 text-white outline-none focus:ring focus:ring-cyan-300"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">LinkedIn Profile URL</label>
                  <input
                    value={formData.linkedinUrl || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full rounded-xl border border-white/20 bg-slate-800 px-3.5 py-2.5 text-white outline-none focus:ring focus:ring-cyan-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">GitHub Profile URL</label>
                  <input
                    value={formData.githubUrl || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, githubUrl: e.target.value }))}
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-white/20 bg-slate-800 px-3.5 py-2.5 text-white outline-none focus:ring focus:ring-cyan-300"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 items-center">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder ?? 1}
                    onChange={(e) => setFormData((p) => ({ ...p, displayOrder: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full rounded-xl border border-white/20 bg-slate-800 px-3.5 py-2.5 text-white outline-none focus:ring focus:ring-cyan-300"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded accent-cyan-400"
                    />
                    Active (Show on Contact page)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-cyan-300 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-200 transition"
                >
                  {saving ? "Saving..." : "Save Coordinator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
