import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You must be logged in to post a blog.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/blogs",
        { title, content, country },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Blog post created successfully!");
      navigate("/blogs");
    } catch (err) {
      setMessage("Failed to create blog: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <h2>Create a Travel Blog</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required /><br />
        <input
          type="text"
          placeholder="Country Visited"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required /><br />
        <textarea
          placeholder="Your travel experience..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="5"
          required /><br />
        <button type="submit">Post Blog</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default CreateBlogPage;
