"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Bell, 
  Check, 
  ExternalLink, 
  Loader2, 
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  FileText,
  Calendar,
  Hash,
  FileCode,
  CalendarX
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markRead, markAllRead, deleteNotification } from "../api/notifications";
import { components } from "../theme/components";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  related_object_type: string | null;
  related_object_id: string | null;
  is_read: boolean;
  created_at: string;
  created_by: { id: number; username: string } | null;
  import_model: string | null;
  record_count: number | null;
  import_datetime: string | null;
  rejection_datetime: string | null;
  rejection_reason: string | null;
}

interface NotificationPageState {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  filter: "all" | "unread" | "read";
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  
  const [state, setState] = useState<NotificationPageState>({
    notifications: [],
    loading: true,
    unreadCount: 0,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    filter: "all",
  });

  const loadNotifications = useCallback(async (page = 1, filter = state.filter) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res: any = await getNotifications({ 
        page, 
        limit: 20,
        is_read: filter === "unread" ? false : filter === "read" ? true : undefined,
      });
      const items = res.results || res || [];
      setState(prev => ({
        ...prev,
        notifications: items,
        loading: false,
        unreadCount: items.filter((n: Notification) => !n.is_read).length,
        currentPage: res.page || page,
        totalPages: res.total_pages || 1,
        totalCount: res.count || items.length,
      }));
    } catch (e) {
      console.error("Failed to load notifications:", e);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.filter]);

  useEffect(() => {
    loadNotifications(1, "all");
  }, []);

  const handleMarkRead = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.is_read) return;
    try {
      await markRead(notification.id.toString());
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (e) {
      console.error("Failed to mark as read:", e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  };

  const handleDelete = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(notification.id.toString());
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notification.id),
        unreadCount: notification.is_read ? prev.unreadCount : Math.max(0, prev.unreadCount - 1),
        totalCount: prev.totalCount - 1,
      }));
    } catch (e) {
      console.error("Failed to delete notification:", e);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'PENDING_IMPORT' && notification.related_object_id) {
      navigate(`/admin/pending-imports?batch_id=${notification.related_object_id}`);
    } else if (notification.type === 'IMPORT_REJECTED' && notification.related_object_id) {
      navigate(`/admin/pending-imports?batch_id=${notification.related_object_id}&rejected=true`);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

   const getTypeIcon = (type: string) => {
     switch (type) {
       case "PENDING_IMPORT": return <Package className="h-5 w-5 text-blue-600" />;
       case "IMPORT_REJECTED": return <XCircle className="h-5 w-5 text-red-600" />;
       case "IMPORT_CONFIRMED": return <CheckCircle className="h-5 w-5 text-green-600" />;
       default: return <Bell className="h-5 w-5 text-gray-600" />;
     }
   };

   const getTypeLabel = (type: string) => {
     switch (type) {
       case "PENDING_IMPORT": return "Import en attente";
       case "IMPORT_REJECTED": return "Import rejeté";
       case "IMPORT_CONFIRMED": return "Import confirmé";
       default: return type;
     }
   };

  const formatDateSimple = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const RejectionDetails: React.FC<{ notification: Notification }> = ({ notification }) => {
    const rows = [
      {
        label: "Modèle(s) impacté(s)",
        value: notification.import_model || "N/A",
        icon: <FileCode className="h-4 w-4 text-slate-500 dark:text-dark-text-secondary" />,
      },
      {
        label: "Nombre d'enregistrements",
        value: notification.record_count !== null && notification.record_count !== undefined
          ? notification.record_count.toLocaleString("fr-FR")
          : "N/A",
        icon: <Hash className="h-4 w-4 text-slate-500 dark:text-dark-text-secondary" />,
      },
      {
        label: "Date d'import",
        value: formatDateSimple(notification.import_datetime),
        icon: <Calendar className="h-4 w-4 text-slate-500 dark:text-dark-text-secondary" />,
      },
      {
        label: "Date de rejet",
        value: formatDateSimple(notification.rejection_datetime),
        icon: <CalendarX className="h-4 w-4 text-slate-500 dark:text-dark-text-secondary" />,
      },
    ];

    return (
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg p-3 border border-gray-200 dark:border-dark-border"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
              {row.icon}
              {row.label}
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-dark-text-primary break-words">
              {row.value}
            </div>
          </div>
        ))}
        {notification.rejection_reason && (
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider mb-1">
              <FileText className="h-4 w-4" />
              Motif du rejet
            </div>
            <div className="mt-1 text-sm text-gray-700 dark:text-dark-text-primary bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg p-3 border border-gray-200 dark:border-dark-border break-words">
              {notification.rejection_reason}
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredNotifications = state.notifications;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={components.pageTitle}>Notifications</h1>
            <p className={components.pageDescription}>
              {state.totalCount} notification(s) au total • {state.unreadCount} non lue(s)
            </p>
          </div>
          {state.unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Tout marquer comme lu
            </button>
          )}
        </header>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setState(prev => ({ ...prev, filter: f, currentPage: 1 }));
                loadNotifications(1, f);
              }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                state.filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-dark-bg-secondary text-gray-700 dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-dark-bg-tertiary"
              }`}
            >
              {f === "all" && "Toutes"}
              {f === "unread" && `Non lues (${state.unreadCount})`}
              {f === "read" && "Lues"}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className={components.card}>
          {state.loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : state.notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                Aucune notification
              </h2>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                {state.filter === "unread" 
                  ? "Toutes vos notifications ont été lues." 
                  : "Vous n'avez aucune notification pour le moment."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-dark-border">
              {filteredNotifications.map((notification) => {
                const isRejected = notification.type === "IMPORT_REJECTED";
                const isPending = notification.type === "PENDING_IMPORT";
                const isConfirmed = notification.type === "IMPORT_CONFIRMED";
                const cardBgClass = notification.is_read
                  ? "bg-white dark:bg-dark-bg-primary"
                  : isRejected
                  ? "bg-red-50 dark:bg-red-900/20"
                  : isPending
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : "bg-green-50 dark:bg-green-900/20";
                const iconBgClass = notification.is_read
                  ? "bg-gray-100 dark:bg-dark-bg-secondary"
                  : isRejected
                  ? "bg-red-100 dark:bg-red-900/30"
                  : isPending
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : "bg-green-100 dark:bg-green-900/30";
                const badgeClass = notification.is_read
                  ? "bg-gray-100 dark:bg-dark-bg-secondary text-gray-600 dark:text-gray-400"
                  : isRejected
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  : isPending
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
                const textColorClass = notification.is_read
                  ? "text-gray-700 dark:text-gray-300"
                  : "text-gray-900 dark:text-white";
                const messageColorClass = notification.is_read
                  ? "text-gray-600 dark:text-gray-400"
                  : isRejected
                  ? "text-gray-700 dark:text-red-300"
                  : isConfirmed
                  ? "text-gray-700 dark:text-green-300"
                  : "text-gray-700 dark:text-gray-300";

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-bg-secondary transition-colors ${cardBgClass}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Type Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-lg ${iconBgClass}`}>
                        {getTypeIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-semibold truncate ${textColorClass}`}>
                                {notification.title}
                              </h3>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${badgeClass}`}>
                                {getTypeLabel(notification.type)}
                              </span>
                              {notification.related_object_id && (
                                <code className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-dark-bg-secondary text-gray-600 dark:text-gray-400 rounded font-mono">
                                  Lot: {notification.related_object_id.slice(0, 8)}
                                </code>
                              )}
                            </div>
                            <p className={`mt-1 text-sm ${messageColorClass}`}>
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <time className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                              {formatDate(notification.created_at)}
                            </time>
                            <div className="flex items-center gap-1">
                              {(isPending || isRejected) && notification.related_object_id && (
                                <ExternalLink
                                  className="h-4 w-4 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex-shrink-0 mt-0.5"
                                  aria-label="Voir les détails"
                                />
                              )}
                              {!notification.is_read && (
                                <button
                                  onClick={(e) => handleMarkRead(notification, e)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  title="Marquer comme lu"
                                  aria-label="Marquer comme lu"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDelete(notification, e)}
                                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Supprimer"
                                aria-label="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Rejection Details */}
                        {isRejected && !notification.is_read && (
                          <div className="mt-3">
                            <RejectionDetails notification={notification} />
                          </div>
                        )}

                        {/* Metadata */}
                        {(notification.created_by || notification.related_object_type) && (
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            {notification.created_by && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Créé par:</span> {notification.created_by.username}
                              </span>
                            )}
                            {notification.related_object_type && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Type:</span> {notification.related_object_type}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!state.loading && state.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 dark:border-dark-border flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {state.currentPage} sur {state.totalPages} ({state.totalCount} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => loadNotifications(state.currentPage - 1)}
                  disabled={state.currentPage <= 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded hover:bg-gray-50 dark:hover:bg-dark-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  onClick={() => loadNotifications(state.currentPage + 1)}
                  disabled={state.currentPage >= state.totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded hover:bg-gray-50 dark:hover:bg-dark-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}