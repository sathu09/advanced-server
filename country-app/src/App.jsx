import React, { useState, useEffect } from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import CountryFetcher from "./components/CountryFetcher"; // Importcomponent

function App(){
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  return (
    <div>
      <h1 style={{ paddingBottom: "30px", letterspacing: "2px", textAlign: "center" ,fontweight: "bold", borderRadius: "18px", marginLeft: "300px", fontFamily: "Times New Roman",textDecoration:"underline" , color:"rgb(111, 17, 63)"}}>Welcome to Rest Countries.com</h1>
      {apiKey ? (
        <div>
          <h2 style={{ paddingBottom: "10px", letterspacing: "2px", textAlign: "center" ,fontweight: "bold", borderRadius: "18px", marginLeft: "300px", fontFamily: "Times New Roman"}} >Hii There !!! <br />Logged In with API Key: {apiKey}</h2>
          {/* CountryFetcher only if user is logged */}
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
