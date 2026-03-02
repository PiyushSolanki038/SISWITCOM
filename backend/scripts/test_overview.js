const axios = require('axios');

(async () => {
  const base = 'http://127.0.0.1:5000';
  let token = '';
  try {
    try {
      const login = await axios.post(`${base}/api/auth/login`, {
        email: 'test.owner@example.com',
        password: 'Password123!',
        role: 'owner'
      });
      token = login.data.token;
      console.log('login ok');
    } catch {
      const signup = await axios.post(`${base}/api/auth/signup`, {
        name: 'Test Owner',
        email: 'test.owner@example.com',
        password: 'Password123!',
        role: 'owner'
      });
      token = signup.data.token;
      console.log('signup ok');
    }
    const res = await axios.get(`${base}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('overview keys', Object.keys(res.data));
    console.log('kpis', {
      activeSubscriptions: res.data?.users?.subscriptionsActive,
      approvalsPending: res.data?.cpq?.approvalsPending,
      contractsExpiringSoon: res.data?.clm?.contractsExpiringSoon
    });
  } catch (e) {
    console.error('overview error', e.response?.status, e.response?.data || e.message);
    process.exit(1);
  }
  process.exit(0);
})(); 
