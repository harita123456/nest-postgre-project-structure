import * as nodemailer from 'nodemailer';
import {
    emailTemplates,
    SendOtpForgotPasswordUserPayload,
    SendSupportEmailPayload,
} from './email-templates';
import { logError } from './logger';

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

interface SendVerificationEmailUserPayload {
    emailAddress: string;
    otp: number | string;
    fullName?: string | null;
}

export const sendVerificationEmailUser = async (
    data: SendVerificationEmailUserPayload
): Promise<void> => {
    const transporter = createMailer();

    const mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: data.emailAddress,
        subject: 'Project Structure - Verify Your Email',
        html: emailTemplates.verificationEmail({
            otp: data.otp,
            emailAddress: data.emailAddress,
        }).html,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        logError('Error sending verification email:', error);
    }
};

export const sendOtpForgotPasswordUser = async (
    data: SendOtpForgotPasswordUserPayload
): Promise<void> => {
    const transporter = createMailer();

    const mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: data.emailAddress,
        subject: 'Project Structure - Reset Password',
        html: emailTemplates.passwordReset({
            otp: data.otp,
            fullName: data.fullName ? data.fullName : data.emailAddress,
            emailAddress: data.emailAddress,
        }).html,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        logError('Error sending password reset email:', error);
    }
};

export const sendSupportEmail = async (
    data: SendSupportEmailPayload
): Promise<void> => {
    const transporter = createMailer();

    const { subject, userEmail, userName, message, attachmentUrl } = data;

    const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: process.env.SUPPORT_MAIL,
        replyTo: userEmail,
        subject: emailTemplates.supportTicket({
            userEmail,
            userName: userName ?? null,
            subject,
            message,
            attachmentUrl: attachmentUrl ?? null,
        }).subject,
        html: emailTemplates.supportTicket({
            userEmail,
            userName: userName ?? null,
            subject,
            message,
            attachmentUrl: attachmentUrl ?? null,
        }).html,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        logError('Error sending support email:', error);
    }
};
