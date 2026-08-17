"""CRUD and recommendation endpoints for books, secured by JWT."""

from typing import List, Optional
from datetime import datetime
import re

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from bson import ObjectId

from db.mongo import get_database
from db.models import BookSchema, BookCreateSchema, BookUpdateSchema, User, RatingSchema
from .dependencies import get_current_user, get_optional_user, get_current_admin

router = APIRouter(prefix="/books", tags=["books"])

class RatingRequest(BaseModel):
    rating: float = Field(..., ge=1.0, le=5.0)

# GET /books/ — with filtering, sorting, pagination
@router.get("/", response_model=List[BookSchema])
async def list_books(
    skip: int = 0,
    limit: int = 40,
    category: Optional[str] = None,
    author: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    min_rating: Optional[float] = None,
    in_stock: Optional[bool] = None,
    sort: Optional[str] = None,
    q: Optional[str] = None,
):
    db = get_database()
    filter_query = {}

    if q:
        regex = {"$regex": q, "$options": "i"}
        filter_query["$or"] = [
            {"title": regex},
            {"author": regex},
            {"category": regex},
            {"description": regex}
        ]

    if category:
        filter_query["category"] = category
    if author:
        filter_query["author"] = {"$regex": author, "$options": "i"}
    if min_price is not None or max_price is not None:
        price_q = {}
        if min_price is not None:
            price_q["$gte"] = min_price
        if max_price is not None:
            price_q["$lte"] = max_price
        filter_query["price"] = price_q
    if min_rating is not None:
        filter_query["rating"] = {"$gte": min_rating}
    if in_stock is True:
        filter_query["stock"] = {"$gt": 0}

    sort_q = [("rating", -1)]
    if sort == "price_asc":
        sort_q = [("price", 1)]
    elif sort == "price_desc":
        sort_q = [("price", -1)]
    elif sort == "newest":
        sort_q = [("created_at", -1)]
    elif sort == "title":
        sort_q = [("title", 1)]

    cursor = db.products.find(filter_query).sort(sort_q).skip(skip).limit(limit)
    books = await cursor.to_list(length=limit)
    return books

# GET /books/categories
@router.get("/categories")
async def list_categories():
    db = get_database()
    cats = await db.products.distinct("category")
    return [c for c in cats if c]

# GET /books/featured
@router.get("/featured", response_model=List[BookSchema])
async def featured_books(limit: int = 8):
    db = get_database()
    cursor = db.products.find({"rating": {"$ne": None}}).sort([("rating", -1)]).limit(limit)
    return await cursor.to_list(length=limit)

# GET /books/search
@router.get("/search", response_model=List[BookSchema])
async def search_books(q: str = Query(..., min_length=1)):
    db = get_database()
    regex = {"$regex": q, "$options": "i"}
    filter_query = {
        "$or": [
            {"title": regex},
            {"author": regex},
            {"category": regex}
        ]
    }
    cursor = db.products.find(filter_query).limit(20)
    return await cursor.to_list(length=20)

# GET /books/recommendations
@router.get("/recommendations", response_model=List[BookSchema])
async def recommend(current_user: User = Depends(get_current_user)):
    db = get_database()
    fav_genres = [g.strip() for g in current_user.favorite_genres.split(",") if g.strip()]
    if fav_genres:
        cursor = db.products.find({"category": {"$in": fav_genres}}).sort([("rating", -1)]).limit(10)
        top_books = await cursor.to_list(length=10)
        if top_books:
            return top_books
    cursor = db.products.find().sort([("rating", -1)]).limit(10)
    return await cursor.to_list(length=10)

# GET /books/history (placeholder as history not requested, but keeping empty list for compat)
@router.get("/history", response_model=List[BookSchema])
async def get_view_history(current_user: User = Depends(get_current_user)):
    return []

# GET /books/{book_id}
@router.get("/{book_id}", response_model=BookSchema)
async def get_book_detail(book_id: str):
    db = get_database()
    book = await db.products.find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

# POST /books
@router.post("/", response_model=BookSchema, status_code=status.HTTP_201_CREATED)
async def create_book(book: BookCreateSchema, admin: User = Depends(get_current_admin)):
    db = get_database()
    new_book = book.model_dump()
    new_book["created_at"] = datetime.utcnow()
    result = await db.products.insert_one(new_book)
    created_book = await db.products.find_one({"_id": result.inserted_id})
    return created_book

# PUT /books/{book_id}
@router.put("/{book_id}", response_model=BookSchema)
async def update_book(book_id: str, book: BookUpdateSchema, admin: User = Depends(get_current_admin)):
    db = get_database()
    update_data = book.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.products.update_one({"_id": ObjectId(book_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
        
    updated = await db.products.find_one({"_id": ObjectId(book_id)})
    return updated

# DELETE /books/{book_id}
@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_id: str, admin: User = Depends(get_current_admin)):
    db = get_database()
    result = await db.products.delete_one({"_id": ObjectId(book_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
    return None

# POST /books/{book_id}/rate
@router.post("/{book_id}/rate")
async def rate_book(
    book_id: str,
    req: RatingRequest,
    current_user: User = Depends(get_current_user)
):
    db = get_database()
    book = await db.products.find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    existing_rating = await db.reviews.find_one({
        "user_id": str(current_user.id),
        "book_id": book_id
    })

    if existing_rating:
        await db.reviews.update_one(
            {"_id": existing_rating["_id"]},
            {"$set": {"rating": req.rating, "timestamp": datetime.utcnow()}}
        )
    else:
        new_rating = {
            "user_id": str(current_user.id),
            "book_id": book_id,
            "rating": req.rating,
            "timestamp": datetime.utcnow()
        }
        await db.reviews.insert_one(new_rating)

    # Recalculate average rating
    pipeline = [
        {"$match": {"book_id": book_id}},
        {"$group": {"_id": "$book_id", "avg_rating": {"$avg": "$rating"}}}
    ]
    cursor = db.reviews.aggregate(pipeline)
    res = await cursor.to_list(length=1)
    
    new_avg = 0
    if res:
        new_avg = round(res[0]["avg_rating"], 2)
        await db.products.update_one({"_id": ObjectId(book_id)}, {"$set": {"rating": new_avg}})

    return {"message": "Rating submitted successfully", "new_average_rating": new_avg}

# GET /books/{book_id}/related
@router.get("/{book_id}/related", response_model=List[BookSchema])
async def get_related_books(book_id: str, limit: int = 6):
    db = get_database()
    book = await db.products.find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    filter_query = {
        "_id": {"$ne": ObjectId(book_id)},
        "$or": [
            {"category": book.get("category")},
            {"author": book.get("author")}
        ]
    }
    cursor = db.products.find(filter_query).sort([("rating", -1)]).limit(limit)
    related = await cursor.to_list(length=limit)
    return related

# POST /books/{book_id}/view (placeholder)
@router.post("/{book_id}/view")
async def log_book_view(book_id: str, current_user: User = Depends(get_current_user)):
    return {"message": "View logged to history"}
