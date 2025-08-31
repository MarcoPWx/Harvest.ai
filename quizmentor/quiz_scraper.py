from __future__ import annotations

"""
QuizMentor - Quiz Scraper and Reasoning Engine
This module is dedicated to QuizMentor and intentionally independent of Harvest.ai internals.
"""

import requests
from bs4 import BeautifulSoup
from typing import List, Dict


def extract_content(url: str) -> str:
    resp = requests.get(url, timeout=20, headers={
        "User-Agent": "QuizMentor/1.0 (https://quizmentor.app)"
    })
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.extract()
    text = soup.get_text(" ")
    return " ".join(text.split())


class QuizReasoningEngine:
    """Simple reasoning engine to derive MCQs from raw text."""

    def generate_questions(self, content: str, num_questions: int = 5) -> List[Dict[str, object]]:
        paragraphs = [p.strip() for p in content.split("\n") if p.strip()]
        if not paragraphs:
            paragraphs = [content]

        questions: List[Dict[str, object]] = []
        for idx, paragraph in enumerate(paragraphs[:num_questions], start=1):
            stem = self._summarize(paragraph)
            options = self._derive_options(stem)
            answer = options[0]
            questions.append({
                "question": f"What is the main idea of paragraph {idx}? {stem}",
                "options": options,
                "answer": answer,
            })
        return questions

    def _summarize(self, text: str) -> str:
        # Heuristic placeholder; swap with LLM later
        return text[:140] + ("..." if len(text) > 140 else "")

    def _derive_options(self, stem: str) -> List[str]:
        base = stem[:40] or "Content"
        return [
            f"{base} (correct)",
            f"{base} (incorrect 1)",
            f"{base} (incorrect 2)",
            f"{base} (incorrect 3)",
        ]


def build_quiz_from_url(url: str, count: int = 5) -> List[Dict[str, object]]:
    content = extract_content(url)
    engine = QuizReasoningEngine()
    return engine.generate_questions(content, num_questions=count)
