import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

const AddProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: '', stock: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return toast.error('Please select an image.');
    
    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', formData.stock);
    data.append('image', image);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: data
      });
      const responseData = await res.json();
      
      if (res.ok) {
        toast.success('Product created successfully.');
        navigate('/admin/products');
      } else {
        toast.error(responseData.message || 'Error creating product.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Unable to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ maxWidth: '700px' }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h2 className="text-warning mb-4"><Icon icon="mdi:plus-box-outline" className="me-2" aria-hidden="true" />Add New Product</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Control className="mb-3" type="text" placeholder="Product Name" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <Form.Control className="mb-3" as="textarea" placeholder="Description" required rows={4} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            <Form.Control className="mb-3" type="number" min="0" step="0.01" placeholder="Price (INR)" required onChange={(e) => setFormData({...formData, price: e.target.value})} />
            <Form.Control className="mb-3" type="text" placeholder="Category" required onChange={(e) => setFormData({...formData, category: e.target.value})} />
            <Form.Control className="mb-3" type="number" placeholder="Stock Quantity" required onChange={(e) => setFormData({...formData, stock: e.target.value})} />
            <Form.Group className="mb-3">
              <Form.Label><Icon icon="mdi:image-plus-outline" className="me-2 text-primary" aria-hidden="true" />Upload Product Image (Cloudinary)</Form.Label>
              <Form.Control type="file" accept="image/*" required onChange={(e) => setImage(e.target.files[0])} />
            </Form.Group>
            <Button type="submit" disabled={loading} className="w-100 d-inline-flex align-items-center justify-content-center gap-2">
              <Icon icon={loading ? 'mdi:loading' : 'mdi:cloud-upload-outline'} aria-hidden="true" />
              {loading ? 'Uploading & Creating...' : 'Publish Product'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddProduct;
