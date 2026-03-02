const axios = require('axios');
(async()=>{
  try{
    const res = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'admin@sirius.com',
      password: 'password123',
      role: 'admin'
    });
    console.log('status', res.status);
    console.log('data', res.data);
  }catch(e){
    console.log('error', e.message, e.response?.data);
  }
  process.exit(0);
})(); 
