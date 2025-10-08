'use client';

import { useState, useEffect } from 'react';
import { Order, OrderItem, Product, AuditLog, OrderStatus, FulfillmentMode } from '@prisma/client';

// A more detailed type for the order detail view
type FullOrder = Order & {
  items: (OrderItem & { product: Product })[];
  auditLog: AuditLog[];
  credential: { id: string } | null;
};

interface OrderDetailProps {
  orderId: string;
  onBack: () => void;
}

export function OrderDetail({ orderId, onBack }: OrderDetailProps) {
  const [order, setOrder] = useState<FullOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decryptedCredentials, setDecryptedCredentials] = useState<Record<string, any> | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/orders/${orderId}`);
        if (!response.ok) throw new Error('Failed to fetch order details');
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      const updatedOrder = await response.json();
      setOrder((prev) => (prev ? { ...prev, ...updatedOrder } : null));
    } catch (err) {
      alert(`Error updating status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewCredentials = async () => {
    if (!confirm('Are you sure you want to view these sensitive credentials? This action will be logged.')) return;
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/credentials`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch credentials');
      }
      const data = await response.json();
      setDecryptedCredentials(data.credentials);
    } catch (err) {
        alert(`Error fetching credentials: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-blue-500 hover:underline">&larr; Back to Order List</button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4">Order #{order.id.split('-')[0]}</h2>

          <div className="mb-4">
            <label className="font-semibold">Status:</label>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              disabled={isUpdating}
              className="ml-2 p-2 border rounded-md"
            >
              {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {isUpdating && <span className="ml-2">Updating...</span>}
          </div>

          <div className="mb-4">
            <p><span className="font-semibold">Customer:</span> {order.customerName} ({order.customerEmail})</p>
            <p><span className="font-semibold">Total Amount:</span> {order.totalAmount.toLocaleString('vi-VN')} VND</p>
          </div>

          <h3 className="text-xl font-semibold border-t pt-4 mt-4">Items</h3>
          <ul>
            {order.items.map(item => (
              <li key={item.id} className="py-2 border-b">
                {item.productName} (x{item.quantity}) - {item.price.toLocaleString('vi-VN')} VND
                <p className="text-sm text-gray-600">Fulfillment: {item.product.fulfillmentMode}</p>
                {item.product.fulfillmentMode === FulfillmentMode.SERVICE_CREDENTIALS && order.credential && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <h4 className="font-semibold">Customer Credentials</h4>
                        {decryptedCredentials ? (
                            <pre className="mt-2 p-2 bg-gray-100 rounded-md whitespace-pre-wrap">
                                {JSON.stringify(decryptedCredentials, null, 2)}
                            </pre>
                        ) : (
                            <button onClick={handleViewCredentials} className="mt-1 text-sm text-blue-600 hover:underline">Click to view (action will be logged)</button>
                        )}
                    </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column - Audit Log */}
        <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Audit Log</h3>
            <ul className="space-y-3">
                {order.auditLog.map(log => (
                    <li key={log.id} className="text-sm">
                        <p className="font-mono text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                        <p><span className="font-semibold">{log.actor}:</span> {log.message}</p>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
}