import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
    <div>
      <h1 style={{ fontSize: '6rem', fontWeight: 700, color: 'hsl(var(--primary))', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Page Not Found</h2>
      <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
      <Link to="/"><Button>Go Home</Button></Link>
    </div>
  </div>
);

export default NotFound;
