import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav style={{ padding: '1rem', background: '#eee' }}>
    <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
    <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
    <Link to="/register">Register</Link>
  </nav>
);

export default Navbar;
