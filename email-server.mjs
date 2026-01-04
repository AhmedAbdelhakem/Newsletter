import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// -------------------------------------------------------------------------
// CONFIGURATION
// -------------------------------------------------------------------------
// To actully send emails to your real Gmail inbox:
// 1. Create an App Password: https://myaccount.google.com/apppasswords
// 2. Uncomment the two lines below and fill them in:
// const GMAIL_USER = 'your.email@gmail.com';
// const GMAIL_APP_PASSWORD = 'xxxx xxxx xxxx xxxx';

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// -------------------------------------------------------------------------

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
        console.log('✅ Gmail SMTP configured for:', GMAIL_USER);
        return;
    }

    // 2. Fallback to Ethereal (Fake Inbox) for testing without setup
    console.log('⚠️  Gmail credentials not found. Using Ethereal Email (Test Service).');
    console.log('   (Real emails won\'t be sent, but you will get a Preview URL)');

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
        console.log('✅ Ethereal Test Server ready');
        console.log('   User:', testAccount.user);
    } catch (err) {
        console.error('❌ Failed to create test account:', err.message);
    }
}

app.get('/api/fetch-url-metadata', async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ success: 0, error: 'URL is required' });
        }

        console.log('🔍 Fetching metadata for:', url);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; NewsletterBot/1.0; +http://localhost:3000)'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();

        // Simple Regex Parsing for OG Tags
        const getMetaTag = (name) => {
            const regex = new RegExp(`<meta\\s+(?:name|property)=["'](?:og:)?${name}["']\\s+content=["'](.*?)["']`, 'i');
            const match = html.match(regex);
            return match ? match[1] : '';
        };

        const title = getMetaTag('title') ||
            (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]) ||
            'No title';

        const description = getMetaTag('description');
        const image = getMetaTag('image');

        res.json({
            success: 1,
            link: url,
            meta: {
                title,
                description,
                image: {
                    url: image
                }
            }
        });

    } catch (error) {
        console.error('❌ Metadata fetch error:', error.message);
        res.json({
            success: 0,
            link: req.query.url,
            meta: {}
        });
    }
});

app.post('/api/send-test', async (req, res) => {
    try {
        const { to, subject, html } = req.body;

        if (!setupTransporter && !transporter) {
            await setupTransporter();
        }

        // Ensure transporter is ready
        if (!transporter) await setupTransporter();

        const info = await transporter.sendMail({
            from: GMAIL_USER ? `"Newsletter Builder" <${GMAIL_USER}>` : '"Newsletter Builder" <test@newsletter.local>',
            to,
            subject: subject || 'Newsletter Test',
            html,
        });

        // Generate preview URL if using Ethereal
        const previewUrl = nodemailer.getTestMessageUrl(info);

        console.log('📨 Email processed.');
        if (previewUrl) {
            console.log('🔗 Preview URL:', previewUrl);
        } else {
            console.log('✅ Sent to:', to);
        }

        res.json({
            success: true,
            messageId: info.messageId,
            previewUrl
        });
    } catch (error) {
        console.error('❌ Email error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    setupTransporter();
});
