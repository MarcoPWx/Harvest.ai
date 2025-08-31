# ADR-0001: Separate Quiz Scraper into QuizMentor

## Status
Accepted – August 27, 2025

## Context
A quiz-specific scraper and reasoning engine existed and created coupling between Harvest.ai and QuizMentor.

## Decision
Move quiz-specific scraping + reasoning into `quizmentor/quiz_scraper.py`. Keep Harvest.ai’s `src/legal_compliance.py` as the general compliance module. Harvest.ai will implement a generic scraper later.

## Consequences
- Reduced cross-product coupling
- Clear ownership boundaries
- Faster iteration per product
- Minor duplication (temporary) until a generic scraper is built
