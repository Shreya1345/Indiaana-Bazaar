import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

const OrderSuccess = () => {
  const { state } = useLocation();
  const isTestOrder = state?.paymentProvider === 'test';
  const confirmationMessage = state?.message || (
    isTestOrder
      ? 'Your test order was created without collecting payment.'
      : 'Thank you for your order. Your payment was received and your shipment will be processed shortly.'
  );
  const containerStyle = {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '50px 30px',
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e4e4e7',
    boxShadow: '0 12px 32px rgba(24,24,27,0.1)',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <Icon icon="mdi:check-circle" width="64" className="text-success mb-3" aria-hidden="true" />
      <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#10b981' }}>
        {isTestOrder ? 'Test Order Placed!' : 'Payment Successful!'}
      </h2>
      <p style={{ color: '#52525b', fontSize: '1.2rem', marginBottom: '40px' }}>
        {confirmationMessage}
      </p>
      <Link to="/shop" className="btn btn-primary px-4 py-2 d-inline-flex align-items-center gap-2">
        <Icon icon="mdi:storefront-outline" aria-hidden="true" /> Continue Shopping
      </Link>
    </div>
  );
};

export default OrderSuccess;
