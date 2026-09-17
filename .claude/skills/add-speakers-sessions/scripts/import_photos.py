#!/usr/bin/env python3
"""Import speaker headshots from the approval form's Drive folder into img/people/.

The form names each upload "<original filename> - <respondent display name>.<ext>", where
the display name is the person's Google account name -- frequently a different spelling
from the program sheet ("alex d", "Zubin Niro Singh"). So this runs in two passes: list
what the zip actually contains, then apply a mapping you have checked by eye.

    # 1. see the respondent names in the archive
    python import_photos.py --list "Your picture (File responses)-....zip"

    # 2. write a mapping, then apply it
    python import_photos.py --apply mapping.json \
        --zip "Your picture (File responses)-....zip" --repo /path/to/corecpp-site

mapping.json maps each respondent name to the speaker's display name. Use null for a
speaker with no upload to have them fall back to NoPhoto.jpg:

    {
      "alex d":            "Alex Dathskovsky",
      "Zubin Niro Singh":  "Niro Singh",
      "Pavel Šimerda":     "Pavel Simerda",
      "__no_upload__": {"Erez Strauss": null, "Amir Kirsh": "AmirKirsh.jpg"}
    }

Photos land flat in img/people/ -- the includes build the URL as "/img/people/" +
thumbnailUrl with no year segment, and img/people/<YEAR>/ is the archive of past editions.
Filenames are {Name}{Surname}.{ext}, CamelCase, non-alphanumerics stripped, original
extension preserved.

Anything that would overwrite a photo referenced by _data/team.yml is archived to
img/people/<prev-year>/ first and reported, because organizers who also speak already have
a headshot there and clobbering it silently changes the Team tab too.
"""
import argparse
import json
import os
import re
import shutil
import sys
import zipfile


def slug(display_name):
    """'Miri Ben-Nissan' -> 'MiriBenNissan'. Diacritics and punctuation go."""
    return re.sub(r"[^A-Za-z0-9]", "", display_name)


def read_members(zip_path):
    """Map respondent display name -> (ZipInfo, extension)."""
    zf = zipfile.ZipFile(zip_path)
    members = {}
    for zi in zf.infolist():
        if zi.is_dir():
            continue
        base = zi.filename.split("/")[-1]
        if "." not in base:
            continue
        stem, ext = base.rsplit(".", 1)
        who = stem.split(" - ")[-1].strip()
        if who in members:
            print(f"warning: two uploads claim '{who}'", file=sys.stderr)
        members[who] = (zi, ext)
    return zf, members


def team_photos(repo):
    """Filenames referenced by _data/team.yml -- these must not be clobbered silently."""
    path = os.path.join(repo, "_data", "team.yml")
    if not os.path.exists(path):
        return set()
    with open(path, encoding="utf-8") as fh:
        return set(re.findall(r"thumbnailUrl:\s*(\S+)", fh.read()))


def prev_year_dir(people):
    """Newest numeric subdirectory of img/people -- where past editions are archived."""
    years = sorted(d for d in os.listdir(people)
                   if d.isdigit() and os.path.isdir(os.path.join(people, d)))
    return os.path.join(people, years[-1]) if years else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("zip_positional", nargs="?", metavar="ZIP")
    ap.add_argument("--zip", dest="zip_opt")
    ap.add_argument("--list", action="store_true",
                    help="print the respondent names found in the archive and exit")
    ap.add_argument("--apply", metavar="MAPPING.JSON")
    ap.add_argument("--repo", default=".", help="repository root (default: cwd)")
    args = ap.parse_args()

    zip_path = args.zip_opt or args.zip_positional
    if not zip_path:
        ap.error("give the uploads zip, positionally or with --zip")
    zf, members = read_members(zip_path)

    if args.list or not args.apply:
        print(f"{len(members)} upload(s):")
        for who, (zi, ext) in sorted(members.items()):
            print(f"  {who!r:<34} .{ext:<5} {zi.file_size:>9,}b  {zi.filename.split('/')[-1]}")
        if not args.apply:
            print("\nWrite a mapping of these names to speaker display names, then rerun "
                  "with --apply.")
        return 0

    with open(args.apply, encoding="utf-8") as fh:
        mapping = json.load(fh)
    no_upload = mapping.pop("__no_upload__", {})

    people = os.path.join(args.repo, "img", "people")
    if not os.path.isdir(people):
        print(f"error: {people} does not exist -- is --repo right?", file=sys.stderr)
        return 1
    protected = team_photos(args.repo)
    archive = prev_year_dir(people)
    results, warnings = [], []

    for who, display in mapping.items():
        if who not in members:
            warnings.append(f"mapping names {who!r}, which is not in the archive")
            continue
        zi, ext = members.pop(who)
        name = f"{slug(display)}.{ext}"
        dst = os.path.join(people, name)
        note = ""
        if name in protected:
            if archive:
                shutil.copyfile(dst, os.path.join(archive, name))
                note = f"REPLACED team photo (old copy -> {os.path.basename(archive)}/{name})"
            else:
                note = "REPLACES a team photo and there is no archive dir -- check this"
            warnings.append(f"{display}: {note}")
        elif any(p.rsplit(".", 1)[0] == slug(display) for p in protected):
            note = f"coexists with team photo {slug(display)}.*"
            warnings.append(f"{display}: {note}")
        with zf.open(zi) as src, open(dst, "wb") as out:
            shutil.copyfileobj(src, out)
        results.append((display, name, note))

    # Speakers with no upload: an explicit filename (an organizer's existing photo) or the
    # shared placeholder.
    placeholder = "NoPhoto.jpg"
    if no_upload and not os.path.exists(os.path.join(people, placeholder)):
        if archive and os.path.exists(os.path.join(archive, placeholder)):
            shutil.copyfile(os.path.join(archive, placeholder),
                            os.path.join(people, placeholder))
        else:
            warnings.append(f"{placeholder} not found at top level or in the archive")
    for display, override in no_upload.items():
        name = override or placeholder
        if not os.path.exists(os.path.join(people, name)):
            warnings.append(f"{display}: {name} does not exist")
        results.append((display, name, "no upload"))

    for display, name, note in results:
        print(f"  {display:<22} -> {name:<26} {note}")
    if members:
        warnings.append("uploads not claimed by the mapping: "
                        + ", ".join(repr(m) for m in sorted(members)))
    if warnings:
        print("\nreview these:")
        for w in warnings:
            print(f"  - {w}")
    print(f"\n{len(results)} speaker(s) resolved, {len(warnings)} thing(s) to review")
    return 0


if __name__ == "__main__":
    sys.exit(main())
