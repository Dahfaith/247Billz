import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CheckCircle2, Clock, Info } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  // Placeholder data for notifications. In a real app, this would be fetched from a 'notifications' table.
  const notifications = [
    {
      id: 1,
      title: "Invoice Paid",
      description: "Acme Corp just paid Invoice #INV-837492.",
      date: "2 mins ago",
      type: "success",
      read: false
    },
    {
      id: 2,
      title: "New Feature",
      description: "You can now customize your invoice templates in Settings.",
      date: "2 days ago",
      type: "info",
      read: true
    },
    {
      id: 3,
      title: "Subscription Reminder",
      description: "Your Pro plan will renew in 3 days.",
      date: "4 days ago",
      type: "warning",
      read: true
    }
  ]

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">Stay updated on your business activity.</p>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`transition-colors ${!notification.read ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}>
            <CardContent className="p-4 sm:p-6 flex gap-4">
              <div className={`mt-0.5 rounded-full p-2 h-10 w-10 flex items-center justify-center shrink-0 ${
                notification.type === 'success' ? 'bg-green-100 text-green-600' :
                notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                 notification.type === 'warning' ? <Clock className="w-5 h-5" /> :
                 <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                  <h3 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-foreground/80'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {notification.date}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
