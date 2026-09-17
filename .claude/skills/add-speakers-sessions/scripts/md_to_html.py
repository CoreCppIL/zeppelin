#!/usr/bin/env python3
"""Convert a speaker bio or talk abstract from Markdown to the HTML-in-YAML form.

The templates emit {{ speaker.bio }} and {{ session.description }} raw -- there is no
markdownify anywhere in _includes -- so Markdown from the CFS site or the approval form
has to be converted on the way into _data, or it shows up literally on the page.

    python md_to_html.py abstract.txt              # one <p> per line, ready to indent
    cat bio.txt | python md_to_html.py             # reads stdin too
    python md_to_html.py --yaml description abstract.txt   # full YAML block

The output already tells you whether the field needs a literal block scalar (|) instead of
a folded one (>): a folded scalar joins lines with spaces, which silently destroys the
newlines inside a <pre><code> block. See references/markup-conversion.md.

Conversion is deliberately narrow -- it covers what these two sources actually produce
rather than all of CommonMark. Read the output before pasting it in; a couple of cases
(intra-word emphasis, mismatched list markers) need a human decision.
"""
import argparse
import re
import sys

BULLET = re.compile(r"^\s*[-*•×]\s+(\S.*)$")
HEADING = re.compile(r"^#{1,6}\s*(.+)$")


def inline(s):
    """Inline Markdown -> HTML. Order matters: links before emphasis, so a URL
    containing an underscore is not mangled into <i>."""
    s = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)",
               lambda m: f'<a href="{m.group(2)}">{m.group(1)}</a>', s)
    s = re.sub(r"\*\*([^*]+)\*\*", lambda m: f"<b>{m.group(1)}</b>", s)
    s = re.sub(r"`([^`]+)`", lambda m: f"<code>{m.group(1)}</code>", s)
    s = re.sub(r"(?<![\w*])_([^_\n]+)_(?![\w])", lambda m: f"<i>{m.group(1)}</i>", s)
    s = re.sub(r"(?<![\w*>])\*([^*\n]+)\*(?![\w*])", lambda m: f"<i>{m.group(1)}</i>", s)
    # bare URLs, but not ones already inside an href we just built
    s = re.sub(r'(?<![">=])(https?://[^\s)<"]+)',
               lambda m: f'<a href="{m.group(1)}">{m.group(1)}</a>', s)
    return s


def convert(text):
    """-> (list of html lines, list of notes for the human)"""
    text = text.replace("\r\n", "\n").replace("\r", "\n").replace("​", "")
    notes = []
    if "​" in text:
        notes.append("stripped a zero-width space")

    out, para, items = [], [], []

    def flush_para():
        if para:
            out.append(f"<p>{inline(' '.join(para))}</p>")
            para.clear()

    def flush_items():
        if items:
            out.append("<ul>" + "".join(f"<li>{inline(i)}</li>" for i in items) + "</ul>")
            items.clear()

    lines, i = text.split("\n"), 0
    while i < len(lines):
        raw = lines[i]
        s = raw.strip()

        if s.startswith("```"):                       # fenced code block
            flush_para(); flush_items()
            lang = s[3:].strip()
            i += 1
            code = []
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            body = ("\n".join(code).strip("\n")
                    .replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
            out.append(f"<pre><code>{body}</code></pre>")
            notes.append("contains a <pre> block: use a literal YAML scalar (|), not (>), "
                         "or the newlines are folded away"
                         + (f" [fence said '{lang}']" if lang else ""))
            i += 1
            continue

        m = HEADING.match(s)
        if m:                                         # ### Heading
            flush_para(); flush_items()
            out.append(f"<p><b>{inline(m.group(1))}</b></p>")
            notes.append(f"heading {m.group(1)!r} rendered as <p><b>..</b></p> -- the "
                         "description already sits inside a <p>, and the existing data "
                         "uses that pattern")
            i += 1
            continue

        m = BULLET.match(s)
        if m:                                         # list item
            flush_para()
            marker = s.lstrip()[0]
            if marker in "•×":
                notes.append(f"list marker {marker!r} is not Markdown -- folded into the "
                             "same <ul>, check that was intended")
            items.append(m.group(1))
            i += 1
            continue

        if not s:                                     # blank line
            flush_para()
            # a blank line between bullets does not close the list: peek ahead
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if not (j < len(lines) and BULLET.match(lines[j].strip())):
                flush_items()
            i += 1
            continue

        flush_items()
        para.append(s)
        i += 1

    flush_para(); flush_items()

    if re.search(r"\w\*[^*\s][^*\n]*\*", text):
        notes.append("intra-word *emphasis* found (e.g. a ^H strikethrough joke) -- "
                     "CommonMark italicises it; ask the speaker what they meant")
    return out, notes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file", nargs="?", help="input file (default: stdin)")
    ap.add_argument("--yaml", metavar="KEY",
                    help="wrap the output as a YAML block under KEY (bio / description)")
    ap.add_argument("--indent", type=int, default=4)
    args = ap.parse_args()

    text = open(args.file, encoding="utf-8").read() if args.file else sys.stdin.read()
    html, notes = convert(text)

    if args.yaml:
        scalar = "|" if any("<pre>" in h for h in html) else ">"
        print(f"  {args.yaml}: {scalar}")
        for h in html:
            for line in h.split("\n"):
                print(" " * args.indent + line)
    else:
        for h in html:
            print(h)

    if notes:
        print("\n# review:", file=sys.stderr)
        for n in notes:
            print(f"#   - {n}", file=sys.stderr)


if __name__ == "__main__":
    main()
