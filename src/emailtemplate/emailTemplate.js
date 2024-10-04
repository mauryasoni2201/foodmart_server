"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emailTemplate = (otp, message) => {
    const userOtp = String(otp).split('');
    let myOtp = ``;
    userOtp.forEach((element) => {
        myOtp += `
        <span class="otp-box">${element}</span>`;
    });
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email-template</title>
    <style>
        *{
           margin: 0px;
           padding: 0px;
           box-sizing: border-box;
           font-family: system-ui;
           font-size: 16px;
           font-weight: 400;
           line-height: 20px;
           font-style: normal;
           color: #1E201E;
           text-transform: capitalize;
        }
        .email-template-wrapper{
            width: 100%;
            max-width: 500px;
        }
        .email-template{
            padding: 10px;
            height: 270px;
            border-radius:10px;
            background-color:#FFD7C4;
            width: 100%;
            box-shadow: 5px 5px 10px black;
        }
        .email-template-image{
          padding-bottom:15px;
        }
        .email-template-subheading h2{
          padding-bottom: 30px;
          text-align: center;
          font-size: 30px;
          line-height: 35px;
          font-weight:600;
        }
        .email-template-message span,p{
            text-align: center;
            font-size: 25px;
            line-height: 30px;
            font-weight:500;
        }
        p{
            padding-bottom: 15px;
        }
        .otp-container{
            padding:15px 7px;
            border-radius: 10px;
            background-color:#E9EFEC;
            display: inline-block;
        }
        .otp-box{
            background-color:#FFFFFF;
            padding:8px 12px;
            margin: 2px;
            border-radius: 10px;
            font-size: 22px !important;
            line-height: 26px !important;
            font-weight: 300;
        }
    </style>
</head>
<body>
    <center>
    <div class="email-template-wrapper">
        <div class="email-template">
            <div class="email-template-content">
                 <div class="email-template-image">
                   <img width="150px" height="60px" src="https://66e121d8db090d873828bacf--gleaming-mandazi-3b4161.netlify.app/images/logo-no-background.png" alt="company-logo"/>
                </div>
                <div class="email-template-subheading">
                    <h2>${message}</h>
                </div>
                <div class="email-template-message">
                    <p>Your otp is</p>
                  <div class="otp-container">
                  ${myOtp}
                  </div>
                </div>
            </div>
        </div>
    </div>
</center>
</body>
</html>
    `;
};
exports.default = emailTemplate;
