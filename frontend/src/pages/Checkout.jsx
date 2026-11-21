import { useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve(window.Razorpay);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
    } else {
      reject(new Error('Razorpay Checkout could not be loaded.'));
    }
  };
  script.onerror = () => {
    script.remove();
    reject(new Error('Unable to load Razorpay Checkout. Check your internet connection and try again.'));
  };
  document.body.appendChild(script);
});

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [loadingAddresses, setLoadingAddresses] = useState(Boolean(user));
  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', postalCode: '', country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (!user) return;

    let active = true;
    const fetchAddresses = async () => {
      try {
        const res = await fetch('/api/auth/addresses', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unable to load saved addresses.');
        if (!active) return;

        const addresses = Array.isArray(data) ? data : [];
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          const mostRecentAddress = addresses[addresses.length - 1];
          setAddress({
            fullName: mostRecentAddress.fullName,
            street: mostRecentAddress.street,
            city: mostRecentAddress.city,
            postalCode: mostRecentAddress.postalCode,
            country: mostRecentAddress.country
          });
          setSelectedAddressId(String(mostRecentAddress._id));
        }
      } catch (error) {
        if (active) {
          console.error(error);
          toast.error(error.message || 'Unable to load saved addresses.');
        }
      } finally {
        if (active) setLoadingAddresses(false);
      }
    };

    fetchAddresses();
    return () => {
      active = false;
    };
  }, [user]);

  const totalInr = cartItems.reduce((total, item) => total + item.price * item.qty, 0);
  const formatPrice = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const finishOrder = async (orderData, provider) => {
    const placedOrder = orderData.order || orderData;
    let addressSaved = true;
    if (selectedAddressId === 'new') {
      try {
        const addressRes = await fetch('/api/auth/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(address)
        });
        const addressData = await addressRes.json();
        if (!addressRes.ok) throw new Error(addressData.message || 'Unable to save address.');
        setSavedAddresses((currentAddresses) => (
          currentAddresses.some((savedAddress) => String(savedAddress._id) === String(addressData.address._id))
            ? currentAddresses
            : [...currentAddresses, addressData.address]
        ));
      } catch (error) {
        addressSaved = false;
        console.error('Order was placed, but the address could not be saved:', error);
      }
    }

    try {
      const cartRes = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!cartRes.ok) console.error('Order was placed, but the server cart could not be cleared.');
    } catch (error) {
      console.error('Order was placed, but the server cart could not be cleared:', error);
    }
    dispatch(clearCart());
    if (addressSaved) {
      toast.success(provider === 'cod' ? 'Cash on Delivery order placed successfully.' : 'Payment successful. Order placed.');
    } else {
      toast.warning('Order placed, but this address could not be saved for future checkouts.');
    }
    navigate('/ordersuccess', {
      state: {
        message: orderData.message || (
          provider === 'cod'
            ? 'Cash on Delivery order placed successfully. Payment will be collected when your order arrives.'
            : 'Payment successful. Your order has been placed.'
        ),
        orderId: placedOrder._id,
        paymentProvider: provider
      }
    });
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error('Please login first.');
      navigate('/login');
      return;
    }

    setPlacingOrder(true);
    let paymentModalOpened = false;
    try {
      const items = cartItems.map(({ productId, qty }) => ({ productId, qty }));
      if (paymentMethod === 'cod') {
        const orderRes = await fetch('/api/payment/cod-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({ items, address })
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.message || 'Unable to place your Cash on Delivery order.');
        await finishOrder(orderData, 'cod');
        return;
      }

      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ items })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || 'Unable to initialize Razorpay payment.');

      const RazorpayCheckout = await loadRazorpayCheckout();
      const checkout = new RazorpayCheckout({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Indiana Bazaar',
        description: 'Order payment',
        order_id: orderData.id,
        prefill: {
          name: address.fullName,
          email: user.email || ''
        },
        theme: { color: '#0d6efd' },
        modal: { ondismiss: () => setPlacingOrder(false) },
        handler: async (paymentDetails) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
              },
              body: JSON.stringify({ ...paymentDetails, address })
            });
            const verifiedOrder = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifiedOrder.message || 'Unable to verify Razorpay payment.');
            await finishOrder(verifiedOrder, 'razorpay');
          } catch (error) {
            console.error('Razorpay payment verification failed:', error);
            toast.error(error.message || 'Unable to verify Razorpay payment.');
            setPlacingOrder(false);
          }
        }
      });

      checkout.on('payment.failed', (paymentFailure) => {
        toast.error(paymentFailure.error?.description || 'Razorpay payment failed.');
        setPlacingOrder(false);
      });
      checkout.open();
      paymentModalOpened = true;
    } catch (error) {
      console.error('Order placement failed:', error);
      toast.error(error.message || 'Unable to place your order.');
    } finally {
      if (!paymentModalOpened) setPlacingOrder(false);
    }
  };

  const handleAddressChange = (event) => {
    setSelectedAddressId('new');
    setAddress({ ...address, [event.target.name]: event.target.value });
  };

  const handleAddressSelect = (event) => {
    const selectedId = event.target.value;
    setSelectedAddressId(selectedId);
    const selectedAddress = savedAddresses.find((savedAddress) => String(savedAddress._id) === selectedId);
    setAddress(selectedAddress ? {
      fullName: selectedAddress.fullName,
      street: selectedAddress.street,
      city: selectedAddress.city,
      postalCode: selectedAddress.postalCode,
      country: selectedAddress.country
    } : { fullName: '', street: '', city: '', postalCode: '', country: '' });
  };

  const formatAddress = (savedAddress) => (
    `${savedAddress.fullName} — ${savedAddress.street}, ${savedAddress.city}, ${savedAddress.country}`
  );

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={7}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="mb-4 d-flex align-items-center gap-2">
                <Icon icon="mdi:clipboard-check-outline" className="text-primary" aria-hidden="true" /> Checkout
              </h2>
              <Form onSubmit={handlePlaceOrder}>
                <h5 className="mb-3"><Icon icon="mdi:map-marker-outline" className="me-2 text-primary" aria-hidden="true" />Shipping Address</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Choose a saved address or enter a new one</Form.Label>
                  <Form.Select value={selectedAddressId} onChange={handleAddressSelect} disabled={loadingAddresses || placingOrder}>
                    {savedAddresses.map((savedAddress) => (
                      <option key={savedAddress._id} value={savedAddress._id}>
                        {formatAddress(savedAddress)}
                      </option>
                    ))}
                    <option value="new">Use a new address</option>
                  </Form.Select>
                  {loadingAddresses && <Form.Text>Loading your saved addresses...</Form.Text>}
                </Form.Group>
                <Row className="g-3">
                  <Col xs={12}><Form.Control name="fullName" placeholder="Full Name" required value={address.fullName} onChange={handleAddressChange} disabled={placingOrder} /></Col>
                  <Col xs={12}><Form.Control name="street" placeholder="Street" required value={address.street} onChange={handleAddressChange} disabled={placingOrder} /></Col>
                  <Col md={6}><Form.Control name="city" placeholder="City" required value={address.city} onChange={handleAddressChange} disabled={placingOrder} /></Col>
                  <Col md={6}><Form.Control name="postalCode" placeholder="Postal Code" required value={address.postalCode} onChange={handleAddressChange} disabled={placingOrder} /></Col>
                  <Col xs={12}><Form.Control name="country" placeholder="Country" required value={address.country} onChange={handleAddressChange} disabled={placingOrder} /></Col>
                </Row>
                <Form.Group className="mt-4">
                  <Form.Label className="fw-semibold">Payment method</Form.Label>
                  <Form.Check
                    type="radio"
                    id="payment-razorpay"
                    name="paymentMethod"
                    value="razorpay"
                    label="Pay securely with Razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    disabled={placingOrder}
                  />
                  <Form.Check
                    type="radio"
                    id="payment-cod"
                    name="paymentMethod"
                    value="cod"
                    label="Cash on Delivery (COD)"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    disabled={placingOrder}
                  />
                  {paymentMethod === 'cod' && (
                    <Form.Text className="d-block mt-1">
                      Pay in cash when your order is delivered.
                    </Form.Text>
                  )}
                </Form.Group>
                <div className="border-top mt-4 pt-4 text-end">
                  <h4 className="text-primary">Order Total: {formatPrice(totalInr)}</h4>
                  {paymentMethod === 'cod' && (
                    <p className="text-secondary">Payment will be collected on delivery.</p>
                  )}
                  <Button type="submit" size="lg" disabled={placingOrder || loadingAddresses || cartItems.length === 0} className="d-inline-flex align-items-center gap-2">
                    <Icon
                      icon={placingOrder ? 'mdi:loading' : paymentMethod === 'cod' ? 'mdi:package-check' : 'mdi:credit-card-outline'}
                      aria-hidden="true"
                    />
                    {placingOrder
                      ? (paymentMethod === 'cod' ? 'Placing COD order…' : 'Opening Razorpay…')
                      : (paymentMethod === 'cod' ? 'Place COD Order' : 'Pay with Razorpay')}
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
