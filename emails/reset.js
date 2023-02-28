const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const keys = require('../keys');

const oAuth2Client = new google.auth.OAuth2(keys.GMAIL_CLIENT_ID, keys.GMAIL_CLIENT_SECRET, keys.GMAIL_REDIRECT_URI);

oAuth2Client.setCredentials({refresh_token:keys.GMAIL_REFRESH_TOKEN});

async function resetEmail(email, token) {
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
            subject:'Восстановление пароля',
            html:`
                <div style="text-align:center;">
                    <h1 style="color:red; text-decoration:underline;">Запрос восстановления пароля</h1>
                    <p>На ваш emil поступил запрос восстановления пароля</p>
                    <p>Если вы не отправляли запрос, проигнорируйте это письмо</p>
                    <p>Если вы отправили запрос
                        <a href="${keys.BASE_URL}/auth/password/${token}">Перейдите по ссылке</a>
                    </p>
                </div>`,
        }
        const result = await transport.sendMail(mailOptions);
    
        return result;
    }
    catch(err) { return err }
}

module.exports = function(email, token){
    resetEmail(email, token);
}