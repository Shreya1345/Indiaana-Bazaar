import React, { useContext, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', postalCode: '', country: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  const totalInr = cartItems.reduce((total, item) => total + item.price * item.qty, 0);
  const formatPrice = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const handleRazorpayPayment = async (event) => {
    event.preventDefault();
    if (!user) {
      alert('Please login first.');
      navigate('/login');
      return;
    }

    setPaymentLoading(true);
    try {
      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          items: cartItems.map(({ productId, qty }) => ({ productId, qty }))
        })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || 'Payment failed to initialize.');
      if (!window.Razorpay) throw new Error('Razorpay Checkout did not load. Please refresh and try again.');

      const checkout = new window.Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Indiaana Bazaar',
        description: 'Purchase',
        order_id: orderData.id,
        prefill: {
          name: address.fullName,
          email: user.email
        },
        theme: { color: '#f97316' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
              },
              body: JSON.stringify({ ...response, address })
            });
            const result = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(result.message || 'Payment verification failed.');
            await fetch('/api/cart', {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${user.token}` }
            });
            dispatch(clearCart());
            navigate('/ordersuccess');
          } catch (error) {
            console.error('Razorpay payment verification failed:', error);
            alert(error.message || 'Unable to verify payment.');
          }
        },
        modal: {
          ondismiss: () => setPaymentLoading(false)
        }
      });
      checkout.open();
    } catch (error) {
      console.error('Razorpay checkout failed:', error);
      alert(error.message || 'Unable to initialize payment.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleAddressChange = (event) => {
    setAddress({ ...address, [event.target.name]: event.target.value });
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={7}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="mb-4">Checkout</h2>
              <Form ref={formRef} onSubmit={handleRazorpayPayment}>
                <h5 className="mb-3">Shipping Address</h5>
                <Row className="g-3">
                  <Col xs={12}><Form.Control name="fullName" placeholder="Full Name" required value={address.fullName} onChange={handleAddressChange} /></Col>
                  <Col xs={12}><Form.Control name="street" placeholder="Street" required value={address.street} onChange={handleAddressChange} /></Col>
                  <Col md={6}><Form.Control name="city" placeholder="City" required value={address.city} onChange={handleAddressChange} /></Col>
                  <Col md={6}><Form.Control name="postalCode" placeholder="Postal Code" required value={address.postalCode} onChange={handleAddressChange} /></Col>
                  <Col xs={12}><Form.Control name="country" placeholder="Country" required value={address.country} onChange={handleAddressChange} /></Col>
                </Row>
                <div className="border-top mt-4 pt-4 text-end">
                  <h4 className="text-primary">Total to Pay: {formatPrice(totalInr)}</h4>
                  <Button type="submit" size="lg" disabled={paymentLoading || cartItems.length === 0}>
                    {paymentLoading ? 'Opening Razorpay…' : 'Proceed to Checkout'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
