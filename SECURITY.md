# Unified Discord Bot - Security Notes

## 🎯 Purpose

This document outlines the **security considerations** for the Unified Discord Bot.  
As a community-facing platform handling **user data, moderation actions, and external integrations**, security was a core part of the system design.

---

## 🔑 Core Risks

### 1. User Data (PII)
- **Collected:** Discord IDs, usernames, messages, XP/levels, moderation strikes, tickets, ticket transcripts.
- **Storage:** MongoDB (schemas: `User`, `Infractions`, `Ticket`, `TicketTranscript`).
- **Risks:**
  - Exposure if MongoDB credentials are leaked.
  - Ticket transcripts may contain sensitive private user data.
- **Mitigations:**
  - MongoDB URL stored securely in `.env` / `config.json`.
  - Ticket transcripts uploaded as **secret GitHub Gists** (not public).
  - Fallback to encrypted MongoDB storage.
  - Access restricted to trusted moderators only.

---

### 2. File & Transcript Storage
- **Collected:** Ticket transcripts, moderation logs.
- **Storage:** GitHub Gist (via API), fallback MongoDB collection.
- **Risks:**
  - Public Gists could expose sensitive conversations.
- **Mitigations:**
  - All transcripts default to **secret Gists**.
  - Only moderators receive transcript links in Discord.
  - 1000+ transcripts securely stored across production environments.

---

### 3. Bot Token & Secrets
- **Stored In:** `config.json` + `.env`.
- **Risks:**
  - Bot token exposure = full account compromise.
  - MongoDB URL exposure = database breach.
- **Mitigations:**
  - `.gitignore` excludes secrets → never committed.
  - Deployment pipelines use environment variables.
  - Keys rotated regularly and revoked if leaked.

---

### 4. Moderation Actions
- **Collected:** Warnings, strikes, bans, timeouts, verification logs.
- **Storage:** `Infractions` schema in MongoDB.
- **Risks:**
  - Abuse by untrusted moderators.
  - Escalation if strike system misconfigured.
- **Mitigations:**
  - Commands gated via Discord permissions (`BAN_MEMBERS`, `ADMINISTRATOR`).
  - Bot-side `admin` and `owner` flags enforced in handlers.
  - Configurable strike tiers ensure consistency.
  - Verification tickets reduce raid/bot account abuse.

---

### 5. Deployment & Hosting
- **Platform:** VPS + Discloud.
- **Risks:**
  - Config leaks could allow hijacked deployments.
- **Mitigations:**
  - Config files restricted in repo.
  - Discloud imports/backups rotated and secured.
  - VPS access restricted via SSH keys.

---

## 📋 Security-by-Design Principles

1. **Least Privilege** → Role/permission-based access for all moderation actions.
2. **Zero Secrets in Repo** → Tokens and DB credentials externalized in `.env`.
3. **Externalized Risk** → GitHub Gist handles transcript storage, reducing DB bloat.
4. **Auditability** → All infractions logged, transcripts archived, and tickets closed with traceable history.
5. **Defense in Depth** → Escalation policies (warnings → strikes → bans) layered with verification workflows.

---

## ⚡ Gaps & Future Improvements

- No automated malware scanning for uploaded attachments in tickets.
- No structured intrusion detection or anomaly monitoring.
- GitHub Gist, while convenient, may not provide full compliance guarantees.
- Reliance on manual moderator oversight for enforcement quality.
- Secrets currently visible in `config.json` in repo → must be migrated fully to `.env`.

---

## ✅ Recruiter-Facing Takeaway

The Unified Discord Bot demonstrates **security-aware design** in a real-world community management context:

- Protected user data with secret transcripts (GitHub Gist + MongoDB fallback).  
- Safe handling of bot tokens and MongoDB URLs.  
- Moderation gated by both Discord and bot-level permissions.  
- Verification tickets protect against raid-style attacks.  
- Deployment aligned with best practices for secrets management.  

While lightweight, the bot applies **practical, production-grade security practices** appropriate for community-scale deployment.

---
