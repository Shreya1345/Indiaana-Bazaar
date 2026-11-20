import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Icon } from '@iconify/react';
import { Card } from 'react-bootstrap';

const AdminUsers = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/auth/users', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    };
    fetchUsers();
  }, [user]);

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#f97316', marginBottom: '20px' }} className="d-flex align-items-center gap-2">
        <Icon icon="mdi:account-group-outline" aria-hidden="true" /> User Directory
      </h2>
      <Card style={tableCardStyle}>
        <Card.Body className="p-0">
          <div style={{ overflowX: 'auto', borderRadius: '11px' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={rowStyle}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>NAME</th>
                  <th style={thStyle}>EMAIL</th>
                  <th style={thStyle}>ROLE</th>
                  <th style={thStyle}>JOINED</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#fff' }}>
                {users.map(u => (
                  <tr key={u._id} style={rowStyle}>
                    <td style={tdStyle}>{u._id.substring(0, 8)}...</td>
                    <td style={tdStyle}>{u.name}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>
                      <span style={{ background: u.role === 'admin' ? 'rgba(234,88,12,0.2)' : 'rgba(16,185,129,0.2)', color: u.role === 'admin' ? '#f97316' : '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '40px auto',
  padding: '30px',
  background: '#fff',
  borderRadius: '12px',
  border: '1px solid #e4e4e7',
  boxShadow: '0 12px 32px rgba(24,24,27,0.1)',
  color: '#18181b'
};
const tableCardStyle = {
  backgroundColor: '#fff',
  border: '1px solid #d4d4d8',
  borderRadius: '12px',
  boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
  transform: 'rotate(-0.35deg)'
};
const tableStyle = { width: '100%', borderCollapse: 'collapse', color: '#18181b', backgroundColor: '#fff' };
const rowStyle = { borderBottom: '1px solid rgba(24,24,27,0.1)' };
const thStyle = { padding: '15px', textAlign: 'left', color: '#52525b', fontSize: '0.9rem', backgroundColor: '#f4f4f5' };
const tdStyle = { padding: '15px', textAlign: 'left', color: '#18181b', backgroundColor: '#fff' };

export default AdminUsers;
