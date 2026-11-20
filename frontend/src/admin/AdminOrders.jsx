import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

const AdminOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    };
    fetchOrders();
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Unable to update order status.');
      setOrders(orders.map(order => order._id === id ? { ...order, status } : order));
      toast.success('Order status updated.');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Unable to update order status.');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#f97316', marginBottom: '20px' }} className="d-flex align-items-center gap-2">
        <Icon icon="mdi:clipboard-list-outline" aria-hidden="true" /> Manage Orders
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={rowStyle}>
              <th style={thStyle}>ORDER ID</th>
              <th style={thStyle}>USER</th>
              <th style={thStyle}>TOTAL</th>
              <th style={thStyle}>PAYMENT</th>
              <th style={thStyle}>DATE</th>
              <th style={thStyle}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} style={rowStyle}>
                <td style={tdStyle}>{order._id.substring(0, 8)}...</td>
                <td style={tdStyle}>{order.userId?.name || 'Deleted User'}</td>
                <td style={tdStyle}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.totalAmount)}</td>
                <td style={tdStyle}>{order.paymentProvider?.toUpperCase() || '—'}</td>
                <td style={tdStyle}>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    style={{ background: '#fff', color: '#18181b', padding: '6px 10px', border: '1px solid #d4d4d8', borderRadius: '8px', outline: 'none' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '40px auto',
  padding: '30px',
  background: '#fff',
  borderRadius: '16px',
  border: '1px solid #e4e4e7',
  boxShadow: '0 12px 32px rgba(24,24,27,0.1)',
  color: '#18181b'
};
const tableStyle = { width: '100%', borderCollapse: 'collapse', color: '#18181b' };
const rowStyle = { borderBottom: '1px solid #e4e4e7' };
const thStyle = { padding: '15px', textAlign: 'left', color: '#52525b', fontSize: '0.9rem' };
const tdStyle = { padding: '15px', textAlign: 'left', color: '#18181b' };

export default AdminOrders;
