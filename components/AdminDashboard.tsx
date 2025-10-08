'use client';

import { useState, useEffect } from 'react';
import { Order } from '@prisma/client'; // Assuming you have run `prisma generate`
import { OrderDetail } from './OrderDetail';

// A simplified type for the order list
type OrderSummary = Pick<Order, 'id' | 'status' | 'totalAmount' | 'customerEmail' | 'createdAt'>;

export function AdminDashboard() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleBackToList = () => {
    setSelectedOrderId(null);
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  if (selectedOrderId) {
    return <OrderDetail orderId={selectedOrderId} onBack={handleBackToList} />;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="w-full bg-gray-100 text-left">
              <th className="p-3">Order ID</th>
              <th className="p-3">Status</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-3 font-mono text-sm">{order.id}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3">{order.customerEmail}</td>
                <td className="p-3">{order.totalAmount.toLocaleString('vi-VN')} VND</td>
                <td className="p-3">{new Date(order.createdAt).toLocaleString()}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleSelectOrder(order.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING_FULFILLMENT':
      return 'bg-yellow-200 text-yellow-800';
    case 'IN_PROGRESS':
      return 'bg-blue-200 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-200 text-green-800';
    case 'CANCELED':
      return 'bg-red-200 text-red-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
}