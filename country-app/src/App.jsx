import React, { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';

function App() {
  const [apiKey, setApiKey] = useState('');

  // This useEffect will save the apiKey to localStorage when it's updated
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('apiKey', apiKey);
    }
  }, [apiKey]);

  // This useEffect will load the apiKey from localStorage when the component mounts
  useEffect(() => {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  return (
    <div>
      <h1>Welcome to Country App</h1>
      {apiKey ? (
        <div>
          <h2>Logged In with API Key: {apiKey}</h2>
          {/* You can add other features here */}
        </div>
      ) : (
        <div>
          <Register />
          <Login setApiKey={setApiKey} />
        </div>
      )}
    </div>
  );
}

export default App;
