import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Container, Card, Table, Button, Spinner } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

const AdminProducts = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unable to load products.');
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'Unable to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you strictly sure you want to delete this?')) {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unable to delete product.');
        setProducts(products.filter(p => p._id !== id));
        toast.success('Product deleted successfully.');
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'Unable to delete product.');
      }
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-warning mb-0 d-flex align-items-center gap-2">
          <Icon icon="mdi:package-variant-closed" aria-hidden="true" /> Manage Products
        </h2>
        <Button as={Link} to="/admin/add-product" className="d-inline-flex align-items-center gap-2">
          <Icon icon="mdi:plus" aria-hidden="true" /> Add Product
        </Button>
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
                  <Button as={Link} to={`/admin/edit-product/${product._id}`} size="sm" variant="primary" className="me-2 d-inline-flex align-items-center gap-1">
                    <Icon icon="mdi:pencil-outline" aria-hidden="true" /> Edit
                  </Button>
                  <Button onClick={() => handleDelete(product._id)} size="sm" variant="danger" className="d-inline-flex align-items-center gap-1">
                    <Icon icon="mdi:trash-can-outline" aria-hidden="true" /> Delete
                  </Button>
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
