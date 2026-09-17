---
name: add-speakers-sessions
description: >
  Populate _data/speakers.yml and _data/sessions.yml for a Core C++ edition from the
  CFS (Call for Speakers) exports and the speaker approval form, and import the speaker
  photos into img/people/. Use this skill whenever the task touches the conference
  speaker or talk lists — adding or updating a speaker, adding a talk/session, importing
  speaker headshots, validating that the accepted-talk data is complete, or rebuilding
  these files for a new year — even when the request is phrased as just "add this
  speaker", "update the talks", "the abstracts changed", or "put the new photos in".
  The data always arrives split across several exports that do not join cleanly, so
  reach for this skill before hand-editing the YAML.
---

# Adding speakers and sessions

Conference content lives in `_data/*.yml`, not in HTML. A talk on the site is three
linked records: **schedule → sessions → speakers**, joined by numeric `id`. This skill
covers the speakers and sessions halves. `schedule.yml` (which slot each talk sits in)
is a separate, later job — the slot grid is usually still being argued over when the
speaker data is ready, so don't block one on the other.

## Why this is not a simple copy-paste

The content for one talk is spread across **four exports that share no single join key**,
and two of the fields you most need are not where you'd expect:

| What you need | Where it actually lives |
|---|---|
| Which talks were accepted | `program` sheet of the program spreadsheet (`Approved` column) |
| Talk title, abstract, length | CFS submissions export (`proposals_report.csv`) |
| **Speaker bio** | CFS **users** export (`proposals_users.csv`) — *not* in the submissions export, and *not* in the approval form |
| Photo, revised title, talk language | Speaker approval form responses |
| The photo files themselves | A Google Drive folder the form writes uploads into |

Read `references/data-sources.md` before touching anything — it lists the exact columns,
the join keys that don't match, and the traps that have actually bitten (a form field that
looks like a bio but is a canned acknowledgement, duplicate CFS accounts with empty bios,
photo filenames that carry a different name than the program sheet).

## Workflow

### 1. Collect the inputs

Ask for all four, by name:

- `proposals_report.csv` — CFS submissions (titles, abstracts, proposal ids)
- `proposals_users.csv` — CFS accounts (**bios**)
- `Core C++ <YEAR> program.xlsx` — the `program` sheet is the accepted list
- `Speaker approval - Core C++ <YEAR> (Responses).xlsx` — what accepted speakers confirmed
- the form's upload folder, downloaded as a zip (`Your picture (File responses)-….zip`)

`.xlsx` needs a reader; `openpyxl` in a throwaway venv in the scratchpad is enough.
Nothing here belongs in the repo.

### 2. Build the roster, explicitly

Derive the accepted list from the `program` sheet: rows where `Approved` is `Y` or `pref`.
Then write the roster out as **one explicit table** — talk number, speaker id, name,
surname, proposal id, photo key, form email — rather than fuzzy-matching names at each
step. Everything downstream generates from that table, so a bad join is visible in one
place instead of silently producing a wrong bio three files later.

Watch for a single slot holding two speakers with two separate talks (a shared 60-minute
slot of two 30-minute talks). Those are two sessions and two speakers, and they may be in
different languages.

### 3. Validate before generating

Cross-check and report, don't paper over:

- every accepted talk resolves to a submission (by proposal id)
- every speaker has a bio, and every talk an abstract
- form responses and uploaded photos are 1:1 with no duplicates
- who is accepted but never responded (they need a placeholder photo and have no
  declared language)

Surface name/title/language disagreements between sources for a human decision instead of
picking one silently. Real errors in speaker-supplied prose (typos, garbled sentences)
should be *reported*, not quietly rewritten — it's their text. Fix only what you're asked
to fix.

### 4. Resolve titles and abstracts

The approval form asks for a *revised* title and abstract. Most answers are not content —
they're notes like "Leave it as it is. Thanks.", "unchanged", or "Sorry, I changed in CfS."
Treat a field as a real revision only when it reads as an actual title or abstract, and
fall back to the submission export otherwise. Getting this wrong puts "Sorry, I changed in
CfS." on the site as a talk title.

### 5. Import the photos

`scripts/import_photos.py` does the extract-and-rename. Key points it encodes:

- Photos go **flat in `img/people/`**. The includes build the URL as `/img/people/` +
  `thumbnailUrl` with no year segment; `img/people/<YEAR>/` is the *archive* of past
  editions, not the current year.
- Filenames are `{Name}{Surname}.{ext}` in CamelCase, diacritics and punctuation stripped,
  original extension preserved (`RanRegev.JPG`, `AdiShavit.png` are both fine).
- Form uploads are named `<original> - <respondent display name>`, and that display name
  is their Google account name — often not the name in the program sheet.
- **Organizers who also speak already have a photo there**, referenced by `_data/team.yml`.
  Overwriting it changes the Team tab too. Archive the old copy to `img/people/<PREV>/`
  first and tell the user, or reuse the existing photo.
- Speakers with no upload get `NoPhoto.jpg` — unless they're an organizer with a photo
  already in the repo, in which case use it rather than showing a blank.

### 6. Convert the markup

**The site renders these fields raw.** `_includes/sessions-modals.html` and
`speakers-modals.html` emit `{{ session.description }}` and `{{ speaker.bio }}` with no
`markdownify`, and the existing `_data` entries are hand-written HTML. Both sources hand
you Markdown, so it has to be converted on the way in or speakers get literal `**bold**`
and ``` fences on the page.

`scripts/md_to_html.py` does the conversion. `references/markup-conversion.md` explains the
rules and the YAML traps — in particular that a folded scalar (`>`) silently collapses the
newlines inside a `<pre>` block, so a code sample needs a literal block (`|`).

### 7. Emit the YAML

Match the file's existing shape exactly — `id`, `name`, `surname`, `bio: >`,
`thumbnailUrl` for speakers; `id`, `title`, `description: >`, `speakers: [id]` for
sessions. Conventions worth keeping:

- **ids**: speakers `1..N`; sessions `200+N`, which keeps talks clear of the reserved
  service ids (`002`–`108`, `1000`).
- **`language:`**: set it only for Hebrew talks. English is the unmarked default, so
  adding `language: English` puts an `[English]` badge on every talk in the schedule.
- **Titles stay plain text.** They render into `itemprop="name"` microdata, so HTML there
  pollutes the structured data — strip backticks rather than emitting `<code>`.
- **Keep the service sessions.** Registration, breaks, lunch, keynote and closing entries
  have no `speakers:` key. Keep them and bump the year in their text; only drop the talks.
- **Line endings are mixed in this repo.** `_config.yml` and `_data/speakers.yml` are CRLF,
  `_data/sessions.yml` is LF. Rewriting a CRLF file with an LF-emitting script turns the
  whole file into one unreviewable diff. Check before and restore after.

### 8. Verify

- YAML parses; no duplicate ids; every `speakers: [id]` resolves; every `thumbnailUrl`
  exists on disk
- `bundle exec jekyll build` succeeds (needs rbenv's Ruby — see CLAUDE.md; system Ruby is
  too old and `bundle` will fail on a missing bundler version)
- no leftover Markdown in the rendered HTML of `_site/`
- `npx cspell "**/*.{html,md,markdown,yml}"` — add new speaker and company proper nouns to
  the `words:` list in `cspell.config.yaml`

Then look at it in a browser. `speakers.html` and `schedule2.html` carry
`published: false` between editions, so `/speakers/` 404s until you remove that line and
uncomment the nav entry in `_config.yml`. The speakers page and its modals show photo,
name, bio, talk title, abstract and language together, which makes it the one page worth
reviewing by eye.

## Files

- `references/data-sources.md` — every column of the four exports, the join keys that
  disagree, and the specific traps. Read this first.
- `references/markup-conversion.md` — Markdown → HTML rules and the YAML scalar traps.
- `scripts/import_photos.py` — extract and rename form uploads into `img/people/`.
- `scripts/md_to_html.py` — convert a bio or abstract to the HTML-in-YAML form.
