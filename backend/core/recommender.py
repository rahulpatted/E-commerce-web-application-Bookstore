import numpy as np
from rapidfuzz import fuzz

from .utils import get_user_ratings_matrix, get_book_content_corpus
from ..db import models


class HybridRecommender:
    """Hybrid recommender combining collaborative filtering and content‑based fuzzy matching."""

    def __init__(self, db_session):
        self.db = db_session
        self._prepare()

    def _prepare(self):
        # Collaborative matrix
        self.user_item_matrix = get_user_ratings_matrix(self.db)
        # Build a dict of book_id -> concatenated text for fuzzy matching
        books = self.db.query(models.Book).all()
        self.book_content = {
            b.id: " ".join(filter(None, [b.title, b.author, b.category or "", b.description or ""]))
            for b in books
        }

    def recommend_for_user(self, user_id: int, top_n: int = 10):
        # If user has no ratings, fall back to content‑based using preferences
        if user_id not in self.user_item_matrix.index:
            return self._content_based_fallback(user_id, top_n)

        # Collaborative filtering: compute similarity via dot product
        user_vec = self.user_item_matrix.loc[user_id].values
        sims = self.user_item_matrix.dot(user_vec)
        similar_user_idxs = np.argsort(sims)[::-1][1:6]  # top‑5 similar users (exclude self)

        # Aggregate books rated >=4 by these users
        candidate_ids = (
            self.user_item_matrix.iloc[similar_user_idxs]
            .apply(lambda row: row[row >= 4].index.tolist(), axis=1)
            .explode()
            .value_counts()
            .index.tolist()
        )
        if not candidate_ids:
            return []

        # Build a profile text from books the user liked (rating >=4)
        liked = self.user_item_matrix.loc[user_id]
        liked_ids = liked[liked >= 4].index.tolist()
        if liked_ids:
            profile_text = " ".join(self.book_content.get(bid, "") for bid in liked_ids)
        else:
            profile_text = ""

        # Compute fuzzy similarity between profile and each candidate's content
        scores = []
        for cid in candidate_ids:
            cand_text = self.book_content.get(cid, "")
            score = fuzz.ratio(profile_text, cand_text) if profile_text else fuzz.ratio("", cand_text)
            scores.append((cid, score))
        ranked = [cid for cid, _ in sorted(scores, key=lambda x: x[1], reverse=True)]
        return ranked[:top_n]

    def _content_based_fallback(self, user_id: int, top_n: int):
        user = self.db.get(models.User, user_id)
        if not user:
            return []
        # Build a text query from favorite genres and authors
        query = " ".join(filter(None, [user.favorite_genres, user.favorite_authors]))
        if not query.strip():
            # generic fallback – top rated books
            top_books = (
                self.db.query(models.Book)
                .order_by(models.Book.rating.desc())
                .limit(top_n)
                .all()
            )
            return [b.id for b in top_books]
        # Compute fuzzy similarity between query and each book's content
        scores = []
        for book in self.db.query(models.Book).all():
            score = fuzz.ratio(query, self.book_content.get(book.id, ""))
            scores.append((book.id, score))
        ranked = [bid for bid, _ in sorted(scores, key=lambda x: x[1], reverse=True)]
        return ranked[:top_n]
