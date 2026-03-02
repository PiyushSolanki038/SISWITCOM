const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const { prisma } = require('./prismaClient');


const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to PostgreSQL via Prisma
(async () => {
  try {
    await prisma.$connect();
    console.log('Prisma PostgreSQL Connected');
  } catch (err) {
    console.error('Prisma connection error', err);
    process.exit(1);
  }
})();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/crm', require('./routes/crm'));
app.use('/api/erp', require('./routes/erp'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/cpq', require('./routes/cpq'));
app.use('/api/clm', require('./routes/clm'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/esign', require('./routes/esign'));
app.use('/api/invitations', require('./routes/invitations'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/chat', require('./routes/chat'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
