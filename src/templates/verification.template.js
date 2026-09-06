export function verificationTemplate({
  firstName,
  verificationUrl,
  expiresMinutes = 10
}) {
  return {
    subject:
      'Verify your SRJJ Accounting Services email address',

    text: `
Hi ${firstName},

Please verify your email address to complete your SRJJ AMS registration.

Verify your email:
${verificationUrl}

This link expires in ${expiresMinutes} minutes and can only be used once.

If you didn't create this account, you can safely ignore this email.

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
    Verify your email address
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
                padding:32px 30px 38px 30px;
                background:#ffffff;
              "
            >

              <h1
                style="
                  margin:0 0 16px 0;
                  font-size:23px;
                  line-height:1.3;
                  font-weight:700;
                  color:#111827;
                "
              >
                Verify your email address
              </h1>


              <p
                style="
                  margin:0 0 18px 0;
                  font-size:15px;
                  line-height:1.65;
                  color:#374151;
                "
              >
                Hi ${firstName},
                please verify your email address to complete
                your SRJJ AMS registration.
              </p>


              <!-- BUTTON -->
              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                border="0"
                align="center"
                style="
                  margin:16px auto 24px auto;
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
                      href="${verificationUrl}"
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
                      Verify Email Address
                    </a>

                  </td>
                </tr>
              </table>


              <p
                style="
                  margin:0 0 18px 0;
                  font-size:14px;
                  line-height:1.6;
                  color:#374151;
                "
              >
                This link expires in
                <strong>
                  ${expiresMinutes} minutes
                </strong>
                and can only be used once.
              </p>


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
                      If the button doesn't work,
                      copy and paste this link into your browser:
                    </p>

                    <a
                      href="${verificationUrl}"
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
                      ${verificationUrl}
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
                If you didn't create this account,
                you can safely ignore this email.
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