const axios = require("axios");
const logger = require("../utils/logger");

class EmailService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.apiUrl = "https://api.brevo.com/v3/smtp/email";

    // Check if key exists but don't crash yet so we can log gracefully later
    if (!this.apiKey) {
      logger.warn(
        "BREVO_API_KEY is not defined in environment variables. Email sending will fail.",
      );
    }
  }

  /**
   * Sends a 6 digit OTP email using Brevo's REST API
   * @param {string} toEmail - Recipient email address
   * @param {string} otpCode - The 6-digit OTP code to send
   */
  async sendOTP(toEmail, otpCode) {
    if (!this.apiKey) {
      throw new Error("Cannot send email: BREVO_API_KEY is missing.");
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          sender: {
            name: "CryptoMarket Authenticator",
            email: "noreply@cryptomarket.local", // Update this to a verified sender in Brevo in production
          },
          to: [{ email: toEmail }],
          subject: "Your CryptoMarket Verification Code",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
              <p style="color: #555; font-size: 16px;">Hello,</p>
              <p style="color: #555; font-size: 16px;">Your One-Time Password (OTP) for accessing <strong>CryptoMarket</strong> is:</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                <h1 style="color: #4f46e5; margin: 0; font-size: 32px; letter-spacing: 5px;">${otpCode}</h1>
              </div>
              
              <p style="color: #777; font-size: 14px; text-align: center;">
                This code is securely hashed in our database and will expire in exactly <strong>5 minutes</strong>. 
                If you did not request this code, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="color: #999; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} CryptoMarket Platform. All rights reserved.
              </p>
            </div>
          `,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": this.apiKey,
          },
        },
      );

      logger.info(
        `✅ OTP Email successfully sent to ${toEmail} via Brevo. Message ID: ${response.data.messageId}`,
      );
      return true;
    } catch (error) {
      logger.error(
        `❌ Failed to send OTP email via Brevo: ${error.response?.data?.message || error.message}`,
      );
      throw new Error("Email provider failed to send OTP");
    }
  }
}

module.exports = new EmailService();
