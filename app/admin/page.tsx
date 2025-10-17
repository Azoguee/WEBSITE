import { AdminDashboardData } from '@/components/AdminDashboardData'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  // In a real app, you would check authentication here
  // For now, we'll just show the dashboard

  return <AdminDashboardData />
}
