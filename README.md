# Unified Discord Bot - Community Engagement & Support 🎮

[![Live Bot](https://img.shields.io/badge/Live-Active-green?logo=discord)](https://discord.com/)  
A **modular Discord bot** built to consolidate commands, events, and support workflows into **one scalable system**.
Originally designed for a **large-scale gaming community (Kingdom 3743, ~900 members)**, it has since been deployed across **8 servers**, replacing the need for multiple bots.

---

## 🌐 Live Usage

- **Primary Server:** *Kingdom 3743* (~900 members, est. May 2024)  
- **Adoption:** Running in **8 separate servers**  
- **Repo Owner:** [rushinski](https://github.com/rushinski)

---

## ✨ Features

- ⚖️ **Moderation Tools** → `/send-rules` command (admin-only), rule embeds, and structured enforcement.  
- 🎟️ **Ticketing System** → dropdown ticket creation, role-based verification, support pings with cooldown, and closure transcripts (saved to GitHub Gist).  
- 🏆 **Leveling & Leaderboards** → gamified chat progression, user persistence in MongoDB, `/leaderboard` command to showcase top members.  
- 🔔 **Event Handlers** → modular event listeners for `messageCreate`, `guildMemberAdd`, `messageDelete`, and more.  
- 🛠️ **Dynamic Loaders** → auto-registration of commands, events, and UI components.  
- 🔐 **Access Control** → flag-driven restrictions (`admin`, `owner`), cooldowns, and Discord-native permission checks.

---

## 📊 Impact

👥 **893+ community members** in Kingdom 3743  
🤖 **8 servers** actively running the bot  
💼 **3 paid bot development offers** generated from this project  
☁️ **Scaled hosting** → upgraded from free-tier to paid server due to growth  
🛡️ **Security-aligned** → built to integrate with Discord’s security & permission model

---

## 🛠 Tech Stack

**Bot Core**
- [Node.js](https://nodejs.org/) + [discord.js](https://discord.js.org/) v14
- MongoDB + Mongoose (persistence)

**Features**
- Slash Command Framework (`SlashCommandBuilder`)
- Modular event-driven architecture
- Leveling + gamification engine
- Ticket system with transcripts + GitHub Gist integration

**Infrastructure**
- Hosting: Upgraded paid VPS (for scale)  
- Config: JSON-based configs + `.env` secrets  
- Security: Discord permission model + flag-based command access

---

## 📂 Repository Structure

```text
bot/
├── commands/              # Modular command files
│   ├── levels/            # Leveling commands (leaderboard, yap-check)
│   ├── moderation/        # Moderation commands (send-rules, setup)
│   └── misc/              # Miscellaneous commands
│
├── events/                # Event handlers (messageCreate, tickets, guild events)
├── utils/                 # Infrastructure loaders (RegisterCommands, ComponentLoader)
├── schemas/               # MongoDB models (User, Ticket, Config, Transcripts)
├── data/                  # Static data (levels, banned words)
│
├── index.js               # Entrypoint, client + loaders
├── config.json            # Bot configuration
└── package.json           # Dependencies
```

---

## 📖 Additional Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) → System design and lifecycle flow  
- [INTEGRATIONS.md](./INTEGRATIONS.md) → Discord API, MongoDB, GitHub Gist integrations  
- [SECURITY.md](./SECURITY.md) → Role-based restrictions, cooldown enforcement, data handling

📌 Portfolio Case Study: This bot demonstrates **scalable engineering for real-world community management**, bridging moderation, engagement, and structured support into one unified system.

