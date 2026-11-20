import { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Breadcrumb, Button, ButtonGroup, Spinner } from 'react-bootstrap';
import { addToCart } from '../redux/cartSlice';
import WishlistButton from '../components/WishlistButton';
import RatingDisplay from '../components/RatingDisplay';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [quantitySelection, setQuantitySelection] = useState({ productId: id, quantity: 1 });
  const quantity = quantitySelection.productId === id ? quantitySelection.quantity : 1;
  const cartItems = useSelector((state) => state.cart.cartItems);
  const cartQuantity = cartItems.find((item) => item.productId === product?._id)?.qty || 0;
  const stock = Number(product?.stock);
  const availableToAdd = Number.isFinite(stock) ? Math.max(0, stock - cartQuantity) : 0;
  const selectedQuantity = availableToAdd > 0 ? Math.min(quantity, availableToAdd) : 0;
  const updateQuantity = (nextQuantity) => setQuantitySelection({ productId: id, quantity: nextQuantity });
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
    if (!user) {
      toast.info('Please log in or register before adding products to your cart.');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    if (!product) return;
    if (selectedQuantity <= 0 || selectedQuantity > availableToAdd) {
      toast.error('The selected quantity exceeds the available stock.');
      return;
    }

    dispatch(addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      qty: cartQuantity + selectedQuantity
    }));
    toast.success(`Added ${selectedQuantity} ${selectedQuantity === 1 ? 'item' : 'items'} to your cart.`);
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
              <div className="mb-3">
                <span className="fw-semibold d-block mb-2">Quantity</span>
                <ButtonGroup aria-label="Select product quantity">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(Math.max(1, selectedQuantity - 1))}
                    disabled={selectedQuantity <= 1}
                  >
                    <Icon icon="mdi:minus" aria-hidden="true" />
                  </Button>
                  <output className="border px-4 d-inline-flex align-items-center" aria-live="polite">{selectedQuantity}</output>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(Math.min(availableToAdd, selectedQuantity + 1))}
                    disabled={selectedQuantity >= availableToAdd}
                  >
                    <Icon icon="mdi:plus" aria-hidden="true" />
                  </Button>
                </ButtonGroup>
              </div>
              <Button onClick={handleAddToCart} size="lg" className="w-100 d-inline-flex align-items-center justify-content-center gap-2" disabled={availableToAdd <= 0}>
                <Icon icon="mdi:cart-plus" aria-hidden="true" /> Add to Shopping Cart
              </Button>
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
