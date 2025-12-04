import * as nodemailer from 'nodemailer';
import { emailTemplates } from './email-templates';
import { SendOtpForgotPasswordAdminPayload } from './email-templates';

export const createMailer = () =>
    nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: Number(process.env.MAIL_PORT) === 465,
        auth: {
            user: process.env.MAIL_FROM_ADDRESS,
            pass: process.env.MAIL_PASSWORD,
        },
    });

export const sendOtpForgotPasswordAdmin = async (
    data: SendOtpForgotPasswordAdminPayload
): Promise<void> => {
    const transporter = createMailer();

    const mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: data.emailAddress,
        subject: 'Reset Password',
        html: emailTemplates.passwordReset(data).html,
    };

    await transporter.sendMail(mailOptions);
};
