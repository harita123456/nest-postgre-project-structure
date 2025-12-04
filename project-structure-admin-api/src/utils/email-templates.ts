export interface SendOtpForgotPasswordAdminPayload {
    emailAddress: string;
    otp: number | string;
}

export const emailTemplates = {
    passwordReset: (data: SendOtpForgotPasswordAdminPayload) => ({
        subject: 'Password Reset Request',
        html: `
          <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Password Reset</title>
</head>
<body style="background-color: #f5f9fc; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    
    <div style="max-width: 600px; background: #ffffff; margin: 50px auto; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); border-radius: 12px; overflow: hidden;">
        
        <!-- Header / Logo -->
        <div style="width: 100%; background-color: #111827; text-align: center; padding: 20px 0;">
            <img src="${process.env.LOGO_PATH}" alt="logo" style="width: 250px; margin: 0 auto; display: block; border-radius: 4px;">
        </div>
        
        <div style="padding: 30px;">
            
            <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 0 0 15px 0;">
                Hello Admin,
            </p>
            
            <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 15px 0;">
                We've received a request to reset the password for your <strong>Project Structure Admin account</strong> associated with <strong>${data.emailAddress}</strong>. No changes have been made to your account yet.
            </p>
            
            <p style="font-size: 16px; line-height: 24px; color: #525F7f; margin: 15px 0;">
                Use this One-Time Password (OTP) to reset your admin password:
            </p>
            
            <!-- OTP Display -->
            <div style="text-align: center; margin: 30px 0;">
                <div style="font-size: 32px; font-weight: bold; color: #667eea; background: #e8eaf6; display: inline-block; padding: 15px 40px; border-radius: 8px; letter-spacing: 8px; border: 2px solid #667eea;">
                    ${data.otp}
                </div>
            </div>
            
            <!-- Expiry Warning -->
            <div style="background: #fff9e6; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="font-size: 14px; line-height: 20px; color: #856404; margin: 0;">
                    ⏱️ <strong>Important:</strong> This OTP will expire in <strong>10 minutes</strong>. Please use it before it expires.
                </p>
            </div>
            
            <!-- Security Note -->
            <div style="background: #f0f7ff; border-left: 4px solid #4a90e2; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="font-size: 14px; line-height: 20px; color: #2c5282; margin: 0;">
                    If you did not request this password reset, please <strong>ignore this email</strong> or contact our support team immediately.
                </p>
            </div>
            
            <!-- Footer -->
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
};
