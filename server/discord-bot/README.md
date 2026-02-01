# 🤖 EliteZero Discord Bot

A futuristic Discord bot with AI chatbot capabilities, premium aesthetics, and modern slash commands.

## ✨ Features

- 🤖 **AI-Powered Chatbot** - Natural conversations with pattern-matching intelligence
- 🦞 **OpenClaw Integration** - Advanced AI mode with context-aware responses
- ⚡ **Slash Commands** - Modern Discord slash command support
- 🎨 **Premium Embeds** - Stunning gradient designs with cyan/purple/pink theme
- 🔄 **Rotating Status** - Dynamic status messages
- 📊 **Server Stats** - Comprehensive server and bot information
- 🖼️ **Avatar Display** - High-quality avatar viewer with download links

## 📋 Commands

| Command | Description |
|---------|-------------|
| `/help` | Display all available commands |
| `/ping` | Check bot latency and performance |
| `/info` | View bot information and statistics |
| `/chat <message>` | Have a conversation with AI |
| `/avatar [user]` | Display user avatar in high quality |
| `/serverinfo` | View detailed server statistics |
| `/zero [message]` | 🦞 Activate OpenClaw AI mode for advanced conversations |
| `/stop` | 🛑 Deactivate OpenClaw mode and return to normal bot |

**Tip:** You can also mention the bot (`@EliteZero`) in any message to start a conversation!

## 🚀 Setup Instructions

### Prerequisites

- Node.js v18.0.0 or higher
- A Discord bot token from [Discord Developer Portal](https://discord.com/developers/applications)

### Step 1: Get Your Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click on your application (or create a new one)
3. Go to the "Bot" section
4. Click "Reset Token" and copy your bot token
5. **Important:** Keep this token secret!

### Step 2: Get Your Client ID and Guild ID

**Client ID:**
1. In Discord Developer Portal, go to "OAuth2" → "General"
2. Copy your "Client ID"

**Guild ID (Server ID):**
1. In Discord, enable Developer Mode: Settings → Advanced → Developer Mode
2. Right-click your server icon → Copy Server ID

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here
   ```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Deploy Commands

```bash
npm run deploy
```

This will register all slash commands to your Discord server.

### Step 6: Start the Bot

```bash
npm start
```

You should see:
```
✓ Logged in as YourBot#0000
✓ Ready to serve X servers
✓ Bot is fully operational! 🚀
```

### Step 7 (Optional): Enable OpenClaw Integration

To use the `/zero` command for advanced AI conversations:

1. **Install OpenClaw** (if not already installed):
   ```powershell
   iwr -useb https://openclaw.ai/install.ps1 | iex
   ```

2. **Start OpenClaw Gateway** (as Administrator):
   ```powershell
   openclaw gateway start
   ```

3. **Get your gateway token**:
   ```powershell
   openclaw gateway token show
   ```

4. **Add to `.env` file**:
   ```env
   OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789
   OPENCLAW_GATEWAY_TOKEN=your_token_from_step_3
   ```

5. **Redeploy commands and restart bot**:
   ```bash
   npm run deploy
   npm start
   ```

Now you can use `/zero` to activate OpenClaw AI mode!


## 🎨 Customization

### Change Colors

Edit `config.js` to customize the color scheme:

```javascript
colors: {
  primary: '#00D9FF',      // Cyan
  secondary: '#B24BF3',    // Purple
  accent: '#FF6B9D',       // Pink
  // ... more colors
}
```

### Add Custom Status Messages

Edit `config.js`:

```javascript
statusMessages: [
  { type: 'WATCHING', text: 'your custom status' },
  { type: 'PLAYING', text: 'another status' },
  // ... add more
]
```

### Modify Chatbot Responses

Edit `utils/chatbot.js` to add new patterns and responses.

## 📁 Project Structure

```
discord-bot/
├── commands/           # Slash commands
│   ├── help.js
│   ├── ping.js
│   ├── info.js
│   ├── chat.js
│   ├── avatar.js
│   └── serverinfo.js
├── events/            # Event handlers
│   ├── ready.js
│   ├── interactionCreate.js
│   └── messageCreate.js
├── utils/             # Utilities
│   ├── embedBuilder.js
│   ├── chatbot.js
│   └── logger.js
├── config.js          # Bot configuration
├── index.js           # Main bot file
├── deploy-commands.js # Command deployment
├── package.json
└── .env              # Environment variables
```

## 🔧 Troubleshooting

### Bot doesn't respond to commands

1. Make sure you ran `npm run deploy` to register commands
2. Check that the bot has proper permissions in your server
3. Verify your `.env` file has correct values

### "Invalid Token" error

- Double-check your `DISCORD_TOKEN` in `.env`
- Make sure you copied the entire token
- Try resetting the token in Discord Developer Portal

### Commands not showing up

- Guild commands update instantly, but only in the specified server
- Global commands (without GUILD_ID) take up to 1 hour to propagate
- Make sure the bot has `applications.commands` scope

### Bot goes offline immediately

- Check the console for error messages
- Verify all required intents are enabled in Discord Developer Portal:
  - Server Members Intent
  - Message Content Intent

## 🎯 Bot Permissions

When inviting the bot, make sure it has these permissions:

- Read Messages/View Channels
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Use Slash Commands

**Quick Invite Link:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

Replace `YOUR_CLIENT_ID` with your actual client ID.

## 📝 Adding New Commands

1. Create a new file in `commands/` folder:

```javascript
import { SlashCommandBuilder } from 'discord.js';
import embedBuilder from '../utils/embedBuilder.js';

export default {
  data: new SlashCommandBuilder()
    .setName('yourcommand')
    .setDescription('Your command description'),

  async execute(interaction) {
    const embed = embedBuilder.info('Title', 'Description');
    await interaction.reply({ embeds: [embed] });
  },
};
```

2. Run `npm run deploy` to register the new command
3. Restart the bot

## 🌟 Future Enhancements

- Moderation commands (kick, ban, mute)
- Welcome/goodbye messages
- Reaction roles
- Music playback
- Custom server-specific features
- Integration with AI APIs (OpenAI, Google AI)

## 📄 License

ISC License - Feel free to modify and use for your own projects!

## 🤝 Support

If you encounter any issues or have questions, feel free to reach out!

---

**Made with ❤️ and ⚡ by Jeet**
