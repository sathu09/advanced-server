import React, { useState } from 'react';

function Login({ setApiKey }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // On successful login API key
        setApiKey(data.api_key);
      } else {
        //show the error message
        setError(data.error);
      }
    } catch (err) {
      // Log the error to console for debugging
      console.error('Login Error:', err);

      // Provide error message to the user
      setError('Login failed, please try again. Error: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div style={{ marginTop: "15px", paddingBottom: "15px", borderRadius: "18px", border:"5px solid", marginLeft: "250px", fontFamily: "Times New Roman", textAlign: "center"}}>
      <h2 >Login</h2>
      <h2>Welcome Back Enter Your Username & Password</h2>
      <form onSubmit={handleLogin}>
        <div style={{paddingBottom:"13px",letterSpacing:"2px", fontWeight: "bold"}}>
          <label htmlFor="username" >Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{paddingBottom:"13px",letterSpacing:"2px", fontWeight: "bold"}}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: "3px", padding: "10px", borderRadius: "18px",border: "2px solid rgb(111, 17, 63)",  fontFamily: "Times New Roman", textAlign: "center"}}>Login</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;
