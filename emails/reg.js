const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const keys = require('../keys');

const oAuth2Client = new google.auth.OAuth2(keys.GMAIL_CLIENT_ID, keys.GMAIL_CLIENT_SECRET, keys.GMAIL_REDIRECT_URI);

oAuth2Client.setCredentials({refresh_token:keys.GMAIL_REFRESH_TOKEN});

async function sendMail(email) {
    try{
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
            service:'gmail',
            auth:{
                type:'OAuth2',
                user:'bpv358@gmail.com',
                clientId:keys.GMAIL_CLIENT_ID,
                clientSecret:keys.GMAIL_CLIENT_SECRET,
                refreshToken:keys.GMAIL_REFRESH_TOKEN,
                accessToken
            }
        });
        const mailOptions = {
            from: `Bookshop <${keys.EMAIL_FROM}>`,
            to:email,
            subject:'Регистрация',
            text:'Регистрация выполнена успешно!',
            html:`
                <div style="text-align:center;">
                    <h1 style="color:red">Вас приветствует книжный магазин Bookshop!</h1>
                    <img src="https://assets.website-files.com/6267f35934aa8b1795cf1a9f/62f53aeb0b37196f0431cc7f_About-topper.png" alt="Bookshop">
                    <a href="${keys.BASE_URL}" style="font-size:20px">Перейти в магазин</a>
                </div>`,
        }
        const result = await transport.sendMail(mailOptions);
         console.log('Письмо отправлено!');
        return result;
    }
    catch(err) { return err }
}

module.exports = function(email){
    sendMail(email);
}