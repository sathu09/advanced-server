import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [editPost, setEditPost] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  const token = localStorage.getItem('token');

  // Memoize headers so that it doesn't change on every render
  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);  // Only change when the token changes

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5002/api/posts', { headers });
      setBlogs(res.data);

      const commentPromises = res.data.map(blog =>
        axios.get(`http://localhost:5002/api/posts/${blog.id}/comments`)
          .then(response => ({ postId: blog.id, data: response.data }))
      );

      const results = await Promise.all(commentPromises);
      const allComments = {};
      results.forEach(({ postId, data }) => {
        allComments[postId] = data;
      });

      setComments(allComments);
    } catch (err) {
      console.error('❌ Error fetching blogs or comments:', err);
    }
  }, [headers]);

  const handleLike = async (id) => {
    try {
      await axios.post(`http://localhost:5002/api/posts/${id}/like`, {}, { headers });
      fetchBlogs(); // Re-fetch to update the like count
    } catch (err) {
      console.error('❌ Error liking post:', err);
    }
  };
  

  const handleCommentSubmit = async (postId) => {
    const content = newComment[postId];
    if (!content) return;

    try {
      await axios.post(
        `http://localhost:5002/api/posts/${postId}/comments`,
        { content },
        { headers }
      );
      setNewComment((prev) => ({ ...prev, [postId]: '' }));
      fetchBlogs();
    } catch (err) {
      console.error('❌ Error adding comment:', err);
    }
  };

  const handleEditPost = (post) => {
    setEditPost(post);
    setEditedTitle(post.title);
    setEditedContent(post.content);
  };

  const handleUpdatePost = async () => {
    if (!editedTitle || !editedContent) return;

    try {
      await axios.put(
        `http://localhost:5002/api/posts/${editPost.id}`,
        { title: editedTitle, content: editedContent },
        { headers }
      );
      setEditPost(null);
      fetchBlogs();
    } catch (err) {
      console.error('❌ Error updating post:', err);
    }
  };

  useEffect(() => {
    if (token) fetchBlogs();
  }, [fetchBlogs, token]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📝 All Blog Posts</h2>
      {blogs.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        blogs.map((blog) => (
          <div key={blog.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '2rem' }}>
            {editPost?.id === blog.id ? (
              <div>
                <h3>Edit Post</h3>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Edit Title"
                />
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Edit Content"
                />
                <button onClick={handleUpdatePost}>Update Post</button>
                <button onClick={() => setEditPost(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <h3>{blog.title}</h3>
                <p>{blog.content}</p>
                <p><strong>By:</strong> {blog.author}</p>
                <p>❤️ Likes: {blog.likes || 0}</p>
                <button onClick={() => handleLike(blog.id)}>Like</button>
                <button onClick={() => handleEditPost(blog)}>Edit</button>

                <div style={{ marginTop: '1rem' }}>
                  <h4>💬 Comments:</h4>
                  {comments[blog.id]?.length > 0 ? (
                    comments[blog.id].map((c) => (
                      <div key={c.id} style={{ marginLeft: '1rem', marginBottom: '0.5rem' }}>
                        <strong>{c.author}:</strong> {c.content}
                      </div>
                    ))
                  ) : (
                    <p style={{ marginLeft: '1rem' }}>No comments yet.</p>
                  )}

                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment[blog.id] || ''}
                    onChange={(e) =>
                      setNewComment((prev) => ({ ...prev, [blog.id]: e.target.value }))
                    }
                    style={{ width: '70%', marginTop: '0.5rem' }}
                  />
                  <button onClick={() => handleCommentSubmit(blog.id)} style={{ marginLeft: '0.5rem' }}>
                    Add Comment
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default BlogListPage;
