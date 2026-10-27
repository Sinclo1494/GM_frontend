"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Loader2, XCircle, Package, CheckCircle, XCircle as RejectIcon } from "lucide-react";
import axios from "axios";
import { listPending, bulkConfirmPending, rejectPending } from "../api/pendingImports";
import { useAuth } from "../context/useAuth";
import { useSearchParams } from "react-router-dom";
import { components } from "../theme/components";

interface PendingBatch {
  batch_id: string;
  module: string;
  title: string;
  created_at: string;
  models: Record<string, number>;
  total: number;
}

interface PendingDetail {
  model: string;
  count: number;
  items: Array<{
    id: number;
    code: string | null;
    designation: string | null;
    created_at: string | null;
  }>;
}

/**
 * Extract a human readable message from an API error.
 * The backend answers with { success, message, errors?, error_count? }.
 */
const extractErrorMessage = (err: unknown, fallback: string): string => {
  const data = axios.isAxiosError(err) ? err.response?.data : undefined;
  const details: string[] = Array.isArray(data?.errors) ? data.errors : [];
  const count =
    typeof data?.error_count === "number" ? data.error_count : details.length;
  const message =
    typeof data?.message === "string" && data.message ? data.message : fallback;

  if (details.length === 0) {
    return message;
  }

  const suffix = count > details.length ? ` (${count} erreurs)` : "";
  const first = details.slice(0, 3).join("\n");

  return `${message}${suffix}\n${first}`;
};

export default function PendingImportsPage() {
  const [batches, setBatches] = useState<PendingBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [batchDetails, setBatchDetails] = useState<Record<string, PendingDetail[]>>({});
  const [confirming, setConfirming] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<{ batchId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const fetchBatches = async () => {
    try {
      const res = await listPending({});
      if (res.batches) {
        setBatches(res.batches);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchDetails = async (batchId: string) => {
    try {
      const res = await listPending({ batch_id: batchId });
      if (res.models) {
        setBatchDetails(prev => ({ ...prev, [batchId]: res.models }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExpand = (batchId: string) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
    } else {
      setExpandedBatch(batchId);
      if (!batchDetails[batchId]) {
        fetchBatchDetails(batchId);
      }
    }
  };

  const handleBulkConfirm = async (batchId: string) => {
    setConfirming(batchId);
    try {
      await bulkConfirmPending(batchId);
      fetchBatches();
      if (expandedBatch === batchId) {
        fetchBatchDetails(batchId);
      }
    } catch (err) {
      console.error(err);
      alert(extractErrorMessage(err, "Erreur lors de la confirmation en lot"));
    } finally {
      setConfirming(null);
    }
  };

  const handleRejectOpen = (batchId: string) => {
    setRejecting({ batchId });
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!rejecting || !rejectReason.trim()) return;
    const { batchId } = rejecting;
    setConfirming(batchId);
    try {
      await rejectPending(batchId, rejectReason.trim());
      fetchBatches();
      if (expandedBatch === batchId) {
        fetchBatchDetails(batchId);
      }
      setRejecting(null);
      setRejectReason("");
    } catch (err: unknown) {
      console.error(err);
      alert(extractErrorMessage(err, "Erreur lors du rejet"));
    } finally {
      setConfirming(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString("fr-FR");
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // Auto-expand batch from query parameter
  useEffect(() => {
    const batchId = searchParams.get("batch_id");
    if (batchId && batches.length > 0) {
      const batch = batches.find(b => b.batch_id === batchId);
      if (batch) {
        setExpandedBatch(batchId);
        if (!batchDetails[batchId]) {
          fetchBatchDetails(batchId);
        }
      }
    }
  }, [searchParams, batches]);

  const isAdmin = user?.is_superuser;

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className={components.card}>
          <div className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
              Accès refusé
            </h2>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Cette page est réservée aux administrateurs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className={components.pageTitle}>Imports en attente</h1>
          <p className={components.pageDescription}>
            Visualiser et confirmer les imports en attente groupés par lot.
          </p>
        </header>

        {loading ? (
          <div className={components.card}>
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </div>
        ) : batches.length === 0 ? (
          <div className={components.card}>
            <div className="p-6 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                Aucun import en attente
              </h2>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Tous les imports ont été confirmés.
              </p>
            </div>
          </div>
        ) : (
          <div className={components.card}>
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className={components.table.header}>
                  <tr>
                    <th className="px-4 py-3 text-left w-12"></th>
                    <th className="px-4 py-3 text-left">Lot</th>
                    <th className="px-4 py-3 text-left">Module</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Total enregistrements</th>
                    <th className="px-4 py-3 text-left">Détails par modèle</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <React.Fragment key={batch.batch_id}>
                      <tr className={components.table.row}>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleExpand(batch.batch_id)}
                            className="flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
                            aria-label={expandedBatch === batch.batch_id ? "Réduire" : "Développer"}
                          >
                            {expandedBatch === batch.batch_id ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-sm bg-gray-100 dark:bg-dark-bg-secondary px-2 py-1 rounded">
                            {batch.batch_id.slice(0, 8)}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">{batch.module || "Inconnu"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm">{formatDate(batch.created_at)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold">{batch.total}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(batch.models).map(([model, count]) => (
                              <span
                                key={model}
                                className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded"
                              >
                                {model}: {count}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>

                      {expandedBatch === batch.batch_id && (
                        <tr className={components.table.row}>
                          <td colSpan={6} className="px-4 py-3 p-0">
                            <div className="bg-gray-50 dark:bg-dark-bg-secondary p-4 border-t border-slate-200 dark:border-dark-border">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">
                                  Actions groupées pour le lot {batch.batch_id.slice(0, 8)}
                                </h3>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleBulkConfirm(batch.batch_id)}
                                    disabled={confirming === batch.batch_id}
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    {confirming === batch.batch_id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                    Confirmer tout
                                  </button>
                                  <button
                                    onClick={() => handleRejectOpen(batch.batch_id)}
                                    disabled={confirming === batch.batch_id || !!rejecting}
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    {rejecting?.batchId === batch.batch_id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RejectIcon className="h-4 w-4" />
                                    )}
                                    Rejeter
                                  </button>
                                </div>
                              </div>
                              {(() => {
                                const details = batchDetails[batch.batch_id] || [];
                                if (details.length === 0) {
                                  return (
                                    <div className="flex items-center justify-center h-32">
                                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    </div>
                                  );
                                }
                                return (
                                  <div className="space-y-4">
                                    {details.map((detail) => (
                                      <div key={detail.model} className="space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">
                                          {detail.model} ({detail.count} enregistrements)
                                        </h4>
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-sm">
                                            <thead>
                                              <tr className="text-left text-gray-500 dark:text-dark-text-secondary border-b border-slate-200 dark:border-dark-border">
                                                <th className="pb-2">ID</th>
                                                <th className="pb-2">Code</th>
                                                <th className="pb-2">Désignation</th>
                                                <th className="pb-2">Date création</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {detail.items.slice(0, 50).map((item) => (
                                                <tr key={item.id} className="border-b border-slate-100 dark:border-dark-border">
                                                  <td className="py-2 font-mono">{item.id}</td>
                                                  <td className="py-2">{item.code || "-"}</td>
                                                  <td className="py-2">{item.designation || "-"}</td>
                                                  <td className="py-2">{formatDate(item.created_at)}</td>
                                                </tr>
                                              ))}
                                              {detail.items.length > 50 && (
                                                <tr>
                                                  <td colSpan={4} className="py-2 text-center text-gray-500 dark:text-dark-text-secondary text-sm">
                                                    ... et {detail.items.length - 50} autres enregistrements
                                                  </td>
                                                </tr>
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
    {rejecting && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
            Rejeter l'import - Lot {rejecting.batchId.slice(0, 8)}
          </h2>
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
            Entrez le motif du rejet. L'utilisateur qui a importé les données recevra une notification avec ce message.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motif du rejet..."
            className="w-full p-3 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
            rows={4}
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => { setRejecting(null); setRejectReason(""); }}
              disabled={confirming === rejecting.batchId}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-bg-secondary hover:bg-gray-200 dark:hover:bg-dark-bg-tertiary rounded disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleReject}
              disabled={confirming === rejecting.batchId || !rejectReason.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {confirming === rejecting.batchId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RejectIcon className="h-4 w-4" />
              )}
              Confirmer le rejet
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}