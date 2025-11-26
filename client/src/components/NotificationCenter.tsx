import { useState, useEffect } from 'react';
import { Bell, X, FileText, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

type Notification = {
  id: string;
  user_id: string;
  type: 'document' | 'email';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  related_id?: string;
};

export default function NotificationCenter() {
  const { user } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    // Subscribe to new documents
    const documentsChannel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user?.id}`,
        },
        async (payload) => {
          const newDoc = payload.new as any;
          
          // Create notification
          await supabase.from('notifications').insert([
            {
              user_id: user?.id,
              type: 'document',
              title: 'Nouveau document',
              message: `Le document "${newDoc.nom_fichier}" a été ajouté`,
              read: false,
              related_id: newDoc.id,
            },
          ]);

          // Show toast
          toast.success('Nouveau document ajouté!', {
            description: newDoc.nom_fichier,
          });

          // Refresh notifications
          fetchNotifications();
        }
      )
      .subscribe();

    // Subscribe to new emails
    const emailsChannel = supabase
      .channel('emails-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emails',
          filter: `user_id=eq.${user?.id}`,
        },
        async (payload) => {
          const newEmail = payload.new as any;
          
          // Create notification
          await supabase.from('notifications').insert([
            {
              user_id: user?.id,
              type: 'email',
              title: 'Email envoyé',
              message: `Email envoyé à ${newEmail.destinataire}`,
              read: false,
              related_id: newEmail.id,
            },
          ]);

          // Show toast
          toast.success('Email envoyé!', {
            description: `À: ${newEmail.destinataire}`,
          });

          // Refresh notifications
          fetchNotifications();
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      documentsChannel.unsubscribe();
      emailsChannel.unsubscribe();
    };
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Toutes les notifications marquées comme lues');
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification supprimée');
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Aucune notification
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start space-x-3 p-3 cursor-pointer ${
                  !notification.read ? 'bg-blue-50/50' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium truncate">
                      {notification.title}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 -mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(notification.created_at)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
