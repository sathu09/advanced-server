import React, { useState } from 'react';
import axios from 'axios';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', {
        email,
        username,
        password,
      });
      setMessage('Registration successful. You can now log in.');
    } catch (err) {
      setMessage('Registration failed: ' + err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required /><br />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required /><br />
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default RegisterPage;
