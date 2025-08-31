from __future__ import annotations

"""
Legal Compliance Module - Ensures ethical and legal web scraping for Harvest.ai
This module is general-purpose and MUST remain in Harvest.ai (not QuizMentor).
"""

import os
import json
import time
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup


logger = logging.getLogger(__name__)


@dataclass
class ComplianceRules:
    domain: str
    can_fetch: bool
    crawl_delay: float
    rate_limit: int  # requests per minute
    disallowed_paths: List[str]
    sitemap_url: Optional[str]
    attribution_required: bool
    last_checked: datetime


class LegalComplianceEngine:
    """Ensures all web scraping activities are legal and ethical."""

    def __init__(self, cache_dir: str = "./cache/compliance") -> None:
        self.cache_dir = cache_dir
        os.makedirs(self.cache_dir, exist_ok=True)
        self.robots_cache: Dict[str, RobotFileParser] = {}
        self.domain_rules: Dict[str, ComplianceRules] = {}
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Harvest.ai/1.0 (https://harvest.ai; legal@harvest.ai) Educational Content Bot",
        })

        # Whitelist of explicitly allowed educational sources
        self.educational_whitelist = {
            "docs.python.org",
            "developer.mozilla.org",
            "w3schools.com",
            "wikipedia.org",
            "github.com",  # Prefer API where possible
            "stackoverflow.com",  # Prefer API
        }

        # Blacklist of sources we never scrape
        self.blacklist = {
            "facebook.com",
            "instagram.com",
            "linkedin.com",
            "twitter.com",
            "medium.com",
            "substack.com",
            "patreon.com",
        }

    # ------------------------- Public API -------------------------
    def check_compliance(self, url: str) -> Tuple[bool, Dict[str, object]]:
        """Check if we can legally scrape this URL.
        Returns (allowed, info_dict).
        """
        domain = urlparse(url).netloc

        # Blacklist
        if any(blocked in domain for blocked in self.blacklist):
            return False, {
                "reason": "blacklisted_domain",
                "message": f"{domain} is on our no-scrape list",
            }

        # robots.txt
        robots_ok, robots_info = self._check_robots_txt(url)
        if not robots_ok:
            return False, {"reason": "robots_txt_disallowed", "message": robots_info}

        # Prefer official APIs when present
        api_info = self._check_api_availability(domain)
        if api_info is not None:
            return False, {
                "reason": "api_available",
                "message": f"Use the official API for {domain}",
                "api_info": api_info,
            }

        # TOS heuristic (placeholder for manual policy map)
        if not self._check_terms_of_service(domain):
            return False, {"reason": "terms_violation", "message": "TOS may prohibit scraping"}

        rules = self._get_domain_rules(domain)
        return True, {
            "domain": domain,
            "crawl_delay": rules.crawl_delay,
            "rate_limit": rules.rate_limit,
            "attribution_required": rules.attribution_required,
            "rules": rules,
        }

    def scrape_content(self, url: str) -> str:
        """Fetch page content after compliance checks. Returns plain text."""
        allowed, info = self.check_compliance(url)
        if not allowed:
            raise PermissionError(f"Scrape blocked: {info}")

        rules: ComplianceRules = info["rules"]  # type: ignore[index]
        if rules.crawl_delay > 0:
            time.sleep(min(rules.crawl_delay, 5.0))

        resp = self.session.get(url, timeout=20)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")
        # Remove script/style
        for tag in soup(["script", "style", "noscript"]):
            tag.extract()
        text = soup.get_text(" ")
        return " ".join(text.split())

    # ------------------------- Internal -------------------------
    def _check_robots_txt(self, url: str) -> Tuple[bool, str]:
        domain = urlparse(url).netloc
        base = f"{urlparse(url).scheme}://{domain}"
        robots_url = f"{base}/robots.txt"

        parser = self.robots_cache.get(domain)
        if parser is None:
            parser = RobotFileParser()
            parser.set_url(robots_url)
            try:
                parser.read()
            except Exception as exc:
                logger.warning("robots.txt read failed for %s: %s", domain, exc)
            self.robots_cache[domain] = parser

        can_fetch = parser.can_fetch(self.session.headers.get("User-Agent", "*"), url)
        crawl_delay = parser.crawl_delay(self.session.headers.get("User-Agent", "*")) or 1.0

        # Update domain rules cache
        rules = ComplianceRules(
            domain=domain,
            can_fetch=bool(can_fetch),
            crawl_delay=float(crawl_delay),
            rate_limit=30,
            disallowed_paths=[],
            sitemap_url=None,
            attribution_required=(domain not in self.educational_whitelist),
            last_checked=datetime.utcnow(),
        )
        self.domain_rules[domain] = rules

        if not can_fetch:
            return False, f"robots.txt disallows scraping: {url}"
        return True, "robots.txt allows scraping"

    def _check_api_availability(self, domain: str) -> Optional[Dict[str, str]]:
        known_apis = {
            "wikipedia.org": {"docs": "https://www.mediawiki.org/wiki/API:Main_page"},
            "github.com": {"docs": "https://docs.github.com/en/rest"},
            "stackoverflow.com": {"docs": "https://api.stackexchange.com/"},
        }
        for known, info in known_apis.items():
            if known in domain:
                return info
        return None

    def _check_terms_of_service(self, domain: str) -> bool:
        # Placeholder heuristic; real implementation would consult a curated policy map
        return True

    def _get_domain_rules(self, domain: str) -> ComplianceRules:
        rules = self.domain_rules.get(domain)
        if rules:
            return rules
        rules = ComplianceRules(
            domain=domain,
            can_fetch=True,
            crawl_delay=1.0,
            rate_limit=30,
            disallowed_paths=[],
            sitemap_url=None,
            attribution_required=(domain not in self.educational_whitelist),
            last_checked=datetime.utcnow(),
        )
        self.domain_rules[domain] = rules
        return rules
