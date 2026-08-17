"""Search endpoints for autocomplete and fuzzy matching."""

from fastapi import APIRouter, Query
from typing import List, Dict, Any

from db.mongo import get_database

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/autocomplete")
async def autocomplete(prefix: str = Query(..., min_length=1)):
    db = get_database()
    regex = {"$regex": f"^{prefix}", "$options": "i"}
    
    # Search in titles
    title_cursor = db.products.find({"title": regex}, {"title": 1}).limit(5)
    titles = await title_cursor.to_list(5)
    
    # Search in authors
    author_cursor = db.products.find({"author": regex}, {"author": 1}).limit(5)
    authors = await author_cursor.to_list(5)
    
    # Search in categories
    cat_cursor = db.products.find({"category": regex}, {"category": 1}).limit(5)
    categories = await cat_cursor.to_list(5)
    
    results = []
    seen = set()
    
    for t in titles:
        if t.get("title") and t["title"] not in seen:
            results.append({"type": "book", "text": t["title"], "id": str(t["_id"])})
            seen.add(t["title"])
            
    for a in authors:
        if a.get("author") and a["author"] not in seen:
            results.append({"type": "author", "text": a["author"]})
            seen.add(a["author"])
            
    for c in categories:
        if c.get("category") and c["category"] not in seen:
            results.append({"type": "category", "text": c["category"]})
            seen.add(c["category"])
            
    return results[:10]
