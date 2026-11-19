import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BsNavbar, Container, Nav, Button, Form } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/?q=${encodeURIComponent(query)}` : '/', { replace: true });
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
              <Button type="submit" variant="outline-primary">Search</Button>
            </Form>
          )}
          <Nav className="ms-auto align-items-lg-center gap-lg-2">
        {!isAdmin && (
          <>
            <Nav.Link as={Link} to="/">Shop</Nav.Link>
            <Nav.Link as={Link} to="/cart">Cart ({cartItems.length})</Nav.Link>
            <Nav.Link as={Link} to="/wishlist">Wishlist</Nav.Link>
          </>
        )}
        {user ? (
          <>
            <Nav.Link as={Link} to="/profile">Hi, {user.name}</Nav.Link>
            {user.role === 'admin' && <Nav.Link as={Link} to="/admin">Admin</Nav.Link>}
            <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <Nav.Link as={Link} to="/login">Login</Nav.Link>
        )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
