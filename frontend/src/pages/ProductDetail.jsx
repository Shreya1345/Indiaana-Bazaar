import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Breadcrumb, Button, Spinner } from 'react-bootstrap';
import { addToCart } from '../redux/cartSlice';
import WishlistButton from '../components/WishlistButton';
import RatingDisplay from '../components/RatingDisplay';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const [reviews, setReviews] = useState([]);
  const formatPrice = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    fetch(`/api/reviews/product/${id}`)
      .then((res) => res.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]));
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        qty: 1
      }));
      alert('Successfully added to your cart!');
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  if (!product) return <div className="text-center py-5 text-danger">Product Not Found</div>;

  return (
    <Container>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/shop' }}>Shop</Breadcrumb.Item>
        <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
      </Breadcrumb>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Row className="g-4 align-items-center">
            <Col md={6}>
              <img src={product.imageUrl} alt={product.name} className="w-100 rounded" style={{ maxHeight: '500px', objectFit: 'cover' }} />
            </Col>
            <Col md={6}>
              <h2>{product.name}</h2>
              <div className="d-flex align-items-center gap-3 mb-3">
                <RatingDisplay rating={product.ratings} count={product.numReviews} large />
                <WishlistButton productId={product._id} className="px-3" />
              </div>
              <p className="text-primary fw-bold fs-2">{formatPrice(product.price)}</p>
              <h5>Product Description</h5>
              <p className="text-secondary">{product.description}</p>
              <Button onClick={handleAddToCart} size="lg" className="w-100">Add to Shopping Cart</Button>
              <p className={`mt-3 fw-semibold ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Temporarily Out of Stock'}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Row className="g-4 mt-2">
        <Col lg={7}>
          <ReviewList reviews={reviews} />
        </Col>
        <Col lg={5}>
          <ReviewForm productId={product._id} onSubmitted={setReviews} />
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
