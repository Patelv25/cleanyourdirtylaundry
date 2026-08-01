#!/usr/bin/env python3
"""Blocking pre-publish validator for social / Business Profile copy.

Exists because of ERR-011: on 2026-07-30 Google turned off posting for the
Hamper'd Business Profile after a post shipped with a phone number in the body
("just call us at (919) 283-3010"). That killed every subsequent upload,
including the video queue.

Same failure class as ERR-008 (wrong phone in a CYDL post) and ERR-010
(deprecated phone in 9 sent emails). RULE-010 already concluded that advisory
checklists do not stop this — validation has to BLOCK. So this exits non-zero
and callers must refuse to publish on a non-zero exit.

Usage:
    python3 content_policy_validator.py --brand hamperd \
        --surface google_business_profile --text "..."
    python3 content_policy_validator.py --brand cydl \
        --surface facebook --file caption.txt
    echo "..." | python3 content_policy_validator.py -b hamperd -s facebook

Exit codes:
    0  clean, safe to publish
    1  BLOCKED, one or more violations
    2  bad invocation / config
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

DEFAULT_FACTS = Path(__file__).with_name("brand-facts.json")

# Phone shapes that Google/Meta will read as a callable number.
#
# Matched structurally rather than as "any run of ~10 digits" on purpose: a
# loose digit-run pattern also swallows things like "2026-08-22 10", and a
# validator that blocks on launch dates gets switched off within a week.
_SEP = r"[\s.\-‐-―]?"
# +1 (919) 301-8054 / 919.301.8054 / 919 301 8054
_PHONE_STRUCTURED = re.compile(
    r"(?<!\d)(?:\+?1{sep})?(?:\(\d{{3}}\)|\d{{3}}){sep}\d{{3}}{sep}\d{{4}}(?!\d)".format(sep=_SEP)
)
# Bare contiguous run, e.g. "9193018054".
_PHONE_BARE = re.compile(r"(?<!\d)1?\d{10}(?!\d)")
# Local 7-digit form, e.g. "283-3010". Requires a real separator so we do not
# swallow ordinary 7-digit integers.
_PHONE_7 = re.compile(r"(?<!\d)\d{3}[\s.\-‐-―]\d{4}(?!\d)")


@dataclass(frozen=True)
class Violation:
    code: str
    detail: str

    def __str__(self) -> str:  # pragma: no cover - trivial
        return f"[{self.code}] {self.detail}"


def digits(s: str) -> str:
    return re.sub(r"\D", "", s)


def find_phone_candidates(text: str) -> list[str]:
    """Return raw substrings that a platform will treat as a phone number."""
    hits: list[str] = []
    spans: list[tuple[int, int]] = []
    for pattern in (_PHONE_STRUCTURED, _PHONE_BARE, _PHONE_7):
        for m in pattern.finditer(text):
            # Skip anything already covered by a longer, earlier match.
            if any(start <= m.start() and m.end() <= end for start, end in spans):
                continue
            hits.append(m.group(0).strip())
            spans.append(m.span())
    return hits


def load_facts(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        sys.exit(f"config error: brand facts file not found at {path}")
    except json.JSONDecodeError as exc:
        sys.exit(f"config error: {path} is not valid JSON ({exc})")


def validate(text: str, brand: str, surface: str, facts: dict) -> list[Violation]:
    brands = facts.get("brands", {})
    surfaces = facts.get("surfaces", {})

    if brand not in brands:
        sys.exit(f"config error: unknown brand '{brand}' (have: {', '.join(sorted(brands))})")
    if surface not in surfaces:
        sys.exit(f"config error: unknown surface '{surface}' (have: {', '.join(sorted(surfaces))})")

    profile = brands[brand]
    rule = surfaces[surface].get("phone_in_body", "must_match_ground_truth")
    violations: list[Violation] = []

    candidates = find_phone_candidates(text)

    if candidates and rule == "forbidden":
        violations.append(
            Violation(
                "GBP-PHONE-IN-BODY",
                f"{surface} forbids phone numbers in post body; found {candidates!r}. "
                f"{surfaces[surface].get('reason', '')}".strip(),
            )
        )
    elif candidates:
        approved = profile.get("phone")
        if approved is None:
            status = profile.get("phone_status", "UNRESOLVED")
            violations.append(
                Violation(
                    f"PHONE-{status}",
                    f"copy contains {candidates!r} but no approved phone number is set for "
                    f"'{brand}'. {profile.get('phone_note', '')}".strip(),
                )
            )
        else:
            approved_digits = digits(approved)
            for raw in candidates:
                if digits(raw) != approved_digits:
                    violations.append(
                        Violation(
                            "PHONE-MISMATCH",
                            f"copy contains {raw!r}, which is not the approved "
                            f"{profile['display_name']} number ({approved}).",
                        )
                    )

    lowered = text.lower()
    for token in profile.get("forbidden_cross_brand", []):
        if token.lower() in lowered:
            violations.append(
                Violation(
                    "CROSS-BRAND",
                    f"copy for '{brand}' references {token!r}, which belongs to the other brand lane.",
                )
            )

    return violations


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("-b", "--brand", required=True, help="hamperd | cydl")
    ap.add_argument("-s", "--surface", required=True, help="google_business_profile | facebook | instagram")
    src = ap.add_mutually_exclusive_group()
    src.add_argument("-t", "--text", help="copy to validate")
    src.add_argument("-f", "--file", type=Path, help="file containing the copy")
    ap.add_argument("--facts", type=Path, default=DEFAULT_FACTS, help="path to brand-facts.json")
    args = ap.parse_args(argv)

    if args.text is not None:
        text = args.text
    elif args.file is not None:
        text = args.file.read_text(encoding="utf-8")
    else:
        text = sys.stdin.read()

    if not text.strip():
        print("config error: no copy supplied", file=sys.stderr)
        return 2

    violations = validate(text, args.brand, args.surface, load_facts(args.facts))

    if violations:
        print(f"BLOCKED — {len(violations)} violation(s) for {args.brand}/{args.surface}:", file=sys.stderr)
        for v in violations:
            print(f"  {v}", file=sys.stderr)
        print("\nDo not publish. Fix the copy or update brand-facts.json with Vee's approval.", file=sys.stderr)
        return 1

    print(f"OK — {args.brand}/{args.surface} copy passed content policy checks.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
