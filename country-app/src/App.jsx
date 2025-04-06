import React, { useState, useEffect } from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import CountryFetcher from "./components/CountryFetcher"; // Import the new component

function App() {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
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
          {/* Show the CountryFetcher component only if user is logged in */}
          <CountryFetcher apiKey={apiKey} />
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
