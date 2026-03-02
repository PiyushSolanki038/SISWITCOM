const getBaseTemplate = (title, bodyContent, opts = {}) => {
  const brandColor = opts.brandColor || process.env.BRAND_COLOR || '#2c3e50';
  const logoUrl = opts.logoUrl || process.env.BRAND_LOGO_URL || '';
  const brandName = (process.env.BRAND_NAME || 'SISWIT');
  const tagline = (process.env.BRAND_TAGLINE || '');
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f7;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      margin-top: 20px;
      margin-bottom: 20px;
    }
    .header {
      background-color: ${brandColor};
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 1px;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 12px;
      opacity: 0.9;
    }
    .logo {
      height: 40px;
      vertical-align: middle;
      margin-right: 8px;
    }
    .content {
      padding: 30px;
      color: #555555;
      line-height: 1.6;
    }
    .content h2 {
      color: #333333;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: ${brandColor};
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      color: #888888;
      font-size: 12px;
      border-top: 1px solid #eeeeee;
    }
    .footer a {
      color: #3498db;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="logo" />` : ''}
      <h1>${brandName}</h1>
      ${tagline ? `<p>${tagline}</p>` : ''}
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SISWIT. All rights reserved.</p>
      <p>This email was sent to you because you are a valued user of our platform.</p>
    </div>
  </div>
</body>
</html>
  `;
};

const getWelcomeEmail = (name, role) => {
  let roleMessage = '';
  let ctaText = 'Get Started';
  let ctaLink = 'http://localhost:5173/login';

  switch(role.toLowerCase()) {
    case 'customer':
      roleMessage = `
        <p>Thank you for joining <strong>SISWIT</strong>! We are delighted to have you as a valued customer.</p>
        <p>Start exploring our latest products and enjoy a seamless service experience tailored just for you.</p>
      `;
      ctaText = 'Start Searching';
      break;
    case 'employee':
      roleMessage = `
        <p>Welcome to the team! You have been successfully registered as an <strong>Employee</strong>.</p>
        <p>Please log in to your dashboard to view your tasks, schedule, and team updates.</p>
      `;
      ctaText = 'Access Employee Dashboard';
      break;
    case 'admin':
      roleMessage = `
        <p>Welcome, Administrator. Your account has been set up with <strong>Admin</strong> privileges.</p>
        <p>You now have full access to manage users, settings, and system configurations. Please ensure you follow security protocols.</p>
      `;
      ctaText = 'Go to Admin Panel';
      break;
    case 'owner':
      roleMessage = `
        <p>Welcome, Owner. Your strategic command center is ready.</p>
        <p>You have full oversight of your business operations, analytics, and management tools.</p>
      `;
      ctaText = 'Manage My Business';
      break;
    default:
      roleMessage = `
        <p>We are thrilled to have you join SISWIT.</p>
        <p>Your account has been successfully created with the role: <strong>${role.charAt(0).toUpperCase() + role.slice(1)}</strong>.</p>
        <p>You can now explore our platform and make the most of our services.</p>
      `;
      break;
  }

  const body = `
    <h2>Welcome, ${name}!</h2>
    ${roleMessage}
    <center>
      <a href="${ctaLink}" class="button">${ctaText}</a>
    </center>
    <p>If you have any questions, feel free to reply to this email.</p>
    <p>Best Regards,<br>The SISWIT Team</p>
  `;
  return getBaseTemplate('Welcome to SISWIT', body);
};

const getLoginNotificationEmail = (name, date) => {
  const body = `
    <h2>New Login Detected</h2>
    <p>Hi ${name},</p>
    <p>We noticed a new login to your SISWIT account on <strong>${date}</strong>.</p>
    <p>If this was you, you can safely ignore this email.</p>
    <p style="color: #e74c3c;"><strong>If you did not log in, please reset your password immediately to secure your account.</strong></p>
    <center>
      <a href="http://localhost:5173/forgot-password" class="button" style="background-color: #e74c3c;">Secure My Account</a>
    </center>
    <p>Best Regards,<br>The SISWIT Team</p>
  `;
  return getBaseTemplate('New Login Alert', body);
};

const getPasswordResetEmail = (name, resetUrl) => {
  const body = `
    <h2>Password Reset Request</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset the password for your SISWIT account.</p>
    <p>Please click the button below to reset your password. This link is valid for <strong>15 minutes</strong>.</p>
    <center>
      <a href="${resetUrl}" class="button">Reset Password</a>
    </center>
    <p>If you didn't request a password reset, you can safely ignore this email.</p>
    <p>Best Regards,<br>The SISWIT Team</p>
  `;
  return getBaseTemplate('Reset Your Password', body);
};

module.exports = {
  getWelcomeEmail,
  getLoginNotificationEmail,
  getPasswordResetEmail,
  getContractApprovalRequestEmail: ({ workspaceName, contractTitle, contractNumber, ctaUrl, expiresAt, brandColor = process.env.BRAND_COLOR, logoUrl = process.env.BRAND_LOGO_URL }) => {
    const body = `
      <h2>Approval Required</h2>
      <p>Workspace: <strong>${workspaceName}</strong></p>
      <p>Contract: <strong>${contractTitle}</strong></p>
      <p>Number: <strong>${contractNumber || 'N/A'}</strong></p>
      <p>This approval request will expire on <strong>${expiresAt ? new Date(expiresAt).toLocaleString() : 'N/A'}</strong>.</p>
      ${ctaUrl ? `<center><a href="${ctaUrl}" class="button">View & Approve</a></center>` : ''}
      <p>Best Regards,<br>The SISWIT Team</p>
    `;
    return getBaseTemplate('Contract Approval Needed', body, { brandColor, logoUrl });
  },
  getContractApprovedEmail: ({ workspaceName, contractTitle, contractNumber, ctaUrl, brandColor = process.env.BRAND_COLOR, logoUrl = process.env.BRAND_LOGO_URL }) => {
    const body = `
      <h2>Contract Approved</h2>
      <p>Workspace: <strong>${workspaceName}</strong></p>
      <p>Contract: <strong>${contractTitle}</strong></p>
      <p>Number: <strong>${contractNumber || 'N/A'}</strong></p>
      ${ctaUrl ? `<center><a href="${ctaUrl}" class="button">View Contract</a></center>` : ''}
      <p>Best Regards,<br>The SISWIT Team</p>
    `;
    return getBaseTemplate('Contract Approved', body, { brandColor, logoUrl });
  },
  getContractRejectedEmail: ({ workspaceName, contractTitle, contractNumber, ctaUrl, reason = '', brandColor = process.env.BRAND_COLOR, logoUrl = process.env.BRAND_LOGO_URL }) => {
    const body = `
      <h2>Contract Rejected</h2>
      <p>Workspace: <strong>${workspaceName}</strong></p>
      <p>Contract: <strong>${contractTitle}</strong></p>
      <p>Number: <strong>${contractNumber || 'N/A'}</strong></p>
      ${reason ? `<div style="background:#f9f9f9;border:1px solid #eee;padding:12px;border-radius:6px;margin:12px 0;"><strong>Reason:</strong> ${reason}</div>` : ''}
      ${ctaUrl ? `<center><a href="${ctaUrl}" class="button">View Contract</a></center>` : ''}
      <p>Best Regards,<br>The SISWIT Team</p>
    `;
    return getBaseTemplate('Contract Rejected', body, { brandColor, logoUrl });
  },
  getSignatureRequestEmail: ({ workspaceName, contractTitle, contractNumber, ctaUrl, expiresAt, brandColor = process.env.BRAND_COLOR, logoUrl = process.env.BRAND_LOGO_URL }) => {
    const body = `
      <h2>Signature Requested</h2>
      <p>Workspace: <strong>${workspaceName}</strong></p>
      <p>Contract: <strong>${contractTitle}</strong></p>
      <p>Number: <strong>${contractNumber || 'N/A'}</strong></p>
      <p>Please review and sign the contract.</p>
      <p>This signing link will expire on <strong>${expiresAt ? new Date(expiresAt).toLocaleString() : 'N/A'}</strong>.</p>
      ${ctaUrl ? `<center><a href="${ctaUrl}" class="button">Open Signing</a></center>` : ''}
      <p>Best Regards,<br>The SISWIT Team</p>
    `;
    return getBaseTemplate('Signature Request', body, { brandColor, logoUrl });
  },
  getContractSignedEmail: ({ workspaceName, contractTitle, contractNumber, ctaUrl, brandColor = process.env.BRAND_COLOR, logoUrl = process.env.BRAND_LOGO_URL }) => {
    const body = `
      <h2>Contract Signed</h2>
      <p>Workspace: <strong>${workspaceName}</strong></p>
      <p>Contract: <strong>${contractTitle}</strong></p>
      <p>Number: <strong>${contractNumber || 'N/A'}</strong></p>
      ${ctaUrl ? `<center><a href="${ctaUrl}" class="button">View Contract</a></center>` : ''}
      <p>Best Regards,<br>The SISWIT Team</p>
    `;
    return getBaseTemplate('Contract Signed', body, { brandColor, logoUrl });
  },
  getLeadOutreachEmail: (name, company, message, opts = {}) => {
    const brandOpts = { brandColor: opts.brandColor, logoUrl: opts.logoUrl };
    const body = `
      <h2>Hi ${name},</h2>
      <p>${message}</p>
      <div style="background:#f4f4f4;padding:15px;border-radius:6px;margin:20px 0;">
        <strong>Topic:</strong> ${company || 'Discussion'}
      </div>
      ${opts.ctaUrl ? `<center><a href="${opts.ctaUrl}" class="button">${opts.ctaText || 'Schedule Meeting'}</a></center>` : ''}
      <p>Best Regards,<br>The SISWIT Team</p>
    `;
    return getBaseTemplate('Follow Up', body, brandOpts);
  },
  getProfessionalOutreachEmail: (params) => {
    const {
      recipientName = '',
      company = '',
      intro = '',
      callToActionText = 'Schedule Meeting',
      callToActionUrl = '',
      senderName = process.env.FROM_NAME || 'SISWIT Team',
      senderRole = process.env.SENDER_ROLE || '',
      senderEmail = process.env.FROM_EMAIL || '',
      senderPhone = process.env.BRAND_CONTACT_PHONE || '',
      brandColor = process.env.BRAND_COLOR,
      logoUrl = process.env.BRAND_LOGO_URL
    } = params || {};
    const signatureLines = [
      senderName,
      senderRole,
      senderEmail,
      senderPhone
    ].filter(Boolean).join('<br>');
    const body = `
      <p style="margin:0 0 14px 0;">Dear ${recipientName || 'Sir/Madam'},</p>
      <p style="margin:0 0 14px 0;">${intro || `I hope you are doing well. I am reaching out to follow up on our discussion regarding ${company || 'your requirements'}.`}</p>
      <p style="margin:0 0 14px 0;">Would you be available for a brief call or meeting this week to explore next steps? Please share a convenient time and preferred channel.</p>
      ${callToActionUrl ? `<center><a href="${callToActionUrl}" class="button">${callToActionText}</a></center>` : ''}
      <div style="margin-top:24px; padding-top:14px; border-top:1px solid #eee; font-size:13px; color:#666;">
        ${signatureLines}
      </div>
    `;
    return getBaseTemplate('Follow Up', body, { brandColor, logoUrl });
  },
  getMeetingRequestNotifyEmail: (params = {}) => {
    const {
      name = '',
      email = '',
      phone = '',
      company = '',
      viewUrl = '',
      brandColor = process.env.BRAND_COLOR,
      logoUrl = process.env.BRAND_LOGO_URL
    } = params;
    const body = `
      <h2>New Meeting Request</h2>
      <p>The recipient has requested to schedule a meeting.</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;">
        <tr><td style="padding:6px;border:1px solid #eee;"><strong>Name</strong></td><td style="padding:6px;border:1px solid #eee;">${name}</td></tr>
        <tr><td style="padding:6px;border:1px solid #eee;"><strong>Email</strong></td><td style="padding:6px;border:1px solid #eee;">${email}</td></tr>
        <tr><td style="padding:6px;border:1px solid #eee;"><strong>Phone</strong></td><td style="padding:6px;border:1px solid #eee;">${phone || 'N/A'}</td></tr>
        <tr><td style="padding:6px;border:1px solid #eee;"><strong>Company</strong></td><td style="padding:6px;border:1px solid #eee;">${company || 'N/A'}</td></tr>
      </table>
      ${viewUrl ? `<center><a href="${viewUrl}" class="button">Open Contact</a></center>` : ''}
      <p style="color:#666;font-size:13px;">Please reply to the recipient to confirm a time.</p>
    `;
    return getBaseTemplate('Meeting Request', body, { brandColor, logoUrl });
  },
  getEmployeeInviteEmail: (companyName, acceptUrl, fullName = '') => {
    const greeting = fullName ? `Dear ${fullName},` : '';
    const body = `
      <h2>You’ve been invited to join ${companyName} on SISWIT</h2>
      ${greeting ? `<p style="margin:0 0 12px 0;">${greeting}</p>` : ''}
      <p style="margin:0 0 12px 0;">Welcome! You’ve been invited to join <strong>${companyName}</strong> on SISWIT as an employee.</p>
      <center>
        <a href="${acceptUrl}" class="button">Accept Invitation</a>
      </center>
      <div style="background:#f9f9f9;border:1px solid #eee;padding:12px;border-radius:6px;margin:12px 0;">
        <strong>Security Notice:</strong> This invitation will expire in <strong>48 hours</strong> and is single‑use. Do not share this link.
      </div>
      <p>If you did not expect this invite, you can safely ignore this email.</p>
      <p>Best Regards,<br>The SISWIT Team</p>
    `;
    return getBaseTemplate('SISWIT Invitation', body);
  },
  getEmployeeInviteText: (companyName, acceptUrl, fullName = '') =>
    `${fullName ? `Hello ${fullName},\n\n` : ''}You’ve been invited to join ${companyName} on SISWIT.\n\nAccept Invitation: ${acceptUrl}\n\nThis invitation expires in 48 hours and is single-use.\n\nBest Regards,\nSISWIT Team`,
  getAdminInviteEmail: ({ acceptUrl, fullName = '' } = {}) => {
    const greeting = fullName ? `Dear ${fullName},` : 'Dear Admin,';
    const body = `
      <h2>Admin Invitation</h2>
      <p style="margin:0 0 12px 0;">${greeting}</p>
      <p style="margin:0 0 12px 0;">You have been invited to join <strong>SISWIT</strong> with <strong>Admin</strong> privileges. Use the button below to accept your invitation and set up access.</p>
      <center>
        <a href="${acceptUrl}" class="button">Accept Invitation</a>
      </center>
      <div style="background:#f9f9f9;border:1px solid #eee;padding:12px;border-radius:6px;margin:12px 0;">
        <strong>Security Notice:</strong> This invitation expires in <strong>48 hours</strong> and is single‑use. Do not share this link.
      </div>
      <p style="margin:0 0 12px 0;">If you were not expecting this invitation, please ignore this email.</p>
      <p>Best Regards,<br>The SISWIT Team</p>
    `;
    return getBaseTemplate('SISWIT Admin Invitation', body);
  },
  getAdminInviteText: (acceptUrl) =>
    `You’ve been invited to become an Admin on SISWIT.\nAccept Invitation: ${acceptUrl}\nThis invitation expires in 48 hours and is single-use.`,
  getQuoteApprovalSubmittedEmail: ({ workspaceName, quoteNumber, customerName, currency = 'USD', grandTotal = 0, discountTotal = 0, items = [], brandColor = process.env.BRAND_COLOR, logoUrl = process.env.BRAND_LOGO_URL }) => {
    const itemsRows = (Array.isArray(items) ? items : []).slice(0, 10).map(it => {
      const qty = Number(it.quantity || 0);
      const up = Number(it.unitPrice || 0).toLocaleString();
      const disc = Number(it.discount || 0);
      const total = Number(it.total || 0).toLocaleString();
      return `<tr>
        <td style="padding:8px;border:1px solid #eee;">${qty}</td>
        <td style="padding:8px;border:1px solid #eee;">${currency} ${up}</td>
        <td style="padding:8px;border:1px solid #eee;">${disc}%</td>
        <td style="padding:8px;border:1px solid #eee;">${currency} ${total}</td>
      </tr>`;
    }).join('');
    const body = `
      <h2>Approval Request Submitted</h2>
      <p>Your quote approval request has been sent.</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;">
        <tr><td style="padding:8px;border:1px solid #eee;"><strong>Quote #</strong></td><td style="padding:8px;border:1px solid #eee;">${quoteNumber || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;"><strong>Customer</strong></td><td style="padding:8px;border:1px solid #eee;">${customerName || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;"><strong>Total</strong></td><td style="padding:8px;border:1px solid #eee;">${currency} ${Number(grandTotal || 0).toLocaleString()}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;"><strong>Discount</strong></td><td style="padding:8px;border:1px solid #eee;">${currency} ${Number(discountTotal || 0).toLocaleString()}</td></tr>
      </table>
      ${itemsRows ? `
      <p><strong>Items</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;">
        <tr>
          <th style="padding:8px;border:1px solid #eee;text-align:left;">Qty</th>
          <th style="padding:8px;border:1px solid #eee;text-align:left;">Unit Price</th>
          <th style="padding:8px;border:1px solid #eee;text-align:left;">Discount</th>
          <th style="padding:8px;border:1px solid #eee;text-align:left;">Line Total</th>
        </tr>
        ${itemsRows}
      </table>` : ''}
      <p style="color:#64748B">You will receive an email once it is approved or rejected.</p>
    `;
    return getBaseTemplate('Quote Approval Submitted', body, { brandColor, logoUrl });
  },
  getQuoteApprovalRequestEmail: ({ workspaceName, quoteNumber, customerName, currency = 'USD', grandTotal = 0, brandColor = process.env.BRAND_COLOR, logoUrl = process.env.BRAND_LOGO_URL }) => {
    const body = `
      <h2>Quote Approval Needed</h2>
      <p>A quote requires your approval.</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;">
        <tr><td style="padding:8px;border:1px solid #eee;"><strong>Quote #</strong></td><td style="padding:8px;border:1px solid #eee;">${quoteNumber || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;"><strong>Customer</strong></td><td style="padding:8px;border:1px solid #eee;">${customerName || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;"><strong>Total</strong></td><td style="padding:8px;border:1px solid #eee;">${currency} ${Number(grandTotal || 0).toLocaleString()}</td></tr>
      </table>
      <p style="color:#64748B">You can review and approve this quote in your dashboard.</p>
    `;
    return getBaseTemplate('Quote Approval Needed', body, { brandColor, logoUrl });
  }
};
