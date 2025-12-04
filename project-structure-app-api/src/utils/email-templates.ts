export interface SendOtpForgotPasswordUserPayload {
    emailAddress: string;
    otp: number | string;
    fullName?: string | null;
}

export interface SendVerificationEmailUserPayload {
    emailAddress: string;
    otp: number | string;
}

export interface SendSupportEmailPayload {
    userEmail: string;
    userName?: string | null;
    subject: string;
    message: string;
    attachmentUrl?: string | null;
}

export const emailTemplates = {
    passwordReset: (data: SendOtpForgotPasswordUserPayload) => ({
        subject: 'Password Reset Request',
        html: `
                      <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify OTP</title>
            </head>
            <body style="background-color: #f5f9fc; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

                <div style="max-width: 600px; background: #ffffff; margin: 50px auto; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">

                    <!-- Header / Logo -->
                    <div style="width: 100%; background-color: #111827; text-align: center; padding: 20px 0;">
                        <img src="${process.env.LOGO_PATH}" alt="logo" style="width: 250px; margin: 0 auto; border-radius: 4px; display: block;">
                    </div>

                    <div style="padding: 30px;">

                        <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 20px 0;">Hello ${data.fullName},</p>

                        <p style="font-size: 18px; line-height: 26px; color: #32325d; margin: 15px 0; font-weight: 600;">
                            Reset Your Project Structure Password 🔒
                        </p>

                        <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 15px 0;">
                            We've received a request to reset your password for the Project Structure account associated with <strong>${data.emailAddress}</strong>. Use the One-Time Password (OTP) below to reset your password:
                        </p>

                        <!-- OTP Display -->
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 32px; font-weight: bold; color: #e16758; background: #e167581c; display: inline-block; padding: 15px 40px; border-radius: 8px; letter-spacing: 8px;">
                                ${data.otp}
                            </div>
                        </div>

                        <!-- OTP Expiry -->
                        <div style="background: #fff9e6; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <p style="font-size: 14px; line-height: 20px; color: #856404; margin: 0;">
                                ⏱️ <strong>Important:</strong> This OTP will expire in <strong>10 minutes</strong>. Please use it before it expires.
                            </p>
                        </div>

                        <!-- Verification Steps -->
                        <div style="background: #f0f7ff; border-left: 4px solid #4a90e2; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <p style="font-size: 14px; line-height: 20px; color: #2c5282; margin: 0 0 10px 0;">
                                <strong>How to reset your password:</strong>
                            </p>
                            <ol style="font-size: 14px; line-height: 20px; color: #2c5282; margin: 0; padding-left: 20px;">
                                <li>Go to the Project Structure password reset page</li>
                                <li>Enter the OTP code shown above</li>
                                <li>Set your new password and click "Reset Password"</li>
                            </ol>
                        </div>

                        <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 15px 0;">
                            If you did not request a password reset, please <strong>ignore this email</strong> or contact our support team immediately.
                        </p>

                        <!-- Next Steps Info -->
                        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <p style="font-size: 14px; line-height: 20px; color: #065f46; margin: 0 0 10px 0;">
                                <strong>What's next?</strong>
                            </p>
                            <p style="font-size: 14px; line-height: 20px; color: #065f46; margin: 0;">
                                Once reset, you can securely log in and continue enjoying Project Structure features!
                            </p>
                        </div>

                        <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 15px 0;">
                            Need help? Contact our support team at <a href="mailto:${process.env.SUPPORT_MAIL}" style="color: #e16758; text-decoration: none;">${process.env.SUPPORT_MAIL}</a>
                        </p>

                        <hr style="margin: 30px 0 20px 0; border: none; border-top: 1px solid #e5e5e5;">
                        <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 15px 0;">
                            Best regards,<br>
                            <strong>The Project Structure Team</strong>
                        </p>

                    </div>

                </div>

            </body>
            </html>

        `,
    }),

    verificationEmail: (data: SendVerificationEmailUserPayload) => ({
        subject: 'Email Verification',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Email</title>
            </head>
            <body style="background-color: #f5f9fc; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

                <div style="max-width: 600px; background: #ffffff; margin: 50px auto; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">

                    <div style="width: 100%; background-color: #111827; text-align: center; padding: 20px 0px;">
                        <img src=${process.env.LOGO_PATH} alt="logo" style="width: 250px; margin: 0 auto; border-radius: 4px; display: block;">
                    </div>

                    <div style="padding: 30px;">

                        <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 20px 0;">Hello ${data.emailAddress},</p>

                        <p style="font-size: 18px; line-height: 26px; color: #32325d; margin: 15px 0; font-weight: 600;">
                            Welcome to Project Structure! 🎉
                        </p>

                        <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 15px 0;">
                            Thank you for signing up! We're excited to have you on board. To complete your registration and verify your email address <strong>${data.emailAddress}</strong>, please use the One-Time Password (OTP) below:
                        </p>

                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 32px; font-weight: bold; color: #e16758; background: #e167581c; display: inline-block; padding: 15px 40px; border-radius: 8px; letter-spacing: 8px;">
                                ${data.otp}
                            </div>
                        </div>

                        <div style="background: #fff9e6; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <p style="font-size: 14px; line-height: 20px; color: #856404; margin: 0;">
                                ⏱️ <strong>Important:</strong> This OTP will expire in <strong>10 minutes</strong>. Please verify your email before it expires.
                            </p>
                        </div>

                        <div style="background: #f0f7ff; border-left: 4px solid #4a90e2; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <p style="font-size: 14px; line-height: 20px; color: #2c5282; margin: 0 0 10px 0;">
                                <strong>How to verify:</strong>
                            </p>
                            <ol style="font-size: 14px; line-height: 20px; color: #2c5282; margin: 0; padding-left: 20px;">
                                <li>Return to the Project Structure verification page</li>
                                <li>Enter the OTP code shown above</li>
                                <li>Click "Verify Email" to complete your registration</li>
                            </ol>
                        </div>

                        <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 15px 0;">
                            If you did not create an account with Project Structure, please <strong>ignore this email</strong> or contact our support team immediately.
                        </p>


                        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <p style="font-size: 14px; line-height: 20px; color: #065f46; margin: 0 0 10px 0;">
                                <strong>What's next?</strong>
                            </p>
                            <p style="font-size: 14px; line-height: 20px; color: #065f46; margin: 0;">
                                Once verified, you'll have full access to join competitions, and connect with other enthusiasts!
                            </p>
                        </div>

                        <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 15px 0;">
                            Need help? Contact our support team at <a href="mailto:${process.env.SUPPORT_MAIL}" style="color: #e16758; text-decoration: none;">${process.env.SUPPORT_MAIL}</a>
                        </p>

                        <hr style="margin: 30px 0 20px 0; border: none; border-top: 1px solid #e5e5e5;">
                        <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 15px 0;">
                            Best regards,<br>
                            <strong>The Project Structure Team</strong>
                        </p>

                    </div>

                </div>
            </body>
            </html>
        `,
    }),

    supportTicket: (data: SendSupportEmailPayload) => ({
        subject: `New Support Request: ${data.subject}`,
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">  
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Support Request</title>
        </head>
        <body style="background-color: #f5f9fc; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

            <div style="max-width: 600px; background: #ffffff; margin: 50px auto; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); border-radius: 12px; overflow: hidden;">

                <!-- Header / Logo -->
                <div style="width: 100%; background-color: #111827; text-align: center; padding: 20px 0;">
                    <img src="${process.env.LOGO_PATH}" alt="logo" style="width: 250px; margin: 0 auto; display: block; border-radius: 4px;">
                </div>

                <div style="padding: 30px;">

                    <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 0 0 15px 0;">
                        You have received a new support request from Project Structure:
                    </p>

                    <!-- Sender Info -->
                    <div style="background: #f0f7ff; border-left: 4px solid #4a90e2; padding: 15px; border-radius: 6px; margin: 15px 0;">
                        <p style="font-size: 14px; line-height: 20px; color: #2c5282; margin: 0 0 5px 0;">
                            <strong>From:</strong> ${data.userName ?? data.userEmail} (${data.userEmail})
                        </p>
                        <p style="font-size: 14px; line-height: 20px; color: #2c5282; margin: 0;">
                            <strong>Subject:</strong> ${data.subject}
                        </p>
                    </div>

                    <!-- Message Content -->
                    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 10px;">
                        <p style="white-space: pre-wrap; font-size: 15px; color: #374151; margin: 0;">${data.message}</p>
                    </div>

                    <!-- Attachment -->
                    ${
                        data.attachmentUrl
                            ? `
                    <p style="margin-top: 16px; font-size: 14px; color: #374151;">
                        Attachment: <a href="${data.attachmentUrl}" style="color: #2563eb; text-decoration: none;">${data.attachmentUrl}</a>
                    </p>`
                            : ''
                    }
                    
                    <!-- Footer -->
                    <hr style="margin: 30px 0 20px 0; border: none; border-top: 1px solid #e5e5e5;">
                    <p style="font-size: 14px; color: #6b7280; margin: 0;">
                        This email was sent automatically by Project Structure Support.
                    </p>
                    
                </div>
                    
            </div>
                    
        </body>
        </html>

        `,
    }),
};
