"""Support ticket endpoints for customers."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
from bson import ObjectId

from db.mongo import get_database
from db.models import SupportTicketSchema, TicketStatus, User
from .dependencies import get_current_user, get_optional_user

router = APIRouter(prefix="/support", tags=["support"])

class SupportTicketCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

@router.post("/", response_model=SupportTicketSchema)
async def create_ticket(
    req: SupportTicketCreate,
    current_user: Optional[User] = Depends(get_optional_user)
):
    db = get_database()
    
    new_ticket = {
        "user_id": str(current_user.id) if current_user else None,
        "name": req.name,
        "email": req.email,
        "subject": req.subject,
        "message": req.message,
        "status": TicketStatus.OPEN.value,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.support.insert_one(new_ticket)
    new_ticket["_id"] = str(result.inserted_id)
    return new_ticket

@router.get("/", response_model=List[SupportTicketSchema])
async def get_my_tickets(current_user: User = Depends(get_current_user)):
    db = get_database()
    cursor = db.support.find({"user_id": str(current_user.id)}).sort([("created_at", -1)])
    return await cursor.to_list(100)
