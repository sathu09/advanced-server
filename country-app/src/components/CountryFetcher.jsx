import React, { useState } from "react";

function CountryFetcher({ apiKey }) {
  const [countryName, setCountryName] = useState("");
  const [countryData, setCountryData] = useState(null);
  const [error, setError] = useState("");

  const fetchCountryData = async () => {
    if (!countryName) {
      setError("Please enter a country name.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/country/${countryName}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCountryData(data);
        setError("");
      } else {
        setError(data.error || "Failed to fetch country data.");
        setCountryData(null);
      }
    } catch (err) {
      console.error("Error fetching country:", err);
      setError("An error occurred while fetching country data.");
      setCountryData(null);
    }
  };

  return (
    <div style={{ marginTop: "20px", paddingBottom: "10px", letterspacing: "2px", textAlign: "center" ,fontweight: "bold", borderRadius: "18px", marginLeft: "300px", fontFamily: "Times New Roman" }}>
      <h2>Thank you for Login <br />Search Your Country Data</h2>

      <input
        type="text"
        value={countryName}
        onChange={(e) => setCountryName(e.target.value)}
        placeholder="Enter country name"
        style={{ padding: "8px", marginRight: "10px", borderRadius:"3px"}}
      />
      <button onClick={fetchCountryData} style={{ padding: "8px" }}>
        Search
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {countryData && (
        <div style={{ marginTop: "20px", border: "5px solid #ccc", padding: "16px", borderRadius: "18px", fontFamily:"Times New Roman" }}>
          <h3>{countryData.name}</h3>
          <p><strong>Name:</strong> {countryData.name}</p>
          <p><strong>Currency:</strong> {countryData.currency}</p>
          <p><strong>Capital:</strong> {countryData.capital}</p>
          <p><strong>Languages:</strong> {countryData.languages}</p>
          <img src={countryData.flag} alt="Flag" width="150" />
        </div>
      )}
    </div>
  );
}

export default CountryFetcher;
