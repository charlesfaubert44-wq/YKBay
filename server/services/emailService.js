const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
const { exportService } = require('./exportService');

class EmailService {
    constructor() {
        // Initialize nodemailer transporter
        this.transporter = this.createTransporter();
    }

    createTransporter() {
        // Use environment variables for email configuration
        const emailConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        };

        // Return null if email is not configured
        if (!emailConfig.auth.user || !emailConfig.auth.pass) {
            console.log('Email service not configured. Please set SMTP environment variables.');
            return null;
        }

        return nodemailer.createTransporter(emailConfig);
    }

    async sendTripPlan(trip, recipients) {
        if (!this.transporter) {
            throw new Error('Email service not configured');
        }

        // Generate PDF
        const pdfBuffer = await exportService.generateTripPDF(trip);

        // Create email HTML
        const emailHTML = this.generateTripEmailHTML(trip);

        // Prepare email options
        const mailOptions = {
            from: `"FrozenShield" <${process.env.SMTP_USER}>`,
            to: recipients.join(', '),
            subject: `Trip Plan: ${trip.title} - ${moment(trip.start_date).format('MMM DD, YYYY')}`,
            html: emailHTML,
            attachments: [
                {
                    filename: `trip-plan-${trip.id}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        // Send email
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Trip plan email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending trip plan email:', error);
            throw error;
        }
    }

    generateTripEmailHTML(trip) {
        const emergencyContactsHTML = trip.emergency_contacts && trip.emergency_contacts.length > 0
            ? trip.emergency_contacts.map(contact => `
                <li style="margin-bottom: 10px;">
                    <strong>${contact.name}</strong>${contact.relationship ? ` (${contact.relationship})` : ''}<br>
                    Phone: <a href="tel:${contact.phone}" style="color: #DC2626;">${contact.phone}</a>
                    ${contact.email ? `<br>Email: <a href="mailto:${contact.email}" style="color: #DC2626;">${contact.email}</a>` : ''}
                </li>
            `).join('')
            : '<li>No emergency contacts specified</li>';

        const checkpointsHTML = trip.checkpoints && trip.checkpoints.length > 0
            ? trip.checkpoints.map((checkpoint, index) => `
                <li style="margin-bottom: 8px;">
                    <strong>${checkpoint.name || `Checkpoint ${index + 1}`}</strong>
                    ${checkpoint.expected_time ? `<br>Expected: ${moment(checkpoint.expected_time).format('MMM DD, HH:mm')}` : ''}
                    ${checkpoint.location ? `<br>Coordinates: ${checkpoint.location.lat || checkpoint.location[1]}, ${checkpoint.location.lng || checkpoint.location[0]}` : ''}
                </li>
            `).join('')
            : '';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trip Plan: ${trip.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2E8B8B 0%, #0B1A2B 100%); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">FrozenShield</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Plan. Protect. Explore the North.</p>
    </div>

    <!-- Emergency Banner -->
    <div style="background-color: #FEE2E2; border: 2px solid #DC2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #DC2626; margin: 0 0 15px 0; font-size: 18px; text-transform: uppercase;">
            ⚠️ Emergency Contacts
        </h2>
        <ul style="list-style: none; padding: 0; margin: 0;">
            ${emergencyContactsHTML}
        </ul>
    </div>

    <!-- Trip Overview -->
    <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #0B1A2B; margin: 0 0 15px 0; font-size: 20px;">Trip Overview</h2>

        <h3 style="color: #2E8B8B; margin: 20px 0 10px 0; font-size: 18px;">${trip.title}</h3>

        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; color: #666;">Activity:</td>
                <td style="padding: 8px 0; font-weight: bold;">${trip.activity_type}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #666;">Start Date:</td>
                <td style="padding: 8px 0; font-weight: bold;">${moment(trip.start_date).tz('America/Yellowknife').format('MMMM DD, YYYY - HH:mm')}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #666;">End Date:</td>
                <td style="padding: 8px 0; font-weight: bold;">${moment(trip.end_date).tz('America/Yellowknife').format('MMMM DD, YYYY - HH:mm')}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #666;">Duration:</td>
                <td style="padding: 8px 0; font-weight: bold;">${trip.estimated_duration ? `${Math.floor(trip.estimated_duration / 60)}h ${trip.estimated_duration % 60}m` : 'Not specified'}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #666;">Difficulty:</td>
                <td style="padding: 8px 0; font-weight: bold;">${trip.difficulty_level || 'Not specified'}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #666;">Group Size:</td>
                <td style="padding: 8px 0; font-weight: bold;">${trip.group_size || 1} person(s)</td>
            </tr>
        </table>
    </div>

    <!-- Route Information -->
    ${(trip.start_location || trip.end_location || (trip.checkpoints && trip.checkpoints.length > 0)) ? `
    <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #0B1A2B; margin: 0 0 15px 0; font-size: 18px;">Route Information</h2>

        ${trip.start_location ? `
        <div style="margin-bottom: 15px;">
            <strong style="color: #666;">Start Location:</strong><br>
            ${trip.start_location.name || ''}<br>
            Coordinates: ${trip.start_location.lat || trip.start_location[1]}, ${trip.start_location.lng || trip.start_location[0]}
        </div>
        ` : ''}

        ${trip.end_location ? `
        <div style="margin-bottom: 15px;">
            <strong style="color: #666;">End Location:</strong><br>
            ${trip.end_location.name || ''}<br>
            Coordinates: ${trip.end_location.lat || trip.end_location[1]}, ${trip.end_location.lng || trip.end_location[0]}
        </div>
        ` : ''}

        ${checkpointsHTML ? `
        <div style="margin-top: 15px;">
            <strong style="color: #666;">Checkpoints:</strong>
            <ol style="margin-top: 10px;">
                ${checkpointsHTML}
            </ol>
        </div>
        ` : ''}
    </div>
    ` : ''}

    <!-- Equipment List -->
    ${trip.equipment_list && trip.equipment_list.length > 0 ? `
    <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #0B1A2B; margin: 0 0 15px 0; font-size: 18px;">Equipment List</h2>
        <ul style="columns: 2; -webkit-columns: 2; -moz-columns: 2; list-style-type: none; padding: 0;">
            ${trip.equipment_list.map(item => `
                <li style="margin-bottom: 8px;">☐ ${item.name || item}</li>
            `).join('')}
        </ul>
    </div>
    ` : ''}

    <!-- Notes -->
    ${trip.notes ? `
    <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #0B1A2B; margin: 0 0 15px 0; font-size: 18px;">Additional Notes</h2>
        <p style="margin: 0; white-space: pre-wrap;">${trip.notes}</p>
    </div>
    ` : ''}

    <!-- Important Notice -->
    <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #92400E;">
            <strong>Important:</strong> A detailed PDF of this trip plan is attached to this email.
            Please save it for offline access and share with relevant parties for safety purposes.
        </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
        <p style="margin: 5px 0;">
            Generated by FrozenShield on ${moment().tz('America/Yellowknife').format('MMMM DD, YYYY at HH:mm')}
        </p>
        <p style="margin: 5px 0;">
            Always verify conditions and carry appropriate safety equipment
        </p>
        <p style="margin: 10px 0 0 0;">
            <a href="https://frozenshield.ca" style="color: #2E8B8B; text-decoration: none;">www.frozenshield.ca</a>
        </p>
    </div>

</body>
</html>
        `;
    }

    async sendTestEmail(to) {
        if (!this.transporter) {
            throw new Error('Email service not configured');
        }

        const mailOptions = {
            from: `"FrozenShield" <${process.env.SMTP_USER}>`,
            to: to,
            subject: 'FrozenShield Email Service Test',
            html: `
                <h1>Test Email from FrozenShield</h1>
                <p>If you're seeing this, the email service is configured correctly!</p>
                <p>Time sent: ${new Date().toISOString()}</p>
            `
        };

        return await this.transporter.sendMail(mailOptions);
    }
}

const emailService = new EmailService();
module.exports = { emailService };