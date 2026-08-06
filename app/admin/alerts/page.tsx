'use client'
import { useSession } from '@/components/SessionProvider'
import { useState, useEffect } from 'react'
import Badge from '@/components/ui/Badge'
import { Bell, AlertTriangle, Info, ShieldAlert, Check } from 'lucide-react'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAlerts = () => {
    fetch('/api/alerts', { cache: 'no-store', credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAlerts(data.data)
        } else {
          setError(data.error)
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  const { user } = useSession()
  useEffect(() => {
    fetchAlerts()
  }, [user?.id])

  const markAsRead = async (id?: number) => {
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { id } : {})
      })
      fetchAlerts()
    } catch (error) {
      console.error(error)
    }
  }

  const getAlertIcon = (type: string) => {
    if (type === 'suspicious') return <ShieldAlert size={18} className="text-[#f05050]" />
    if (type === 'high_transaction') return <AlertTriangle size={18} className="text-accent" />
    if (type === 'low_balance') return <AlertTriangle size={18} className="text-[#4090f0]" />
    return <Info size={18} className="text-[#8890a0]" />
  }

  const getAlertBadge = (type: string) => {
    if (type === 'suspicious') return <Badge variant="red">Suspicious</Badge>
    if (type === 'high_transaction') return <Badge variant="yellow">High Transaction</Badge>
    if (type === 'low_balance') return <Badge variant="blue">Low Balance</Badge>
    return <Badge variant="gray">Info</Badge>
  }

  const unreadCount = alerts.filter(a => !a.is_read).length

  if (loading) return <div className="p-6 text-white">Loading alerts...</div>

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-700 text-white">Notifications</h1>
            <p className="text-sm text-[#8890a0] mt-1">You have {unreadCount} unread alerts</p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={() => markAsRead()} 
              className="btn-ghost flex items-center gap-2 text-sm text-[#8890a0] hover:text-white"
            >
              <Check size={16} /> Mark all as read
            </button>
          )}
        </div>

        {error && <div className="p-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">{error}</div>}

        <div className="card divide-y divide-[#1a1d24]">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-[#8890a0]">
              <Bell size={32} className="mx-auto mb-3 opacity-20" />
              <p>No alerts or notifications</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.alert_id} 
                className={`p-5 flex gap-4 transition-colors ${!alert.is_read ? 'bg-[#1a1d24]/30' : 'opacity-70'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!alert.is_read ? 'bg-[#1a1d24]' : 'bg-transparent border border-[#1a1d24]'}`}>
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getAlertBadge(alert.type)}
                    {!alert.is_read && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" title="Unread" />}
                    <span className="text-[12px] text-[#8890a0] ml-auto">
                      {new Date(alert.created_at).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className={`text-sm ${!alert.is_read ? 'text-white font-medium' : 'text-[#8890a0]'}`}>
                    {alert.message}
                  </p>
                </div>
                
                {!alert.is_read && (
                  <button 
                    onClick={() => markAsRead(alert.alert_id)}
                    className="p-2 text-[#8890a0] hover:text-white hover:bg-[#1a1d24] rounded-lg transition-colors flex-shrink-0 self-center"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    
  )
}



