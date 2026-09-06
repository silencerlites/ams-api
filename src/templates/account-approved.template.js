export function accountApprovedTemplate({
  firstName,
  loginUrl
}) {
  return {
    subject:
      'Your SRJJ AMS account has been approved',

    text: `
Hi ${firstName},

Good news! Your SRJJ AMS account has been approved and activated.

You can now sign in to your account:

${loginUrl}

If you did not create this account, please contact us at support@srjj.ph.

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
    Account Approved
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
                  font-weight:700;
                "
              >
                SRJJ
              </span>

              <span
                style="
                  color:#f97316;
                  font-size:18px;
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
                padding:32px 30px 36px 30px;
                background:#ffffff;
              "
            >

              <!-- STATUS BADGE -->
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
                      background:#dcfce7;
                      color:#166534;
                      padding:5px 10px;
                      border-radius:20px;
                      font-size:10px;
                      line-height:1;
                      font-weight:700;
                    "
                  >
                    ACCOUNT APPROVED
                  </td>
                </tr>
              </table>


              <h1
                style="
                  margin:0 0 16px 0;
                  font-size:23px;
                  line-height:1.3;
                  font-weight:700;
                  color:#111827;
                "
              >
                Your account is ready
              </h1>


              <p
                style="
                  margin:0 0 16px 0;
                  font-size:15px;
                  line-height:1.65;
                  color:#374151;
                "
              >
                Hi ${firstName},
              </p>


              <p
                style="
                  margin:0 0 22px 0;
                  font-size:15px;
                  line-height:1.65;
                  color:#374151;
                "
              >
                Good news! Your
                <strong style="color:#111827;">
                  SRJJ AMS account
                </strong>
                has been approved and activated.
                You can now sign in and access the system.
              </p>


              <!-- BUTTON -->
              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                border="0"
                align="center"
                style="
                  margin:0 auto 24px auto;
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
                      href="${loginUrl}"
                      target="_blank"
                      style="
                        display:inline-block;
                        padding:13px 25px;
                        background:#155d32;
                        color:#ffffff;
                        font-size:14px;
                        line-height:1;
                        font-weight:700;
                        text-decoration:none;
                        border-radius:8px;
                      "
                    >
                      Sign in to SRJJ AMS
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
                  margin:0 0 20px 0;
                "
              >
                <tr>
                  <td
                    style="
                      background:#f9fafb;
                      border:1px solid #d1d5db;
                      border-radius:8px;
                      padding:13px;
                    "
                  >

                    <p
                      style="
                        margin:0 0 7px 0;
                        font-size:11px;
                        line-height:1.4;
                        color:#6b7280;
                      "
                    >
                      If the button doesn't work, copy and paste
                      this link into your browser:
                    </p>

                    <a
                      href="${loginUrl}"
                      target="_blank"
                      style="
                        display:block;
                        font-size:11px;
                        line-height:1.5;
                        color:#155d32;
                        text-decoration:underline;
                        word-break:break-all;
                        overflow-wrap:anywhere;
                      "
                    >
                      ${loginUrl}
                    </a>

                  </td>
                </tr>
              </table>


              <p
                style="
                  margin:0;
                  font-size:13px;
                  line-height:1.6;
                  color:#374151;
                "
              >
                If you did not create this account,
                contact us at

                <a
                  href="mailto:support@srjj.ph"
                  style="
                    color:#155d32;
                    text-decoration:none;
                  "
                >
                  support@srjj.ph
                </a>.
              </p>

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