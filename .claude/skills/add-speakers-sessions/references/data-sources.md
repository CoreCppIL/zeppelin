# The four data sources

Content for one talk is assembled from four exports plus a photo folder. None of them is
complete on its own, and they do not share a reliable join key.

## Contents

- [1. CFS submissions — `proposals_report.csv`](#1-cfs-submissions--proposals_reportcsv)
- [2. CFS accounts — `proposals_users.csv`](#2-cfs-accounts--proposals_userscsv)
- [3. Program spreadsheet — `Core C++ <YEAR> program.xlsx`](#3-program-spreadsheet--core-c-year-programxlsx)
- [4. Speaker approval form responses](#4-speaker-approval-form-responses)
- [5. The photo folder](#5-the-photo-folder)
- [Joining them](#joining-them)
- [Traps](#traps)

---

## 1. CFS submissions — `proposals_report.csv`

One row per **submitted** proposal (including rejected ones, and several per speaker).

```
presenter, email, financial_assistance, Agree Code of Conduct, title, length,
audience, abstract, constraints, is_accepted, status, id, comments, notes, feedback
```

- `id` is the proposal id (e.g. `8D7954443`) and is the only stable key into this file.
  The `title` may have changed since; `id` has not.
- `abstract` is the **authoritative abstract** — the approval form almost never supplies a
  real replacement.
- `is_accepted` / `status` are *not* reliable — they read `False` / `submitted` even for
  accepted talks. Acceptance comes from the program sheet.
- **There is no bio column.**
- `comments` often holds things worth reading: preferred length, co-presenter requests,
  remote-presentation asks, "I'd rather give this in Hebrew".
- Titles and abstracts may carry trailing whitespace. Strip.
- This export can be *newer* than the program sheet — a speaker who edited their title on
  the CFS site after acceptance shows the new title here and the old one in the sheet.

## 2. CFS accounts — `proposals_users.csv`

One row per CFS account, including committee members and people who never submitted.

```
full_name, bio, email, profile_pic
```

- **This is the only source of speaker bios.** Nothing else has them.
- `profile_pic` has been empty for every row every time — photos come from the form.
- `bio` is Markdown-ish free text, sometimes with bare URLs, and is occasionally empty.
- `full_name` can be misspelled (`Amit Perelmanm`) or carry a stray character
  (`Alexander Kushniר` — a Hebrew ר at the end). Don't use it as a display name without
  looking.

## 3. Program spreadsheet — `Core C++ <YEAR> program.xlsx`

Sheets: `program`, `ranking summary`, `Form Responses 1`, `schedule 1..3`.

**`program` is the accepted list.** Headers are on **row 2**, data from row 3:

| Col | Field | Notes |
|---|---|---|
| A | `Talk number` | the slot number used in the schedule discussion |
| B | `Presenter` | display name; may be `First / Second` for a shared slot, or `(none)` |
| C | `Talk Title` | may lag behind the CFS export |
| D | `Length` | 30 / 60 / 90 |
| E | `Central` | flagged as a headline talk |
| F | `Similar/related` | talk numbers to avoid scheduling against |
| G | `Approved` | **`Y`, `pref`, or blank** — blank means not accepted |
| H/I | `Only in slots` / `Not in slots` | scheduling constraints |
| J | `Talk lang` | `EN` / `HE`, sometimes blank |

- Treat both `Y` and `pref` as accepted, and confirm the `pref` rows with the user.
- A row can pack **two speakers and two talks into one slot** (`Avi Kivity / Yuval Lifshitz`,
  `Talk A / Talk B`). That is two sessions and two speakers, and column J only carries one
  language for both — check each speaker's own form answer.
- The far-right columns (L onward) are scratch space: slot grids, hall capacities and
  free-text discussion notes. Ignore them; the schedule is not settled there.

`Form Responses 1` on this workbook is the **committee ranking** vote, not speaker data.
Its column headers are useful for one thing: they carry `Title [[proposal-id]]`, which
shows what each title looked like at ranking time.

## 4. Speaker approval form responses

`Speaker approval - Core C++ <YEAR> (Responses).xlsx`, one row per accepted speaker who
replied. 13 columns:

```
Timestamp, Email Address, Your name, Your phone number,
Please confirm that you will be attending…, Your picture,
Revised speaker bio, Scheduling constraints, Talk language,
Revised talk title, Revised talk abstract,
When and how will you be arriving in Israel…, Where will you be staying…
```

Field by field:

- **`Your picture`** — a `https://drive.google.com/open?id=…` link, not a file. The files
  come from the folder (§5).
- **`Revised speaker bio`** — ⚠️ **not a bio.** It's a single canned choice,
  `"I've revised my bio at the submissions site"`, or empty. Its only meaning is *"my bio
  in `proposals_users.csv` is current"*. Never write this string into `speakers.yml`.
- **`Revised talk title`** / **`Revised talk abstract`** — free text, and **most answers
  are notes rather than content**. Observed: `"Leave it as it is. Thanks."`, `"unchanged"`,
  `"Sorry, I changed in CfS."`, `"Use what there's now; if I see later that it requires
  rephrasing, I'll approach you."`, `"will like feedback on the abstract, i think it is
  good enough"`. Accept a value only if it reads as an actual title/abstract.
- **`Talk language`** — `English` / `Hebrew`. This is the speaker's own declaration and
  the best source. Fall back to the program sheet's `Talk lang` for non-responders.
- **`Scheduling constraints`** — free text, for `schedule.yml` later. Mostly `None`, but
  real constraints hide here ("Oct 21 only", "must be after 10am", "prefer before lunch",
  a co-presenter in a US timezone).
- **`Your name`** — how they signed the form. Can be a nickname (`Arik` for Noam Nassi), a
  fuller form (`Miri (Kopel) Ben-Nissan`), or a different surname from the program sheet
  (`Nathanel Ozeri` vs `Nathanel Green`).

## 5. The photo folder

The form writes uploads into a Drive folder named `<question title> (File responses)`,
i.e. `Your picture (File responses)`. Download it as a zip.

- Each file is named `<original filename> - <respondent Google display name>.<ext>`.
- That display name is a **third** spelling of the person's name (`alex d`,
  `Zubin Niro Singh`, `Michael Lindner` for "Mike Lindner").
- Mixed extensions: `.jpg`, `.jpeg`, `.png`, `.JPG`.
- Entries are valid UTF-8 (`Pavel Šimerda`). If `unzip -Z1` shows mojibake that's your
  terminal locale, not the archive — run shell text tools under `LC_ALL=C`, or read the
  zip with Python, which also lets you write straight to the final filename.
- Sizes range from 8 KB to 6 MB. Nobody optimizes these; `automation/` has image scripts if
  it matters.
- One file per respondent. A resubmission **replaces** the file rather than adding one, so
  the folder count matching the response count does not prove nobody re-uploaded.

## Joining them

Chain: `program` row → proposal `id` → submission → proposal email → CFS account (bio),
and separately → approval-form email → form row (photo, language).

The join that breaks is **email**. The address someone used on the CFS site is often not
the one they used for the form:

| Speaker | CFS proposal email | Approval form email |
|---|---|---|
| Alex Kushnir | `akushni1@its.jnj.com` | `kushnir.alexander@gmail.com` |
| Yuval Lifshitz | `yuvalif@yahoo.com` | `ylifshit@ibm.com` |
| Inbal Levi | `sinbal2l@gmail.com` | `sinbal2lextra@gmail.com` |
| Alex Cohn | `sasha.cohn@gmail.com` | `4618515@gmail.com` |

Case also differs (`ChrisR98008@` vs `chrisr98008@`) — compare lowercased.

So: **write the roster as one explicit table** mapping talk number → speaker id → name →
proposal id → photo key → form email, and generate everything from it. Fuzzy-matching
names at each step produces a wrong bio on a real person's page.

## Traps

**Duplicate CFS accounts, and the empty one is the one they used.** Some people have two
accounts; the second usually has an **empty bio**:

- Alex Kushnir: `akushni1@its.jnj.com` (bio) vs `kushnir.alexander@gmail.com` (empty)
- Yuval Lifshitz: `yuvalif@yahoo.com` (bio) vs `yuvalif@gmail.com` (empty)

Both empty-bio accounts are the ones tied to the approval form. Joining bios on the
form email yields blanks. Use the **proposal** email, and ask which account to keep.

**A bio can describe someone else.** Co-presented submissions sometimes put both people's
bios in one account's field, or the wrong person's entirely (one account's bio opened with
a different person's name). Read the bios you import.

**The bio is not just missing for non-responders.** Everyone who never filled the form
still has a bio in `proposals_users.csv` — they're only missing a *photo* and a *language*.

**Speaker-supplied prose has errors.** Typos, missing spaces after periods, `^H`
backspace-strikethrough jokes, an abstract that opens with leftover form metadata
(`90 minutes\nJohn Lakos\n\n`), mismatched list markers (`×` next to `*`). Report these
and let the user decide; only the spacing/typo class is safe to fix on request.

**A proposal id can appear twice in the program.** Nothing stops the same talk being
listed under two slots. Assert one-to-one before generating.
