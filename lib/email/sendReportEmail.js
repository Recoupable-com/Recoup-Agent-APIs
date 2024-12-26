import sendEmail from "./sendEmail.js";

const sendReportEmail = (
  rawContent,
  artistImage,
  artistName,
  email,
  subject,
) => {
  const reportContent = `
    <div style="width: 757px; height:146px; border-radius: 10px; background-image: url('${artistImage}'); background-position: center; background-size: cover; margin-bottom: 10px;">
      <div style="display:flex; text-align:right; padding-right: 8px; color: white; font-weight:bold; font-size: 30px; padding-top: 53px; padding-left: 462px;">
        <p style="padding-right: 10px;">${artistName}</p><img src="https://i.imgur.com/dNzHwTO.png" style="width: 24px; height:27px;"/><p style="padding-left: 10px;">Recoup</p>
      </div>
      <div style="text-align:right; padding-right: 8px; color: white; font-weight:bold; font-size:20px;">
        <p>${subject}</p>
      </div>
    </div/>
    <div style="width: 100%; height: 16px;"></div>${rawContent}
    `;
  const template = `<!DOCTYPE html>
        <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta content="width=device-width, initial-scale=1" name="viewport">
              <meta name="x-apple-disable-message-reformatting">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta content="telephone=no" name="format-detection">
              <title>Empty template</title>
              <style type="text/css">
                  * {
                      box-sizing: border-box !important;
                      margin: 0px !important;
                  }
              </style>
          </head>
          <body class="body" style="width:100%;padding:0;margin:0;">
            <div style="color: black; width: 100%; background-color: white; padding: 0.3in; font-size: 11pt; line-height: normal;">
              ${reportContent}
            </div>
            <div style="text-align: center;">
              <img src='https://i.imgur.com/hwJIKMx.png' style='width:24px; height:27px;'/>
            </div>
          </body>
        </html>`;

  const data = {
    from: "Recoup <hello@recoupable.com>",
    to: email,
    subject,
    html: template,
  };

  sendEmail(data);
};

export default sendReportEmail;
