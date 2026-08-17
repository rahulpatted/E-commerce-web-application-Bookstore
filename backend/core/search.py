"""Search utilities using rapidfuzz for autocomplete and fuzzy matching."""

from typing import List

from rapidfuzz import process, fuzz

from ..db import models


class SearchEngine:
    def __init__(self, db_session):
        self.db = db_session
        self._build_index()

    def _build_index(self):
        # Load all book titles for fuzzy matching
        books = self.db.query(models.Book).all()
        self.titles = [book.title for book in books]
        # No additional index needed; rapidfuzz will handle matching at runtime

    def autocomplete(self, prefix: str, limit: int = 10) -> List[str]:
        """Return up to `limit` book titles that best match the given prefix.
        Prefers exact prefix matches, then falls back to fuzzy similarity.
        """
        # First, collect titles that start with the prefix (case‑insensitive)
        starts = [t for t in self.titles if t.lower().startswith(prefix.lower())]
        if len(starts) >= limit:
            return starts[:limit]
        # If not enough, use rapidfuzz to find the best fuzzy matches
        # We always include the prefix matches first
        results = []
        if starts:
            results.extend(starts)
        # Use rapidfuzz's extract to get additional candidates
        # scorer=fuzz.ratio gives a similarity score (0‑100)
        # limit is increased to ensure enough total results
        needed = limit - len(results)
        if needed > 0:
            # Extract top `needed` matches from the full title list
            fuzzy_matches = process.extract(
                query=prefix,
                choices=self.titles,
                scorer=fuzz.ratio,
                limit=needed * 5,  # fetch extra to filter out already‑included titles
            )
            # fuzzy_matches is list of (title, score, index)
            # Sort by score descending and filter out duplicates
            seen = set(starts)
            for title, score, _ in sorted(fuzzy_matches, key=lambda x: x[1], reverse=True):
                if title not in seen:
                    results.append(title)
                    seen.add(title)
                if len(results) >= limit:
                    break
        return results[:limit]
