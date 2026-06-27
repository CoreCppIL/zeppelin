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
bundle install        # install Ruby gem dependencies (one-time)
bundle exec jekyll serve -w   # build + serve at http://localhost:4000, rebuild on change
npx cspell "**/*.{html,md,markdown,yml}"   # spell-check (config in cspell.config.yaml)
```

There is no test suite. Verification is visual via the local server.

## Architecture

### Data-driven content
Conference content lives in `_data/*.yml`, **not** in HTML. Edit these to change
what the site shows:
- `speakers.yml` — speaker records, each with a numeric `id`
- `sessions.yml` — talks/workshops, each with `id` and a `speakers: [ids]` list referencing speaker ids
- `schedule.yml` — per-day tracks and timeslots, where each timeslot references `sessionIds: [...]`
- `partners.yml` — sponsors/partners (grouped by tier)
- `team.yml`, `organizers.yml`, `judges.yml` — people

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

### Pages, layouts, includes
- Top-level `*.html` files (`index.html`, `speakers.html`, `schedule2.html`, `team.html`, …) are thin pages: YAML front matter (`layout`, `permalink`, `title`) plus a series of `{% include %}` calls.
- `_includes/*.html` are the actual content sections (`hero.html`, `partners.html`, `schedule.html`, `speakers-list.html`, modals, etc.). This is where most rendering logic and markup lives.
- `_layouts/default.html` wraps every page (head, nav, footer, modals). It chains to `_layouts/compress.html`, which strips whitespace from the final HTML.
- **Homepage sections are toggled by commenting includes in/out** in `index.html` using `{% comment %} … {% endcomment %}`. This is the normal mechanism for showing/hiding blocks per edition — expect many commented-out includes.

### Styling (SCSS via Compass — important)
- Source styles are in `_sass/` (`main.scss` + `partials/_*.scss`), compiled to the committed `css/main.css`.
- Compilation is done by the custom plugin `_plugins/generator_scss.rb`, which shells out to **Compass** (configured in `_sass/config.rb`) on every Jekyll build. `output_style` is `:compressed` and a monkey-patch strips all comments.
- Because this uses a custom plugin and Compass, GitHub Pages' safe mode will **not** compile SCSS. The compiled `css/main.css` is committed to the repo; CSS changes only take effect after a local build regenerates and you commit `css/main.css`. Edit the `_sass` partials, not `css/main.css` directly.

### Other
- `automation/` holds Windows-oriented image-optimization and JS-minification scripts (optipng, jpegtran, yuicompressor, etc.) — run manually, not part of the Jekyll build.
- Blog posts live in `_posts/` (published) and `_drafts/` (unpublished); the blog is currently disabled in navigation.
- `cspell.config.yaml` carries a `words:` allowlist of company/conference names — add new sponsor/speaker proper nouns there to keep spell-check clean.
