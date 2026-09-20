# How the schedule page renders

`/schedule/` is produced by **`schedule2.html`** — a page, not an include. It contains the
whole table renderer plus its own inline `<style>` block. There is no `{% include %}` for
it.

`_includes/schedule.html` is the **older** flexbox renderer, reached only through
`schedule.html`, whose permalink is `/schedule_orig/` and which is kept `published: false`.
Editing that partial changes nothing visitors see. Check which file you are in before
debugging layout.

## Layout is inferred from the id pattern

Nothing in `schedule.yml` says "span" or "merge". `schedule2.html` works it out:

### Full-width service rows

```liquid
{% if timeslot.sessionIds.size == 1 %}
  {% for s in site.data.sessions %}
    {% if s.id == only_id %}
      {% if s.service != null or s.lunch != null %}
        {% assign is_service_row = true %}
```

One id **whose session has `service` or `lunch`** produces a single
`<td colspan="{track count}" class="service-slot service-session">`. A `lunch:` session
additionally becomes clickable, opening its modal.

A lone id whose session is a *talk* does **not** take this path — it falls through to the
colspan-on-last-cell branch below, which is rarely what you want.

### Vertical merge

```liquid
{% if next_timeslot and col_index < next_timeslot.sessionIds.size %}
  {% assign next_id = next_timeslot.sessionIds[col_index] %}
  {% if nid1 == cid1 and cid1 != '-' and cid1 != '404' and cid1 != '1000' %}
    {% assign rowspan = 2 %}
```

The same id in the **same column** of the next row emits `rowspan="2"` and records the
column in `skip_next_str`, so the following row skips it. This is how a 60-minute talk sits
alongside two 30-minute talks in another track.

It only ever merges **two** rows. Three consecutive identical ids give a merged pair
followed by a lone cell, not a three-row span.

### Partial rows

```liquid
{% if sessionCount < trackCount and col_index == lastSessionIndex %}
  {% assign colspan = trackCount | minus: col_index %}
```

Fewer ids than tracks makes the **last** cell stretch over the remainder. Occasionally
useful, usually a mistake — to leave a track empty use `1000`, which renders a proper empty
cell, rather than dropping the id.

### Empty cells

`1000` and `404` are both skipped when looking up the session, leaving `title == ''`, which
adds `class="empty-session"` (hidden on mobile by the inline CSS). `1000` is what the data
has used since 2025.

### Rows that are all continuation

`has_new_content` marks a row whose every cell merely continues the row above; it gets
`class="empty-timeslot"` and is hidden on mobile. Note the check reads `is_service_row`
*before* that variable is assigned further down the loop body, so on any given row it is
really testing the **previous** row's value. Liquid carries variables across iterations, so
this does not error — the effect is only that the row after a service row is never hidden
on mobile. Harmless, but surprising if you are chasing a mobile layout bug.

### End times

A slot's end time is hidden when it equals the next slot's start time, so back-to-back
slots show one number. A gap between slots makes both times appear — which is how the
breaks read as breaks even with no row of their own.

## Where each field surfaces

| Field | Used for |
|---|---|
| `date` | not rendered; keep it accurate for reference |
| `dateReadable` | the `<h4>` heading above each day's table |
| `shortName` | the table's top-left corner cell (`<th>`) |
| `tracks[].title` | column headers, and each cell's `data-label` for the mobile layout |
| `tracks[].color` | read by `_includes/schedule.html` only — `schedule2.html` ignores it |
| `startTime` / `endTime` | the first column, and the end-time suppression above |

Everything else — title, speakers, photos, language badge, the modal — comes from the
session and speaker records.

## Modals

Talk cells get `data-toggle="modal" data-target="#sessionDetail-{id}"`. The modals
themselves are emitted by `_includes/sessions-modals.html`, which iterates **all** of
`sessions.yml` rather than only the scheduled ones, so a session missing from the schedule
still has a modal — it is simply unreachable.
