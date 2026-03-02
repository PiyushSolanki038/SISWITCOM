const { prisma } = require('../prismaClient');

async function main() {
  console.log('--- Multi-Tenancy Verification Script ---');
  const ts = Date.now();
  const ownerAEmail = `ownerA+${ts}@sirius.com`;
  const ownerBEmail = `ownerB+${ts}@sirius.com`;

  // 1) Signup Owner A (workspace A)
  const ownerA = await prisma.user.create({
    data: { email: ownerAEmail, role: 'OWNER', firstName: 'OwnerA' }
  });
  await prisma.user.update({ where: { id: ownerA.id }, data: { tenantId: ownerA.id } });
  console.log('Owner A created:', ownerA.id);

  // Create Account, Quote, Contract under Tenant A
  const accountA = await prisma.account.create({
    data: { tenantId: ownerA.id, name: 'Workspace A Co', createdById: ownerA.id, status: 'active' }
  });
  const quoteA = await prisma.quote.create({
    data: { tenantId: ownerA.id, status: 'DRAFT', accountId: accountA.id, currency: 'USD' }
  });
  const contractA = await prisma.contract.create({
    data: { tenantId: ownerA.id, name: 'MSA A', account_id: accountA.id, quote_id: quoteA.id, status: 'draft' }
  });
  console.log('Tenant A data:', { accountId: accountA.id, quoteId: quoteA.id, contractId: contractA.id });

  // 2) Signup Owner B (workspace B) - empty workspace
  const ownerB = await prisma.user.create({
    data: { email: ownerBEmail, role: 'OWNER', firstName: 'OwnerB' }
  });
  await prisma.user.update({ where: { id: ownerB.id }, data: { tenantId: ownerB.id } });
  console.log('Owner B created:', ownerB.id);

  // 3) Verify isolation: Owner B sees no data from A
  const bAccounts = await prisma.account.findMany({ where: { tenantId: ownerB.id } });
  const bQuotes = await prisma.quote.findMany({ where: { tenantId: ownerB.id } });
  const bContracts = await prisma.contract.findMany({ where: { tenantId: ownerB.id } });

  const isolationOK = bAccounts.length === 0 && bQuotes.length === 0 && bContracts.length === 0;
  console.log('Isolation check:', isolationOK ? 'PASS' : 'FAIL', { bAccounts: bAccounts.length, bQuotes: bQuotes.length, bContracts: bContracts.length });

  // Cleanup created data (optional for dev) - comment out if you want to keep
  // await prisma.contract.delete({ where: { id: contractA.id } });
  // await prisma.quote.delete({ where: { id: quoteA.id } });
  // await prisma.account.delete({ where: { id: accountA.id } });
  // await prisma.user.delete({ where: { id: ownerA.id } });
  // await prisma.user.delete({ where: { id: ownerB.id } });
}

main().then(() => {
  console.log('Verification done');
  process.exit(0);
}).catch(err => {
  console.error('Verification error', err);
  process.exit(1);
});
