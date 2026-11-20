import { useContext, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

const WishlistButton = ({ productId, className = '', rounded = false }) => {
  const { user } = useContext(AuthContext);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    if (!user) {
      setWishlisted(false);
      return;
    }
    fetch('/api/wishlist', { headers: { Authorization: `Bearer ${user.token}` } })
      .then((res) => res.json())
      .then((data) => {
        setWishlisted(data.products?.some((item) => String(item._id) === String(productId)) || false);
      })
      .catch(() => setWishlisted(false));
  }, [user, productId]);

  const toggleWishlist = async () => {
    if (!user) return toast.error('Please login to use your wishlist.');
    try {
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Unable to update wishlist.');
      setWishlisted(data.isWishlisted);
      toast.success(data.isWishlisted ? 'Added to your wishlist.' : 'Removed from your wishlist.');
    } catch (error) {
      toast.error(error.message || 'Unable to update wishlist.');
    }
  };

  return (
    <Button
      variant={wishlisted ? 'danger' : 'light'}
      className={`${rounded ? 'rounded-circle' : ''} shadow-sm ${className}`}
      style={rounded ? { width: '42px', height: '42px' } : undefined}
      onClick={toggleWishlist}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Icon icon={wishlisted ? 'mdi:heart' : 'mdi:heart-outline'} width="20" aria-hidden="true" />
    </Button>
  );
};

export default WishlistButton;
