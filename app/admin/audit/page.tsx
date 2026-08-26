"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, History, Search, Loader2 } from "lucide-react";

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
      l.recordId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-brand-black flex items-center gap-2">
              <History className="w-6 h-6 text-brand-yellow" />
              <span>Immutable Transaction Audit Log</span>
            </h1>
            <p className="text-xs text-brand-muted">
              Complete tamper-proof record of every actor, workflow transition, verification, payment, eSign, and admin override
            </p>
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search action, role, record ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-brand-border text-xs text-brand-black placeholder-gray-400 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-brand-yellow"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-xs text-brand-muted">
            <Loader2 className="w-5 h-5 animate-spin text-brand-yellow mr-2" />
            <span>Loading audit log entries...</span>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-premium space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-xs text-brand-muted">
                No audit logs found. Transaction events will appear here automatically.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Actor / Role</th>
                      <th className="p-3">Target Record</th>
                      <th className="p-3">Log Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3 text-gray-500 font-mono text-[11px]">
                          {new Date(log.createdAt).toLocaleString("en-IN")}
                        </td>
                        <td className="p-3">
                          <Badge variant="yellow" className="font-extrabold text-[10px]">
                            {log.action}
                          </Badge>
                        </td>
                        <td className="p-3 font-bold text-brand-black">
                          {log.actorRole} ({log.actorId.slice(0, 8)}...)
                        </td>
                        <td className="p-3 font-mono text-[11px] text-gray-600">
                          {log.tableName}:{log.recordId.slice(0, 8)}...
                        </td>
                        <td className="p-3 font-mono text-[11px] text-gray-500 max-w-xs truncate">
                          {log.newValuesJson || log.oldValuesJson || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
