# 💗 Elina's Love Claw Machine

A playable, mobile-friendly claw machine website built with plain HTML, CSS, and JavaScript. No frameworks or build step required.

## Prizes
- 💆‍♀️ Free Massage
- 💋 Unlimited Kiss
- 🍜 Dinner Date
- 🧋 Bubble Tea

## Love notes from Josh's messages
The game includes a second tab, **💌 My texts to you**, containing collectible envelopes. Each time Elina grabs an envelope, a message from Josh's outgoing texts appears as a keepsake card. The eight messages are transcribed from the supplied screenshots and are intentionally not shown as screenshot images. The collection saves locally on the device. All eight notes are discoverable, and the machine remains replayable.

Edit or add messages in the `LOVE_MESSAGES` array at the top of `script.js`. The four original gifts and coupons are unchanged. Select the desired tab above the machine to switch between gifts and notes.

## Run locally
Open `index.html` in a browser, or use VS Code's Live Server extension.

## Deploy to GitHub + Vercel
1. Create a new GitHub repository, for example `love-claw-machine`.
2. Upload the **contents of this folder** (or push via Git).
3. In Vercel choose **Add New → Project → Import Git Repository**.
4. Select the repo. Choose **Framework Preset: Other**; leave build command empty, and set output directory to `.` if requested.
5. Click **Deploy**. Share the generated `.vercel.app` URL.

New pushes to the connected repository automatically trigger deployments.

## Customize
- Change the four prizes, descriptions, or coupons in the `GIFTS` object at the top of `script.js`.
- Change the heading and love note in `index.html`.
- Adjust colors in `styles.css` (`:root` variables).
- Change `Love, Josh ♡` in `index.html` if needed.

## How it works
Use on-screen left/right buttons (or keyboard arrows) to line up the claw above a prize, then tap **GRAB!** (or press Space). If the claw lands sufficiently close to a prize, a redeemable love coupon appears. Winning prizes are saved in the same browser's local storage so the collection persists on that device. The game supports unlimited plays and repeat wins. Coupons are playful keepsakes, not externally tracked redemptions.
