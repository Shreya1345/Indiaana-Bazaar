import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ButtonGroup } from 'react-bootstrap';
import { removeFromCart, addToCart } from '../redux/cartSlice';
const Cart = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formatPrice = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQty = (item, qty) => {
    if (qty > 0) {
      dispatch(addToCart({ ...item, qty }));
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <Container>
      <h2 className="mb-4">Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <Card className="text-center p-5"><p className="mb-3">Your cart is empty.</p><Button as={Link} to="/shop">Go Shopping</Button></Card>
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
                      <Button variant="outline-secondary" onClick={() => handleUpdateQty(item, item.qty - 1)}>-</Button>
                      <Button variant="outline-secondary" disabled>{item.qty}</Button>
                      <Button variant="outline-secondary" onClick={() => handleUpdateQty(item, item.qty + 1)}>+</Button>
                    </ButtonGroup>
                    <div><Button variant="outline-danger" size="sm" onClick={() => handleRemove(item.productId)}>Remove</Button></div>
                  </div>
                </Card.Body>
              </Card>
            ))}
            <Card className="shadow-sm mt-4">
              <Card.Body>
                <h4 className="border-bottom pb-3">Total: {formatPrice(totalPrice)}</h4>
                <Button onClick={() => navigate('/checkout')} size="lg" className="w-100">Proceed to Checkout</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Cart;
