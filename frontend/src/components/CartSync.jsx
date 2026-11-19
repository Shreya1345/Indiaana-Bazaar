import { useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../context/AuthContext';
import { setCartItems, clearCart } from '../redux/cartSlice';

const CartSync = () => {
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const hasLoadedUserCart = useRef(false);
  const previousUserId = useRef(null);

  useEffect(() => {
    if (!user) {
      previousUserId.current = null;
      hasLoadedUserCart.current = false;
      dispatch(clearCart());
      return;
    }

    const userId = user._id || user.id;
    if (previousUserId.current === userId) return;
    const isFirstLogin = previousUserId.current === null;
    previousUserId.current = userId;
    hasLoadedUserCart.current = false;

    const guestItems = isFirstLogin ? [...cartItems] : [];
    fetch('/api/cart', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to load cart.');
        const savedItems = data.items || [];

        const merged = new Map();
        savedItems.forEach((item) => {
          merged.set(String(item.productId), item);
        });
        guestItems.forEach((item) => {
          const productId = String(item.productId);
          const saved = merged.get(productId);
          merged.set(productId, saved ? { ...item, qty: item.qty + saved.qty } : item);
        });

        const mergedItems = [...merged.values()];
        const enriched = await Promise.all(mergedItems.map(async (item) => {
          const productRes = await fetch(`/api/products/${item.productId}`);
          const product = await productRes.json();
          return productRes.ok ? {
            productId: String(product._id),
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            qty: item.qty
          } : null;
        }));

        dispatch(setCartItems(enriched.filter(Boolean)));
        hasLoadedUserCart.current = true;
      })
      .catch((error) => {
        console.error('Unable to load saved cart:', error);
        hasLoadedUserCart.current = true;
      });
  }, [dispatch, user]);

  useEffect(() => {
    if (!user || !hasLoadedUserCart.current) return;

    const timer = setTimeout(() => {
      fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          items: cartItems.map(({ productId, qty }) => ({ productId, qty }))
        })
      }).catch((error) => console.error('Unable to save cart:', error));
    }, 300);

    return () => clearTimeout(timer);
  }, [cartItems, user]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'userInfo' && !event.newValue) dispatch(clearCart());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [dispatch]);

  return null;
};

export default CartSync;
