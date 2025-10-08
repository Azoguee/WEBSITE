import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/AdminDashboard'

export default function AdminPage() {
  // In a real app, you would check authentication here
  // For now, we'll just show the dashboard

  return <AdminDashboard />
}

