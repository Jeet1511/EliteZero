// Bot Configuration
// Created by @jeet1511 - https://github.com/jeet1511
export default {
  // Futuristic color scheme
  colors: {
    primary: '#00D9FF',      // Cyan
    secondary: '#B24BF3',    // Purple
    accent: '#FF6B9D',       // Pink
    success: '#00FF88',      // Green
    warning: '#FFB800',      // Orange
    error: '#FF4757',        // Red
    dark: '#0A0E27',         // Dark blue
    darker: '#050816',       // Darker blue
  },

  // Emojis for enhanced UX
  emojis: {
    online: '🟢',
    idle: '🟡',
    dnd: '🔴',
    offline: '⚫',
    bot: '🤖',
    rocket: '🚀',
    sparkles: '✨',
    zap: '⚡',
    fire: '🔥',
    star: '⭐',
    gear: '⚙️',
    shield: '🛡️',
    crown: '👑',
    wave: '👋',
    thinking: '🤔',
    check: '✅',
    cross: '❌',
    loading: '⏳',
  },

  // Rotating status messages
  statusMessages: [
    { type: 'WATCHING', text: 'over the server 👀' },
    { type: 'LISTENING', text: '/help for commands 🎵' },
    { type: 'PLAYING', text: 'with AI 🤖' },
    { type: 'COMPETING', text: 'in the future 🚀' },
    { type: 'CUSTOM', text: '✨ EliteZero Bot' },
  ],

  // Status rotation interval (30 seconds)
  statusInterval: 30000,

  // Bot settings
  settings: {
    prefix: '!',  // Fallback prefix for non-slash commands
    ownerId: '',  // Your Discord user ID (optional)
    github: 'https://github.com/jeet1511', // Creator GitHub
    inviteURL: 'https://discord.com/oauth2/authorize?client_id=1466746596904665179', // Bot invite link
  },

  // Embed footer
  footer: {
    text: 'EliteZero • God',
    iconURL: '', // Bot avatar URL (will be set dynamically)
  },

  // Keep-alive configuration (prevents bot sleep on Replit)
  keepAlive: {
    enabled: true, // Set to false to disable keep-alive messages
    interval: 5 * 60 * 1000, // 5 minutes in milliseconds
  },
};
