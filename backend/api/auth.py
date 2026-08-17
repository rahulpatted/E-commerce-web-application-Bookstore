"""Authentication routes: signup, login, profile, JWT utilities."""
import os
from datetime import datetime, timedelta
from typing import Annotated

import jwt
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from bson import ObjectId

from db.mongo import get_database
from db.models import User, UserRole, UserResponse
from .dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey123")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

# ── Schemas ────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str = ""
    favorite_genres: list[str] = []
    favorite_authors: list[str] = []
    role: str = "USER"

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str = "USER"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProfileUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = None
    favorite_genres: str | None = None
    favorite_authors: str | None = None

# ── JWT Utilities ──────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# ── Routes ─────────────────────────────────────────────────────────────────

@router.post("/signup", response_model=TokenResponse)
async def signup(user: UserCreate):
    db = get_database()
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user.email,
        hashed_password=get_password_hash(user.password),
        name=user.name,
        favorite_genres=",".join(user.favorite_genres),
        favorite_authors=",".join(user.favorite_authors),
        role=user.role,
    )
    
    result = await db.users.insert_one(new_user.model_dump(by_alias=True, exclude={"id"}))
    new_user.id = str(result.inserted_id)
    
    access_token = create_access_token({"sub": str(new_user.id)})
    user_data = new_user.model_dump(by_alias=True)
    user_data["_id"] = new_user.id
    return TokenResponse(access_token=access_token, user=UserResponse(**user_data))


@router.post("/login", response_model=TokenResponse)
async def login(form: UserLogin):
    db = get_database()
    user_data = await db.users.find_one({"email": form.email})
    if not user_data or not verify_password(form.password, user_data["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if user_data.get("role") != form.role:
        raise HTTPException(status_code=401, detail=f"Invalid credentials for role {form.role}")
        
    user = User(**user_data)
    user.id = str(user_data["_id"])
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
        
    access_token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=access_token, user=UserResponse(**user_data))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    update: ProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    db = get_database()
    update_data = update.model_dump(exclude_unset=True)
    
    if not update_data:
        return current_user
        
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
        
    return current_user
