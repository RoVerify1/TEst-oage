# XERION X - Professional Roblox Developer Platform

A cutting-edge Roblox developer platform featuring marketplace, verification system, and creator dashboard.

## Features

- **Modern Cyberpunk UI** - Black/red neon design with glassmorphism effects
- **Discord OAuth2 Login** - Secure authentication with Discord
- **Roblox Verification System** - Bio-based verification for user authentication
- **Marketplace** - Buy and sell Roblox assets (UI packs, scripts, systems, plugins)
- **Creator Dashboard** - Analytics, uploads management, and revenue tracking
- **Particle Animations** - Futuristic background effects
- **Toast Notifications** - Modern notification system
- **Modal System** - Product detail modals
- **Responsive Design** - Mobile-optimized interface

## Tech Stack

### Frontend
- HTML5 / CSS3
- Vanilla JavaScript
- Font Awesome Icons
- Google Fonts (Rajdhani, Inter)

### Backend (server.js)
- Node.js
- Express.js
- Discord.js
- LowDB (JSON database)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your credentials:
```env
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/callback
DISCORD_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_guild_id
DISCORD_ROLE_ID=your_role_id
PORT=3000
```

4. Start the server:
```bash
npm start
```

5. Open http://localhost:3000 in your browser

## Project Structure

```
/workspace
├── index.html          # Main frontend application
├── server.js           # Backend server with API routes
├── package.json        # Dependencies configuration
├── vercel.json         # Vercel deployment config
└── README.md           # This file
```

## Sections

### Home
- Hero section with animated stats
- Live statistics (verified users, online users, products sold, connected games)

### Features
- Roblox Verification
- Marketplace
- UI Packs
- Discord Sync
- Analytics
- Premium Features

### Marketplace
- Product search and filtering
- Categories: UI Packs, Scripts, Systems, Plugins
- Product cards with ratings and prices
- Modal product details

### Games
- Featured games showcase
- Game statistics (visits, likes, players)

### Dashboard
- User profile with verification status
- Stats panels (downloads, revenue, uploads, likes)
- Recent activity feed
- Sidebar navigation

### Verification
- Discord login integration
- Roblox username input
- Code generation
- Bio verification workflow

## Configuration

### Discord OAuth2 Setup
1. Go to Discord Developer Portal
2. Create a new application
3. Add redirect URI: `http://localhost:3000/callback`
4. Copy Client ID and Client Secret to .env

### Discord Bot Setup
1. Create bot in Discord Developer Portal
2. Enable required intents (Guilds, GuildMembers)
3. Invite bot to your server
4. Copy bot token and guild/role IDs to .env

## Security Notes

- Never commit .env files
- Use HTTPS in production
- Implement rate limiting
- Validate all user inputs
- Keep dependencies updated

## License

© 2025 XERION X. All rights reserved.
