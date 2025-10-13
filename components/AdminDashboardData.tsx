import { prisma } from '@/lib/db';
import { AdminDashboard } from './AdminDashboard';

async function getAnalytics() {
  const [
    totalLeads,
    pendingLeads,
    contactedLeads,
    successLeads,
    lostLeads,
    totalRevenue,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'pending_chat' } }),
    prisma.lead.count({ where: { status: 'contacted' } }),
    prisma.lead.count({ where: { status: 'success' } }),
    prisma.lead.count({ where: { status: 'lost' } }),
    prisma.lead.aggregate({
      where: { status: 'success' },
      _sum: { price: true },
    }),
  ]);

  const conversionRate = totalLeads > 0 ? (successLeads / totalLeads) * 100 : 0;
  const contactRate = totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0;

  return {
    summary: {
      totalLeads,
      pendingLeads,
      contactedLeads,
      successLeads,
      lostLeads,
      totalRevenue: totalRevenue._sum.price || 0,
      conversionRate: Math.round(conversionRate * 100) / 100,
      contactRate: Math.round(contactRate * 100) / 100,
    },
  };
}

async function getLeads() {
  return prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function AdminDashboardData() {
  const analytics = await getAnalytics();
  const leads = await getLeads();

  return <AdminDashboard initialAnalytics={analytics} initialLeads={leads} />;
}
