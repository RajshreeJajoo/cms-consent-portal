# CMS consent portal

Phase 1 consent intake demo. It runs entirely in the browser.

Vite 4 is used so the app runs on Node.js 14. Current Vite needs Node.js 18 or newer.

## Run

```bash
npm install
npm run dev
```

Open the local address Vite prints, usually http://localhost:5173

To scan a QR code from a phone, use the Network address Vite prints and keep the dev server running.

## Sign in

Each person has a separate username and password. There is no password reset on this screen.

| Username | Password | Access |
| --- | --- | --- |
| sarah.lim@cms.demo | Sarah#0142 | Adviser |
| operations@cms.demo | Priya#0208 | Operations |
| compliance@cms.demo | David#1104 | Compliance |
| admin@cms.demo | Admin#1001 | Admin, approves first login |
| amir.hassan@cms.demo | Amir#7781 | Waiting for admin approval |

## Checks

```bash
npm run test:rules
npm run build
```
