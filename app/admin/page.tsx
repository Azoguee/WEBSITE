import { AdminDashboard } from '@/components/AdminDashboard';

export default function AdminRootPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminDashboard />
    </div>
  );
}