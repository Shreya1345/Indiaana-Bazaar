import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button } from 'react-bootstrap';

const EditProduct = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '', stock: '' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setFormData({ name: data.name, description: data.description, price: data.price, category: data.category, stock: data.stock });
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', formData.stock);
    if (image) data.append('image', image);

    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user.token}` },
      body: data
    });
    setLoading(false);
    if (res.ok) {
      alert('Product updated successfully!');
      navigate('/admin/products');
    }
  };

  return (
    <Container style={{ maxWidth: '700px' }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h2 className="text-warning mb-4">Edit Product</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Control className="mb-3" type="text" placeholder="Product Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <Form.Control className="mb-3" as="textarea" placeholder="Description" required rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            <Form.Control className="mb-3" type="number" min="0" step="0.01" placeholder="Price (INR)" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            <Form.Control className="mb-3" type="text" placeholder="Category" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
            <Form.Control className="mb-3" type="number" placeholder="Stock" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
            <Form.Group className="mb-3">
              <Form.Label>Replace Image (Optional)</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
            </Form.Group>
            <Button type="submit" disabled={loading} className="w-100">
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditProduct;
