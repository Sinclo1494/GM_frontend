import { useState, useEffect } from 'react';
import { Bell, ExternalLink, Check, Mail } from 'lucide-react';
import { getNotifications, markRead, markAllRead } from '../../api/notifications';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: string;
  related_object_id?: string | null;
  is_read: boolean;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res: any = await getNotifications({ limit: 10 });
      const items = res.results || res || [];
      setNotifications(items);
      setUnread(items.filter((n: any) => !n.is_read).length);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
    if (!open) load();
  };

  const handleMarkAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAllRead();
      await load();
    } catch (e) {}
  };

  const handleMarkOneRead = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    if (notification.is_read) return;
    try {
      await markRead(notification.id.toString());
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const handleNotificationClick = (notification: any) => {
    if ((notification.type === 'PENDING_IMPORT' || notification.type === 'IMPORT_REJECTED' || notification.type === 'IMPORT_CONFIRMED') && notification.related_object_id) {
      const params = new URLSearchParams();
      params.set('batch_id', notification.related_object_id);
      if (notification.type === 'IMPORT_REJECTED') {
        params.set('rejected', 'true');
      }
      navigate(`/admin/pending-imports?${params.toString()}`);
      setOpen(false);
    }
  };

  return (
    <div className='relative'>
      <button onClick={handleOpen} className='relative p-2'>
        <Bell className='h-5 w-5' />
        {unread > 0 && <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1'>{unread}</span>}
      </button>
      {open && (
        <div className='absolute right-0 mt-2 w-80 bg-white dark:bg-dark-bg-secondary shadow-lg rounded-lg z-50 border border-gray-200 dark:border-dark-border'>
          <div className='p-3 border-b flex justify-between items-center'>
            <span className='font-semibold text-gray-900 dark:text-white'>Notifications</span>
            {unread > 0 && <button onClick={handleMarkAll} className='text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium'>Tout marquer lu</button>}
          </div>
          <div className='max-h-64 overflow-y-auto'>
            {notifications.length === 0 ? (
              <div className='p-3 text-sm text-gray-500 dark:text-gray-400'>Aucune notification</div>
            ) : (
              <>
                {notifications.map((n: any) => (
                  <div
                    key={n.id}
                    className={`p-3 border-b text-sm cursor-pointer transition-colors ${
                      n.is_read
                        ? 'bg-white dark:bg-dark-bg-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
                        : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    }`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1 min-w-0'>
                        <div className={`font-medium truncate ${n.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                          {n.title}
                        </div>
                        <div className='text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5'>{n.message}</div>
                      </div>
                      <div className='flex items-center gap-1.5 flex-shrink-0'>
                        {n.type === 'IMPORT_REJECTED' && n.related_object_id && (
                          <ExternalLink className='h-4 w-4 text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0 mt-0.5' aria-label="Voir les détails du lot" />
                        )}
                        {n.type === 'PENDING_IMPORT' && n.related_object_id && (
                          <ExternalLink className='h-4 w-4 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex-shrink-0 mt-0.5' aria-label="Voir les détails du lot" />
                        )}
                        {!n.is_read && (
                          <button
                            onClick={(e) => handleMarkOneRead(e, n)}
                            className='p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                            aria-label="Marquer comme lu"
                            title="Marquer comme lu"
                          >
                            <Check className='h-4 w-4' />
                          </button>
                        )}
                        {n.is_read && (
                          <Mail className='h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5' aria-label="Notification lue" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div className='p-2 border-t'>
                  <button
                    onClick={() => { navigate('/notifications'); setOpen(false); }}
                    className='w-full text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-1.5'
                  >
                    Voir toutes les notifications
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
