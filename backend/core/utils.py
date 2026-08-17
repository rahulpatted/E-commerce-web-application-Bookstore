import pandas as pd
from sqlalchemy.orm import Session

from ..db import models

def get_user_ratings_matrix(db: Session) -> pd.DataFrame:
    """Return a pandas DataFrame with users as rows, books as columns, rating values (0 if missing)."""
    rows = []
    for r in db.query(models.Rating).all():
        rows.append({"user_id": r.user_id, "book_id": r.book_id, "rating": r.rating})
    if not rows:
        return pd.DataFrame()
    df = pd.DataFrame(rows)
    matrix = df.pivot(index="user_id", columns="book_id", values="rating").fillna(0)
    return matrix

def get_book_content_corpus(db: Session) -> list[str]:
    """Create a list of text documents, one per book, combining relevant fields for TF‑IDF."""
    corpus = []
    for b in db.query(models.Book).all():
        parts = [b.title, b.author, b.category or "", b.description or ""]
        corpus.append(" ".join(filter(None, parts)))
    return corpus
