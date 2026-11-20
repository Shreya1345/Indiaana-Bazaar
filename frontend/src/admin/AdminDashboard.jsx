import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Icon } from '@iconify/react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        } else {
          if (res.status === 401) {
            navigate('/login');
          }
          setStats({ totalOrders: 0, totalProducts: 0, totalUsers: 0, revenueInr: 0 });
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, [user, navigate]);

  const numberStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#f97316'
  };

  return (
    <Container>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '5px' }}>
        <img src="/Logo.png" alt="Logo" style={{ height: '40px', width: '40px', borderRadius: '8px', objectFit: 'cover', filter: 'drop-shadow(0 0px 10px rgba(249, 115, 22, 0.3))' }} />
        <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
      </div>
      <p style={{ color: '#a1a1aa', marginBottom: '30px', fontSize: '1.1rem' }}>Welcome back, <span style={{color: '#fff'}}>{user?.name}</span></p>
      
      {stats ? (
        <Row className="g-4">
          <Col sm={6} lg={3}><Card className="h-100 text-center shadow-sm"><Card.Body><h6 className="text-secondary">Total Orders</h6><div style={numberStyle}>{stats.totalOrders}</div></Card.Body></Card></Col>
          <Col sm={6} lg={3}><Card className="h-100 text-center shadow-sm"><Card.Body><h6 className="text-secondary">Total Products</h6><div style={numberStyle}>{stats.totalProducts}</div></Card.Body></Card></Col>
          <Col sm={6} lg={3}><Card className="h-100 text-center shadow-sm"><Card.Body><h6 className="text-secondary">Total Users</h6><div style={numberStyle}>{stats.totalUsers}</div></Card.Body></Card></Col>
          <Col sm={6} lg={3}><Card className="h-100 text-center shadow-sm"><Card.Body><h6 className="text-secondary">Revenue (INR)</h6><div style={numberStyle}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.revenueInr || 0)}</div></Card.Body></Card></Col>
        </Row>
      ) : (
        <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
      )}

      <Card className="mt-4 shadow-sm">
        <Card.Body className="p-4">
          <h3 className="text-warning mb-1">Administrative Controls</h3>
          <p className="text-secondary mb-4">Manage your store from one place.</p>
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-xl-3">
              <Button as={Link} to="/admin/add-product" variant="light" className="w-100 h-100 d-flex align-items-center gap-3 border shadow-sm p-3 text-start">
                <Icon icon="mdi:plus-box-outline" width="26" height="26" style={{ color: '#f97316', flexShrink: 0 }} aria-hidden="true" />
                <span className="fw-semibold">Add Product</span>
              </Button>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <Button as={Link} to="/admin/products" variant="light" className="w-100 h-100 d-flex align-items-center gap-3 border shadow-sm p-3 text-start">
                <Icon icon="mdi:package-variant-closed" width="26" height="26" style={{ color: '#2563eb', flexShrink: 0 }} aria-hidden="true" />
                <span className="fw-semibold">Manage Products</span>
              </Button>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <Button as={Link} to="/admin/orders" variant="light" className="w-100 h-100 d-flex align-items-center gap-3 border shadow-sm p-3 text-start">
                <Icon icon="mdi:clipboard-list-outline" width="26" height="26" style={{ color: '#16a34a', flexShrink: 0 }} aria-hidden="true" />
                <span className="fw-semibold">Manage Orders</span>
              </Button>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <Button as={Link} to="/admin/users" variant="light" className="w-100 h-100 d-flex align-items-center gap-3 border shadow-sm p-3 text-start">
                <Icon icon="mdi:account-group-outline" width="26" height="26" style={{ color: '#7c3aed', flexShrink: 0 }} aria-hidden="true" />
                <span className="fw-semibold">Users Directory</span>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;
