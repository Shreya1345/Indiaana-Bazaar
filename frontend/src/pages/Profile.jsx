import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const res = await fetch('/api/orders/myorders', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setOrders(Array.isArray(data) ? data : []);
        } else {
          // Token obsolete or 401: clear and bounce
          if (res.status === 401) {
             logout();
             navigate('/login');
          }
          setOrders([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out.');
    navigate('/', { replace: true });
  };

  const containerStyle = { maxWidth: '1000px', margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '16px', border: '1px solid #e4e4e7', boxShadow: '0 12px 32px rgba(24,24,27,0.1)', color: '#18181b' };
  const badgeStyle = { background: 'rgba(249,115,22,0.1)', color: '#f97316', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block' };

  if (!user) return null;

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e4e4e7', paddingBottom: '30px', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#18181b', fontSize: '2.2rem', marginBottom: '10px' }}>
            <Icon icon="mdi:account-circle-outline" className="me-2" aria-hidden="true" />My Profile
          </h2>
          <p style={{ color: '#52525b', fontSize: '1.2rem', marginBottom: '5px' }}>
            <strong>Name:</strong> {user.role === 'admin' ? 'Indiana Bazaar Admin' : user.name}
          </p>
          <p style={{ color: '#52525b', fontSize: '1.2rem', marginBottom: '15px' }}><strong>Email:</strong> {user.email}</p>
          <span style={badgeStyle}>Account Type: {user.role.toUpperCase()}</span>
        </div>
        <button onClick={handleLogout} className="btn d-inline-flex align-items-center gap-2" style={{ background: '#ef4444', boxShadow: 'none' }}>
          <Icon icon="mdi:logout" aria-hidden="true" /> Logout
        </button>
      </div>

      {user.role !== 'admin' && (
        <>
          <h3 style={{ color: '#f97316', marginBottom: '20px', fontSize: '1.5rem' }}>
            <Icon icon="mdi:clipboard-list-outline" className="me-2" aria-hidden="true" />Order History
          </h3>
          {loading ? (
            <p style={{ color: '#52525b' }}>Fetching your orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e4e4e7' }}>
              <p style={{ color: '#52525b', marginBottom: '15px' }}>You haven't placed any orders yet.</p>
              <Link to="/shop" className="btn d-inline-flex align-items-center gap-2">
                <Icon icon="mdi:storefront-outline" aria-hidden="true" /> Start Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {orders.map(order => (
                <div key={order._id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 12px rgba(24,24,27,0.06)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                  <div>
                    <p style={{ color: '#52525b', fontSize: '0.9rem', marginBottom: '5px' }}>Order ID: <span style={{ color: '#18181b' }}>{order._id}</span></p>
                    <p style={{ color: '#52525b', fontSize: '0.9rem', marginBottom: '5px' }}>Placed On: <span style={{ color: '#18181b' }}>{new Date(order.createdAt).toLocaleDateString()}</span></p>
                    <p style={{ color: '#52525b', fontSize: '0.9rem' }}>Total: <strong style={{ color: '#10b981' }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.totalAmount)}</strong></p>
                  </div>
                  <div>
                    <span style={{ 
                      background: order.status === 'Delivered' ? 'rgba(16,185,129,0.1)' : order.status === 'Shipped' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', 
                      color: order.status === 'Delivered' ? '#10b981' : order.status === 'Shipped' ? '#3b82f6' : '#f59e0b',
                      padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' 
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
