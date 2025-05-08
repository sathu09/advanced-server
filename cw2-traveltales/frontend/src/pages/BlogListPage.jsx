import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/blogs');
        setBlogs(res.data.blogs); // Adjust this based on your backend response
      } catch (err) {
        setError('Failed to load blogs: ' + (err.response?.data?.message || err.message));
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div>
      <h2>Travel Blog Posts</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {blogs.length === 0 ? (
        <p>No blog posts yet.</p>
      ) : (
        blogs.map((blog) => (
          <div key={blog.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{blog.title}</h3>
            <p><strong>Country:</strong> {blog.country}</p>
            <p>{blog.content}</p>
            <p><em>By: {blog.author}</em></p>
          </div>
        ))
      )}
    </div>
  );
};

export default BlogListPage;
