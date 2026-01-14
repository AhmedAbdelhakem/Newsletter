import nodemailer from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

let transporter = null;

async function setupTransporter() {
    // 1. Try Gmail if configured
    if (GMAIL_USER && GMAIL_APP_PASSWORD) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_APP_PASSWORD,
            },
        });
        return;
    }

    // 2. Fallback to Ethereal (Fake Inbox) for testing without setup
    // Note: Creating a test account every time might be slow, but safe for serverless
    try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    } catch (err) {
        console.error('Failed to create test account:', err.message);
    }
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    // another common pattern
    // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { to, subject, html } = req.body;

        if (!transporter) {
            await setupTransporter();
        }

        if (!transporter) {
            throw new Error('Failed to initialize email transporter');
        }

        const info = await transporter.sendMail({
            from: `"Newsletter Builder" <${(GMAIL_USER && GMAIL_USER.includes('@')) ? GMAIL_USER.trim() : 'test@example.com'}>`,
            to,
            subject: subject || 'Newsletter Test',
            html,
        });

        // Generate preview URL if using Ethereal
        const previewUrl = nodemailer.getTestMessageUrl(info);

        res.status(200).json({
            success: true,
            messageId: info.messageId,
            previewUrl
        });
    } catch (error) {
        console.error('Email error:', error.message);
        res.status(500).json({ error: error.message });
    }
}
