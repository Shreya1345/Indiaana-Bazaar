import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ButtonGroup } from 'react-bootstrap';
import { removeFromCart, addToCart } from '../redux/cartSlice';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
const Cart = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formatPrice = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
    toast.success('Item removed from your cart.');
  };

  const handleUpdateQty = (item, qty) => {
    if (qty > 0) {
      dispatch(addToCart({ ...item, qty }));
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <Container>
      <h2 className="mb-4 d-flex align-items-center gap-2"><Icon icon="mdi:cart-outline" aria-hidden="true" /> Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <Card className="text-center p-5">
          <Icon icon="mdi:cart-off" width="40" className="text-secondary mx-auto mb-3" aria-hidden="true" />
          <p className="mb-3">Your cart is empty.</p>
          <Button as={Link} to="/shop" className="d-inline-flex align-items-center gap-2 mx-auto">
            <Icon icon="mdi:storefront-outline" aria-hidden="true" /> Go Shopping
          </Button>
        </Card>
      ) : (
        <Row className="g-4">
          <Col xs={12}>
            {cartItems.map((item) => (
              <Card key={item.productId} className="mb-3 shadow-sm">
                <Card.Body className="d-flex align-items-center gap-3">
                  <img src={item.imageUrl} alt={item.name} width="120" height="120" className="rounded" style={{ objectFit: 'cover' }} />
                  <div className="flex-grow-1">
                    <h5>{item.name}</h5>
                    <p className="text-primary fw-bold">{formatPrice(item.price)}</p>
                    <ButtonGroup size="sm" className="mb-2">
                      <Button variant="outline-secondary" aria-label="Decrease quantity" onClick={() => handleUpdateQty(item, item.qty - 1)}>
                        <Icon icon="mdi:minus" aria-hidden="true" />
                      </Button>
                      <Button variant="outline-secondary" disabled>{item.qty}</Button>
                      <Button variant="outline-secondary" aria-label="Increase quantity" onClick={() => handleUpdateQty(item, item.qty + 1)}>
                        <Icon icon="mdi:plus" aria-hidden="true" />
                      </Button>
                    </ButtonGroup>
                    <div>
                      <Button variant="outline-danger" size="sm" onClick={() => handleRemove(item.productId)} className="d-inline-flex align-items-center gap-1">
                        <Icon icon="mdi:trash-can-outline" aria-hidden="true" /> Remove
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
            <Card className="shadow-sm mt-4">
              <Card.Body>
                <h4 className="border-bottom pb-3">Total: {formatPrice(totalPrice)}</h4>
                <Button onClick={() => navigate('/checkout')} size="lg" className="w-100 d-inline-flex align-items-center justify-content-center gap-2">
                  Proceed to Checkout <Icon icon="mdi:arrow-right-circle-outline" aria-hidden="true" />
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Cart;
