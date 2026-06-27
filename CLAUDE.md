# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The website for the **Core C++** conference (corecpp.org), a Jekyll static site
forked from the GDG "Project Zeppelin" DevFest template. It is deployed to GitHub
Pages from the `master` branch, with the custom domain set via `CNAME`
(`corecpp.org`). The site is re-themed and re-populated each year for the next
conference edition.

## Commands

```bash
bundle install                 # install Ruby gem dependencies (one-time)
bundle exec jekyll serve -w    # build + serve at http://localhost:4000, rebuild on change
bundle exec jekyll build       # one-off build into _site/
npx cspell "**/*.{html,md,markdown,yml}"   # spell-check (config in cspell.config.yaml)
```

Ruby version is pinned in `.ruby-version` (3.3.11); use rbenv (or any manager
that reads `.ruby-version`). The system macOS Ruby is too old for the
`github-pages` gem. There is no test suite — verification is visual via the
local server.

## Architecture

### Data-driven content
Conference content lives in `_data/*.yml`, **not** in HTML. Edit these to change
what the site shows:
- `speakers.yml` — speaker records, each with a numeric `id`
- `sessions.yml` — talks/workshops, each with `id` and a `speakers: [ids]` list referencing speaker ids
- `schedule.yml` — per-day tracks and timeslots, where each timeslot references `sessionIds: [...]`
- `partners.yml` — sponsors/partners (grouped by tier)
- `team.yml`, `organizers.yml` — people

The three-way link **schedule → sessions → speakers** is by numeric id. When
adding a talk you typically add a speaker, a session referencing the speaker id,
and a schedule timeslot referencing the session id. Past-year content is usually
left in the YAML files commented out (`#`) rather than deleted.

### Site configuration
`_config.yml` is the single source of truth for the current edition: title,
`eventDate`, hero text, navigation links, ticket/CFP URLs, social/SEO metadata,
and the `aboutBlock`. Updating the site for a new year is mostly editing
`_config.yml` plus the `_data` files. Note `permalink` and feature flags like
`showSessions` here drive page behavior.

**Rolling the site to a new edition** (dates, hiding last year's
speakers/schedule, archiving PDFs/photos, SEO metadata, logo year) follows a
specific checklist — see **[NEW_YEAR_ROLLOVER.md](NEW_YEAR_ROLLOVER.md)**.

### Pages, layouts, includes
- Top-level `*.html` files (`index.html`, `speakers.html`, `schedule2.html`, `team.html`, …) are thin pages: YAML front matter (`layout`, `permalink`, `title`) plus a series of `{% include %}` calls.
- `_includes/*.html` are the actual content sections (`hero.html`, `partners.html`, `schedule.html`, `speakers-list.html`, modals, etc.). This is where most rendering logic and markup lives.
- `_layouts/default.html` wraps every page (head, nav, footer, modals). It chains to `_layouts/compress.html`, which strips whitespace from the final HTML.
- **Homepage sections are toggled by commenting includes in/out** in `index.html` using `{% comment %} … {% endcomment %}`. This is the normal mechanism for showing/hiding blocks per edition — expect many commented-out includes.

### Styling (SCSS via Jekyll's built-in converter)
- Source styles are in `_sass/` (`main.scss` + `partials/_*.scss` + vendored Bootstrap 3 / Animate / Waves under `_sass/vendor/`).
- `css/main.scss` is the entry point: it has empty YAML front matter so **Jekyll's built-in `jekyll-sass-converter` compiles it to `css/main.css`** (output style `compressed`, set in `_config.yml`). Edit the `_sass` partials; never edit `css/main.css` — it is generated and **not** committed (it's git-ignored output that Jekyll, and GitHub Pages, build on demand).
- This project formerly used **Compass** (a long-dead Ruby Sass framework) driven by a custom `_plugins/` generator. That pipeline was removed; if you see references to Compass, `_plugins/generator_scss.rb`, or a committed `css/main.css` in old commits, that's the legacy setup. The one Compass feature that was actually used, `headings()`, was replaced with the literal `h1, h2, h3, h4, h5, h6` selector list in `_sass/partials/_global.scss`.
- Note: the prefix-adding Autoprefixer step is gone with Compass. Most vendor prefixes are already hand-written in the Bootstrap 3 mixins (`_sass/vendor/bootstrap/mixins/`), which is fine for current browsers.

### SEO structured data
- `_includes/schema-event.html` emits a JSON-LD `<script type="application/ld+json">` block (schema.org `Event`) on every page, via the layouts. It is invisible on the page — inspect it with *View Source* or `curl -s <url> | grep ld+json`. It must remain **valid JSON** (no `//` comments).
- ⚠️ **When new content is published, the matching JSON-LD blocks must be re-added**: during the 2026 teaser rollover the `performer` (speakers), `offers` (tickets), and `subEvent` blocks were stripped out, leaving only the core Event. As speakers/sessions/tickets come online, restore those blocks (templated versions are in this file's git history). See [NEW_YEAR_ROLLOVER.md](NEW_YEAR_ROLLOVER.md) step 8.

### Other
- `automation/` holds Windows-oriented image-optimization and JS-minification scripts (optipng, jpegtran, yuicompressor, etc.) — run manually, not part of the Jekyll build.
- Blog posts live in `_posts/` (published) and `_drafts/` (unpublished); the blog is currently disabled in navigation.
- `cspell.config.yaml` carries a `words:` allowlist of company/conference names — add new sponsor/speaker proper nouns there to keep spell-check clean.
