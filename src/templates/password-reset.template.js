export function passwordResetTemplate({
  firstName,
  resetUrl,
  ipAddress = 'Unknown',
  device = 'Unknown',
  expiresMinutes = 10
}) {
  return {
    subject:
      'Reset your SRJJ Accounting Services password',

    text: `
PASSWORD RESET

Reset your password

Hi ${firstName},

We received a request to reset your password.

Reset your password:
${resetUrl}

Request details:
Requested from IP: ${ipAddress}
Device: ${device}

This link expires in ${expiresMinutes} minutes and can only be used once.

If you didn't request a password reset, you can safely ignore this email.

SRJJ Accounting Services
Philippines

Questions? Email support@srjj.ph
This is an automated message. Please do not reply directly.
`.trim(),

    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    Reset your password
  </title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f3f4f6;
    font-family:Arial, Helvetica, sans-serif;
    color:#111827;
  "
>

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      width:100%;
      background:#f3f4f6;
      padding:30px 16px 40px 16px;
    "
  >
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            max-width:600px;
            background:#ffffff;
            border-radius:10px;
            overflow:hidden;
            box-shadow:0 1px 3px rgba(0,0,0,0.12);
          "
        >

          <!-- HEADER -->
          <tr>
            <td
              style="
                background:#155d32;
                padding:27px 30px;
              "
            >

              <span
                style="
                  color:#ffffff;
                  font-size:18px;
                  line-height:1.2;
                  font-weight:700;
                "
              >
                SRJJ
              </span>

              <span
                style="
                  color:#f97316;
                  font-size:18px;
                  line-height:1.2;
                  font-weight:700;
                "
              >
                Accounting Services
              </span>

            </td>
          </tr>


          <!-- BODY -->
          <tr>
            <td
              style="
                background:#ffffff;
                padding:27px 27px 38px 27px;
              "
            >

              <!-- BADGE -->
              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin:0 0 14px 0;
                "
              >
                <tr>
                  <td
                    style="
                      background:#fef3c7;
                      color:#92400e;
                      padding:5px 10px;
                      border-radius:20px;
                      font-size:10px;
                      line-height:1;
                      font-weight:700;
                    "
                  >
                    PASSWORD RESET
                  </td>
                </tr>
              </table>


              <!-- TITLE -->
              <h1
                style="
                  margin:0 0 14px 0;
                  font-size:19px;
                  line-height:1.3;
                  font-weight:700;
                  color:#111827;
                "
              >
                Reset your password
              </h1>


              <!-- INTRO -->
              <p
                style="
                  margin:0 0 16px 0;
                  font-size:13px;
                  line-height:1.6;
                  color:#374151;
                "
              >
                Hi ${firstName}, we received a request to reset your
                password. Click the button below to choose a new password.
              </p>


              <!-- RESET BUTTON -->
              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                border="0"
                align="center"
                style="
                  margin:14px auto 16px auto;
                "
              >
                <tr>
                  <td
                    align="center"
                    bgcolor="#f97316"
                    style="
                      border-radius:8px;
                    "
                  >
                    <a
                      href="${resetUrl}"
                      target="_blank"
                      style="
                        display:inline-block;
                        padding:12px 21px;
                        background:#f97316;
                        color:#ffffff;
                        font-size:12px;
                        line-height:1;
                        font-weight:700;
                        text-decoration:none;
                        border-radius:8px;
                      "
                    >
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>


              <!-- FALLBACK URL -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  width:100%;
                  margin:0 0 16px 0;
                "
              >
                <tr>
                  <td
                    style="
                      background:#f9fafb;
                      border:1px solid #d1d5db;
                      border-radius:8px;
                      padding:12px;
                    "
                  >

                    <p
                      style="
                        margin:0 0 7px 0;
                        font-size:10px;
                        line-height:1.4;
                        color:#6b7280;
                      "
                    >
                      If the button doesn't work, copy and paste this
                      link into your browser:
                    </p>

                    <a
                      href="${resetUrl}"
                      target="_blank"
                      style="
                        display:block;
                        font-size:10px;
                        line-height:1.5;
                        color:#155d32;
                        text-decoration:underline;
                        word-break:break-all;
                        overflow-wrap:anywhere;
                      "
                    >
                      ${resetUrl}
                    </a>

                  </td>
                </tr>
              </table>


              <!-- REQUEST DETAILS -->
              <p
                style="
                  margin:0 0 6px 0;
                  font-size:12px;
                  line-height:1.4;
                  font-weight:700;
                  color:#111827;
                "
              >
                Request details
              </p>

              <p
                style="
                  margin:0 0 3px 0;
                  font-size:12px;
                  line-height:1.4;
                  color:#374151;
                "
              >
                Requested from IP:
                ${ipAddress}
              </p>

              <p
                style="
                  margin:0 0 3px 0;
                  font-size:12px;
                  line-height:1.4;
                  color:#374151;
                "
              >
                Device:
                ${device}
              </p>

              <p
                style="
                  margin:0 0 16px 0;
                  font-size:12px;
                  line-height:1.4;
                  color:#374151;
                "
              >
                This link expires in
                ${expiresMinutes} minutes
                and can only be used once.
              </p>


              <!-- SECURITY MESSAGE -->
              <p
                style="
                  margin:0;
                  font-size:12px;
                  line-height:1.6;
                  color:#374151;
                "
              >
                If you didn't request a password reset,
                your account is still safe — the link will
                simply expire. For extra peace of mind,
                contact us at

                <a
                  href="mailto:support@srjj.ph"
                  style="
                    color:#155d32;
                    text-decoration:none;
                  "
                >
                  support@srjj.ph
                </a>

                and we can review recent sign-in activity.
              </p>

            </td>
          </tr>


          <!-- FOOTER -->
          <tr>
            <td
              style="
                background:#f9fafb;
                border-top:1px solid #e5e7eb;
                padding:17px 27px 20px 27px;
              "
            >

              <p
                style="
                  margin:0 0 3px 0;
                  font-size:10px;
                  line-height:1.4;
                  color:#6b7280;
                "
              >
                SRJJ Accounting Services · Philippines
              </p>

              <p
                style="
                  margin:0 0 3px 0;
                  font-size:10px;
                  line-height:1.4;
                  color:#6b7280;
                "
              >
                Questions? Email

                <a
                  href="mailto:support@srjj.ph"
                  style="
                    color:#155d32;
                    text-decoration:underline;
                  "
                >
                  support@srjj.ph
                </a>.
              </p>

              <p
                style="
                  margin:0;
                  font-size:10px;
                  line-height:1.4;
                  color:#6b7280;
                "
              >
                This is an automated message.
                Please do not reply directly.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`
  };
}