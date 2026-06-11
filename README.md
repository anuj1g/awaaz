# Awaaz — Public Complaint Platform

Awaaz is an anonymous public grievance platform. Anyone can report an issue — a road accident, a corrupt official, a school complaint, anything — without revealing their identity. Based on the location mentioned in the report, the complaint is automatically routed to the relevant local authority (police, municipality, etc.) via email using Power Automate.

The posts are public so the community can engage with them, which also adds social pressure on authorities to act.

---

## Features

- Anonymous complaint submission — no name appears on posts
- File attachments — photos, videos, and documents supported
- Location-based email routing to relevant authority via Power Automate
- OTP-based login and signup via EmailJS
- Public post feed with likes, comments, and share options
- Direct sharing to WhatsApp, Facebook, and X (Twitter)
- Copy link for any post

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, TypeScript, Tailwind CSS |
| Backend / Database | Firebase (Firestore, Auth, Storage) |
| OTP / Email | EmailJS |
| Automation | Microsoft Power Automate |
| AI Integration | Google Gemini API |
| Build Tool | Vite |

---

## Getting Started

**Prerequisites:** Node.js v18+, Firebase project, EmailJS account, Power Automate flow configured

```bash
git clone https://github.com/anuj1g/awaaz.git
cd awaaz
npm install

# Copy the env template and fill in your keys
cp .env.example .env.local

npm run dev
```

---

## How the Email Routing Works

When a user submits a complaint and selects a location, the form data triggers a Power Automate flow. The flow reads the location field and sends an email to the mapped authority for that area — for example, a complaint tagged to Bhopal routes to Bhopal municipal or police contact. New locations can be added by updating the flow's routing table.

---

## Project Structure

```
awaaz/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route-level pages
│   ├── firebase/       # Firebase config and helpers
│   └── utils/          # Utility functions
├── server/             # Server-side logic
├── uploads/            # File upload handling
├── .env.example
├── firestore.rules
└── vite.config.ts
```

---

## Roadmap

- [x] Anonymous complaint submission
- [x] File uploads (photo, video, documents)
- [x] OTP-based authentication
- [x] Location-based authority email routing via Power Automate
- [x] Public feed with likes, comments, and social sharing
- [ ] Admin/authority dashboard to manage and respond to complaints
- [ ] Complaint status tracking for users
- [ ] Mobile app

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## License

MIT
