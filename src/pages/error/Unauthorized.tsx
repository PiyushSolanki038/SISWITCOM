import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Unauthorized: React.FC = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
    <div>
      <h1 style={{ fontSize: '6rem', fontWeight: 700, color: 'hsl(var(--destructive))', marginBottom: '1rem' }}>403</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Access Denied</h2>
      <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>You don't have permission to access this page.</p>
      <Link to="/dashboard"><Button>Go to Dashboard</Button></Link>
    </div>
  </div>
);

export default Unauthorized;
