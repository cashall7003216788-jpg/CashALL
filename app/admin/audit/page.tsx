"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ShieldCheck, History, Search, Loader2, Database, User, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface AuditEntry {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValuesJson: string | null;
  newValuesJson: string | null;
  createdAt: string;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const session = typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("cashall_admin_session") || "{}")
          : {};
        const token = session?.token || "";

        const res = await fetch("/api/v1/admin/dashboard", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          setLogs(json.auditLogs || []);
        }
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actorRole.toLowerCase().includes(search.toLowerCase()) ||
      l.recordId.toLowerCase().includes(search.toLowerCase()) ||
      l.tableName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-6 h-6 text-yellow-400" />
              <h1 className="text-2xl font-black text-white tracking-wide font-price">
                Transaction Audit Trail
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Tamper-proof chronological log of every status transition, payment, verification, and admin action.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search action, role, record..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-neutral-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-yellow-400 mr-2" />
            <span>Loading audit log entries...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-500 text-xs">
            No audit logs found matching your query.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              const hasJsonData = Boolean(log.newValuesJson || log.oldValuesJson);

              return (
                <div
                  key={log.id}
                  className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition rounded-2xl p-4 sm:p-5 space-y-3 shadow-md"
                >
                  {/* TOP ROW: ACTION + TIMESTAMP */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black uppercase px-2.5 py-1 rounded-lg bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                      {log.action}
                    </span>
                    <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* MIDDLE ROW: ACTOR & TARGET ENTITY */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-neutral-400">Actor: </span>
                        <span className="text-white font-bold">{log.actorRole}</span>
                        <span className="text-neutral-500 text-[11px] font-mono ml-1">
                          ({log.actorId.slice(0, 8)}...)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="truncate font-mono text-[11px]">
                        <span className="text-neutral-400">Target: </span>
                        <span className="text-emerald-300 font-semibold">{log.tableName}</span>
                        <span className="text-neutral-500 ml-1">#{log.recordId.slice(0, 10)}</span>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ROW: EXPANDABLE DETAILS */}
                  {hasJsonData && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-yellow-400 transition"
                      >
                        <span>{isExpanded ? "Hide Payload Data" : "View Payload Data"}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-3 bg-black/60 border border-neutral-800 rounded-xl overflow-x-auto text-[11px] font-mono text-neutral-300 space-y-2">
                          {log.newValuesJson && (
                            <div>
                              <span className="text-green-400 font-bold">New Values: </span>
                              <pre className="whitespace-pre-wrap break-all mt-1">{log.newValuesJson}</pre>
                            </div>
                          )}
                          {log.oldValuesJson && (
                            <div>
                              <span className="text-amber-400 font-bold">Old Values: </span>
                              <pre className="whitespace-pre-wrap break-all mt-1">{log.oldValuesJson}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
