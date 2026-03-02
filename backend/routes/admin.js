const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

const { prisma } = require('../prismaClient');
const sessionBlocklist = require('../utils/sessionBlocklist');

// Helper to get model
const toEnumRole = (role) => {
    if (!role) return null;
    const r = role.toLowerCase();
    if (r === 'admin') return 'ADMIN';
    if (r === 'owner') return 'OWNER';
    if (r === 'employee') return 'EMPLOYEE';
    if (r === 'customer') return 'CUSTOMER';
    return null;
};

// @route   POST api/admin/users/create
// @desc    Create an internal user (Admin, Employee, etc.)
// @access  Private (Admin/Owner only)
router.post('/users/create', auth, async (req, res) => {
    try {
        // 1. Verify requester is Admin or Owner
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied. Admin or Owner role required.' });
        }

        const { name, email, password, role } = req.body;

        if (!role || !['admin', 'employee', 'owner'].includes(role)) {
            return res.status(400).json({ message: 'Valid internal role is required (admin, employee, owner)' });
        }

        // 2. Check uniqueness
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Create User
        const enumRole = toEnumRole(role);
        if (!enumRole) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const hashed = await bcrypt.hash(password, 10);
        const created = await prisma.user.create({
            data: {
                email,
                password: hashed,
                role: enumRole,
                firstName: name
            }
        });

        res.json({ message: 'User created successfully', userId: created.id });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/roles-permissions
// @desc    Return roles and module access matrix
// @access  Private (Admin/Owner only)
router.get('/roles-permissions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const tenantId = req.user.tenantId || req.user.id;
    const roles = ['owner', 'admin', 'employee', 'customer'];
    const modules = ['crm', 'cpq', 'clm', 'erp', 'docs', 'sign', 'billing', 'portal', 'workflows', 'approvals', 'templates', 'reports', 'subscription', 'settings'];
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role TEXT NOT NULL,
        module TEXT NOT NULL,
        allowed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (role, module)
      )
    `);
    await prisma.$executeRawUnsafe(`ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS tenant_id TEXT`);
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name='role_permissions' AND constraint_type='PRIMARY KEY'
        ) THEN
          ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
        END IF;
      END$$;
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS role_permissions_unique_tenant ON role_permissions(tenant_id, role, module)`);
    await prisma.$executeRawUnsafe(`UPDATE role_permissions SET tenant_id = $1 WHERE tenant_id IS NULL`, tenantId);
    const existingTenant = await prisma.$queryRaw`SELECT role, module, allowed FROM role_permissions WHERE tenant_id = ${tenantId}`;
    if (!existingTenant || existingTenant.length === 0) {
      const defaults = [];
      for (const m of modules) {
        defaults.push({ tenant_id: tenantId, role: 'owner', module: m, allowed: true });
        defaults.push({ tenant_id: tenantId, role: 'admin', module: m, allowed: true });
        const empAllowed = ['crm', 'cpq', 'clm', 'sign', 'docs', 'billing', 'portal', 'workflows', 'approvals', 'templates', 'reports'].includes(m);
        defaults.push({ tenant_id: tenantId, role: 'employee', module: m, allowed: empAllowed });
        const custAllowed = ['portal'].includes(m);
        defaults.push({ tenant_id: tenantId, role: 'customer', module: m, allowed: custAllowed });
      }
      for (const d of defaults) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO role_permissions (tenant_id, role, module, allowed) VALUES ($1, $2, $3, $4)
           ON CONFLICT (tenant_id, role, module) DO UPDATE SET allowed = EXCLUDED.allowed, updated_at = NOW()`,
          d.tenant_id, d.role, d.module, d.allowed
        );
      }
    }
    await prisma.$executeRawUnsafe(
      `INSERT INTO role_permissions (tenant_id, role, module, allowed) VALUES ($1, $2, $3, $4)
       ON CONFLICT (tenant_id, role, module) DO NOTHING`,
      tenantId, 'owner', 'erp', true
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO role_permissions (tenant_id, role, module, allowed) VALUES ($1, $2, $3, $4)
       ON CONFLICT (tenant_id, role, module) DO NOTHING`,
      tenantId, 'admin', 'erp', true
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO role_permissions (tenant_id, role, module, allowed) VALUES ($1, $2, $3, $4)
       ON CONFLICT (tenant_id, role, module) DO NOTHING`,
      tenantId, 'employee', 'erp', true
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO role_permissions (tenant_id, role, module, allowed) VALUES ($1, $2, $3, $4)
       ON CONFLICT (tenant_id, role, module) DO NOTHING`,
      tenantId, 'customer', 'erp', false
    );
    const rows = await prisma.$queryRaw`SELECT role, module, allowed FROM role_permissions WHERE tenant_id = ${tenantId}`;
    const matrix = modules.map(m => {
      const row = { module: m };
      for (const r of roles) {
        const match = rows.find(x => x.module === m && x.role === r);
        row[r] = !!(match && match.allowed);
      }
      return row;
    });
    res.json({ roles, modules, matrix });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/roles-permissions/:role/:module', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const tenantId = req.user.tenantId || req.user.id;
    const { role, module } = req.params;
    const { allowed } = req.body || {};
    if (!['owner', 'admin', 'employee', 'customer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const modules = ['crm', 'cpq', 'clm', 'erp', 'docs', 'sign', 'billing', 'portal', 'workflows', 'approvals', 'templates', 'reports', 'subscription', 'settings'];
    if (!modules.includes(module)) {
      return res.status(400).json({ message: 'Invalid module' });
    }
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role TEXT NOT NULL,
        module TEXT NOT NULL,
        allowed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (role, module)
      )
    `);
    await prisma.$executeRawUnsafe(`ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS tenant_id TEXT`);
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name='role_permissions' AND constraint_type='PRIMARY KEY'
        ) THEN
          ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
        END IF;
      END$$;
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS role_permissions_unique_tenant ON role_permissions(tenant_id, role, module)`);
    await prisma.$executeRawUnsafe(`UPDATE role_permissions SET tenant_id = $1 WHERE tenant_id IS NULL`, tenantId);
    await prisma.$executeRawUnsafe(
      `INSERT INTO role_permissions (tenant_id, role, module, allowed) VALUES ($1, $2, $3, $4)
       ON CONFLICT (tenant_id, role, module) DO UPDATE SET allowed = EXCLUDED.allowed, updated_at = NOW()`,
      tenantId, role, module, !!allowed
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/users
// @desc    Get all users (Admin, Owner, Employee, Customer)
// @access  Private (Admin/Owner only)
router.get('/users', auth, async (req, res) => {
    try {
        if (!req.user.role || (req.user.role !== 'admin' && req.user.role !== 'owner')) {
            try {
                const u = await prisma.user.findUnique({ where: { id: req.user.id } });
                const roleMap = { ADMIN: 'admin', OWNER: 'owner', EMPLOYEE: 'employee', CUSTOMER: 'customer' };
                const normalized = u && u.role ? (roleMap[u.role] || null) : null;
                if (normalized) req.user.role = normalized;
            } catch {}
        }
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const tenantId = req.user.tenantId || req.user.id;
        const users = await prisma.user.findMany({
            where: { tenantId: tenantId },
            select: { id: true, email: true, role: true, firstName: true, subscriptionStatus: true, createdAt: true }
        });
        const roleMap = { ADMIN: 'admin', OWNER: 'owner', EMPLOYEE: 'employee', CUSTOMER: 'customer' };
        const allUsers = users.map(u => {
            const roleStr = roleMap[u.role] || 'employee';
            return {
                _id: u.id,
                email: u.email,
                name: u.firstName || 'User',
                type: roleStr,
                role: roleStr,
                status: sessionBlocklist.has(u.id) ? 'inactive' : (roleStr === 'customer' ? (u.subscriptionStatus || 'active') : 'active'),
                createdAt: u.createdAt || null
            };
        });
        res.json(allUsers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin/Owner only)
router.post('/users/:id/role', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { id } = req.params;
        const { role } = req.body;
        const enumRole = toEnumRole(role);
        if (!enumRole) return res.status(400).json({ message: 'Invalid role' });
        await prisma.user.update({ where: { id }, data: { role: enumRole } });
        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/users/:id/force-logout
// @desc    Invalidate current sessions (in-memory blocklist)
// @access  Private (Admin/Owner only)
router.post('/users/:id/force-logout', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { id } = req.params;
        sessionBlocklist.add(id);
        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/users/:id/enable
// @desc    Remove user from blocklist (enable)
// @access  Private (Admin/Owner only)
router.post('/users/:id/enable', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { id } = req.params;
        sessionBlocklist.remove(id);
        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// @route   GET api/admin/overview
// @desc    Tenant-scoped Admin Overview data (single payload)
// @access  Private (Admin/Owner only)
router.get('/overview', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const isEmpty = (obj) => !obj || Object.keys(obj).length === 0;

        // Resolve tenant context from Accounts created by this user
        const myAccounts = await prisma.account.findMany({
            where: { createdById: req.user.id },
            select: { id: true, tenantId: true }
        });
        const tenantIds = [...new Set(myAccounts.map(a => a.tenantId).filter(Boolean))];

        const now = new Date();
        const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Helper filters
        const tenantFilter = tenantIds.length ? { tenantId: { in: tenantIds } } : {};
        const accountFilter = myAccounts.length ? { accountId: { in: myAccounts.map(a => a.id) } } : {};
        const createdByFilter = { createdById: req.user.id };

        // CRM counts
        const orFilters = [];
        if (!isEmpty(tenantFilter)) orFilters.push(tenantFilter);
        orFilters.push(createdByFilter);
        const crmWhere = orFilters.length ? { OR: orFilters } : {};
        let accountsCount = 0, leadsCount = 0, opportunitiesCount = 0, activitiesPending = 0;
        try {
            [accountsCount, leadsCount, opportunitiesCount, activitiesPending] = await Promise.all([
                prisma.account.count({ where: crmWhere }),
                prisma.lead.count({ where: crmWhere }),
                prisma.opportunity.count({ where: crmWhere }),
                prisma.activity.count({ where: { ...crmWhere, completed: false } })
            ]);
        } catch {}

        // CPQ: quotes by status + pending approvals
        const quoteStatuses = ['DRAFT', 'SENT', 'APPROVAL_PENDING', 'APPROVED', 'REJECTED', 'ACCEPTED'];
        const quoteCounts = {};
        try {
            for (const st of quoteStatuses) {
                const quoteOr = [];
                if (!isEmpty(tenantFilter)) quoteOr.push(tenantFilter);
                if (!isEmpty(accountFilter)) quoteOr.push(accountFilter);
                quoteOr.push({ createdBy: req.user.email || req.user.id });
                const quoteWhere = quoteOr.length ? { OR: quoteOr, status: st } : { status: st };
                const count = await prisma.quote.count({ where: quoteWhere });
                quoteCounts[st] = count;
            }
        } catch {}
        let quoteApprovalsPending = 0;
        try {
            if (tenantIds.length) {
                quoteApprovalsPending = await prisma.quoteApproval.count({ where: { ...tenantFilter, status: 'PENDING' } });
            } else {
                quoteApprovalsPending = await prisma.quoteApproval.count({ where: { tenantId: req.user.id, status: 'PENDING' } });
            }
        } catch {}

        // CLM: contracts total/active/expiring soon
        const clmOr = [];
        if (!isEmpty(tenantFilter)) clmOr.push(tenantFilter);
        clmOr.push(createdByFilter);
        const clmWhere = clmOr.length ? { OR: clmOr } : {};
        let contractsTotal = 0, contractsActive = 0, contractsExpiringSoon = 0;
        try {
            [contractsTotal, contractsActive, contractsExpiringSoon] = await Promise.all([
                prisma.contract.count({ where: clmWhere }),
                prisma.contract.count({ where: { ...clmWhere, status: 'active' } }),
                prisma.contract.count({ where: { ...clmWhere, end_date: { lte: next7Days, gte: now } } })
            ]);
        } catch {}

        // E-Sign: signing sessions status
        const [signingPending, signingCompleted, signingFailed] = tenantIds.length
            ? await Promise.all([
                prisma.signingSession.count({ where: { ...tenantFilter, status: 'sent' } }),
                prisma.signingSession.count({ where: { ...tenantFilter, status: 'completed' } }),
                prisma.signingSession.count({ where: { ...tenantFilter, status: 'failed' } })
            ])
            : [0, 0, 0];

        // ERP: payments last 30d and orders
        let paymentsAgg = { _sum: { amount: 0 }, _count: { _all: 0 } };
        try {
            paymentsAgg = await prisma.payment.aggregate({
                _sum: { amount: true },
                _count: { _all: true },
                where: {
                    paymentDate: { gte: last30Days },
                    status: 'completed',
                    ...(isEmpty(accountFilter) ? {} : accountFilter)
                }
            });
        } catch {}
        const erpOr = [];
        if (!isEmpty(tenantFilter)) erpOr.push(tenantFilter);
        erpOr.push(createdByFilter);
        const erpWhere = erpOr.length ? { OR: erpOr } : {};
        let ordersTotal = 0, ordersPendingFulfillment = 0, ordersPaymentPending = 0;
        try {
            [ordersTotal, ordersPendingFulfillment, ordersPaymentPending] = await Promise.all([
                prisma.eRPOrder.count({ where: erpWhere }),
                prisma.eRPOrder.count({ where: { ...erpWhere, fulfillmentStatus: 'pending' } }),
                prisma.eRPOrder.count({ where: { ...erpWhere, paymentStatus: 'pending' } })
            ]);
        } catch {}

        // Documents
        let documentsTotal = 0;
        try {
            documentsTotal = await prisma.document.count({
                where: {
                    ...(isEmpty(accountFilter)
                        ? { userId: req.user.id }
                        : { OR: [accountFilter, { userId: req.user.id }] }
                    )
                }
            });
        } catch {}

        // Subscriptions active (users tied to tenant via subscriptions)
        let subscriptionsActive = 0;
        try {
            subscriptionsActive = tenantIds.length
                ? await prisma.subscription.count({ where: { ...tenantFilter, status: 'active' } })
                : 0;
        } catch {}

        // Alerts (derived from real logs/state)
        let failedEmailsCount = 0, pendingInvitesCount = 0, paymentIssuesCount = 0;
        try {
            failedEmailsCount = tenantIds.length
                ? await prisma.emailLog.count({ where: { ...tenantFilter, status: 'ERROR' } })
                : 0;
        } catch {}
        try {
            pendingInvitesCount = tenantIds.length
                ? await prisma.invitation.count({ where: { ...tenantFilter, status: 'PENDING' } })
                : 0;
        } catch {}
        try {
            paymentIssuesCount = tenantIds.length
                ? await prisma.paymentTransaction.count({ where: { ...tenantFilter, status: { in: ['CREATED'] } } })
                : 0;
        } catch {}

        const alerts = [];
        if (failedEmailsCount > 0) {
            alerts.push({
                title: 'Email Delivery Issues',
                desc: `${failedEmailsCount} email(s) failed to send`,
                severity: 'medium',
                time: 'recent'
            });
        }
        if (quoteApprovalsPending > 0) {
            alerts.push({
                title: 'Quote Approvals Pending',
                desc: `${quoteApprovalsPending} approval(s) awaiting decision`,
                severity: 'high',
                time: 'recent'
            });
        }
        if (contractsExpiringSoon > 0) {
            alerts.push({
                title: 'Contracts Expiring Soon',
                desc: `${contractsExpiringSoon} contract(s) expiring within 7 days`,
                severity: 'amber',
                time: 'recent'
            });
        }
        if (paymentIssuesCount > 0) {
            alerts.push({
                title: 'Payment Transactions Pending',
                desc: `${paymentIssuesCount} transaction(s) require attention`,
                severity: 'medium',
                time: 'recent'
            });
        }

        const pendingActions = [];
        if (pendingInvitesCount > 0) {
            pendingActions.push({
                title: 'Review Pending Invitations',
                desc: `You have ${pendingInvitesCount} pending user invitation(s).`
            });
        }
        if (activitiesPending > 0) {
            pendingActions.push({
                title: 'Complete Open Activities',
                desc: `${activitiesPending} activity item(s) are not completed.`
            });
        }
        if (ordersPendingFulfillment > 0) {
            pendingActions.push({
                title: 'Fulfill Pending Orders',
                desc: `${ordersPendingFulfillment} order(s) awaiting fulfillment.`
            });
        }

        res.json({
            users: {
                subscriptionsActive
            },
            crm: {
                accounts: accountsCount,
                leads: leadsCount,
                opportunities: opportunitiesCount,
                activitiesPending
            },
            cpq: {
                quotes: {
                    draft: quoteCounts.DRAFT,
                    sent: quoteCounts.SENT,
                    approval_pending: quoteCounts.APPROVAL_PENDING,
                    approved: quoteCounts.APPROVED,
                    rejected: quoteCounts.REJECTED,
                    accepted: quoteCounts.ACCEPTED
                },
                approvalsPending: quoteApprovalsPending
            },
            clm: {
                contractsTotal,
                contractsActive,
                contractsExpiringSoon
            },
            esign: {
                signingSessions: {
                    pending: signingPending,
                    completed: signingCompleted,
                    failed: signingFailed
                }
            },
            erp: {
                payments: {
                    last30Amount: Number(paymentsAgg._sum.amount || 0),
                    last30Count: paymentsAgg._count._all || 0
                },
                orders: {
                    total: ordersTotal,
                    pendingFulfillment: ordersPendingFulfillment,
                    paymentPending: ordersPaymentPending
                }
            },
            documents: {
                total: documentsTotal
            },
            alerts,
            pendingActions
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/system/health
// @desc    Run system health check (verify_workflow.js)
// @access  Private (Admin/Owner only)
router.post('/system/health', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { exec } = require('child_process');
        const path = require('path');
        const scriptPath = path.join(__dirname, '../scripts/verify_workflow.js');

        exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Health check error: ${error.message}`);
                return res.status(500).json({ 
                    status: 'failed', 
                    output: stdout, 
                    error: error.message 
                });
            }
            if (stderr) {
                console.warn(`Health check stderr: ${stderr}`);
            }
            res.json({ 
                status: 'success', 
                output: stdout 
            });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/workspace
// @desc    Create or update workspace (Account) for Owner
// @access  Private (Owner/Admin)
router.post('/workspace', auth, async (req, res) => {
    try {
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { companyName } = req.body;
        if (!companyName || !companyName.trim()) {
            return res.status(400).json({ message: 'Company name is required' });
        }
        // Try to find existing account created by this user
        let account = await prisma.account.findFirst({ where: { createdById: req.user.id } });
        if (account) {
            account = await prisma.account.update({
                where: { id: account.id },
                data: { name: companyName.trim(), status: 'active', ownerName: 'Owner' },
            });
        } else {
            account = await prisma.account.create({
                data: {
                    tenantId: req.user.tenantId || req.user.id,
                    name: companyName.trim(),
                    status: 'active',
                    ownerName: 'Owner',
                    createdById: req.user.id,
                },
            });
        }
        res.json({ success: true, account: { id: account.id, name: account.name } });
    } catch (err) {
        console.error('workspace error:', err);
        res.status(500).json({ message: err?.message || 'Server Error' });
    }
});

// @route   GET api/admin/workspace/my
// @desc    Get current user's workspace (Account)
// @access  Private (Owner/Admin)
router.get('/workspace/my', auth, async (req, res) => {
    try {
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const account = await prisma.account.findFirst({ where: { createdById: req.user.id } });
        if (!account) {
            return res.json(null);
        }
        res.json({ id: account.id, name: account.name });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/data/summary
// @desc    Data Management summary metrics
// @access  Private (Admin/Owner)
router.get('/data/summary', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const now = new Date();
    const cutoff90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const cutoff6m = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const [contacts, accounts] = await Promise.all([
      prisma.contact.findMany({ select: { email: true } }),
      prisma.account.findMany({ select: { name: true } }),
    ]);
    const dupCount = (arr, key) => {
      const map = new Map();
      for (const it of arr) {
        const k = (it[key] || '').trim().toLowerCase();
        if (!k) continue;
        map.set(k, (map.get(k) || 0) + 1);
      }
      let total = 0;
      for (const [, c] of map) {
        if (c > 1) total += c;
      }
      return total;
    };
    const duplicateRecords = dupCount(contacts, 'email') + dupCount(accounts, 'name');

    const orphanedFiles = await prisma.document.count({
      where: {
        accountId: null,
        linked_entity_id: null,
        linked_entity_model: null,
        userId: null,
        quoteId: null,
        contractId: null,
        invoiceId: null,
        orderId: null,
      },
    });

    const users = await prisma.user.findMany({ select: { id: true, role: true } });
    const userIds = users.filter(u => u.role !== 'CUSTOMER').map(u => u.id);
    let inactiveUsers = 0;
    if (userIds.length) {
      const recent = await prisma.attendance.findMany({
        where: { userId: { in: userIds }, date: { gte: cutoff90 } },
        select: { userId: true },
      });
      const activeSet = new Set(recent.map(r => r.userId));
      for (const id of userIds) {
        if (!activeSet.has(id)) inactiveUsers += 1;
      }
    }

    const oldDrafts = await prisma.quote.count({
      where: { status: 'DRAFT', updatedAt: { lt: cutoff6m } },
    });

    res.json({
      duplicateRecords,
      orphanedFiles,
      inactiveUsers,
      oldDrafts,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/data/cleanup/orphans
// @desc    Delete orphaned documents
// @access  Private (Admin/Owner)
router.post('/data/cleanup/orphans', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const del = await prisma.document.deleteMany({
      where: {
        accountId: null,
        linked_entity_id: null,
        linked_entity_model: null,
        userId: null,
        quoteId: null,
        contractId: null,
        invoiceId: null,
        orderId: null,
      },
    });
    res.json({ deleted: del.count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/data/deactivate-inactive
// @desc    Mark inactive users (no attendance in 90 days) as inactive subscriptionStatus
// @access  Private (Admin/Owner)
router.post('/data/deactivate-inactive', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const cutoff90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const users = await prisma.user.findMany({ select: { id: true, role: true } });
    const targetIds = users.filter(u => u.role !== 'CUSTOMER').map(u => u.id);
    const recent = await prisma.attendance.findMany({
      where: { userId: { in: targetIds }, date: { gte: cutoff90 } },
      select: { userId: true },
    });
    const activeSet = new Set(recent.map(r => r.userId));
    const deactivateIds = targetIds.filter(id => !activeSet.has(id));
    let updated = 0;
    for (const id of deactivateIds) {
      await prisma.user.update({ where: { id }, data: { subscriptionStatus: 'inactive' } });
      updated += 1;
    }
    res.json({ deactivated: updated });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/data/purge-drafts
// @desc    Delete DRAFT quotes older than 6 months
// @access  Private (Admin/Owner)
router.post('/data/purge-drafts', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const cutoff6m = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const del = await prisma.quote.deleteMany({
      where: { status: 'DRAFT', updatedAt: { lt: cutoff6m } },
    });
    res.json({ deleted: del.count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/maintenance/index-optimize
// @desc    Run ANALYZE to optimize query plans
// @access  Private (Admin/Owner)
router.post('/maintenance/index-optimize', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await prisma.$executeRawUnsafe('ANALYZE');
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/maintenance/temp-clean
// @desc    Remove documents without links older than 30 days
// @access  Private (Admin/Owner)
router.post('/maintenance/temp-clean', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const cutoff30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const del = await prisma.document.deleteMany({
      where: {
        accountId: null,
        linked_entity_id: null,
        linked_entity_model: null,
        userId: null,
        quoteId: null,
        contractId: null,
        invoiceId: null,
        orderId: null,
        createdAt: { lt: cutoff30 },
      },
    });
    res.json({ deleted: del.count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/maintenance/audit-archive
// @desc    Delete email logs older than 180 days
// @access  Private (Admin/Owner)
router.post('/maintenance/audit-archive', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const cutoff180 = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const del = await prisma.emailLog.deleteMany({
      where: { sentAt: { lt: cutoff180 } },
    });
    res.json({ deleted: del.count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/data/duplicates
// @desc    Detect duplicate Contacts (by email) and Accounts (by name)
// @access  Private (Admin/Owner)
router.get('/data/duplicates', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const contacts = await prisma.contact.findMany({ select: { id: true, email: true, name: true } });
    const accounts = await prisma.account.findMany({ select: { id: true, name: true } });
    const groupBy = (arr, key) => {
      const map = new Map();
      for (const it of arr) {
        const k = (it[key] || '').trim().toLowerCase();
        if (!k) continue;
        const list = map.get(k) || [];
        list.push(it);
        map.set(k, list);
      }
      return [...map.entries()]
        .filter(([, list]) => list.length > 1)
        .map(([k, list]) => ({
          key: k,
          items: list,
          count: list.length,
        }));
    };
    const contactGroups = groupBy(contacts, 'email');
    const accountGroups = groupBy(accounts, 'name');
    res.json({
      contacts: contactGroups,
      accounts: accountGroups,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/data/merge
// @desc    Merge duplicates into a target record and delete others
// @access  Private (Admin/Owner)
router.post('/data/merge', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { type, targetId, duplicateIds } = req.body || {};
    if (!type || !['contact', 'account'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type' });
    }
    if (!targetId || !Array.isArray(duplicateIds) || duplicateIds.length === 0) {
      return res.status(400).json({ message: 'targetId and duplicateIds required' });
    }
    const ids = duplicateIds.filter((id) => id && id !== targetId);
    if (ids.length === 0) return res.json({ updated: 0, deleted: 0 });

    if (type === 'contact') {
      for (const id of ids) {
        await prisma.lead.updateMany({ where: { contactId: id }, data: { contactId: targetId } });
        await prisma.opportunity.updateMany({ where: { contactId: id }, data: { contactId: targetId } });
        await prisma.opportunity.updateMany({ where: { primaryContactId: id }, data: { primaryContactId: targetId } });
        await prisma.quote.updateMany({ where: { contactId: id }, data: { contactId: targetId } });
        await prisma.contractSigner.updateMany({ where: { contactId: id }, data: { contactId: targetId } });
        try {
          await prisma.activity.updateMany({ where: { contactId: id }, data: { contactId: targetId } });
        } catch {}
        try {
          await prisma.note.updateMany({ where: { contactId: id }, data: { contactId: targetId } });
        } catch {}
        await prisma.contact.delete({ where: { id } });
      }
      return res.json({ updated: ids.length, deleted: ids.length });
    }

    if (type === 'account') {
      for (const id of ids) {
        await prisma.contact.updateMany({ where: { accountId: id }, data: { accountId: targetId } });
        await prisma.lead.updateMany({ where: { accountId: id }, data: { accountId: targetId } });
        await prisma.opportunity.updateMany({ where: { accountId: id }, data: { accountId: targetId } });
        await prisma.quote.updateMany({ where: { accountId: id }, data: { accountId: targetId } });
        await prisma.eRPOrder.updateMany({ where: { accountId: id }, data: { accountId: targetId } });
        await prisma.invoice.updateMany({ where: { accountId: id }, data: { accountId: targetId } });
        await prisma.document.updateMany({ where: { accountId: id }, data: { accountId: targetId } });
        try {
          await prisma.contract.updateMany({ where: { account_id: id }, data: { account_id: targetId } });
        } catch {}
        try {
          await prisma.creditNote.updateMany({ where: { accountId: id }, data: { accountId: targetId } });
        } catch {}
        await prisma.activity.updateMany({ where: { accountId: id }, data: { accountId: targetId } });
        await prisma.note.updateMany({ where: { accountId: id }, data: { accountId: targetId } });
        await prisma.account.delete({ where: { id } });
      }
      return res.json({ updated: ids.length, deleted: ids.length });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/workflows/metrics
// @desc    Workflow monitoring metrics
// @access  Private (Admin/Owner)
router.get('/workflows/metrics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let stuckWorkflows = 0;
    try {
      const stuckQuotes = await prisma.quote.count({ where: { status: 'APPROVAL_PENDING', updatedAt: { lt: sevenDaysAgo } } });
      const stuckSign = await prisma.signingSession.count({ where: { status: 'sent', createdAt: { lt: sevenDaysAgo } } });
      const stuckOpps = await prisma.opportunity.count({ where: { updatedAt: { lt: sevenDaysAgo } } });
      stuckWorkflows = (stuckQuotes || 0) + (stuckSign || 0) + (stuckOpps || 0);
    } catch {}

    let pendingApprovals = 0;
    try {
      pendingApprovals = await prisma.quoteApproval.count({ where: { status: 'PENDING' } });
    } catch {}

    let avgCompletionTimeDays = 0;
    try {
      const accepted = await prisma.quote.findMany({ where: { status: 'ACCEPTED', updatedAt: { gte: thirtyDaysAgo } }, select: { createdAt: true, updatedAt: true } });
      if (accepted.length) {
        const sumMs = accepted.reduce((acc, q) => acc + (new Date(q.updatedAt).getTime() - new Date(q.createdAt).getTime()), 0);
        avgCompletionTimeDays = Math.round((sumMs / accepted.length) / (24 * 60 * 60 * 1000) * 10) / 10;
      }
    } catch {}

    let activeProcesses = 0;
    try {
      const activeQuotes = await prisma.quote.count({ where: { status: { in: ['SENT', 'APPROVAL_PENDING'] } } });
      const activeSign = await prisma.signingSession.count({ where: { status: 'sent' } });
      const activeContracts = await prisma.contract.count({ where: { status: 'active' } });
      const recentOpps = await prisma.opportunity.count({ where: { updatedAt: { gte: sevenDaysAgo } } });
      activeProcesses = (activeQuotes || 0) + (activeSign || 0) + (activeContracts || 0) + (recentOpps || 0);
    } catch {}

    res.json({
      stuckWorkflows,
      pendingApprovals,
      avgCompletionTimeDays,
      activeProcesses
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/workflows/stalled
// @desc    Stalled & critical items list
// @access  Private (Admin/Owner)
router.get('/workflows/stalled', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const list = [];
    try {
      const quotes = await prisma.quote.findMany({
        where: { status: 'APPROVAL_PENDING', updatedAt: { lt: sevenDaysAgo } },
        select: { id: true, quoteNumber: true, createdBy: true, updatedAt: true }
      });
      for (const q of quotes) {
        const days = Math.ceil((now.getTime() - new Date(q.updatedAt).getTime()) / (24 * 60 * 60 * 1000));
        list.push({
          type: 'Quote Approval',
          id: q.id,
          item: q.quoteNumber || q.id,
          owner: q.createdBy || 'unknown',
          stage: 'Approval Pending',
          timeDays: days,
          status: 'Critical'
        });
      }
    } catch {}
    try {
      const sessions = await prisma.signingSession.findMany({
        where: { status: 'sent', createdAt: { lt: sevenDaysAgo } },
        select: { id: true, contractId: true, signerEmail: true, createdAt: true }
      });
      for (const s of sessions) {
        const days = Math.ceil((now.getTime() - new Date(s.createdAt).getTime()) / (24 * 60 * 60 * 1000));
        list.push({
          type: 'Contract Signing',
          id: s.id,
          item: s.contractId,
          owner: s.signerEmail || 'customer',
          stage: 'Customer Sign',
          timeDays: days,
          status: days > 10 ? 'Critical' : 'Warning'
        });
      }
    } catch {}
    try {
      const leads = await prisma.lead.findMany({
        where: { status: 'New', updatedAt: { lt: fiveDaysAgo } },
        select: { id: true, company: true, ownerName: true, updatedAt: true }
      });
      for (const l of leads) {
        const days = Math.ceil((now.getTime() - new Date(l.updatedAt).getTime()) / (24 * 60 * 60 * 1000));
        list.push({
          type: 'Lead Qual',
          id: l.id,
          item: l.company || l.id,
          owner: l.ownerName || 'owner',
          stage: 'New',
          timeDays: days,
          status: 'Warning'
        });
      }
    } catch {}

    list.sort((a, b) => b.timeDays - a.timeDays);
    res.json(list.slice(0, 25));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/workflows/nudge
// @desc    Nudge owner of an item (logs EmailLog entry)
// @access  Private (Admin/Owner)
router.post('/workflows/nudge', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { type, id } = req.body || {};
    if (!type || !id) return res.status(400).json({ message: 'type and id required' });
    await prisma.emailLog.create({
      data: {
        toEmail: 'system@local',
        subject: `Nudge: ${type} ${id}`,
        templateName: 'nudge',
        status: 'SENT'
      }
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ================================
// Notifications & Templates
// ================================
router.get('/notifications/templates', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    try {
      await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ContractTemplate" (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "tenantId" uuid NOT NULL,
          "name" text NOT NULL,
          "contract_type" text NOT NULL,
          "content" text NOT NULL,
          "version" integer NOT NULL DEFAULT 1,
          "is_active" boolean NOT NULL DEFAULT TRUE,
          created_at timestamptz DEFAULT NOW(),
          updated_at timestamptz DEFAULT NOW()
        )
      `);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS contract_template_id_tenantId ON "ContractTemplate"(id,"tenantId")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS contract_template_tenantId_idx ON "ContractTemplate"("tenantId")`);
    } catch (ensureErr) {
      console.error('templates ensure error:', ensureErr);
    }
    try {
      const rows = await prisma.$queryRawUnsafe(
        `SELECT id, "name", "version", "is_active", updated_at FROM "ContractTemplate" WHERE "tenantId" = $1 ORDER BY updated_at DESC`,
        req.user.id
      );
      res.json(rows || []);
    } catch (listErr) {
      console.error('templates list error:', listErr);
      res.json([]);
    }
  } catch (err) {
    console.error('templates list outer error:', err);
    res.json([]);
  }
});

router.get('/notifications/templates/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    try {
      await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ContractTemplate" (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "tenantId" uuid NOT NULL,
          "name" text NOT NULL,
          "contract_type" text NOT NULL,
          "content" text NOT NULL,
          "version" integer NOT NULL DEFAULT 1,
          "is_active" boolean NOT NULL DEFAULT TRUE,
          created_at timestamptz DEFAULT NOW(),
          updated_at timestamptz DEFAULT NOW()
        )
      `);
    } catch {}
    try {
      const rows = await prisma.$queryRawUnsafe(
        `SELECT id, "name", "content", "version", "is_active", updated_at FROM "ContractTemplate" WHERE id = $1 AND "tenantId" = $2 LIMIT 1`,
        req.params.id, req.user.id
      );
      if (!rows || rows.length === 0) return res.status(404).json({ message: 'Template not found' });
      const t = rows[0];
      let subject = '';
      let html = t.content;
      try {
        const parsed = JSON.parse(t.content);
        subject = parsed.subject || '';
        html = parsed.html || t.content;
      } catch {}
      return res.json({ id: t.id, name: t.name, subject, html, version: t.version, is_active: t.is_active, updated_at: t.updated_at });
    } catch (errInner) {
      console.error('template detail error:', errInner);
      return res.status(500).json({ message: errInner.message || 'Error' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/notifications/templates', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { name, subject, html } = req.body || {};
    if (!name || !subject || !html) return res.status(400).json({ message: 'name, subject, html required' });
    try {
      await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ContractTemplate" (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "tenantId" uuid NOT NULL,
          "name" text NOT NULL,
          "contract_type" text NOT NULL,
          "content" text NOT NULL,
          "version" integer NOT NULL DEFAULT 1,
          "is_active" boolean NOT NULL DEFAULT TRUE,
          created_at timestamptz DEFAULT NOW(),
          updated_at timestamptz DEFAULT NOW()
        )
      `);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS contract_template_id_tenantId ON "ContractTemplate"(id,"tenantId")`);
    } catch {}
    try {
      const created = await prisma.contractTemplate.create({
        data: {
          tenantId: req.user.id,
          name,
          contract_type: 'EMAIL',
          content: JSON.stringify({ subject, html }),
          version: 1,
          is_active: true
        }
      });
      return res.status(201).json({ id: created.id });
    } catch (ormErr) {
      try {
        const rows = await prisma.$queryRawUnsafe(
          `INSERT INTO "ContractTemplate" ("tenantId","name","contract_type","content","version","is_active") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
          req.user.id, name, 'EMAIL', JSON.stringify({ subject, html }), 1, true
        );
        const id = rows && rows[0] ? rows[0].id : null;
        return res.status(201).json({ id });
      } catch (sqlErr) {
        return res.status(500).json({ message: sqlErr.message || 'Create failed' });
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/notifications/templates/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { name, subject, html, is_active } = req.body || {};
    const t = await prisma.contractTemplate.findFirst({ where: { id: req.params.id, tenantId: req.user.id, contract_type: 'EMAIL' } });
    if (!t) return res.status(404).json({ message: 'Template not found' });
    const updated = await prisma.contractTemplate.update({
      where: { contract_template_id_tenantId: { id: t.id, tenantId: req.user.id } },
      data: {
        name: name ?? t.name,
        content: subject && html ? JSON.stringify({ subject, html }) : t.content,
        is_active: typeof is_active === 'boolean' ? is_active : t.is_active,
        version: (t.version || 1) + 1
      }
    });
    res.json({ id: updated.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/notifications/templates/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await prisma.contractTemplate.delete({ where: { contract_template_id_tenantId: { id: req.params.id, tenantId: req.user.id } } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/notifications/send-test', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const sendEmail = require('../utils/sendEmail');
    const { toEmail, subject, html } = req.body || {};
    const email = (toEmail || req.user.email || process.env.SMTP_EMAIL);
    if (!email) return res.status(400).json({ message: 'No recipient email configured' });
    await sendEmail({ email, subject: subject || 'Test Email', message: 'Test email', html: html || '<p>Test</p>' });
    try {
    try {
      await prisma.notificationDeliveryLog.create({
        data: {
          tenantId: req.user.id,
          recipient: email,
          subject: subject || 'Test Email',
          templateId: null,
          status: 'SENT'
        }
      });
    } catch {}
      await prisma.emailLog.create({
        data: {
          tenantId: req.user.id,
          toEmail: email,
          subject: subject || 'Test Email',
          templateName: 'custom',
          status: 'SENT'
        }
      });
    } catch {}
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/notifications/triggers', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const planName = req.user.subscriptionPlan || 'Default';
    let plan = await prisma.plan.findFirst({ where: { name: planName } });
    if (!plan) {
      plan = await prisma.plan.create({ data: { name: planName, priceMonthly: 0, priceYearly: 0, limits: {} } });
    }
    const limits = (plan.limits || {});
    const triggers = limits.notifications || {
      newLeadAssigned: { email: true, inApp: true },
      quoteApproved: { email: true, inApp: true },
      contractExpiring: { email: true, inApp: false },
      systemMaintenance: { email: false, inApp: true }
    };
    res.json(triggers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/notifications/triggers', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const planName = req.user.subscriptionPlan || 'Default';
    let plan = await prisma.plan.findFirst({ where: { name: planName } });
    if (!plan) {
      plan = await prisma.plan.create({ data: { name: planName, priceMonthly: 0, priceYearly: 0, limits: {} } });
    }
    const limits = (plan.limits || {});
    limits.notifications = req.body || limits.notifications || {};
    await prisma.plan.update({ where: { id: plan.id }, data: { limits } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
// Validate template placeholders and basic requirements
router.post('/notifications/templates/validate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { subject, html } = req.body || {};
    if (!subject || !html) {
      return res.status(400).json({ message: 'subject and html required' });
    }
    const placeholderRegex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    const found = new Set();
    let m;
    while ((m = placeholderRegex.exec(subject)) !== null) {
      found.add(m[0]);
    }
    while ((m = placeholderRegex.exec(html)) !== null) {
      found.add(m[0]);
    }
    const placeholders = Array.from(found);
    res.json({ ok: true, placeholders, count: placeholders.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
router.post('/notifications/bootstrap', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const defaults = [
      { key: 'newLeadAssigned', name: 'New Lead Assigned', subject: 'New lead assigned to {{user_name}}', html: '<p>Hello {{user_name}},</p><p>You have a new lead assigned.</p><p><a href="{{cta_url}}">Open Lead</a></p>' },
      { key: 'quoteApproved', name: 'Quote Approved', subject: 'Quote {{quote_number}} approved', html: '<p>Your quote {{quote_number}} has been approved.</p><p><a href="{{cta_url}}">View Quote</a></p>' },
      { key: 'contractExpiring', name: 'Contract Expiring', subject: 'Contract {{contract_number}} expiring soon', html: '<p>Contract {{contract_number}} is expiring soon.</p><p><a href="{{cta_url}}">Review Contract</a></p>' },
      { key: 'systemMaintenance', name: 'System Maintenance', subject: '{{company_name}} system maintenance notice', html: '<p>Scheduled maintenance is coming up.</p><p><a href="{{cta_url}}">Learn More</a></p>' }
    ];
    const createdMap = {};
    for (const d of defaults) {
      let tId = null;
      if (prisma.contractTemplate && prisma.contractTemplate.findFirst) {
        const t = await prisma.contractTemplate.findFirst({ where: { tenantId: req.user.id, name: d.name } });
        if (!t) {
          const created = await prisma.contractTemplate.create({
            data: {
              tenantId: req.user.id,
              name: d.name,
              contract_type: 'EMAIL',
              content: JSON.stringify({ subject: d.subject, html: d.html }),
              version: 1,
              is_active: true
            }
          });
          tId = created.id;
        } else {
          tId = t.id;
        }
      } else {
        const existing = await prisma.$queryRawUnsafe(`SELECT id FROM "ContractTemplate" WHERE "tenantId" = $1 AND "name" = $2 LIMIT 1`, req.user.id, d.name);
        if (existing && existing.length > 0) {
          tId = existing[0].id;
        } else {
          const inserted = await prisma.$queryRawUnsafe(
            `INSERT INTO "ContractTemplate" ("tenantId","name","contract_type","content","version","is_active") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
            req.user.id, d.name, 'EMAIL', JSON.stringify({ subject: d.subject, html: d.html }), 1, true
          );
          tId = inserted && inserted[0] ? inserted[0].id : null;
        }
      }
      createdMap[d.key] = tId;
    }
    const planName = req.user.subscriptionPlan || 'Default';
    let plan = null;
    if (prisma.plan && prisma.plan.findFirst) {
      plan = await prisma.plan.findFirst({ where: { name: planName } });
      if (!plan) {
        plan = await prisma.plan.create({ data: { name: planName, priceMonthly: 0, priceYearly: 0, limits: {} } });
      }
    } else {
      const found = await prisma.$queryRawUnsafe(`SELECT id, limits FROM "Plan" WHERE "name" = $1 LIMIT 1`, planName);
      if (found && found.length > 0) {
        plan = found[0];
      } else {
        const created = await prisma.$queryRawUnsafe(
          `INSERT INTO "Plan" ("name","priceMonthly","priceYearly","currency","active","limits") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, limits`,
          planName, 0, 0, 'USD', true, {}
        );
        plan = created && created[0] ? created[0] : null;
      }
    }
    const notifications = {
      newLeadAssigned: { email: true, inApp: true, templateId: createdMap['newLeadAssigned'] },
      quoteApproved: { email: true, inApp: true, templateId: createdMap['quoteApproved'] },
      contractExpiring: { email: true, inApp: true, templateId: createdMap['contractExpiring'] },
      systemMaintenance: { email: true, inApp: true, templateId: createdMap['systemMaintenance'] }
    };
    if (prisma.plan && prisma.plan.update) {
      const limits = plan.limits || {};
      limits.notifications = notifications;
      await prisma.plan.update({ where: { id: plan.id }, data: { limits } });
    } else {
      const limits = (plan.limits || {});
      limits.notifications = notifications;
      await prisma.$executeRawUnsafe(`UPDATE "Plan" SET "limits" = $1 WHERE "name" = $2`, limits, planName);
    }
    res.json({ success: true, templates: createdMap, notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/notifications/triggers/enable-all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const planName = req.user.subscriptionPlan || 'Default';
    let plan = await prisma.plan.findFirst({ where: { name: planName } });
    if (!plan) {
      plan = await prisma.plan.create({ data: { name: planName, priceMonthly: 0, priceYearly: 0, limits: {} } });
    }
    const limits = plan.limits || {};
    const keys = ['newLeadAssigned','quoteApproved','contractExpiring','systemMaintenance'];
    limits.notifications = limits.notifications || {};
    for (const k of keys) {
      const curr = limits.notifications[k] || {};
      limits.notifications[k] = { ...curr, email: true, inApp: true };
    }
    await prisma.plan.update({ where: { id: plan.id }, data: { limits } });
    res.json({ success: true, notifications: limits.notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/notifications/send-test-mapped', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const sendEmail = require('../utils/sendEmail');
    const planName = req.user.subscriptionPlan || 'Default';
    const plan = await prisma.plan.findFirst({ where: { name: planName } });
    const limits = plan?.limits || {};
    const notifications = limits.notifications || {};
    const email = req.user.email || process.env.SMTP_EMAIL;
    if (!email) return res.status(400).json({ message: 'No recipient email configured' });
    const keys = Object.keys(notifications);
    let count = 0;
    for (const k of keys) {
      const tplId = notifications[k]?.templateId;
      if (!tplId) continue;
      const t = await prisma.contractTemplate.findFirst({ where: { id: tplId, tenantId: req.user.id } });
      if (!t) continue;
      let subject = 'Test';
      let html = t.content;
      try {
        const parsed = JSON.parse(t.content);
        subject = parsed.subject || subject;
        html = parsed.html || html;
      } catch {}
      await sendEmail({ email, subject: `[Test] ${subject}`, message: 'Test', html });
      try {
        await prisma.emailLog.create({
          data: { tenantId: req.user.id, toEmail: email, subject: `[Test] ${subject}`, templateName: t.name, status: 'SENT' }
        });
      } catch {}
      count++;
    }
    res.json({ success: true, sent: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;

// Notification Rules CRUD (tenant-scoped)
router.get('/notifications/rules', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const rules = await prisma.notificationRule.findMany({ where: { tenantId: req.user.id }, orderBy: { createdAt: 'desc' } });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/notifications/rules', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { eventType, templateId, isEnabled } = req.body || {};
    if (!eventType) return res.status(400).json({ message: 'eventType required' });
    const created = await prisma.notificationRule.create({
      data: {
        tenantId: req.user.id,
        eventType,
        templateId: templateId || null,
        isEnabled: typeof isEnabled === 'boolean' ? isEnabled : true,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/notifications/rules/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { id } = req.params;
    const rule = await prisma.notificationRule.findFirst({ where: { id, tenantId: req.user.id } });
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    const { eventType, templateId, isEnabled } = req.body || {};
    const updated = await prisma.notificationRule.update({
      where: { id },
      data: {
        eventType: eventType ?? rule.eventType,
        templateId: typeof templateId !== 'undefined' ? templateId : rule.templateId,
        isEnabled: typeof isEnabled === 'boolean' ? isEnabled : rule.isEnabled,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/notifications/rules/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { id } = req.params;
    const rule = await prisma.notificationRule.findFirst({ where: { id, tenantId: req.user.id } });
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    await prisma.notificationRule.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Notification Delivery Logs (tenant-scoped)
router.get('/notifications/logs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    let logs = [];
    try {
      logs = await prisma.notificationDeliveryLog.findMany({
        where: { tenantId: req.user.id },
        orderBy: { sentAt: 'desc' },
        take: 100,
      });
    } catch {
      // Fallback to EmailLog if NotificationDeliveryLog not yet populated
      logs = await prisma.emailLog.findMany({
        where: { tenantId: req.user.id },
        orderBy: { sentAt: 'desc' },
        take: 100,
      });
      logs = logs.map(l => ({
        id: l.id,
        tenantId: l.tenantId,
        eventType: null,
        recipient: l.toEmail,
        subject: l.subject,
        templateId: null,
        status: l.status,
        error: l.error,
        sentAt: l.sentAt,
      }));
    }
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Integrations: status overview
router.get('/integrations/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    let emailConnected = false;
    let emailDetails = {};
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.replace(/\s+/g, '') : '',
        },
      });
      await transporter.verify();
      emailConnected = true;
      emailDetails = {
        host: process.env.SMTP_HOST || null,
        port: Number(process.env.SMTP_PORT || 587),
        fromEmail: process.env.FROM_EMAIL || process.env.SMTP_EMAIL || null,
        fromName: process.env.FROM_NAME || 'SISWIT',
      };
    } catch (e) {
      emailConnected = false;
      emailDetails = {
        host: process.env.SMTP_HOST || null,
        port: Number(process.env.SMTP_PORT || 587),
        fromEmail: process.env.FROM_EMAIL || process.env.SMTP_EMAIL || null,
        error: 'SMTP verification failed',
      };
    }
    const storageConnected = !!(process.env.S3_BUCKET || process.env.GCS_BUCKET);
    const storageDetails = {
      provider: process.env.S3_BUCKET ? 's3' : (process.env.GCS_BUCKET ? 'gcs' : null),
      bucketName: process.env.S3_BUCKET || process.env.GCS_BUCKET || null,
    };
    const crmSyncConnected = false;
    const crmDetails = {
      provider: null,
      status: 'disabled',
    };
    let publicApiEnabled = false;
    try {
      const setting = await prisma.integrationSetting.findFirst({ where: { tenantId: req.user.id } });
      publicApiEnabled = !!setting?.publicApiEnabled;
    } catch {}
    res.json({
      email: { connected: emailConnected, details: emailDetails },
      storage: { connected: storageConnected, details: storageDetails },
      crmSync: { connected: crmSyncConnected, details: crmDetails },
      developerApi: { enabled: publicApiEnabled }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Integrations: toggle developer API (tenant-scoped)
router.put('/integrations/developer-api', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const enabled = !!req.body?.enabled;
    let setting = await prisma.integrationSetting.findFirst({ where: { tenantId: req.user.id } });
    if (!setting) {
      setting = await prisma.integrationSetting.create({
        data: { tenantId: req.user.id, publicApiEnabled: enabled }
      });
    } else {
      setting = await prisma.integrationSetting.update({
        where: { id: setting.id },
        data: { publicApiEnabled: enabled }
      });
    }
    res.json({ developerApi: { enabled: setting.publicApiEnabled } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
