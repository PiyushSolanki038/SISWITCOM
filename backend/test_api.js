// const fetch = require('node-fetch'); // Native fetch is available in Node 18+

const BASE_URL = 'http://localhost:5000/api/auth';

const testCustomer = {
  name: 'Test Customer',
  email: 'customer@example.com',
  password: 'Password123!',
  role: 'customer'
};

const testEmployee = {
  name: 'Test Employee',
  email: 'employee@example.com',
  password: 'Password123!',
  role: 'employee'
};

async function testAuth() {
  console.log('--- Testing Signup Customer ---');
  try {
    const signupRes = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCustomer)
    });
    const signupData = await signupRes.json();
    console.log('Signup Status:', signupRes.status);
    console.log('Signup Response:', signupData);
  } catch (e) {
    console.error('Signup Error:', e);
  }

  console.log('\n--- Testing Signup Employee ---');
  try {
    const signupRes = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEmployee)
    });
    const signupData = await signupRes.json();
    console.log('Signup Status:', signupRes.status);
    console.log('Signup Response:', signupData);
  } catch (e) {
    console.error('Signup Error:', e);
  }

  console.log('\n--- Testing Login Customer (with role) ---');
  try {
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testCustomer.email, password: testCustomer.password, role: 'customer' })
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', loginData);
  } catch (e) {
    console.error('Login Error:', e);
  }

  console.log('\n--- Testing Login Employee (without role - auto detect) ---');
  try {
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmployee.email, password: testEmployee.password })
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', loginData);
  } catch (e) {
    console.error('Login Error:', e);
  }
}

testAuth();
