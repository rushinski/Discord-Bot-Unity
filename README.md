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

### 🎭 Community Engagement
- 🏆 **Leveling & Leaderboards** → gamified chat progression, user persistence in MongoDB, `/leaderboard` command to showcase top members.
- 🎟️ **Ticketing System** → dropdown ticket creation, role-based verification, support pings with cooldown, and closure transcripts (saved to GitHub Gist).
- 📊 **Role Selection & Counts** → `/sendRolesSelect` for self-assignable roles, with live updates tracked by `updateRoleCount`.

### ⚖️ Moderation & Security
- 🚫 **Rule Enforcement** → `/send-rules` command, banned words filter, structured enforcement.
- 🔨 **Expanded Moderation Tools** → `/idBan`, `/idUnban`, `/strike`, `/set`, `/unset`, `/verifyUser` for complete admin control.
- 📝 **Infractions Tracking** → MongoDB persistence for strikes, bans, and moderation logs.

### 🎉 Engagement Utilities
- 🎁 **Giveaways** → `/startGiveaway` with persistent schema for entrants and winners.
- ✅ **Verification System** → `/sendVerification`, verification tickets, reaction-based verification, persistent storage of verification states.
- ⏰ **Utilities** → `/getUtc`, `/say`, scheduled UTC-ready status via `readyUTC`.

### 🛠️ Infrastructure & Extensibility
- 🛠️ **Dynamic Loaders** → auto-registration of commands, events, and UI components.
- 🔐 **Access Control** → flag-driven restrictions (`admin`, `owner`), cooldowns, and Discord-native permission checks.
- ☁️ **Hosting/Deployment** → optimized for Discloud with `discloud.config`, backups, and import snapshots.
- 📂 **Persistence** → MongoDB + Mongoose models for users, tickets, giveaways, configs, transcripts, infractions.
- 🔗 **External Integrations** → GitHub Gist for transcript archiving.

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
- Expanded moderation & verification workflows
- Giveaway engine with persistent storage

**Infrastructure**
- Hosting: Paid VPS + Discloud deployment  
- Config: `config.json` (tokens, Mongo URL, bot ID) + `.env` secrets  
- Security: Discord permission model + flag-based command access

---

## 📂 Repository Structure

```text
bot/
├── commands/              # Modular command files
│   ├── levels/            # Leveling commands (leaderboard, add/remove/reset messages)
│   ├── moderation/        # Moderation commands (ban/unban, strikes, verifyUser, set/unset)
│   ├── misc/              # Miscellaneous commands (getUtc, say)
│   ├── sendRolesSelect.js # Role selection embed
│   ├── sendRules.js       # Rules enforcement
│   ├── sendTicketSetup.js # Ticket setup embed
│   ├── sendVerification.js# Verification setup
│   └── startGiveaway.js   # Giveaway system
│
├── events/                # Event handlers (messages, moderation, tickets, reactions, guild events)
├── utils/                 # Infrastructure loaders & helpers (RegisterCommands, EventLoader, ComponentLoader)
├── schemas/               # MongoDB models (User, Ticket, Infractions, Giveaways, Config, Transcripts)
├── data/                  # Static data (levels, banned words)
├── discloud/              # Hosting configs, backups, import snapshots
│
├── index.js               # Entrypoint, client + loaders
├── config.json            # Bot config (tokens, Mongo URL, bot ID)
├── package.json           # Dependencies
└── package-lock.json      # Lockfile
```

---

## 📖 Additional Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) → System design and lifecycle flow  
- [INTEGRATIONS.md](./INTEGRATIONS.md) → Discord API, MongoDB, GitHub Gist integrations  
- [SECURITY.md](./SECURITY.md) → Role-based restrictions, cooldown enforcement, data handling

📌 Portfolio Case Study: This bot demonstrates **scalable engineering for real-world community management**, bridging moderation, engagement, and structured support into one unified system.
