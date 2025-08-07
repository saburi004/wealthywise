import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_FOLDER = path.join(__dirname, 'temp');

// Create temp folder if it doesn't exist
if (!fs.existsSync(TEMP_FOLDER)) {
  fs.mkdirSync(TEMP_FOLDER, { recursive: true });
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

router.get('/', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const { data } = await gmail.users.messages.list({
      userId: 'me',
      q: 'subject:statement OR subject:"bank statement" OR from:bank OR has:attachment',
      maxResults: 10
    });

    const downloadedFiles = [];

    for (const msg of data.messages || []) {
      const msgData = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full'
      });

      const parts = msgData.data.payload?.parts || [];
      for (const part of parts) {
        if (part.mimeType === 'application/pdf' && part.filename) {
          const attachmentId = part.body.attachmentId;
          if (!attachmentId) continue;

          const attachment = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId: msg.id,
            id: attachmentId
          });

          const fileData = Buffer.from(attachment.data.data, 'base64');
          const filePath = path.join(TEMP_FOLDER, part.filename);
          
          fs.writeFileSync(filePath, fileData);
          downloadedFiles.push({
            filename: part.filename,
            path: filePath,
            messageId: msg.id,
            snippet: msgData.data.snippet
          });
        }
      }
    }

    res.redirect(`/?status=success&files=${downloadedFiles.length}`);
  } catch (err) {
    console.error('OAuth Error:', err);
    res.redirect('/?status=error');
  }
});

export { router as gmailRouter };