import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BsNavbar, Container, Nav, Button, Form } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const handleLogout = () => {
    logout();
    toast.success('Logged out.');
    navigate('/', { replace: true });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop', { replace: true });
  };

  return (
    <BsNavbar expand="lg" bg="white" variant="light" sticky="top" className="border border-light-subtle shadow-sm rounded-3 mx-3 mt-2">
      <Container>
        <BsNavbar.Brand as={Link} to={isAdmin ? '/admin' : '/'}>
          <img src="/Logo.png" alt="Indiaana Bazaar" width="36" height="36" className="rounded me-2" />
          Indiaana Bazaar
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-navigation" />
        <BsNavbar.Collapse id="main-navigation">
          {!isAdmin && (
            <Form onSubmit={handleSearch} className="d-flex mx-lg-auto my-2 my-lg-0" role="search">
              <Form.Control
                type="search"
                placeholder="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="me-2"
                aria-label="Search products"
              />
              <Button type="submit" variant="outline-primary" className="d-inline-flex align-items-center gap-2">
                <Icon icon="mdi:magnify" width="18" aria-hidden="true" />
                Search
              </Button>
            </Form>
          )}
          <Nav className="ms-auto align-items-lg-center gap-lg-2">
        {!isAdmin && (
          <>
            <Nav.Link as={Link} to="/shop" className="d-flex align-items-center gap-1">
              <Icon icon="mdi:storefront-outline" width="18" aria-hidden="true" /> Shop
            </Nav.Link>
            <Nav.Link as={Link} to="/cart" className="d-flex align-items-center gap-1">
              <Icon icon="mdi:cart-outline" width="18" aria-hidden="true" /> Cart ({cartItems.length})
            </Nav.Link>
            <Nav.Link as={Link} to="/wishlist" className="d-flex align-items-center gap-1">
              <Icon icon="mdi:heart-outline" width="18" aria-hidden="true" /> Wishlist
            </Nav.Link>
          </>
        )}
        {user ? (
          <>
            <Nav.Link as={Link} to="/profile" className="d-flex align-items-center gap-1">
              <Icon icon="mdi:account-circle-outline" width="18" aria-hidden="true" /> Hi, {user.name}
            </Nav.Link>
            {user.role === 'admin' && (
              <Nav.Link as={Link} to="/admin" className="d-flex align-items-center gap-1">
                <Icon icon="mdi:view-dashboard-outline" width="18" aria-hidden="true" /> Admin
              </Nav.Link>
            )}
            <Button variant="outline-danger" size="sm" onClick={handleLogout} className="d-inline-flex align-items-center gap-1">
              <Icon icon="mdi:logout" width="16" aria-hidden="true" /> Logout
            </Button>
          </>
        ) : (
          <Nav.Link as={Link} to="/login" className="d-flex align-items-center gap-1">
            <Icon icon="mdi:login" width="18" aria-hidden="true" /> Login
          </Nav.Link>
        )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
