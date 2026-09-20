#!/usr/bin/env python3
"""Validate _data/schedule.yml against the session and speaker data, and print the grid.

    python .claude/skills/build-schedule/scripts/check_schedule.py [--repo .]

Checks:
  - every session id in the schedule exists in sessions.yml
  - every talk session (one with `speakers:`) is scheduled somewhere
  - each row holds either one id (a full-width service row) or exactly one per track
  - a lone id belongs to a service/lunch session -- a lone talk id renders oddly
  - no session is scheduled twice, except as a deliberate rowspan continuation
  - slot times parse, run forwards, and do not overlap within a day

Exits non-zero if anything is wrong, so it can gate a commit.

Note on parsing: schedule.yml indents with tabs inside its `{ }` blocks. Ruby's Psych
accepts that and Jekyll builds fine, but PyYAML rejects tabs outright, so the file is
read with tabs swapped for spaces. That is safe here -- they are only ever separators
inside flow mappings, never structural indentation.
"""
import argparse
import os
import sys

try:
    import yaml
except ImportError:
    sys.exit("needs PyYAML:  pip install pyyaml")


def load(path):
    with open(path, encoding="utf-8") as fh:
        return yaml.safe_load(fh.read().replace("\t", " "))


def minutes(hhmm):
    h, m = hhmm.split(":")
    return int(h) * 60 + int(m)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=".", help="repository root (default: cwd)")
    args = ap.parse_args()
    d = os.path.join(args.repo, "_data")

    sched = load(os.path.join(d, "schedule.yml"))
    sessions = {s["id"]: s for s in load(os.path.join(d, "sessions.yml"))}
    speakers = {s["id"]: s for s in load(os.path.join(d, "speakers.yml"))}

    EMPTY = {1000, 404}
    problems, used, seen_cells = [], [], {}

    for day in sched:
        ntracks = len(day["tracks"])
        label = f"{day.get('shortName') or day.get('dateReadable')}"
        print(f"\n{label} — {day.get('dateReadable')} ({day.get('date')}), "
              f"{ntracks} tracks, {len(day['timeslots'])} slots")
        print("  " + "  ".join(f"[{t['title']}]" for t in day["tracks"]))

        prev_end = None
        for ts in day["timeslots"]:
            ids = ts["sessionIds"]
            start, end = ts["startTime"], ts["endTime"]

            if minutes(end) <= minutes(start):
                problems.append(f"{label} {start}-{end}: end is not after start")
            if prev_end is not None and minutes(start) < prev_end:
                problems.append(f"{label} {start}-{end}: overlaps the previous slot")
            prev_end = minutes(end)

            if len(ids) == 1:
                s = sessions.get(ids[0])
                if s is None:
                    problems.append(f"{label} {start}: session {ids[0]} does not exist")
                elif not (s.get("service") or s.get("lunch")):
                    problems.append(
                        f"{label} {start}: lone id {ids[0]} ({s.get('title')!r}) is a talk, "
                        "not a service session -- it will not span the tracks")
            elif len(ids) != ntracks:
                problems.append(
                    f"{label} {start}: {len(ids)} ids but {ntracks} tracks "
                    "(give one id, or exactly one per track)")

            cells = []
            for col, sid in enumerate(ids):
                if sid in EMPTY:
                    cells.append("(empty)")
                    continue
                s = sessions.get(sid)
                if s is None:
                    cells.append(f"!! {sid} MISSING")
                    problems.append(f"{label} {start}: session {sid} does not exist")
                    continue
                used.append(sid)
                if s.get("speakers"):
                    who = ", ".join(
                        f"{speakers[i]['name']} {speakers[i]['surname']}"
                        for i in s["speakers"] if i in speakers)
                    tag = " [HE]" if s.get("language") == "Hebrew" else ""
                    cells.append(f"{who}{tag}")
                    # a repeat is fine only directly above/below in the same column
                    key = (id(day), col, sid)
                    seen_cells.setdefault(key, []).append(start)
                else:
                    cells.append(f"<{s.get('title') or 'empty'}>")

            span = "   <- spans all tracks" if len(ids) == 1 else ""
            print(f"  {start}-{end}  " + "  |  ".join(cells) + span)

    # a talk appearing in two different columns or two different days is a mistake
    by_session = {}
    for (day_key, col, sid), times in seen_cells.items():
        by_session.setdefault(sid, []).append((day_key, col, times))
    for sid, places in by_session.items():
        if len(places) > 1:
            problems.append(
                f"session {sid} ({sessions[sid].get('title')!r}) appears in "
                f"{len(places)} different day/track positions")

    talks = {i for i, s in sessions.items() if s.get("speakers")}
    unscheduled = sorted(talks - set(used))
    print(f"\nscheduled talks: {len(talks & set(used))}/{len(talks)}")
    if unscheduled:
        print("unscheduled:")
        for i in unscheduled:
            s = sessions[i]
            who = ", ".join(f"{speakers[x]['name']} {speakers[x]['surname']}"
                            for x in s["speakers"] if x in speakers)
            print(f"  {i}  {who} — {s['title']}")
        problems.append(f"{len(unscheduled)} talk session(s) never scheduled")

    if problems:
        print(f"\n{len(problems)} problem(s):")
        for p in problems:
            print(f"  - {p}")
        return 1
    print("\nno problems found")
    return 0


if __name__ == "__main__":
    sys.exit(main())
