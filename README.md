# Mocar: redesigned website

Static site with no build step. Open `index.html`, or upload the whole folder to any web host.

- `assets/js/data.js`: cars, prices, brands, branches, banks, offers and FAQs (snapshot of rec.sa taken 2026-11-02)
- `assets/js/i18n.js`: all Arabic and English interface text
- `assets/js/app.js`: pages and interactive features
- `assets/css/style.css`: design; the brand colours are the variables at the top of the file
- `brand/`: Mocar logo files (SVG and PNG) for slides and print
- `assets/img/`, `assets/fonts/`: optimised images and the self-hosted Cairo font
- `sw.js`, `manifest.webmanifest`: installable app and offline support (these only run on https or localhost)

## Before going live

- **Finance figures:** the 5% profit rate, 60-month term and 33% deduction ratio are placeholders in `FIN` at the top of `app.js`. They drive the monthly estimate on every car card, the monthly filters and the calculators. Replace them with approved figures.
- **Prices:** `data.js` is a snapshot and does not update itself. Connect it to the live API or refresh it when prices change.
- **Requests:** forms and the purchase journey open a pre-filled WhatsApp message to 0560256655. Nothing is saved to a server, and the customer has to press send. Reference numbers are generated in the browser, so sales will not have them on record unless the message is sent.
- **Search engines:** page addresses use `#/`, which Google does not index as separate pages. Real addresses for each car need a server rewrite rule on the chosen host.
- **Analytics:** leads are pushed to `window.dataLayer` as a `lead` event, but no analytics tag is installed yet.
- **Old brand links:** the email address, social links, app store links, Google Maps links, WhatsApp and phone numbers, and the "full privacy policy" link (rec.sa) all still point to the existing Ramz Alekhtyar accounts. Replace them in `contact` and `branches` in `data.js`, and in the privacy page in `app.js`.
- **Branch photos:** the old photos show Ramz Alekhtyar signage, so `assets/img/branches/mocar-branch.webp` is used as a placeholder until new photos are available.
- **Name and logo:** "Mocar" still needs a formal trademark and commercial registration check.
