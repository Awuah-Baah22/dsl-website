# Dos Santos Limited website

Plain HTML, CSS and JavaScript. No build step, no framework.
Open the folder in VS Code and run **Live Server** on `index.html`.

## Folder structure

```
site/
├── index.html          Home
├── services.html       Services
├── siemens.html        Siemens
├── projects.html       Projects (ENI, portfolio, gallery, network)
├── about.html          About (story, mission/vision, values, policies)
├── esg.html            ESG
├── contact.html        Contact form + maps
├── thank-you.html      Shown after the form is sent
├── 404.html            "Page not found"
│
├── css/
│   ├── base.css        Colours, fonts, buttons, sections, photo slots, scroll animation
│   ├── layout.css      Header, menu, footer
│   ├── components.css  Reusable blocks (stats, logo strip, cards, testimonials, gallery, form ...)
│   └── pages.css       Sections that belong to one page
│
├── js/
│   ├── main.js         Every page: menu, scroll animation, photo slots, logo strips, counters, form
│   └── pages/
│       ├── home.js     Hero slideshow
│       ├── services.js Support slider + fumigation tap on phones
│       ├── projects.js Gallery viewer + full screen
│       └── about.js    Core values waves
│
├── images/             Photos and logos (see IMAGE-SLOTS.txt)
│   └── illustrations/  Drawings used until your photos are added
├── policies/           Policy PDFs (quality-policy.pdf, ...)
├── IMAGE-SLOTS.txt     Every photo/logo/PDF the site expects, page by page
├── netlify.toml        Netlify settings
└── robots.txt
```

## How to change things

| I want to ... | Where |
|---|---|
| Change a colour or font | `css/base.css`, section 1 (TOKENS) |
| Change a menu link | The `<header>` block at the top of **every** page |
| Change footer details | The `<footer>` block at the bottom of **every** page |
| Add a hero photo (Home) | `index.html`, copy one `<img class="home-hero__slide">` line |
| Add a photo anywhere | Put the file at the path in the `<img data-slot src="...">` tag |
| Add a client logo | Copy one `logo-strip__item` (moving strips) or `client-card` (portfolio) |
| Link a Siemens product | `siemens.html`, change `href="#"` on that `product-card` |
| Change "View the product range" | `siemens.html`, the comment `PRODUCT RANGE LINK` |
| Add a gallery photo | `projects.html`, copy one `gallery__thumb` button |
| Change the stats numbers | `data-count="47"` and the number next to it, on **Home and Projects** |
| Add a policy PDF | Put it in `policies/` with the name used in `about.html` |

## Useful classes

- `reveal` - add to anything to make it fade up when scrolled to.
- `img data-slot` - a photo slot. Missing file = placeholder, never a broken image.
- `data-fallback="file.svg"` on a slot - shows that drawing until the photo exists.
- `section`, `section--cloud`, `section--dark` - section spacing and backgrounds.
- `btn btn--primary | btn--outline | btn--orange | btn--ghost | btn--white` - buttons.

## Contact form (Netlify)

The form already has `data-netlify="true"`. After the site is live:
Netlify > your site > **Forms** > `contact` shows every message.
Turn on email notifications in **Forms > Form notifications**.
On Live Server the form only checks the fields (Netlify is not there yet).

## Going live on Netlify

1. Netlify > **Add new site** > **Deploy manually**.
2. Drag this whole `site` folder onto the page.
3. Later updates: drag the folder again (or connect GitHub).

## Planned later (not built yet)

- Siemens product prices and online payment (needs a payment provider such as Paystack and a small backend).
