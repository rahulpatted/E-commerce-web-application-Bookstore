from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from pydantic_core import core_schema
from bson import ObjectId
import enum

class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: Any) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(str)
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class OrderStatus(str, enum.Enum):
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    PROCESSING = "Processing"
    SHIPPED = "Shipped"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"

class PaymentStatus(str, enum.Enum):
    PENDING = "Pending"
    PAID = "Paid"
    FAILED = "Failed"
    REFUNDED = "Refunded"

class TicketStatus(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"

# --- DB Models & Schemas ---

class User(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: str
    hashed_password: str
    name: str = ""
    phone: str = ""
    address: str = ""
    city: str = ""
    state: str = ""
    postal_code: str = ""
    country: str = "India"
    role: str = UserRole.USER.value
    is_active: bool = True
    favorite_genres: str = ""
    favorite_authors: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, json_encoders={ObjectId: str})

class UserResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    email: str
    name: str
    phone: str
    address: str
    city: str
    state: str
    postal_code: str
    country: str
    role: str
    is_active: bool
    favorite_genres: str
    favorite_authors: str
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, json_encoders={ObjectId: str})

class BookSchema(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str
    author: str
    category: Optional[str] = None
    price: Optional[int] = None
    original_price: Optional[int] = None
    rating: Optional[float] = None
    image: Optional[str] = None
    description: Optional[str] = None
    publisher: Optional[str] = None
    language: Optional[str] = None
    pages: Optional[int] = None
    isbn: Optional[str] = None
    stock: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, json_encoders={ObjectId: str})

class BookCreateSchema(BaseModel):
    title: str
    author: str
    category: Optional[str] = None
    price: Optional[int] = None
    original_price: Optional[int] = None
    rating: Optional[float] = None
    image: Optional[str] = None
    description: Optional[str] = None
    publisher: Optional[str] = None
    language: Optional[str] = None
    pages: Optional[int] = None
    isbn: Optional[str] = None
    stock: int = 0

class BookUpdateSchema(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    price: Optional[int] = None
    original_price: Optional[int] = None
    rating: Optional[float] = None
    image: Optional[str] = None
    description: Optional[str] = None
    publisher: Optional[str] = None
    language: Optional[str] = None
    pages: Optional[int] = None
    isbn: Optional[str] = None
    stock: Optional[int] = None

class CartItemSchema(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    book_id: str
    quantity: int = 1
    added_at: datetime = Field(default_factory=datetime.utcnow)
    book: Optional[BookSchema] = None

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, json_encoders={ObjectId: str})

class WishlistItemSchema(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    book_id: str
    added_at: datetime = Field(default_factory=datetime.utcnow)
    book: Optional[BookSchema] = None

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, json_encoders={ObjectId: str})

class RatingSchema(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    book_id: str
    rating: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, json_encoders={ObjectId: str})

class OrderItemSchema(BaseModel):
    book_id: str
    quantity: int
    price: int
    title: str
    author: str
    image: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, json_encoders={ObjectId: str})

class OrderSchema(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    status: str = OrderStatus.PENDING.value
    payment_status: str = PaymentStatus.PENDING.value
    subtotal: int = 0
    shipping_fee: int = 0
    discount: int = 0
    total: int = 0
    shipping_name: str = ""
    shipping_email: str = ""
    shipping_phone: str = ""
    shipping_address: str = ""
    shipping_city: str = ""
    shipping_state: str = ""
    shipping_postal_code: str = ""
    shipping_country: str = "India"
    payment_method: str = ""
    payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    items: List[OrderItemSchema] = []

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, json_encoders={ObjectId: str})

class SupportTicketSchema(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: Optional[str] = None
    name: str
    email: str
    subject: str
    message: str
    status: str = TicketStatus.OPEN.value
    admin_response: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, json_encoders={ObjectId: str})
