export function loginOtpTemplate({
  firstName,
  otp,
  expiresMinutes
}) {
  return {
    subject:
      'Your SRJJ Accounting Services One-Time Passcode',

    text: `
Hi ${firstName},

Use the passcode below to continue:

${otp}

This passcode expires in ${expiresMinutes} minutes.

Never share this code with anyone. SRJJ staff will never ask for it.

Didn't try to sign in? Contact us immediately at support@srjj.ph.

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
    Your one-time passcode
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
                padding:26px 30px;
              "
            >

              <span
                style="
                  color:#ffffff;
                  font-size:18px;
                  font-weight:700;
                  line-height:1.2;
                "
              >
                SRJJ
              </span>

              <span
                style="
                  color:#f97316;
                  font-size:18px;
                  font-weight:700;
                  line-height:1.2;
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
                padding:32px 30px 36px 30px;
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
                Your one-time passcode
              </h1>


              <p
                style="
                  margin:0 0 18px 0;
                  font-size:15px;
                  line-height:1.65;
                  color:#374151;
                "
              >
                Hi ${firstName}, use the passcode below to continue.
                Never share this code with anyone —
                SRJJ staff will never ask for it.
              </p>


              <!-- OTP BOX -->
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
                    style="
                      min-width:180px;
                      padding:20px 22px;
                      background:#f0fdf4;
                      border:1px dashed #155d32;
                      border-radius:12px;
                    "
                  >

                    <span
                      style="
                        display:inline-block;
                        font-size:30px;
                        line-height:1;
                        font-weight:700;
                        letter-spacing:10px;
                        color:#145c31;
                        font-family:Arial, Helvetica, sans-serif;
                      "
                    >
                      ${String(otp)
                        .split('')
                        .join(' ')}
                    </span>

                  </td>
                </tr>
              </table>


              <p
                style="
                  margin:0 0 18px 0;
                  font-size:15px;
                  line-height:1.6;
                  color:#374151;
                "
              >
                This passcode expires in
                <strong>
                  ${expiresMinutes} minutes
                </strong>.
              </p>


              <!-- SECURITY WARNING -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  width:100%;
                  margin:0;
                "
              >
                <tr>

                  <td
                    width="4"
                    style="
                      width:4px;
                      background:#f97316;
                    "
                  >
                  </td>

                  <td
                    style="
                      background:#fff7ed;
                      padding:13px 16px;
                      border-radius:0 8px 8px 0;
                    "
                  >

                    <p
                      style="
                        margin:0;
                        font-size:13px;
                        line-height:1.5;
                        color:#9a3412;
                      "
                    >
                      Didn't try to sign in?
                      Contact us immediately at

                      <a
                        href="mailto:support@srjj.ph"
                        style="
                          color:#9a3412;
                          text-decoration:none;
                        "
                      >
                        support@srjj.ph
                      </a>.
                    </p>

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