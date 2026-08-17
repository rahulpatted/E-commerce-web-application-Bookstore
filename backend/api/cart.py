"""Cart API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime

from db.mongo import get_database
from db.models import CartItemSchema, User, BookSchema
from .dependencies import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])

class CartAddRequest(BaseModel):
    book_id: str
    quantity: int = 1

class CartUpdateRequest(BaseModel):
    quantity: int

@router.get("/", response_model=List[CartItemSchema])
async def get_cart(current_user: User = Depends(get_current_user)):
    db = get_database()
    cursor = db.carts.find({"user_id": str(current_user.id)})
    items = await cursor.to_list(length=100)
    
    # Populate book data
    for item in items:
        book = await db.products.find_one({"_id": ObjectId(item["book_id"])})
        if book:
            book["_id"] = str(book["_id"])
            item["book"] = BookSchema(**book)
            
    return items

@router.post("/add", response_model=CartItemSchema)
async def add_to_cart(req: CartAddRequest, current_user: User = Depends(get_current_user)):
    db = get_database()
    book = await db.products.find_one({"_id": ObjectId(req.book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.get("stock", 0) < 1:
        raise HTTPException(status_code=400, detail="Book is out of stock")

    existing = await db.carts.find_one({"user_id": str(current_user.id), "book_id": req.book_id})
    
    if existing:
        new_qty = existing["quantity"] + req.quantity
        if new_qty > book.get("stock", 0):
            raise HTTPException(status_code=400, detail=f"Only {book.get('stock', 0)} available in stock")
            
        await db.carts.update_one(
            {"_id": existing["_id"]},
            {"$set": {"quantity": new_qty}}
        )
        existing["quantity"] = new_qty
        book["_id"] = str(book["_id"])
        existing["book"] = BookSchema(**book)
        return existing

    if req.quantity > book.get("stock", 0):
        raise HTTPException(status_code=400, detail=f"Only {book.get('stock', 0)} available in stock")

    new_item = {
        "user_id": str(current_user.id),
        "book_id": req.book_id,
        "quantity": req.quantity,
        "added_at": datetime.utcnow()
    }
    result = await db.carts.insert_one(new_item)
    new_item["_id"] = result.inserted_id
    
    book["_id"] = str(book["_id"])
    new_item["book"] = BookSchema(**book)
    return new_item

@router.put("/{item_id}", response_model=CartItemSchema)
async def update_cart_item(item_id: str, req: CartUpdateRequest, current_user: User = Depends(get_current_user)):
    db = get_database()
    item = await db.carts.find_one({"_id": ObjectId(item_id), "user_id": str(current_user.id)})
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if req.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    book = await db.products.find_one({"_id": ObjectId(item["book_id"])})
    if book and req.quantity > book.get("stock", 0):
        raise HTTPException(status_code=400, detail=f"Only {book.get('stock', 0)} available in stock")

    await db.carts.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": {"quantity": req.quantity}}
    )
    
    item["quantity"] = req.quantity
    if book:
        book["_id"] = str(book["_id"])
        item["book"] = BookSchema(**book)
        
    return item

@router.delete("/{item_id}")
async def remove_cart_item(item_id: str, current_user: User = Depends(get_current_user)):
    db = get_database()
    result = await db.carts.delete_one({"_id": ObjectId(item_id), "user_id": str(current_user.id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Item removed from cart"}

@router.delete("/")
async def clear_cart(current_user: User = Depends(get_current_user)):
    db = get_database()
    await db.carts.delete_many({"user_id": str(current_user.id)})
    return {"message": "Cart cleared"}
