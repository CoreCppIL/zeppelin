# Markdown → HTML, and the YAML scalar traps

## Why convert at all

The templates emit these fields **raw**:

- `_includes/sessions-modals.html` — `<p class="theme-description">{{ session.description }}</p>`
- `_includes/speakers-modals.html` — `<p class="about">{{ speaker.bio }}</p>`
- `_includes/schedule.html` — `<p class="service-description">{{ session.description }}</p>`
- `_includes/speakers-list-2.html` — `{{ speaker.bio | strip_html }}` (strips, never renders)

There is no `markdownify` anywhere, and the existing `_data` entries are hand-written HTML.
Both the CFS site and the approval form hand you Markdown. Paste it through and speakers
get literal `**bold**`, ``` fences and `### headings` on their page.

## Paragraph rule

This is the convention the existing data files already follow, and it's worth matching so
diffs stay readable:

- a **blank line** starts a new `<p>`
- **single newlines inside a paragraph are joined with a space** (bios are often hard-wrapped
  at ~75 characters; keeping those breaks would be meaningless)
- each paragraph is wrapped in `<p>…</p>`, one per line in the YAML block

## Inline conversions

| Markdown | HTML | Seen in |
|---|---|---|
| `**bold**` | `<b>bold</b>` | Mike Lindner's abstract |
| `_italic_`, `*italic*` | `<i>italic</i>` | Ron Shabi, Mike Lindner, Roi Barkan |
| `` `code` `` | `<code>code</code>` | Ron Shabi (`aarch64-none-elf`, `configure`) |
| `[text](url)` | `<a href="url">text</a>` | Yuval Lifshitz → ceph.io, Ron Shabi → YouTube |
| bare `https://…` | `<a href="…">…</a>` | Erez Strauss, Mike Lindner (bios) |
| `* item` / `- item` | `<ul><li>item</li></ul>` | Amir Kirsh, Chris Ryan |
| `### Heading` | `<p><b>Heading</b></p>` | Ron Shabi |
| ` ```cpp … ``` ` | `<pre><code>…</code></pre>` | Ran Regev |

Notes on the awkward ones:

- **Headings**: don't emit `<h3>`. The description is already inside a `<p>`, and the
  existing data uses `<p><b>WORKSHOP</b></p>` for the same job. Follow that.
- **Bullets separated by blank lines** still belong to one list. Amir Kirsh's three bullets
  each sit in their own paragraph; a naive converter emits three separate `<ul>`s.
- **Mismatched markers**: Roi Barkan's list is `× RCU` then `* Hazard pointers` — the `×`
  is a multiplication sign and won't render as a bullet. Normalize both into one `<ul>`.
- **Emphasis outside a list still needs converting.** Running only the list lines through
  the inline converter leaves `*safe reclamation*` literal in the surrounding paragraph.
- **Intra-word `*`**: `have*^H^H^H^H*` is a backspace-strikethrough joke, and CommonMark
  renders intra-word `*…*` as emphasis. Ask what they meant rather than guessing.
- **`&`** is left bare in the existing files (`Johnson & Johnson`, `high & low level`).
  Stay consistent rather than half-escaping.
- **Escape `<` `>` `&` inside `<pre><code>`** — that content is code, not markup.

## Titles are plain text, always

Titles render into `itemprop="name"` microdata in `_includes/schedule.html` and into
`<h4>`/`<h5>`/`<li>` elsewhere. HTML in a title pollutes the structured data, so strip
markup rather than converting it: a title containing `` `configure` `` becomes plain
`configure`, not `<code>configure</code>`.

## The folded-scalar trap

`>` is a **folded** scalar: YAML joins its lines with spaces. That is exactly right for a
run of `<p>` lines, and exactly wrong for anything whose newlines matter.

A `<pre><code>` block written under `>` comes out as one line — the code sample is
destroyed. Worse, if the emitter doesn't indent the continuation lines, the file stops
parsing entirely:

```
could not find expected ':'
```

Use a **literal** block (`|`) for any description containing a `<pre>`:

```yaml
- id: 223
  title: "Structured Binding Assignments (P3817)"
  description: |
    <p>The talk describes the C++ language feature…</p>
    <p>The feature in a nutshell:</p>
    <pre><code>int ar[2] = {42, 43};
    int y;
    auto [x, using y] = ar; // x is new, y is assigned</code></pre>
  speakers: [23]
```

Everything else can stay on `>`; there's no need to convert the whole file.

## Block elements inside a `<p>`

`<ul>` and `<pre>` inside `<p class="theme-description">` break out of that paragraph in
the DOM. Browsers recover, and the existing data already nests `<p>` inside `<p>`, so this
is pre-existing rather than something new — but it is the one thing worth checking in a
browser after a conversion pass.

## Line endings

`_config.yml` and `_data/speakers.yml` are **CRLF**; `_data/sessions.yml` is **LF**. Python
text mode reads CRLF as `\n` and writes `\n`, so a script that rewrites a CRLF file
silently converts it and every line shows as changed — a 7-line edit to `_config.yml`
became a 333-line diff. Check the committed line endings, and restore them before
committing:

```python
d = open(f, 'rb').read()
open(f, 'wb').write(d.replace(b'\r\n', b'\n').replace(b'\n', b'\r\n'))  # back to CRLF
```
