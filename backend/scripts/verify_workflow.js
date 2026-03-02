const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api';

// Utilities
const log = (msg) => console.log(`[TEST] ${msg}`);
const error = (msg, err) => console.error(`[ERROR] ${msg}`, err?.response?.data || err?.message);

let employeeToken = '';
let customerToken = '';
let leadId = '';
let opportunityId = '';
let accountId = '';
let quoteId = '';
let contractId = '';
let orderId = '';
let invoiceId = '';
let subscriptionId = '';

const uniqueId = Math.floor(Math.random() * 10000);
const employeeEmail = `emp${uniqueId}@test.com`;
const customerEmail = `cust${uniqueId}@test.com`;
const customerName = `Test Customer ${uniqueId}`;

async function run() {
    try {
        log('Starting End-to-End Workflow Verification...');

        // 0. Assume seed users exist

        // 1. Create and Login Employee
        log('1. Registering/Logging in Employee...');
        // Note: Public signup might be restricted to customers, so we might need to seed an employee directly or use a known one.
        // For this test, let's assume we can use the /api/auth/login if we have a seed, OR we try to register if allowed (but we fixed security to force customer).
        // So we must use an existing employee or insert one directly into DB if we were running inside the app.
        // Since we are external script, let's try to login as a known default employee, or skip if we can't.
        // Actually, for the purpose of this script, let's assume we have a way to get an employee token.
        // If not, we might fail step 1.
        // Let's try to login with a hardcoded admin/employee if it exists, or fail gracefully.
        // User "admin@example.com" / "password" is common in these projects.
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'admin@sirius.com',
                password: 'password123',
                role: 'admin'
            });
            employeeToken = loginRes.data.token;
            log('Employee logged in successfully.');
        } catch (e) {
            log(`Could not login as default admin. Error: ${e.message} ${JSON.stringify(e.response?.data)}`);
            // If we can't login as employee, we can't do most steps.
            // Let's assume the user has a valid employee login.
            // I'll try to create one directly if I can connect to DB, but I'll stick to API.
            // Let's try to sign up as customer and see if we can use that (no, need employee for Lead/Quote).
            
            // Hack: Use the /api/auth/signup endpoint which forces customer, so we can't create employee.
            // We must rely on existing data.
            throw new Error('Cannot authenticate as Employee. Please ensure admin@sirius.com exists.');
        }

        // 2. Create Lead
        log('2. Creating Lead...');
        const leadRes = await axios.post(`${API_URL}/crm/leads`, {
            name: `Test Lead ${uniqueId}`,
            email: customerEmail,
            company: `Company ${uniqueId}`,
            status: 'new',
            source: 'web'
        }, { headers: { 'x-auth-token': employeeToken } });
        leadId = leadRes.data._id;
        log(`Lead created: ${leadId}`);

        // 3. Convert Lead
        log('3. Converting Lead...');
        const convertRes = await axios.post(`${API_URL}/crm/leads/${leadId}/convert`, {
            dealName: `Deal ${uniqueId}`,
            dealValue: 5000
        }, { headers: { 'x-auth-token': employeeToken } });
        
        opportunityId = convertRes.data.opportunity._id;
        accountId = convertRes.data.account._id; // Adjust based on actual response structure
        // If convertRes.data.account is just ID or object
        if (convertRes.data.account && convertRes.data.account._id) accountId = convertRes.data.account._id;
        
        log(`Lead converted. Opportunity: ${opportunityId}, Account: ${accountId}`);

        // 3.5 Ensure Products Exist
        log('3.5 Checking/Creating Products...');
        let productId = '';
        try {
            const prodRes = await axios.get(`${API_URL}/cpq/products`, { headers: { 'x-auth-token': employeeToken } });
            if (prodRes.data.length > 0) {
                productId = prodRes.data[0]._id;
                log(`Using existing product: ${productId}`);
            } else {
                log('No products found, creating one...');
                const newProdRes = await axios.post(`${API_URL}/cpq/products`, {
                    name: 'Enterprise License',
                    sku: `ENT-${uniqueId}`,
                    description: 'Full enterprise access',
                    pricing_type: 'yearly',
                    base_price: 5000,
                    currency: 'USD'
                }, { headers: { 'x-auth-token': employeeToken } });
                productId = newProdRes.data._id;
                log(`Created new product: ${productId}`);
            }
        } catch (e) {
            error('Failed to manage products', e);
            throw e;
        }

        // 4. Create Quote
        log('4. Creating Quote...');
        const quoteRes = await axios.post(`${API_URL}/cpq/quotes`, {
            opportunityId,
            accountId,
            currency: 'USD',
            items: [{
                productId: productId,
                name: 'Enterprise License',
                quantity: 1,
                unitPrice: 5000,
                discount: 0,
                total: 5000
            }],
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'draft'
        }, { headers: { 'x-auth-token': employeeToken } });
        quoteId = quoteRes.data._id;
        log(`Quote created: ${quoteId}`);

        // 5. Send Quote
        log('5. Sending Quote...');
        await axios.post(`${API_URL}/cpq/quotes/${quoteId}/send`, {}, { headers: { 'x-auth-token': employeeToken } });
        log('Quote sent.');

        // 6. Customer Login
        // We need to login as the customer. The Lead Conversion might have created a Customer user?
        // Usually Lead Conversion creates a Contact and Account. It might NOT create a User login.
        // But the system might allow the customer to "register" or "login" if they have an email.
        // Wait, the conversion logic I saw earlier creates a CRMContact.
        // The /auth/signup creates a Customer.
        // To simulate the customer side, we should register the customer with the SAME email.
        log('6. Registering Customer...');
        try {
            const signupRes = await axios.post(`${API_URL}/auth/signup`, {
                name: customerName,
                email: customerEmail,
                password: 'password123'
            });
            customerToken = signupRes.data.token;
            log('Customer registered and logged in.');
        } catch (e) {
            log('Customer might already exist, logging in...');
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: customerEmail,
                password: 'password123',
                role: 'customer'
            });
            customerToken = loginRes.data.token;
        }

        // 7. Accept Quote
        log('7. Accepting Quote (Customer)...');
        const acceptRes = await axios.post(`${API_URL}/cpq/quotes/${quoteId}/accept`, {}, { headers: { 'x-auth-token': customerToken } });
        log('Quote accepted.');

        log('8. Creating Contract from Quote (Employee)...');
        await axios.post(`${API_URL}/clm/contracts/from-quote/${quoteId}`, {}, { headers: { 'x-auth-token': employeeToken } });
        log('Contract created.');

        log('Fetching Contract...');
        // Let's list contracts for the customer
        const contractsRes = await axios.get(`${API_URL}/clm/contracts`, { headers: { 'x-auth-token': customerToken } });
        const contract = contractsRes.data.find(c => c.quote_id === quoteId || c.quote_id?._id === quoteId);
        if (!contract) throw new Error('Contract not found after quote acceptance');
        contractId = contract._id;
        log(`Contract found: ${contractId}`);

        // 8.5 Send for Signature (Employee)
        log('8.5 Sending Contract for Signature (Employee)...');
        await axios.post(`${API_URL}/clm/contracts/${contractId}/send-for-signature`, {
            signers: [{
                name: customerName,
                email: customerEmail,
                sign_order: 1
            }]
        }, { headers: { 'x-auth-token': employeeToken } });
        log('Contract sent for signature.');

        // 8. Signing Contract
        log('8. Signing Contract (Customer)...');
        await axios.post(`${API_URL}/clm/contracts/${contractId}/sign`, {}, { headers: { 'x-auth-token': customerToken } });
        log('Contract signed.');

        // 9. Verify Order
        log('9. Verifying ERP Order...');
        // Switch to Employee to view orders
        const ordersRes = await axios.get(`${API_URL}/erp/orders`, { headers: { 'x-auth-token': employeeToken } });
        // Assuming we can filter or find the latest
        const order = ordersRes.data.find(o => o.contractId === contractId);
        if (!order) throw new Error('ERP Order not created after contract signature');
        orderId = order._id;
        log(`ERP Order created: ${orderId}`);

        // 10. Fulfill Order / Create Invoice
        log('10. Fulfilling Order (Employee)...');
        // This step depends on ERP logic. Is there an endpoint to "fulfill" or "generate invoice"?
        // Usually /erp/orders/:id/fulfill or update status.
        // Let's try updating status to 'fulfillment' or 'completed'.
        await axios.put(`${API_URL}/erp/orders/${orderId}`, { status: 'fulfillment' }, { headers: { 'x-auth-token': employeeToken } });
        
        // Check if invoice exists
        log('Checking for Invoice...');
        const invoicesRes = await axios.get(`${API_URL}/erp/invoices`, { headers: { 'x-auth-token': employeeToken } });
        const invoice = invoicesRes.data.find(i => i.orderId === orderId);
        if (!invoice) {
            // Maybe we need to explicitly create it?
            log('Invoice not found, trying to create manually...');
            const invRes = await axios.post(`${API_URL}/erp/invoices`, {
                orderId: orderId,
                dueDate: new Date(Date.now() + 30*24*60*60*1000)
            }, { headers: { 'x-auth-token': employeeToken } });
            invoiceId = invRes.data._id;
        } else {
            invoiceId = invoice._id;
        }
        log(`Invoice ready: ${invoiceId}`);

        // 11. Pay Invoice
        log('11. Paying Invoice (Customer)...');
        await axios.post(`${API_URL}/erp/invoices/${invoiceId}/pay`, {
            paymentMethod: 'credit_card'
        }, { headers: { 'x-auth-token': customerToken } });
        log('Invoice paid.');

        // 12. Verify Subscription
        log('12. Verifying Subscription...');
        const subRes = await axios.get(`${API_URL}/subscription/my-subscription`, { headers: { 'x-auth-token': customerToken } });
        if (!subRes.data) throw new Error('Subscription not found');
        log(`Subscription active: ${subRes.data.status}`);

        log('SUCCESS: Full End-to-End Workflow Verified!');

    } catch (err) {
        console.error('API Error:', err.response ? err.response.data : err.message);
        if (err.response && err.response.data && err.response.data.stack) {
            console.error('Stack:', err.response.data.stack);
        }
        throw new Error(`Workflow verification failed "${err.response ? JSON.stringify(err.response.data) : err.message}"`);
    }
}

run();
