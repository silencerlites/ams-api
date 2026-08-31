export function welcomeTemplate({
  firstName,
  businessName,
  tin,
  portalUrl
}) {
  return {
    subject:
      'Welcome to SRJJ Accounting Services',

    text: `
Welcome aboard, ${firstName}!

We're glad to have ${businessName} with SRJJ Accounting Services.

Your client portal is ready — you can now track bookkeeping, BIR filings, payroll and billing in one place.

Business Name:
${businessName}

TIN:
${tin}

Portal Access:
TIN + 6-digit authenticator code

Sign in using your 12-digit TIN and the 6-digit code from your authenticator app.

Client Portal:
${portalUrl}

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
    Welcome to SRJJ Accounting Services
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
                padding:32px 30px 28px 30px;
              "
            >

              <h1
                style="
                  margin:0 0 18px 0;
                  font-size:23px;
                  line-height:1.3;
                  font-weight:700;
                  color:#111827;
                "
              >
                Welcome aboard, ${firstName}!
              </h1>


              <p
                style="
                  margin:0 0 17px 0;
                  font-size:15px;
                  line-height:1.65;
                  color:#374151;
                "
              >
                We're glad to have

                <strong style="color:#111827;">
                  ${businessName}
                </strong>

                with SRJJ Accounting Services.
                Your client portal is ready — you can now track
                bookkeeping, BIR filings, payroll and billing
                in one place.
              </p>


              <!-- ACCOUNT INFORMATION -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  width:100%;
                  margin:0 0 22px 0;
                  border:1px solid #d1d5db;
                  border-radius:10px;
                  border-collapse:separate;
                  border-spacing:0;
                  overflow:hidden;
                "
              >

                <!-- BUSINESS NAME -->
                <tr>

                  <td
                    width="34%"
                    style="
                      padding:12px 16px;
                      background:#f9fafb;
                      border-bottom:1px solid #e5e7eb;
                      color:#6b7280;
                      font-size:12px;
                      line-height:1.4;
                    "
                  >
                    Business Name
                  </td>

                  <td
                    align="right"
                    style="
                      padding:12px 16px;
                      background:#ffffff;
                      border-bottom:1px solid #e5e7eb;
                      color:#111827;
                      font-size:13px;
                      line-height:1.4;
                      font-weight:700;
                    "
                  >
                    ${businessName}
                  </td>

                </tr>


                <!-- TIN -->
                <tr>

                  <td
                    width="34%"
                    style="
                      padding:12px 16px;
                      background:#ffffff;
                      border-bottom:1px solid #e5e7eb;
                      color:#6b7280;
                      font-size:12px;
                      line-height:1.4;
                    "
                  >
                    TIN
                  </td>

                  <td
                    align="right"
                    style="
                      padding:12px 16px;
                      background:#ffffff;
                      border-bottom:1px solid #e5e7eb;
                      color:#111827;
                      font-size:13px;
                      line-height:1.4;
                      font-weight:700;
                    "
                  >
                    ${tin}
                  </td>

                </tr>


                <!-- PORTAL ACCESS -->
                <tr>

                  <td
                    width="34%"
                    style="
                      padding:12px 16px;
                      background:#f9fafb;
                      color:#6b7280;
                      font-size:12px;
                      line-height:1.4;
                    "
                  >
                    Portal Access
                  </td>

                  <td
                    align="right"
                    style="
                      padding:12px 16px;
                      background:#ffffff;
                      color:#111827;
                      font-size:13px;
                      line-height:1.4;
                      font-weight:700;
                    "
                  >
                    TIN + 6-digit authenticator code
                  </td>

                </tr>

              </table>


              <!-- LOGIN INSTRUCTIONS -->
              <p
                style="
                  margin:0 0 17px 0;
                  font-size:15px;
                  line-height:1.6;
                  color:#374151;
                "
              >
                Sign in using your 12-digit TIN and the
                6-digit code from your authenticator app.
              </p>


              <!-- BUTTON -->
              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin:0;
                "
              >
                <tr>
                  <td
                    align="center"
                    bgcolor="#155d32"
                    style="
                      border-radius:8px;
                    "
                  >

                    <a
                      href="${portalUrl}"
                      target="_blank"
                      style="
                        display:inline-block;
                        background:#155d32;
                        color:#ffffff;
                        font-size:14px;
                        line-height:1;
                        font-weight:700;
                        text-decoration:none;
                        padding:14px 24px;
                        border-radius:8px;
                      "
                    >
                      Go to Client Portal
                    </a>

                  </td>
                </tr>
              </table>

            </td>
          </tr>


          <!-- FOOTER -->
          <tr>
            <td
              style="
                background:#f9fafb;
                border-top:1px solid #e5e7eb;
                padding:22px 30px 27px 30px;
              "
            >

              <p
                style="
                  margin:0 0 4px 0;
                  font-size:12px;
                  line-height:1.4;
                  color:#6b7280;
                "
              >
                SRJJ Accounting Services · Philippines
              </p>


              <p
                style="
                  margin:0 0 4px 0;
                  font-size:12px;
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
                  font-size:12px;
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