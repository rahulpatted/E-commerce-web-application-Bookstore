"""Order API endpoints for customers."""

from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from bson import ObjectId

from db.mongo import get_database
from db.models import OrderSchema, OrderStatus, PaymentStatus, User, OrderItemSchema
from .dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

class CreateOrderRequest(BaseModel):
    shipping_name: str
    shipping_email: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_postal_code: str
    shipping_country: str = "India"
    payment_method: str = "COD"

@router.post("/", response_model=OrderSchema)
async def create_order(req: CreateOrderRequest, current_user: User = Depends(get_current_user)):
    db = get_database()
    
    # Get cart items
    cursor = db.carts.find({"user_id": str(current_user.id)})
    cart_items = await cursor.to_list(length=100)
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    subtotal = 0
    order_items = []
    
    for ci in cart_items:
        book = await db.products.find_one({"_id": ObjectId(ci["book_id"])})
        if not book:
            raise HTTPException(status_code=400, detail=f"Book ID {ci['book_id']} not found")
            
        stock = book.get("stock", 0)
        if ci["quantity"] > stock:
            raise HTTPException(
                status_code=400,
                detail=f"'{book.get('title')}' only has {stock} in stock, but {ci['quantity']} requested"
            )
            
        price = book.get("price", 0)
        item_price = price * ci["quantity"]
        subtotal += item_price
        
        order_items.append({
            "book_id": str(book["_id"]),
            "quantity": ci["quantity"],
            "price": price,
            "title": book.get("title", ""),
            "author": book.get("author", ""),
            "image": book.get("image")
        })

    shipping_fee = 0 if subtotal >= 999 else 49
    total = subtotal + shipping_fee

    new_order = {
        "user_id": str(current_user.id),
        "status": OrderStatus.PENDING.value,
        "payment_status": PaymentStatus.PENDING.value if req.payment_method != "COD" else PaymentStatus.PAID.value,
        "subtotal": subtotal,
        "shipping_fee": shipping_fee,
        "discount": 0,
        "total": total,
        "shipping_name": req.shipping_name,
        "shipping_email": req.shipping_email,
        "shipping_phone": req.shipping_phone,
        "shipping_address": req.shipping_address,
        "shipping_city": req.shipping_city,
        "shipping_state": req.shipping_state,
        "shipping_postal_code": req.shipping_postal_code,
        "shipping_country": req.shipping_country,
        "payment_method": req.payment_method,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "items": order_items
    }
    
    result = await db.orders.insert_one(new_order)
    new_order["_id"] = result.inserted_id

    # Deduct stock
    for oi in order_items:
        await db.products.update_one(
            {"_id": ObjectId(oi["book_id"])},
            {"$inc": {"stock": -oi["quantity"]}}
        )

    # Clear cart
    await db.carts.delete_many({"user_id": str(current_user.id)})
    
    return new_order

@router.get("/", response_model=List[OrderSchema])
async def get_orders(current_user: User = Depends(get_current_user)):
    db = get_database()
    cursor = db.orders.find({"user_id": str(current_user.id)}).sort([("created_at", -1)])
    orders = await cursor.to_list(length=100)
    return orders

@router.get("/{order_id}", response_model=OrderSchema)
async def get_order_detail(order_id: str, current_user: User = Depends(get_current_user)):
    db = get_database()
    order = await db.orders.find_one({"_id": ObjectId(order_id), "user_id": str(current_user.id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}/cancel")
async def cancel_order(order_id: str, current_user: User = Depends(get_current_user)):
    db = get_database()
    order = await db.orders.find_one({"_id": ObjectId(order_id), "user_id": str(current_user.id)})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.get("status") in [OrderStatus.SHIPPED.value, OrderStatus.DELIVERED.value]:
        raise HTTPException(status_code=400, detail="Cannot cancel a shipped or delivered order")

    # Restore stock
    for item in order.get("items", []):
        await db.products.update_one(
            {"_id": ObjectId(item["book_id"])},
            {"$inc": {"stock": item["quantity"]}}
        )

    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {
            "status": OrderStatus.CANCELLED.value,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Order cancelled successfully"}
