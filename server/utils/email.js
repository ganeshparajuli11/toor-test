import nodemailer from 'nodemailer';
import { getSettings } from '../config/store.js';

/**
 * Email Service
 * Handles sending verification, reset, and notification emails
 */

// Create transporter based on settings
const createTransporter = async () => {
    try {
        const settings = await getSettings();
        const emailConfig = settings.email || {};

        // Check if email is configured
        if (!emailConfig.host || !emailConfig.user || !emailConfig.pass) {
            console.log('[Email] SMTP not configured, using development mode');
            return null;
        }

        return nodemailer.createTransport({
            host: emailConfig.host,
            port: emailConfig.port || 587,
            secure: emailConfig.secure || false,
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass
            }
        });
    } catch (error) {
        console.error('[Email] Error creating transporter:', error);
        return null;
    }
};

// Get app URL from settings or use default
const getAppUrl = async () => {
    try {
        const settings = await getSettings();
        return settings.appUrl || 'http://localhost:5173';
    } catch (error) {
        return 'http://localhost:5173';
    }
};

// Get sender email
const getSenderEmail = async () => {
    try {
        const settings = await getSettings();
        return settings.email?.from || settings.email?.user || 'noreply@zanafly.com';
    } catch (error) {
        return 'noreply@zanafly.com';
    }
};

/**
 * Send verification email
 * @param {string} email - Recipient email
 * @param {string} firstName - User's first name
 * @param {string} verificationToken - Verification token
 * @returns {boolean} Success
 */
export const sendVerificationEmail = async (email, firstName, verificationToken) => {
    try {
        const transporter = await createTransporter();
        const appUrl = await getAppUrl();
        const senderEmail = await getSenderEmail();

        const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Zanafly</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Zanafly!</h1>
    </div>

    <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${firstName},</p>

        <p style="font-size: 16px;">Thank you for signing up! Please verify your email address to complete your registration and start booking amazing trips.</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                Verify Email Address
            </a>
        </div>

        <p style="font-size: 14px; color: #666;">Or copy and paste this link in your browser:</p>
        <p style="font-size: 12px; color: #888; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
            ${verifyUrl}
        </p>

        <p style="font-size: 14px; color: #666; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

        <p style="font-size: 12px; color: #888; text-align: center;">
            Zanafly - Your Travel Companion<br>
            <a href="${appUrl}" style="color: #667eea;">Visit our website</a>
        </p>
    </div>
</body>
</html>
`;

        const textContent = `
Hi ${firstName},

Welcome to Zanafly!

Thank you for signing up! Please verify your email address by clicking the link below:

${verifyUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

---
Zanafly - Your Travel Companion
${appUrl}
`;

        if (transporter) {
            await transporter.sendMail({
                from: `"Zanafly" <${senderEmail}>`,
                to: email,
                subject: 'Verify Your Email - Zanafly',
                text: textContent,
                html: htmlContent
            });
            console.log('[Email] Verification email sent to:', email);
            return true;
        } else {
            // Development mode - log the link
            console.log('[Email] === DEVELOPMENT MODE ===');
            console.log('[Email] Verification email would be sent to:', email);
            console.log('[Email] Verification URL:', verifyUrl);
            console.log('[Email] ========================');
            return true;
        }
    } catch (error) {
        console.error('[Email] Error sending verification email:', error);
        return false;
    }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} firstName - User's first name
 * @param {string} resetToken - Reset token
 * @returns {boolean} Success
 */
export const sendPasswordResetEmail = async (email, firstName, resetToken) => {
    try {
        const transporter = await createTransporter();
        const appUrl = await getAppUrl();
        const senderEmail = await getSenderEmail();

        const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Zanafly</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
    </div>

    <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${firstName},</p>

        <p style="font-size: 16px;">We received a request to reset your password. Click the button below to create a new password:</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                Reset Password
            </a>
        </div>

        <p style="font-size: 14px; color: #666;">Or copy and paste this link in your browser:</p>
        <p style="font-size: 12px; color: #888; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
            ${resetUrl}
        </p>

        <p style="font-size: 14px; color: #666; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

        <p style="font-size: 12px; color: #888; text-align: center;">
            Zanafly - Your Travel Companion<br>
            <a href="${appUrl}" style="color: #667eea;">Visit our website</a>
        </p>
    </div>
</body>
</html>
`;

        const textContent = `
Hi ${firstName},

Password Reset Request

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

---
Zanafly - Your Travel Companion
${appUrl}
`;

        if (transporter) {
            await transporter.sendMail({
                from: `"Zanafly" <${senderEmail}>`,
                to: email,
                subject: 'Reset Your Password - Zanafly',
                text: textContent,
                html: htmlContent
            });
            console.log('[Email] Password reset email sent to:', email);
            return true;
        } else {
            // Development mode - log the link
            console.log('[Email] === DEVELOPMENT MODE ===');
            console.log('[Email] Password reset email would be sent to:', email);
            console.log('[Email] Reset URL:', resetUrl);
            console.log('[Email] ========================');
            return true;
        }
    } catch (error) {
        console.error('[Email] Error sending password reset email:', error);
        return false;
    }
};

/**
 * Send booking confirmation email
 * @param {string} email - Recipient email
 * @param {string} firstName - User's first name
 * @param {Object} booking - Booking details
 * @returns {boolean} Success
 */
export const sendBookingConfirmationEmail = async (email, firstName, booking) => {
    try {
        const transporter = await createTransporter();
        const appUrl = await getAppUrl();
        const senderEmail = await getSenderEmail();

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed - Zanafly</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
    </div>

    <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${firstName},</p>

        <p style="font-size: 16px;">Great news! Your booking has been confirmed. Here are your booking details:</p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${booking.id || booking.partner_order_id}</p>
            <p style="margin: 5px 0;"><strong>Hotel:</strong> ${booking.hotelName || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Check-in:</strong> ${booking.checkIn || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Check-out:</strong> ${booking.checkOut || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Total:</strong> ${booking.currency || '$'} ${booking.totalPrice || 'N/A'}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/bookings" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                View My Bookings
            </a>
        </div>

        <p style="font-size: 14px; color: #666;">
            Thank you for choosing Zanafly! If you have any questions about your booking, please contact our support team.
        </p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

        <p style="font-size: 12px; color: #888; text-align: center;">
            Zanafly - Your Travel Companion<br>
            <a href="${appUrl}" style="color: #667eea;">Visit our website</a>
        </p>
    </div>
</body>
</html>
`;

        const textContent = `
Hi ${firstName},

Booking Confirmed!

Great news! Your booking has been confirmed.

Booking Details:
- Booking ID: ${booking.id || booking.partner_order_id}
- Hotel: ${booking.hotelName || 'N/A'}
- Check-in: ${booking.checkIn || 'N/A'}
- Check-out: ${booking.checkOut || 'N/A'}
- Total: ${booking.currency || '$'} ${booking.totalPrice || 'N/A'}

View your bookings: ${appUrl}/bookings

Thank you for choosing Zanafly!

---
Zanafly - Your Travel Companion
${appUrl}
`;

        if (transporter) {
            await transporter.sendMail({
                from: `"Zanafly" <${senderEmail}>`,
                to: email,
                subject: 'Booking Confirmed - Zanafly',
                text: textContent,
                html: htmlContent
            });
            console.log('[Email] Booking confirmation email sent to:', email);
            return true;
        } else {
            console.log('[Email] === DEVELOPMENT MODE ===');
            console.log('[Email] Booking confirmation would be sent to:', email);
            console.log('[Email] ========================');
            return true;
        }
    } catch (error) {
        console.error('[Email] Error sending booking confirmation email:', error);
        return false;
    }
};

/**
 * Test email configuration
 * @returns {Object} { success, message }
 */
export const testEmailConfig = async () => {
    try {
        const transporter = await createTransporter();

        if (!transporter) {
            return {
                success: false,
                message: 'SMTP not configured. Running in development mode.'
            };
        }

        await transporter.verify();
        return {
            success: true,
            message: 'Email configuration is valid.'
        };
    } catch (error) {
        return {
            success: false,
            message: `Email configuration error: ${error.message}`
        };
    }
};

export default {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendBookingConfirmationEmail,
    testEmailConfig
};
