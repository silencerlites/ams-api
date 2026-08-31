export function accountApprovedTemplate({
  firstName,
  loginUrl
}) {
  return {
    subject:
      'Your SRJJ AMS account has been approved',

    text: `
Hello ${firstName},

Your SRJJ AMS account has been approved.

Login:
${loginUrl}

SRJJ AMS
`.trim(),

    html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;">
  <h2>Account Approved</h2>

  <p>Hello ${firstName},</p>

  <p>
    Your SRJJ AMS account has been approved
    and activated.
  </p>

  <p>
    <a href="${loginUrl}">
      Sign in to SRJJ AMS
    </a>
  </p>
</body>
</html>
`
  };
}