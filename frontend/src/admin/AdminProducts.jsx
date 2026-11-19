import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Container, Card, Table, Button, Spinner } from 'react-bootstrap';

const AdminProducts = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you strictly sure you want to delete this?')) {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
      }
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-warning mb-0">Manage Products</h2>
        <Button as={Link} to="/admin/add-product">+ Add Product</Button>
      </div>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
      ) : (
      <Card className="shadow-sm">
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>PRICE</th>
              <th>CATEGORY</th>
              <th>STOCK</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product._id.substring(0, 8)}...</td>
                <td>{product.name}</td>
                <td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}</td>
                <td>{product.category}</td>
                <td>{product.stock}</td>
                <td>
                  <Button as={Link} to={`/admin/edit-product/${product._id}`} size="sm" variant="primary" className="me-2">Edit</Button>
                  <Button onClick={() => handleDelete(product._id)} size="sm" variant="danger">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      )}
    </Container>
  );
};

export default AdminProducts;
