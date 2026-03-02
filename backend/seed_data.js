const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/siswit?schema=public';
process.env.PRISMA_CLIENT_ENGINE_TYPE = process.env.PRISMA_CLIENT_ENGINE_TYPE || 'binary';
const { prisma } = require('./prismaClient');

const seedData = async () => {
  try {
    await prisma.$transaction([
      prisma.document.deleteMany({}),
      prisma.payment.deleteMany({}),
      prisma.invoice.deleteMany({}),
      prisma.eRPOrder.deleteMany({}),
      prisma.contract.deleteMany({}),
      prisma.quoteItem.deleteMany({}),
      prisma.quote.deleteMany({}),
      prisma.opportunity.deleteMany({}),
      prisma.activity.deleteMany({}),
      prisma.note.deleteMany({}),
      prisma.contact.deleteMany({}),
      prisma.account.deleteMany({}),
      prisma.subscription.deleteMany({}),
      prisma.user.deleteMany({}),
    ]);

    const password = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.create({
      data: { email: 'admin@sirius.com', password, role: 'ADMIN', firstName: 'Admin', subscriptionStatus: null, subscriptionPlan: null },
    });
    const employee = await prisma.user.create({
      data: { email: 'john@sirius.com', password, role: 'EMPLOYEE', firstName: 'John', subscriptionStatus: null, subscriptionPlan: null },
    });
    const customer = await prisma.user.create({
      data: { email: 'alice@globaltech.com', password, role: 'CUSTOMER', firstName: 'Alice', subscriptionStatus: null, subscriptionPlan: null },
    });
    const owner = await prisma.user.create({
      data: { email: 'owner@sirius.com', password, role: 'OWNER', firstName: 'Owner', subscriptionStatus: null, subscriptionPlan: null },
    });

    const productLicense = await prisma.product.create({
      data: { name: 'Enterprise License', sku: 'ENT-LIC', description: 'Enterprise software license', pricing_type: 'one_time', base_price: 100000, currency: 'USD', is_active: true },
    });
    const productImpl = await prisma.product.create({
      data: { name: 'Implementation', sku: 'IMPL-SVC', description: 'Implementation services', pricing_type: 'one_time', base_price: 20000, currency: 'USD', is_active: true },
    });

    const account = await prisma.account.create({
      data: {
        name: 'Global Tech Industries',
        industry: 'Technology',
        website: 'www.globaltech.com',
        phone: '555-0123',
        status: 'active',
        annualRevenue: '5000000',
        ownerName: 'John Sales',
        createdById: employee.id,
      },
    });

    const opportunity = await prisma.opportunity.create({
      data: {
        title: 'Global Tech Expansion',
        company: account.name,
        accountId: account.id,
        stage: 'closed_won',
        value: 120000,
        closingDate: new Date(),
        ownerName: 'John Sales',
        ownerId: employee.id,
      },
    });

    const quote = await prisma.quote.create({
      data: {
        quoteNumber: 'Q-2024-001',
        opportunityId: opportunity.id,
        accountId: account.id,
        status: 'accepted',
        currency: 'USD',
        subtotal: 120000,
        taxTotal: 0,
        grandTotal: 120000,
        createdBy: 'John Sales',
        items: {
          create: [
            {
              productId: productLicense.id,
              quantity: 1,
              unitPrice: 100000,
              total: 100000,
            },
            {
              productId: productImpl.id,
              quantity: 1,
              unitPrice: 20000,
              total: 20000,
            },
          ],
        },
      },
      include: { items: true },
    });

    const contract = await prisma.contract.create({
      data: {
        contract_number: 'CTR-2024-001',
        name: 'Global Tech MSA',
        account_id: account.id,
        customer_name: account.name,
        quote_id: quote.id,
        status: 'signed',
        start_date: new Date(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        contract_value: 120000,
        owner_id: employee.id,
      },
    });

    const order = await prisma.eRPOrder.create({
      data: {
        orderNumber: 'ORD-2024-001',
        contractId: contract.id,
        accountId: account.id,
        items: [
          {
            name: 'Enterprise License',
            quantity: 1,
            unitPrice: 100000,
            total: 100000,
          },
          {
            name: 'Implementation',
            quantity: 1,
            unitPrice: 20000,
            total: 20000,
          },
        ],
        subtotal: 120000,
        taxTotal: 12000,
        grandTotal: 132000,
        status: 'confirmed',
        paymentStatus: 'partial',
        fulfillmentStatus: 'processing',
        createdByStr: 'John Sales',
        createdById: employee.id,
      },
    });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-001',
        orderId: order.id,
        accountId: account.id,
        items: order.items,
        subtotal: 120000,
        taxTotal: 12000,
        grandTotal: 132000,
        balanceDue: 32000,
        status: 'sent',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        createdBy: 'John Sales',
      },
    });

    await prisma.payment.create({
      data: {
        paymentNumber: 'PAY-2024-001',
        invoiceId: invoice.id,
        accountId: account.id,
        amount: 100000,
        paymentMethod: 'bank_transfer',
        status: 'completed',
        paymentDate: new Date(),
        recordedBy: 'John Sales',
      },
    });

    await prisma.subscription.create({
      data: {
        userId: customer.id,
        plan: 'professional',
        status: 'active',
        amount: 149,
        startDate: new Date(),
        billingCycle: 'monthly',
        currency: 'USD',
      },
    });

    console.log('SEED DATA GENERATED SUCCESSFULLY');
    console.log('Admin: admin@sirius.com / password123');
    console.log('Employee: john@sirius.com / password123');
    console.log('Customer: alice@globaltech.com / password123');
    console.log('Owner: owner@sirius.com / password123');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
