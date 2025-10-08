'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import {
  Users,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface Lead {
  id: string
  orderRef: string
  productName: string
  price: number
  variant?: string
  status: string
  createdAt: string
  product?: {
    name: string
  }
}

interface Analytics {
  summary: {
    totalLeads: number
    pendingLeads: number
    contactedLeads: number
    successLeads: number
    lostLeads: number
    totalRevenue: number
    conversionRate: number
    contactRate: number
  }
}

export function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })
      if (searchTerm) params.set('search', searchTerm)
      if (statusFilter) params.set('status', statusFilter)

      const response = await fetch(`/api/leads?${params.toString()}`)
      const data = await response.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }, [currentPage, searchTerm, statusFilter])

  useEffect(() => {
    fetchLeads()
    fetchAnalytics()
  }, [fetchLeads, fetchAnalytics])

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchLeads()
        fetchAnalytics()
      }
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  const deleteLead = async (leadId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lead này?')) return

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchLeads()
        fetchAnalytics()
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
    }
  }

  const exportLeads = async () => {
    try {
      const response = await fetch('/api/leads/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting leads:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_chat': return 'bg-yellow-100 text-yellow-800'
      case 'contacted': return 'bg-blue-100 text-blue-800'
      case 'success': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_chat': return 'Chờ liên hệ'
      case 'contacted': return 'Đã liên hệ'
      case 'success': return 'Thành công'
      case 'lost': return 'Mất khách'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Quản lý leads và theo dõi hiệu suất</p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalLeads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageCircle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chờ liên hệ</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.summary.pendingLeads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tỷ lệ chuyển đổi</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.summary.conversionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(analytics.summary.totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Danh sách Leads</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportLeads}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending_chat">Chờ liên hệ</option>
                <option value="contacted">Đã liên hệ</option>
                <option value="success">Thành công</option>
                <option value="lost">Mất khách</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Order Ref</th>
                    <th className="text-left py-3 px-4">Sản phẩm</th>
                    <th className="text-left py-3 px-4">Giá</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                    <th className="text-left py-3 px-4">Ngày tạo</th>
                    <th className="text-left py-3 px-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{lead.orderRef}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{lead.productName}</div>
                          {lead.variant && (
                            <div className="text-sm text-gray-500">{lead.variant}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{formatPrice(lead.price)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {getStatusText(lead.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending_chat">Chờ liên hệ</option>
                            <option value="contacted">Đã liên hệ</option>
                            <option value="success">Thành công</option>
                            <option value="lost">Mất khách</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteLead(lead.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {leads.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Không có leads nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

