"""Wishlist API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime

from db.mongo import get_database
from db.models import WishlistItemSchema, User, BookSchema
from .dependencies import get_current_user

router = APIRouter(prefix="/wishlist", tags=["wishlist"])

@router.get("/", response_model=List[WishlistItemSchema])
async def get_wishlist(current_user: User = Depends(get_current_user)):
    db = get_database()
    cursor = db.wishlists.find({"user_id": str(current_user.id)}).sort([("added_at", -1)])
    items = await cursor.to_list(100)
    
    for item in items:
        book = await db.products.find_one({"_id": ObjectId(item["book_id"])})
        if book:
            book["_id"] = str(book["_id"])
            item["book"] = BookSchema(**book)
            
    return items

@router.post("/{book_id}")
async def add_to_wishlist(book_id: str, current_user: User = Depends(get_current_user)):
    db = get_database()
    book = await db.products.find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    existing = await db.wishlists.find_one({"user_id": str(current_user.id), "book_id": book_id})
    if existing:
        raise HTTPException(status_code=400, detail="Book already in wishlist")

    await db.wishlists.insert_one({
        "user_id": str(current_user.id),
        "book_id": book_id,
        "added_at": datetime.utcnow()
    })
    return {"message": "Book added to wishlist"}

@router.delete("/{book_id}")
async def remove_from_wishlist(book_id: str, current_user: User = Depends(get_current_user)):
    db = get_database()
    result = await db.wishlists.delete_one({"user_id": str(current_user.id), "book_id": book_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not in wishlist")
    return {"message": "Book removed from wishlist"}

@router.get("/check/{book_id}")
async def check_wishlist(book_id: str, current_user: User = Depends(get_current_user)):
    db = get_database()
    item = await db.wishlists.find_one({"user_id": str(current_user.id), "book_id": book_id})
    return {"in_wishlist": item is not None}
