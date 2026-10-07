# Telebirr Game Center — The 11 Canonical Workflows

**Target:** Telebirr SuperApp Mini-App / H5 Webview Container  
**Architecture:** Shared-Nothing, Direct C2B Wallet Billing & Anti-Cheat Engine  

This document details the 11 canonical user journeys and technical workflows for the Telebirr Game Center deployment, matching the reference implementation in `docs/game-center-flow/`.

---

## 1. The 11 Canonical Workflows

### Workflow 1: Discovery in Telebirr Game Center (`1. Telebirr game center.jpg`)
- Player opens the official Telebirr SuperApp on Android or iOS.
- Navigates to the "Game Center" / "Mini-Apps" section.
- The portal icon and banner are featured prominently in the catalog.

### Workflow 2: Launch Game Homepage in Webview (`2. game homepage in game center.jpg`)
- User taps the game service icon.
- Telebirr native container opens an embedded Webview pointing to the service URL (`https://<service>.innopulseplatform.com`).
- Query parameters containing the user's MSISDN and temporary session token are passed: `?msisdn=2519...&token=...`.

### Workflow 3: Sign-in Confirmation & SSO Handshake (`3. sign in confirmation.jpg`)
- The Webview prompts for single-sign-on consent.
- Frontend transmits the credentials to `POST /api/auth/telebirr-login`.
- Fastify backend authenticates the MSISDN, upserts the player profile in PostgreSQL, generates a JWT session token, and caches it in Valkey (24h TTL).
- Player receives an immediate sign-in confirmation.

### Workflow 4: Game is inside Telebirr App (`4. Game is in Telebirr App.jpg`)
- Webview renders the full-bleed responsive interface with Telebirr navigation headers intact.
- Safe-area insets (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`) are respected.
- Native back button popstate listener ensures seamless mini-app navigation.

### Workflow 5: Game Home - Tournament & Free Pass Styles (`5. Game home - tournament styles.jpg`)
- Webview renders the 12-game catalog:
  - 1 Flagship Tournament Banner with active prize pool (e.g. 25,000 ETB) and 2-Coin entry fee.
  - 11 Permanent Free Pass cards with instant "PLAY" actions.

### Workflow 6: Game Plan & Coin Package Selection (`6. game plan.jpg`)
- When a user enters the Tournament or opens the wallet modal, coin top-up packs are displayed:
  - 10 Coins = 10 ETB
  - 25 Coins = 25 ETB
  - 50 Coins = 50 ETB

### Workflow 7: Consent for Purchase (`7. consent for purchase.jpg`)
- User selects a coin pack.
- A native Telebirr payment confirmation bottom-sheet appears detailing item description, price in ETB, and payer MSISDN.

### Workflow 8: Payment Order Generation (`8. Payment order.jpg`)
- User taps "Proceed to Pay".
- Frontend calls `POST /api/payments/process`.
- Backend creates a `PENDING` payment order in PostgreSQL and initiates the C2B checkout request to the Telebirr payment gateway.
- Telebirr returns an encrypted checkout URL / H5 payment payload.

### Workflow 9: Payment Processing Wait (`9. payment processing wait.jpg`)
- The Telebirr app displays the PIN authorization prompt.
- User enters their Telebirr PIN to authorize the wallet deduction.
- Frontend listens for completion via asynchronous webhook polling or socket notification.

### Workflow 10: Telebirr Payment Confirmation (`10. telebirr payment confirmation.jpg`)
- Telebirr payment gateway dispatches a signed inbound webhook to `POST /api/payments/webhook`.
- Backend verifies HMAC signature, marks the transaction `SUCCESS` in PostgreSQL, credits the coins to the player's wallet, and invalidates the Valkey cache.
- Telebirr displays the receipt: "Payment Successful".

### Workflow 11: Game Home 2 — Updated Balance & Access (`11. game home 2.jpg`)
- Webview transitions back to the main portal.
- Coin wallet is refreshed via `GET /api/auth/me`.
- Tournament entry is unlocked, and the player can enter competitive matches.

---

## 2. Technical Contracts

### SSO Handshake
```http
POST /api/auth/telebirr-login
Content-Type: application/json

{
  "phoneNumber": "251911223344",
  "token": "tb_sso_token_sample"
}
```

### Response
```json
{
  "success": true,
  "profile": {
    "phoneNumber": "251911223344",
    "displayName": "Gamer_3344",
    "coins": 100,
    "highScores": {}
  },
  "tokens": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```
