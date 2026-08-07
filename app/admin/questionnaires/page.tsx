"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  MoveUp,
  MoveDown,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  FolderPlus,
} from "lucide-react";

export default function AdminQuestionnairesPage() {
  const [loading, setLoading] = useState(true);
  const [questionSets, setQuestionSets] = useState<any[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);

  // Modals
  const [showQuestionSetModal, setShowQuestionSetModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // Forms
  const [setForm, setSetForm] = useState({ id: "", name: "", description: "", deviceCategory: "MOBILE", active: true });
  const [questionForm, setQuestionForm] = useState<any>({
    id: "",
    questionSetId: "",
    title: "",
    subtitle: "",
    group: "BASIC",
    type: "SINGLE",
    sortOrder: 1,
    active: true,
    options: [
      { label: "Option 1", description: "", iconName: "Check" },
      { label: "Option 2", description: "", iconName: "X" },
    ],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const resSets = await fetch("/api/admin/catalog/question-sets").then((r) => r.json());
      if (resSets.success) {
        setQuestionSets(resSets.data);
        if (resSets.data.length > 0 && !selectedSetId) {
          setSelectedSetId(resSets.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentSet = questionSets.find((s) => s.id === selectedSetId) || questionSets[0];

  // Save Question Set
  const handleSaveQuestionSet = async () => {
    if (!setForm.name) return alert("Question Set Name is required");
    try {
      const method = setForm.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/catalog/question-sets", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setForm),
      }).then((r) => r.json());

      if (res.success) {
        setShowQuestionSetModal(false);
        fetchData();
      } else {
        alert(res.error || "Failed to save Question Set");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Question
  const handleSaveQuestion = async () => {
    if (!questionForm.title || !questionForm.group) return alert("Title and group are required");
    try {
      const method = questionForm.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/catalog/questions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...questionForm,
          questionSetId: currentSet?.id,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setShowQuestionModal(false);
        fetchData();
      } else {
        alert(res.error || "Failed to save question");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/catalog/questions?id=${id}`, { method: "DELETE" }).then((r) => r.json());
      if (res.success) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AdminSidebar />

      <main className="flex-grow p-8 overflow-y-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-black">
              Dynamic Questionnaire & Question Set Builder
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Create, reorder, assign, and customize condition questions across device models
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setSetForm({ id: "", name: "", description: "", deviceCategory: "MOBILE", active: true });
                setShowQuestionSetModal(true);
              }}
              variant="secondary"
              size="sm"
              className="font-bold text-xs"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create Question Set</span>
            </Button>

            <Button
              onClick={() => {
                setQuestionForm({
                  id: "",
                  questionSetId: currentSet?.id || "",
                  title: "",
                  subtitle: "",
                  group: "BASIC",
                  type: "SINGLE",
                  sortOrder: (currentSet?.questions?.length || 0) + 1,
                  active: true,
                  options: [
                    { label: "Yes / Perfect", description: "Function works normally", iconName: "Check" },
                    { label: "No / Broken", description: "Issue detected", iconName: "X" },
                  ],
                });
                setShowQuestionModal(true);
              }}
              variant="primary"
              size="sm"
              className="font-extrabold text-xs shadow-yellowGlow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </Button>
          </div>
        </div>

        {/* QUESTION SET SELECTOR TABS */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
          {questionSets.map((set) => (
            <button
              key={set.id}
              onClick={() => setSelectedSetId(set.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                (selectedSetId || questionSets[0]?.id) === set.id
                  ? "bg-brand-black text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-brand-border"
              }`}
            >
              {set.name} ({set.questions?.length || 0} Qs)
            </button>
          ))}
        </div>

        {/* QUESTIONS LIST */}
        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-gray-400">Loading questionnaire dataset...</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-brand-black">{currentSet?.name}</h2>
                <p className="text-xs text-brand-muted">{currentSet?.description || "Reusable device evaluation set"} | Assigned to {currentSet?._count?.models || 0} Models</p>
              </div>
              <Badge variant="yellow">{currentSet?.deviceCategory || "MOBILE"}</Badge>
            </div>

            <div className="space-y-4">
              {currentSet?.questions?.map((q: any, idx: number) => (
                <div key={q.id} className="bg-white rounded-3xl p-6 border border-brand-border shadow-subtleCard space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-brand-yellow/20 text-brand-black text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-brand-black">{q.title}</h3>
                        {q.subtitle && <p className="text-xs text-gray-400">{q.subtitle}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">Group: {q.group}</Badge>
                      <Badge variant="yellow">Type: {q.type}</Badge>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* OPTIONS LIST */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {q.options?.map((opt: any) => (
                      <div key={opt.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1">
                        <div className="font-bold text-brand-black">{opt.label}</div>
                        {opt.description && <div className="text-[11px] text-gray-400">{opt.description}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT QUESTION SET */}
        {showQuestionSetModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fadeIn">
              <h3 className="text-lg font-black text-brand-black">Create Question Set</h3>

              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block text-gray-500 mb-1">Set Name</label>
                  <input
                    type="text"
                    value={setForm.name}
                    onChange={(e) => setSetForm({ ...setForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                    placeholder="e.g. Laptop Evaluation Questionnaire"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={setForm.description}
                    onChange={(e) => setSetForm({ ...setForm, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Category</label>
                  <select
                    value={setForm.deviceCategory}
                    onChange={(e) => setSetForm({ ...setForm, deviceCategory: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                  >
                    <option value="MOBILE">Mobile Phone</option>
                    <option value="LAPTOP">Laptop</option>
                    <option value="TABLET">Tablet</option>
                    <option value="SMARTWATCH">Smart Watch</option>
                    <option value="CONSOLE">Gaming Console</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="tertiary" size="sm" onClick={() => setShowQuestionSetModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleSaveQuestionSet} className="font-extrabold shadow-yellowGlow">Save Question Set</Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT QUESTION */}
        {showQuestionModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-black text-brand-black">Add New Question</h3>

              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block text-gray-500 mb-1">Question Title</label>
                  <input
                    type="text"
                    value={questionForm.title}
                    onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                    placeholder="e.g. Is the battery swelling or degraded?"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Subtitle / User Tip</label>
                  <input
                    type="text"
                    value={questionForm.subtitle}
                    onChange={(e) => setQuestionForm({ ...questionForm, subtitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                    placeholder="Check battery health percentage in settings"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-500 mb-1">Group</label>
                    <select
                      value={questionForm.group}
                      onChange={(e) => setQuestionForm({ ...questionForm, group: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                    >
                      <option value="BASIC">BASIC</option>
                      <option value="SCREEN">SCREEN</option>
                      <option value="BODY">BODY</option>
                      <option value="FUNCTIONAL">FUNCTIONAL</option>
                      <option value="REPAIR">REPAIR</option>
                      <option value="ACCESSORIES">ACCESSORIES</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Type</label>
                    <select
                      value={questionForm.type}
                      onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-yellow"
                    >
                      <option value="SINGLE">Single Select</option>
                      <option value="MULTIPLE">Multi Select</option>
                      <option value="BOOLEAN">Boolean (Yes/No)</option>
                      <option value="DROPDOWN">Dropdown</option>
                      <option value="IMAGE_UPLOAD">Image Upload</option>
                    </select>
                  </div>
                </div>

                {/* OPTIONS BUILDER */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-gray-500">Answer Options</label>
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionForm({
                          ...questionForm,
                          options: [...questionForm.options, { label: `Option ${questionForm.options.length + 1}`, description: "", iconName: "Check" }],
                        })
                      }
                      className="text-brand-black hover:underline text-[11px]"
                    >
                      + Add Option
                    </button>
                  </div>

                  {questionForm.options.map((opt: any, oIdx: number) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => {
                          const updated = [...questionForm.options];
                          updated[oIdx].label = e.target.value;
                          setQuestionForm({ ...questionForm, options: updated });
                        }}
                        className="w-1/2 p-2 rounded-xl border border-gray-300"
                        placeholder="Option Label"
                      />
                      <input
                        type="text"
                        value={opt.description}
                        onChange={(e) => {
                          const updated = [...questionForm.options];
                          updated[oIdx].description = e.target.value;
                          setQuestionForm({ ...questionForm, options: updated });
                        }}
                        className="w-1/2 p-2 rounded-xl border border-gray-300"
                        placeholder="Description (Optional)"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="tertiary" size="sm" onClick={() => setShowQuestionModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleSaveQuestion} className="font-extrabold shadow-yellowGlow">Save Question</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
