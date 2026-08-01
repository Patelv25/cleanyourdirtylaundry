#!/usr/bin/env python3
"""Tests for content_policy_validator. Run: python3 -m unittest discover tools/social-publishing"""

import json
import unittest
from pathlib import Path

from content_policy_validator import find_phone_candidates, validate

FACTS = json.loads((Path(__file__).with_name("brand-facts.json")).read_text(encoding="utf-8"))

# The exact copy Google quoted when it suspended posting on 2026-07-30.
OFFENDING_POST = (
    "Easiest way to start with Hamper'd: just call us at (919) 283-3010. "
    "We'll set up your weekly pick..."
)


def codes(violations):
    return {v.code for v in violations}


class PhoneDetection(unittest.TestCase):
    def test_detects_common_us_formats(self):
        for raw in [
            "(919) 301-8054",
            "919-301-8054",
            "919.301.8054",
            "919 301 8054",
            "+1 919-301-8054",
            "9193018054",
            "283-3010",
        ]:
            with self.subTest(raw=raw):
                self.assertTrue(find_phone_candidates(f"call {raw} today"), raw)

    def test_ignores_prices_dates_and_specs(self):
        clean = (
            "$100/mo flat. One 20 lb bag a week. Comforter add-on $20. "
            "Launch is Saturday Aug 22 2026, move-in Aug 14-16. "
            "Pickup 2026-08-22 10:00, back Thursday."
        )
        self.assertEqual(find_phone_candidates(clean), [])

    def test_does_not_double_report_one_number(self):
        self.assertEqual(len(find_phone_candidates("(919) 301-8054")), 1)


class GoogleBusinessProfile(unittest.TestCase):
    def test_regression_the_post_that_caused_the_suspension(self):
        v = validate(OFFENDING_POST, "hamperd", "google_business_profile", FACTS)
        self.assertIn("GBP-PHONE-IN-BODY", codes(v))

    def test_blocks_even_the_approved_number(self):
        """Google forbids ALL phone numbers in post body, correct one included."""
        v = validate("Call (919) 301-8054", "hamperd", "google_business_profile", FACTS)
        self.assertIn("GBP-PHONE-IN-BODY", codes(v))

    def test_clean_post_passes(self):
        v = validate(
            "Weekly pickup and delivery in Raleigh. $120/month for a 20 lb bag. "
            "Tap Call now to get started.",
            "hamperd",
            "google_business_profile",
            FACTS,
        )
        self.assertEqual(v, [])


class SocialSurfaces(unittest.TestCase):
    def test_hamperd_phone_blocked_while_ground_truth_unresolved(self):
        v = validate("Call (919) 283-3010", "hamperd", "facebook", FACTS)
        self.assertIn("PHONE-UNRESOLVED", codes(v))

    def test_cydl_has_no_phone_so_any_number_is_invented(self):
        v = validate("Text us at 919-555-0100", "cydl", "instagram", FACTS)
        self.assertIn("PHONE-NONE_EXISTS", codes(v))

    def test_mismatch_flagged_once_ground_truth_is_set(self):
        facts = json.loads(json.dumps(FACTS))
        facts["brands"]["hamperd"]["phone"] = "(919) 301-8054"
        good = validate("Call (919) 301-8054", "hamperd", "facebook", facts)
        self.assertEqual(good, [])
        bad = validate("Call (919) 283-3010", "hamperd", "facebook", facts)
        self.assertIn("PHONE-MISMATCH", codes(bad))

    def test_cross_brand_contamination(self):
        """ERR-008: a CYDL post that shipped Hamper'd contact details."""
        v = validate("Sign up at hamperd.com", "cydl", "facebook", FACTS)
        self.assertIn("CROSS-BRAND", codes(v))

    def test_clean_cydl_caption_passes(self):
        v = validate(
            "Your laundry pile is judging you. $100/mo flat, one bag a week. "
            "cleanyourdirtylaundry.com",
            "cydl",
            "facebook",
            FACTS,
        )
        self.assertEqual(v, [])


if __name__ == "__main__":
    unittest.main()
