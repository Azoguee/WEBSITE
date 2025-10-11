'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  MessageCircle,
  TrendingUp,
  DollarSign,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Lead {
  id: string
  orderRef: string
  productName: string
  price: number
  variant: string | null
  status: string
  createdAt: Date
}

interface Analytics {
  summary: {
    totalLeads: number
    pendingLeads: number
    successLeads: number
    totalRevenue: number
    conversionRate: number
  }
}

interface AdminDashboardProps {
  initialAnalytics: Analytics | null
  initialLeads: Lead[]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

const AnalyticsCard = ({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
)

export function AdminDashboard({ initialAnalytics, initialLeads }: AdminDashboardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [analytics, setAnalytics] = useState<Analytics | null>(initialAnalytics)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }, [])

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const response = await fetch(`/api/leads?${params.toString()}`)
      const data = await response.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }, [searchTerm, statusFilter])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchLeads()
      fetchAnalytics()
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  const deleteLead = async (leadId: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await fetch(`/api/leads/${leadId}`, {
          method: 'DELETE',
        })
        fetchLeads()
        fetchAnalytics()
      } catch (error) {
        console.error('Error deleting lead:', error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_chat': return 'bg-yellow-100 text-yellow-800'
      case 'success': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 w-full">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <AnalyticsCard
              title="Tổng doanh thu"
              value={formatCurrency(analytics?.summary.totalRevenue || 0)}
              icon={DollarSign}
            />
            <AnalyticsCard
              title="Leads thành công"
              value={`+${analytics?.summary.successLeads || 0}`}
              icon={Users}
            />
            <AnalyticsCard
              title="Tỷ lệ chuyển đổi"
              value={`${analytics?.summary.conversionRate || 0}%`}
              icon={TrendingUp}
            />
            <AnalyticsCard
              title="Chờ liên hệ"
              value={`${analytics?.summary.pendingLeads || 0}`}
              icon={MessageCircle}
            />
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Leads</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Quản lý và theo dõi tất cả leads.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                <Select onValueChange={setStatusFilter} defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending_chat">Chờ liên hệ</SelectItem>
                    <SelectItem value="success">Thành công</SelectItem>
                    <SelectItem value="lost">Mất khách</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Ref</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.orderRef}</TableCell>
                      <TableCell>{lead.productName}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lead.status)}`}
                        >
                          {lead.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(lead.price)}</TableCell>
                      <TableCell>
                        {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'success')}>
                              Đánh dấu thành công
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'lost')}>
                              Đánh dấu mất khách
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteLead(lead.id)}>
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
