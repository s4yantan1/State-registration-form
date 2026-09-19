# Consultation on Access to Empowerment

Static, mobile-first registration page for the Odisha consultation on E-Governance for PVTGs and Marginalized Communities.

## Purpose

This project is a frontend-only registration experience designed to be opened from a QR code. It prepares a structured participant registration object in the browser and shows a confirmation state after validation. It does not use a database, local storage, analytics, authentication, or any third-party submission service.

## Run locally

No build step is required. Open `index.html` in a browser, or serve the folder with any static file server, for example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Structure

```text
/
├── index.html   # Semantic page and form markup
├── style.css    # Responsive visual system and layout
├── script.js    # Validation, signature pad, and submission preparation
└── README.md
```

## Branding assets

The supplied logo files are stored in `assets/` and are used directly in the header:

```text
assets/
├── cini-logo.png
└── nasscom-foundation-logo.png
```

Replace those files in place if higher-resolution official versions become available. The header image elements include accessible alt text.

## Form fields

The submitted object uses these names: `fullName`, `designation`, `organisation`, `organisationType`, `state`, `district`, `block`, `email`, `mobileNumber`, `alternateContactNumber`, `documentationConsent`, `digitalSignature`, and `submissionDateTime`.

Districts are defined directly in the district `<select>` in `index.html`. The block selector is intentionally a small dynamic placeholder and can later be populated from a district data source.

## Digital signature

The canvas supports mouse, touch, and stylus pointer input. `Clear signature` clears the drawing. On submit, the canvas is converted to a PNG data URL and assigned to `digitalSignature`; it is not uploaded or stored.

## Future API integration

The integration boundary is `submitRegistration(data)` in `script.js`. The function currently resolves a simulated frontend submission. Replace its body with a `fetch` call to the CINI endpoint once the backend contract and endpoint are provided. No API URL is invented in this project.

## Deployment

The page can be hosted as a static site on GitHub Pages or any static hosting provider. Publish the repository root, including `index.html`, `style.css`, and `script.js`. Backend and database integration is pending.
