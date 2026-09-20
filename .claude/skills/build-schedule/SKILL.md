---
name: build-schedule
description: >
  Build or change _data/schedule.yml for a Core C++ edition — place talks into day/slot/track
  cells from the program workbook's Schedule sheet, add the service rows (registration,
  welcome, lunch, breaks, closing) that span all tracks, and publish the /schedule/ page.
  Use this skill whenever the request touches the conference timetable: "build the
  schedule", "move this talk to another slot", "add lunch", "add a coffee break", "which
  talk is in which room", "the schedule changed", "add a second day", or when a talk needs
  to span or share a slot. Reach for it before hand-editing schedule.yml — the renderer
  infers colspan and rowspan from how session ids repeat, so the layout is a consequence
  of the id pattern rather than anything you state directly.
---

# Building the schedule

`_data/schedule.yml` is the third link in the chain **schedule → sessions → speakers**,
joined by numeric `id`. It holds no content of its own: every cell is a session id, and
everything the visitor reads comes from `_data/sessions.yml`.

So this is the *last* step. The sessions have to exist first — see the
**add-speakers-sessions** skill, which builds `speakers.yml` and `sessions.yml` from the
CFS exports and the speaker approval form. If a talk is missing from `sessions.yml`, it
cannot be scheduled.

## The shape of the file

```yaml
-
  date: "2026-10-20"
  dateReadable: "October 20"
  shortName: "Day 1"          # fills the table's top-left corner cell
  tracks:
    - {title: "Track 1", color: "#90be4e"}
    - {title: "Track 2", color: "#90be4e"}
    - {title: "Track 3", color: "#90be4e"}
  timeslots:
    - {
    	startTime: "08:30",
    	endTime: "09:30",
    	sessionIds: [106]
    }
```

One entry per day; `{% for day in site.data.schedule %}` renders them in order.

**`sessionIds` is positional**: entry *n* goes in track *n*. Give it either one id (a row
that spans every track) or exactly as many ids as there are tracks. Anything in between
triggers a colspan on the last cell, which is almost never what you want.

Two reserved ids stand in for "no talk here":

- **`1000`** — an empty session. Renders as an empty cell, hidden on mobile. This is what
  2025 used and what to keep using.
- **`404`** — also treated as empty. Older sentinel, equivalent in `schedule2.html`.

## Reading the program workbook

The `Schedule` sheet carries the same timetable **twice**, side by side:

- **columns A–D** — a human grid, one block per day, cells reading `Presenter [LANG]\nTitle`
- **columns N–W** — a machine-readable table, one row per day/slot/track:
  `Day, Slot, Time, Track, Duration, Talk #, Presenter, Central, Lang, Title`

Use the table, then check it against the grid — they are maintained by hand and can drift.
Columns F–L are scratch space for hall capacities; ignore them.

`Talk #` refers to the `program` sheet's talk numbering, **not** to a session id. Build the
talk# → session id map from the roster used when the sessions were generated (in the 2026
edition, session id = 200 + speaker id).

**Cross-check acceptance.** The Schedule sheet can list a talk the `program` sheet has not
marked `Approved` — that happened in 2026 and left a scheduled speaker with no session
record. Compare the two sheets before generating and raise the discrepancy; do not quietly
invent a session or silently drop the slot.

## Service rows

Registration, welcome, breaks, lunch and closing are sessions like any other, already in
`sessions.yml` with `service: true` (and, for some, `lunch: true`). Reuse them rather than
adding new ones:

| id | title |
|---|---|
| 106 | Registration and Coffee |
| 099 | Welcome to Core C++ &lt;YEAR&gt;! |
| 107 | Coffee Break |
| 101 | Break |
| 102 | Lunch |
| 104 | Updates |
| 105 | Closing Remarks |
| 007 | Lightning Meetup |
| 1000 | *(empty placeholder)* |

**A service row spans all tracks by being alone in its slot** — `sessionIds: [102]`, not
`[102,102,102]`. The renderer detects a single id whose session has `service` or `lunch`
set and emits one `<td colspan="{track count}">`.

Work out where these go from the gaps between talk slots: an hour-long hole mid-day is
lunch, the half-hour holes are usually coffee breaks. Add only what was asked for — the
organizers often want the small gaps left blank while the timings are still moving.

## Talks that do not fit the grid

**Two talks sharing one slot.** A 60-minute slot holding two 30-minute talks (the program
sheet writes it as `Speaker A / Speaker B` on one row) needs the hour split into two rows,
with the *other* tracks' ids repeated in both:

```yaml
    - { startTime: "12:30", endTime: "13:00", sessionIds: [226,210,224] }
    - { startTime: "13:00", endTime: "13:30", sessionIds: [226,211,224] }
```

`schedule2.html` sees id `226` in the same column of consecutive rows and merges them with
`rowspan="2"`, so tracks 1 and 3 still read as single unbroken hour-long cells while track
2 shows two half-hour talks. This is worth the extra row: it is the only way each talk gets
its own entry, its own modal and its own language badge.

**A talk spanning two slots** works the same way — repeat its id in the same column across
both rows.

## Language badges

`sessions.yml` carries `language:` per session, and only Hebrew talks are marked (English
is the unmarked default). The schedule inherits this automatically; there is nothing to set
in `schedule.yml`.

But the spreadsheet has **one `Lang` cell per row**, so a shared slot can only declare one
language. In 2026 the Avi Kivity / Yuval Lifshitz slot was tagged `[HE]` while Yuval's own
approval-form answer said English. Cross-check all three sources — the grid's `[XX]` tag,
the table's `Lang` column, and `sessions.yml` — and report any row where they disagree
rather than picking one. `scripts/check_schedule.py` does this comparison.

## Verify

```bash
python .claude/skills/build-schedule/scripts/check_schedule.py
```

It prints the timetable as a grid and flags: sessions that do not exist, talks in
`sessions.yml` that never got scheduled, rows whose id count matches neither 1 nor the
track count, overlapping times, and sessions scheduled twice.

Then build and look at it:

```bash
PATH="$HOME/.rbenv/shims:$PATH" bundle exec jekyll serve -w
```

`/schedule/` is hidden between editions — `schedule2.html` carries `published: false`, and
the nav entry in `_config.yml` is commented out. Both need changing to publish, and
**`_config.yml` changes need a server restart**; `-w` does not reload them.

## Gotchas

- **`/schedule/` is rendered by `schedule2.html` itself**, a self-contained table. The
  `_includes/schedule.html` partial is the older flexbox renderer behind `/schedule_orig/`,
  which stays disabled — editing it changes nothing on the live page. See
  `references/renderer.md`.
- **The file indents with tabs inside the `{ }` blocks.** Ruby's Psych accepts this and
  Jekyll builds fine, but PyYAML rejects it outright. Any Python tooling must replace tabs
  with spaces before parsing (the checker script does).
- **`_config.yml` is CRLF.** Editing it with a Python script that writes `\n` converts the
  whole file and turns a one-line change into an unreadable diff. Edit it as bytes.
- Keep the past edition's block if you like — the convention here is to comment it out —
  but the live days are simply replaced; git history holds the rest.

## Files

- `references/renderer.md` — how `schedule2.html` turns ids into colspan, rowspan and
  empty cells. Read before changing layout behaviour.
- `scripts/check_schedule.py` — validate `schedule.yml` against the session and speaker
  data, and print the timetable.
