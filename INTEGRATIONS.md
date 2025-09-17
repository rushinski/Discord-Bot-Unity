# Unified Discord Bot - Integrations

## 🎯 Purpose

This document details the **external integrations** that power the Unified Discord Bot. Each integration connects the bot’s modular system with third-party services or APIs, enabling persistence, deployment, and extended functionality.

---

## 🤖 Discord API

### Overview
- Built on **[discord.js v14](https://discord.js.org/)**, providing an abstraction over the Discord REST and WebSocket APIs.
- Uses **Gateway Intents** for events: `Guilds`, `GuildMembers`, `GuildPresences`, `MessageContent`, `Reactions`.

### Features Enabled
- Slash Commands (`/leaderboard`, `/idBan`, `/startGiveaway`, etc.)
- Interaction Components (buttons, dropdowns, modals)
- Event-driven architecture (messageCreate, guildMemberAdd, ticketSystemHandler)
- Role & permission enforcement via Discord’s built-in security model

### Security
- Commands are gated via Discord role/permission checks and bot-side `admin`/`owner` flags.
- Sensitive identifiers (bot token, application ID) stored in `config.json` / `.env`.

---

## 🗄️ MongoDB

### Overview
- Provides persistence via **Mongoose ODM**.
- Stores all critical bot state across sessions.

### Schemas
- `User` → XP, levels, notifications
- `Infractions` → strikes, warnings, bans
- `Ticket` → open tickets, user, guild, description
- `TicketTranscript` → closed tickets, archived metadata
- `Giveaway` → prize, entrants, winners
- `Config` → per-guild configurations
- `RoleReactionMessage` → reaction-role mappings

### Security
- Connection string (`MONGO_URL`) stored in `config.json` / `.env`.
- Models enforce schema validation for reliable persistence.

---

## 📂 GitHub Gist

### Overview
- Integrated for **ticket transcript storage**.
- Transcripts uploaded after closure for audit and archival.

### Workflow
1. User creates a ticket via dropdown.
2. Support team interacts, conversation is stored.
3. On closure, transcript generated and uploaded via `utils/githubGistUtils.js`.
4. Bot returns Gist link in Discord for moderators.

### Benefits
- Offloads long transcripts from Discord.
- Provides permanent, shareable records.

---

## ☁️ Discloud Hosting

### Overview
- **Discloud** used as a **deployment platform** in addition to VPS hosting.
- Provides backups, imports, and fast redeploys.

### Components
- `discloud.config` → defines deployment parameters.
- `/discloud/import/*` → deployment snapshots (commands, events, utils, schemas).
- `/discloud/backup/` → versioned bot backups.

### Workflow
1. Code changes pushed to GitHub.
2. Discloud pulls and deploys with predefined config.
3. Snapshots allow rollback or environment replication.

---

## 🔐 Security & Secrets

- **Bot Token**: stored in `config.json` / `.env`, required for Discord API auth.
- **MongoDB URL**: stored in `config.json` / `.env`, connects persistence layer.
- **Bot ID/Application ID**: stored in `config.json`, used for command registration.

**Best Practices**
- Never commit real tokens to version control.
- Use environment variables or secret managers for production.
- Apply least-privilege roles in Discord to minimize attack surface.

---

## 🌟 Integration Strengths

- **Discord API** → modular event-driven commands, strong security model
- **MongoDB** → durable storage for leveling, moderation, tickets, giveaways
- **GitHub Gist** → scalable transcript archiving
- **Discloud Hosting** → deployment portability, rollback safety, backups
- **Security Alignment** → secrets management and role-based access enforced
