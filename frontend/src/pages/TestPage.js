import React from 'react';
import { Link } from 'react-router-dom';

const TestPage = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test Page - Routing Works!</h1>
      <p>If you can see this page, routing is working correctly.</p>
      <Link to="/" style={{ color: 'blue', textDecoration: 'underline' }}>← Back to Home</Link>
    </div>
  );
};

export default TestPage;