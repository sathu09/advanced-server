import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateBlogPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5002/api/posts', // 👈 corrected endpoint
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      
      navigate('/blogs'); // ✅ Redirect to blog list
    } catch (err) {
      alert('Failed to create blog: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Create New Blog Post</h2>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: '1rem' }}
        />
        <textarea
          placeholder="Write your content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="5"
          required
          style={{ display: 'block', width: '100%', marginBottom: '1rem' }}
        ></textarea>
        <button type="submit">Publish</button>
      </form>
    </div>
  );
};

export default CreateBlogPage;
