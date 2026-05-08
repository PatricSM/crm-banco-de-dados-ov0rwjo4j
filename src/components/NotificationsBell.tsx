import { useState, useEffect, useMemo } from 'react'
import {
  Bell,
  Check,
  UserPlus,
  ArrowRightCircle,
  Clock,
  Calendar,
  CalendarX,
  AlertCircle,
  AtSign,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type AppNotification,
} from '@/services/notifications'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function NotificationsBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const loadNotifications = async () => {
    if (!user) return
    try {
      const data = await getNotifications()
      setNotifications(data.items)
    } catch (err) {
      console.error('Failed to load notifications', err)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user])

  useRealtime('notifications', (e) => {
    if (e.action === 'create' && e.record.recipient === user?.id) {
      setNotifications((prev) => [e.record as AppNotification, ...prev])
    } else if (e.action === 'update') {
      setNotifications((prev) =>
        prev.map((n) => (n.id === e.record.id ? (e.record as AppNotification) : n)),
      )
    } else if (e.action === 'delete') {
      setNotifications((prev) => prev.filter((n) => n.id !== e.record.id))
    }
  })

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read_at).length, [notifications])

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read_at) {
      try {
        const updated = await markAsRead(notif.id)
        setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
      } catch (err) {
        console.error(err)
      }
    }
    setOpen(false)
    if (notif.link) {
      navigate(notif.link)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(notifications.filter((n) => !n.read_at).map((n) => n.id))
      loadNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  const getIconInfo = (kind: AppNotification['kind']) => {
    switch (kind) {
      case 'lead_assigned':
        return { Icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50' }
      case 'lead_status_changed':
        return { Icon: ArrowRightCircle, color: 'text-violet-500', bg: 'bg-violet-50' }
      case 'agendamento_proximo':
        return { Icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' }
      case 'agendamento_confirmar':
        return { Icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' }
      case 'no_show':
        return { Icon: CalendarX, color: 'text-rose-500', bg: 'bg-rose-50' }
      case 'lead_sem_contato':
        return { Icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' }
      case 'mention':
        return { Icon: AtSign, color: 'text-slate-500', bg: 'bg-slate-50' }
      case 'sistema':
      default:
        return { Icon: Info, color: 'text-slate-500', bg: 'bg-slate-50' }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground rounded-full">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 sm:w-96 shadow-lg border-muted">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-8 text-xs px-2 text-muted-foreground hover:bg-transparent"
            >
              <Check className="size-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Bell className="size-8 text-muted/50" />
              Sem notificações no momento
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => {
                const { Icon, color, bg } = getIconInfo(notif.kind)
                const isUnread = !notif.read_at
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      'flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 relative border-b last:border-0',
                      isUnread && 'bg-muted/20',
                    )}
                  >
                    {isUnread && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                    <div className={cn('p-2 rounded-full shrink-0', bg, color)}>
                      <Icon className="size-4" />
                    </div>
                    <div className="space-y-1 pr-4">
                      <p
                        className={cn(
                          'text-sm font-medium leading-none',
                          !isUnread && 'text-muted-foreground',
                        )}
                      >
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notif.body}</p>
                      <p className="text-[10px] text-muted-foreground/80 mt-1">
                        {formatDistanceToNow(new Date(notif.created), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
