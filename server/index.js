import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { Headers } from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Initialize stats from .env or set to 0 if not exists
const stats = {
  totalLookups: Number(process.env.TOTAL_LOOKUPS || 0),
  availableVanities: Number(process.env.AVAILABLE_VANITIES || 0),
  takenVanities: Number(process.env.TAKEN_VANITIES || 0)
};

// Function to update .env file
async function updateEnvFile() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    const envContent = await fs.readFile(envPath, 'utf-8');
    
    // Update or add stats variables
    const updatedContent = envContent
      .replace(/^TOTAL_LOOKUPS=.*/m, `TOTAL_LOOKUPS=${stats.totalLookups}`)
      .replace(/^AVAILABLE_VANITIES=.*/m, `AVAILABLE_VANITIES=${stats.availableVanities}`)
      .replace(/^TAKEN_VANITIES=.*/m, `TAKEN_VANITIES=${stats.takenVanities}`);

    // If variables don't exist, add them
    const newLines = [];
    if (!updatedContent.includes('TOTAL_LOOKUPS=')) {
      newLines.push(`TOTAL_LOOKUPS=${stats.totalLookups}`);
    }
    if (!updatedContent.includes('AVAILABLE_VANITIES=')) {
      newLines.push(`AVAILABLE_VANITIES=${stats.availableVanities}`);
    }
    if (!updatedContent.includes('TAKEN_VANITIES=')) {
      newLines.push(`TAKEN_VANITIES=${stats.takenVanities}`);
    }

    // Write back to .env file
    await fs.writeFile(
      envPath,
      newLines.length ? `${updatedContent}\n${newLines.join('\n')}` : updatedContent
    );
  } catch (error) {
    console.error('Error updating .env file:', error);
  }
}

app.use(cors());
app.use(express.json());

// Stats endpoints
app.get('/api/stats', (req, res) => {
  res.json(stats);
});

// Discord API endpoint
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const token = process.env.DISCORD_BOT_TOKEN;
    
    if (!token) {
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    const headers = new Headers({
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'DiscordBot (https://discordtest.com, 1.0.0)'
    });

    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Increment lookup counter and update .env
    stats.totalLookups++;
    await updateEnvFile();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Vanity URL check endpoint
app.get('/api/vanity/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const token = process.env.DISCORD_BOT_TOKEN;
    
    if (!token) {
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    const headers = new Headers({
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'DiscordBot (https://discordtest.com, 1.0.0)'
    });

    const response = await fetch(`https://discord.com/api/v10/invites/${code}`, {
      headers
    });

    if (response.status === 404) {
      stats.availableVanities++;
      await updateEnvFile();
      return res.json({ available: true });
    } else {
      stats.takenVanities++;
      await updateEnvFile();
      const data = await response.json();
      return res.json({ available: false, guild: data.guild });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to check vanity URL' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 