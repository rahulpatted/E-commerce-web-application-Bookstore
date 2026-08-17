"""Admin API endpoints — all require admin role."""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from bson import ObjectId

from db.mongo import get_database
from db.models import (
    BookSchema, BookCreateSchema, BookUpdateSchema,
    OrderSchema, SupportTicketSchema, UserResponse,
    OrderStatus, PaymentStatus, TicketStatus, User
)
from .dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])

# ── Dashboard ──────────────────────────────────────────────────────────────

@router.get("/dashboard")
async def admin_dashboard(admin: User = Depends(get_current_admin)):
    db = get_database()
    
    total_books = await db.products.count_documents({})
    total_users = await db.users.count_documents({"role": "USER"})
    total_orders = await db.orders.count_documents({})
    
    # Total revenue from paid orders
    pipeline = [
        {"$match": {"payment_status": PaymentStatus.PAID.value}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    res = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = res[0]["total"] if res else 0
    
    pending_orders = await db.orders.count_documents({"status": OrderStatus.PENDING.value})
    
    low_stock_books = await db.products.count_documents({"stock": {"$lte": 5, "$gt": 0}})
    out_of_stock = await db.products.count_documents({"stock": {"$lte": 0}})

    return {
        "total_books": total_books,
        "total_users": total_users,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "pending_orders": pending_orders,
        "low_stock_books": low_stock_books,
        "out_of_stock": out_of_stock,
    }

# ── Analytics ──────────────────────────────────────────────────────────────

@router.get("/analytics")
async def admin_analytics(admin: User = Depends(get_current_admin)):
    db = get_database()
    
    # Category performance
    cat_pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    cat_res = await db.products.aggregate(cat_pipeline).to_list(100)
    category_stats = [{"category": c["_id"], "count": c["count"]} for c in cat_res if c["_id"]]

    # Top selling books
    top_books_pipeline = [
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.title",
            "total_sold": {"$sum": "$items.quantity"},
            "revenue": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}}
        }},
        {"$sort": {"total_sold": -1}},
        {"$limit": 10}
    ]
    top_res = await db.orders.aggregate(top_books_pipeline).to_list(10)
    top_books = [{"title": t["_id"], "total_sold": t["total_sold"], "revenue": t["revenue"]} for t in top_res]

    # Recent orders
    recent_orders = await db.orders.find().sort([("created_at", -1)]).limit(10).to_list(10)

    return {
        "category_stats": category_stats,
        "top_books": top_books,
        "recent_orders": recent_orders,
    }

# ── Book Management ───────────────────────────────────────────────────────

@router.get("/books", response_model=List[BookSchema])
async def admin_list_books(
    skip: int = 0,
    limit: int = 50,
    q: Optional[str] = None,
    category: Optional[str] = None,
    admin: User = Depends(get_current_admin)
):
    db = get_database()
    query = {}
    if q:
        regex = {"$regex": q, "$options": "i"}
        query["$or"] = [{"title": regex}, {"author": regex}]
    if category:
        query["category"] = category
        
    cursor = db.products.find(query).sort([("_id", -1)]).skip(skip).limit(limit)
    return await cursor.to_list(limit)

@router.post("/books", response_model=BookSchema)
async def admin_create_book(book: BookCreateSchema, admin: User = Depends(get_current_admin)):
    db = get_database()
    new_book = book.model_dump()
    new_book["created_at"] = datetime.utcnow()
    result = await db.products.insert_one(new_book)
    created_book = await db.products.find_one({"_id": result.inserted_id})
    return created_book

@router.put("/books/{book_id}", response_model=BookSchema)
async def admin_update_book(book_id: str, update: BookUpdateSchema, admin: User = Depends(get_current_admin)):
    db = get_database()
    update_data = update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    result = await db.products.update_one({"_id": ObjectId(book_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
        
    updated = await db.products.find_one({"_id": ObjectId(book_id)})
    return updated

@router.delete("/books/{book_id}")
async def admin_delete_book(book_id: str, admin: User = Depends(get_current_admin)):
    db = get_database()
    result = await db.products.delete_one({"_id": ObjectId(book_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
        
    await db.reviews.delete_many({"book_id": book_id})
    await db.carts.delete_many({"book_id": book_id})
    await db.wishlists.delete_many({"book_id": book_id})
    
    return {"message": "Book deleted successfully"}

# ── Inventory Management ──────────────────────────────────────────────────

@router.get("/inventory")
async def admin_inventory(admin: User = Depends(get_current_admin)):
    db = get_database()
    cursor = db.products.find().sort([("stock", 1)])
    books = await cursor.to_list(1000)
    
    result = []
    for book in books:
        stock = book.get("stock", 0)
        stock_status = "Out of Stock"
        if stock > 10:
            stock_status = "In Stock"
        elif stock > 0:
            stock_status = "Low Stock"
            
        result.append({
            "id": str(book["_id"]),
            "title": book.get("title", ""),
            "author": book.get("author", ""),
            "category": book.get("category", ""),
            "stock": stock,
            "price": book.get("price", 0),
            "status": stock_status,
        })
    return result

@router.put("/inventory/{book_id}")
async def admin_update_stock(
    book_id: str,
    stock: int = Query(..., ge=0),
    admin: User = Depends(get_current_admin)
):
    db = get_database()
    result = await db.products.update_one({"_id": ObjectId(book_id)}, {"$set": {"stock": stock}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"message": f"Stock updated to {stock}", "book_id": book_id, "new_stock": stock}

# ── Order Management ──────────────────────────────────────────────────────

@router.get("/orders", response_model=List[OrderSchema])
async def admin_list_orders(
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_current_admin)
):
    db = get_database()
    query = {}
    if status:
        query["status"] = status
    if payment_status:
        query["payment_status"] = payment_status
        
    cursor = db.orders.find(query).sort([("created_at", -1)]).skip(skip).limit(limit)
    return await cursor.to_list(limit)

class OrderStatusUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None

@router.put("/orders/{order_id}/status")
async def admin_update_order_status(
    order_id: str,
    update: OrderStatusUpdate,
    admin: User = Depends(get_current_admin)
):
    db = get_database()
    update_data = {}
    if update.status:
        update_data["status"] = update.status
    if update.payment_status:
        update_data["payment_status"] = update.payment_status
        
    if not update_data:
        raise HTTPException(status_code=400, detail="No status provided")
        
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.orders.update_one({"_id": ObjectId(order_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
        
    return {"message": "Order status updated"}

# ── User Management ───────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserResponse])
async def admin_list_users(
    q: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_current_admin)
):
    db = get_database()
    query = {"role": "USER"}
    if q:
        regex = {"$regex": q, "$options": "i"}
        query["$or"] = [{"email": regex}, {"name": regex}]
        
    cursor = db.users.find(query).sort([("_id", -1)]).skip(skip).limit(limit)
    users = await cursor.to_list(limit)
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
async def admin_get_user(user_id: str, admin: User = Depends(get_current_admin)):
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/users/{user_id}/orders", response_model=List[OrderSchema])
async def admin_get_user_orders(user_id: str, admin: User = Depends(get_current_admin)):
    db = get_database()
    cursor = db.orders.find({"user_id": user_id}).sort([("created_at", -1)])
    return await cursor.to_list(100)

@router.put("/users/{user_id}/toggle-active")
async def admin_toggle_user_active(user_id: str, admin: User = Depends(get_current_admin)):
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    new_status = not user.get("is_active", True)
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_active": new_status}})
    
    return {"message": f"User {'activated' if new_status else 'deactivated'}", "is_active": new_status}

# ── Support Ticket Management ─────────────────────────────────────────────

@router.get("/support", response_model=List[SupportTicketSchema])
async def admin_list_tickets(
    status: Optional[str] = None,
    admin: User = Depends(get_current_admin)
):
    db = get_database()
    query = {}
    if status:
        query["status"] = status
    cursor = db.support.find(query).sort([("created_at", -1)])
    return await cursor.to_list(1000)

class TicketUpdateRequest(BaseModel):
    status: Optional[str] = None
    admin_response: Optional[str] = None

@router.put("/support/{ticket_id}")
async def admin_update_ticket(
    ticket_id: str,
    update: TicketUpdateRequest,
    admin: User = Depends(get_current_admin)
):
    db = get_database()
    update_data = {}
    if update.status:
        update_data["status"] = update.status
    if update.admin_response:
        update_data["admin_response"] = update.admin_response
        
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
        
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.support.update_one({"_id": ObjectId(ticket_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    return {"message": "Ticket updated"}
