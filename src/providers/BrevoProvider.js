import { env } from '~/config/environment'
const brevo = require('@getbrevo/brevo')
// SMTP & API Keys
let apiInstance = new brevo.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (receiveEmail, customSubject, htmlContent) => {
    let sendSmtpEmail = new brevo.SendSmtpEmail()
    //tieu de email
    sendSmtpEmail.subject = customSubject
    sendSmtpEmail.htmlContent = htmlContent
    //array de gui den nhieu user
    sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }
    sendSmtpEmail.to = [{ email: receiveEmail }]
    //gui mail
    return apiInstance.sendTransacEmail(sendSmtpEmail)
}
export const BrevoProvider = {
    sendEmail
}