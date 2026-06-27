# Annual event rollover

How to re-initialize the site for a new conference edition. This is the runbook
that was followed to roll the site over to **2026**; replace `<YEAR>` with the
new year and `<PREV>` with the previous one.

The general philosophy: the site starts each cycle as a **teaser** (dates +
Call-For-Speakers, last year's content hidden), then content is layered back in
(speakers → schedule → tickets) as it becomes available. Last year's content is
*hidden/archived*, not deleted, so it can be referenced or restored.

> This file is excluded from the Jekyll build (see `exclude:` in `_config.yml`),
> so it is never published to the site.

---

## 1. Dates, year text & core config — `_config.yml`

- `eventDate` — human-readable, e.g. `"October 20-21, 2026"`
- `eventStartTime` / `eventEndTime` — ISO dates (`"2026-10-20"` / `"2026-10-21"`); these feed the SEO structured data
- `eventLocationName` / address / `eventPlaceCoordinates` — update if the venue changed
- Year in text (search for the previous year): `title`, `description`,
  `organizerAlternateName`, `heroTitle`, `aboutTitle`, `twitterHashTag`
- `c4sponsorsUrl` — point at the new sponsoring PDF
- `statisticBlock` — refresh the headline numbers if desired

## 2. Action buttons — `_config.yml`

The same button list appears in three places: `heroButtons`,
`bottomNavigationLinks` (mobile menu), `rightNavigationButtons` (desktop). Keep
them in sync. Enable/disable per phase by (un)commenting lines:

- **Teaser phase:** show **Call For Speakers** (link to
  `/assets/CoreCpp<YEAR>_CallForSpeakers.pdf`); usually hide Register / Sponsor Us
- **Registration open:** add **Register** (`https://ti.to/hamakor/core-cpp-<YEAR>`)
- **Sponsorship:** add **Sponsor Us** (link to the sponsoring PDF)

## 3. PDFs — `assets/`

- Move last year's PDFs to the archive: `assets/CoreCpp<PREV>_*.pdf` →
  `assets/past/<PREV>/` (use `git mv` to preserve history)
- Add the new files to `assets/` using the same naming
  (`CoreCpp<YEAR>_CallForSpeakers.pdf`, `CoreCpp<YEAR>_SponsoringOffer.pdf`)
- Update the button links in `_config.yml` (step 2)

## 4. Hide last year's Speakers & Schedule

- **Navigation:** comment out the `Schedule` and `Speakers` entries in
  `navigationLinks` (`_config.yml`)
- **Direct-URL block:** add `published: false` to the front matter of
  `speakers.html`, `schedule2.html` (`/schedule/`), and `schedule.html`
  (`/schedule_orig/`). Jekyll then won't generate them, so the URLs 404. The
  templates are kept for when the content returns.
- **Photos:** move last year's speaker photos `img/people/*` →
  `img/people/<PREV>/`, **keeping** the ones referenced by `_data/team.yml`
  (the Team tab). Verify afterwards that the only `img/people/*.*` files left at
  the top level are the team photos.

## 5. Home page sections — `index.html` (+ includes)

Home sections are toggled by commenting `{% include %}` lines in/out. For the
teaser phase we removed:

- **Price table** — comment out `{% include tickets.html %}`
- **Sponsors list** — in `_includes/partners.html`, remove the
  `site.data.partners` loop and the "Become a sponsor" button; **keep** the
  Organizers (`site.data.organizers`) block
- **Register / Sponsor Us buttons** — handled via the config lists in step 2

## 6. Data files — `_data/`

- `team.yml` — current organizers (their photos must stay in `img/people/`)
- `speakers.yml`, `sessions.yml`, `schedule.yml`, `partners.yml` — repopulate as
  content is confirmed. The link is by numeric id: **schedule → sessions →
  speakers**.

## 7. Blog

- Keep `blog.html` (the `/blog/` page) but clear the post data in `_posts/`.

## 8. SEO structured data — `_includes/schema-event.html`  ⚠️

This emits the JSON-LD `<script type="application/ld+json">` block on every page
(for Google rich results / social crawlers). It is **not** visible on the page —
view it via *View Source* or `curl -s <url> | grep ld+json`.

For the teaser phase it should contain only the core `Event` (name, dates,
location). **When speakers / sessions / tickets are published, re-add the
matching blocks** — `performer` (from `speakers.yml`), `offers` (from
`ticketsOffers`), and, if relevant, `subEvent`. See the git history of this file
for the full templated versions that were removed during the 2026 rollover.

## 9. Logo year

The year shown in the corner logo (`img/sprites/logos.svg`) is **outlined Fira
Code Bold vector paths**, not editable text, repeated across three sprite
variants (dark/gray/light). To change it, regenerate the digit glyph(s) — the
2026 change used `opentype.js` + the Fira Code Bold TTF to render the new digit,
calibrated to the existing glyphs, then replaced the path data in all three
variants and updated the `aria-label`s. See the "Update corner logo" commit for
the exact approach. Other logo files in `img/seo/` and `img/sprites/` are unused
artifacts (see CLAUDE.md).

## 10. Verify

```bash
bundle exec jekyll build          # must be clean (no Liquid/SCSS errors)
bundle exec jekyll serve          # then spot-check:
```
- `/` and `/team/` return 200; `/speakers/` and `/schedule/` return 404
- Hero shows the new dates; no Register/Sponsor Us/tickets if in teaser phase
- View source: the JSON-LD is valid and shows the new year with no stale data
- No broken `img/people/...` references (only the team photos remain top-level)

## Leftover cleanup (optional)

After hiding last year's content, some config/data becomes orphaned (referenced
by nothing): e.g. `ticketsOffers`, the `hackathon*`/`directionDetails`/`findWay`
blocks, and stale entries in `speakers.yml`. Safe to purge when convenient.
