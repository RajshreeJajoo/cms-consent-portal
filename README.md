# CMS Consent Portal

Live demo: [https://rajshreejajoo.github.io/cms-consent-portal/](https://rajshreejajoo.github.io/cms-consent-portal/)

A browser-only consent management demo for a sales campaign. Advisers, operations, and compliance staff work from one register. A prospect can scan a campaign QR code and submit marketing consent on their own phone. Nothing is sent to a server: accounts, consent records, and the do-not-contact list stay in the browser.

## What a reviewer can try

- Sign in as four different roles. Each role sees a different menu.
- Approve or reject a first-time access request as admin.
- Enter a new consent, including a paper scan, and open it on the register.
- Open a campaign QR. The public form is tied to that campaign and adviser.
- Withdraw consent, change contact preferences, or use the unsubscribe link.
- Check whether a person may be contacted for a purpose and channel.
- Load a do-not-contact list. A listing overrides an earlier opt-in.

## Demo sign-in

The sign-in screen lists the same accounts. There is no password reset in this demo.

| Username | Password | Access |
| --- | --- | --- |
| sarah.lim@cms.demo | Sarah#0142 | Adviser |
| operations@cms.demo | Priya#0208 | Operations |
| compliance@cms.demo | David#1104 | Compliance |
| admin@cms.demo | Admin#1001 | Admin, approves first login |
| amir.hassan@cms.demo | Amir#7781 | Waiting for admin approval |

## Stack

React 18, React Router 6, and Vite 4. Consent rules (validation, duplicates, withdrawal, and eligibility) are plain JavaScript and covered by `npm run test:rules`. Vite 4 is pinned so the app still runs on Node.js 14. Current Vite needs Node.js 18 or newer.

## Run locally

```bash
npm install
npm run dev
```

Open the address Vite prints, usually http://localhost:5173.

To scan a QR code from a phone, use the Network address Vite prints and keep the dev server running.

```bash
npm run test:rules
npm run build
```

`main` deploys to GitHub Pages. The published site is served from `/cms-consent-portal/`, so campaign QR links include that path.
