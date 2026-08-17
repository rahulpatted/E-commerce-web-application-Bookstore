from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["bookstore"]
books_collection = db["books"]

books = [
    {
        "id": 1,
        "title": "Atomic Habits",
        "author": "James Clear",
        "category": "Self Help",
        "price": 499,
        "rating": 4.8,
        "image": "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
        "description": "Atomic Habits teaches practical strategies for building good habits.",
        "publisher": "Penguin Random House",
        "language": "English",
        "pages": 320,
        "stock": 25
    },
    {
        "id": 2,
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "category": "Programming",
        "price": 799,
        "rating": 4.9,
        "image": "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
        "description": "A handbook of agile software craftsmanship.",
        "publisher": "Prentice Hall",
        "language": "English",
        "pages": 464,
        "stock": 18
    }
]

# Remove old data
books_collection.delete_many({})

# Insert books
books_collection.insert_many(books)

print("Books inserted successfully!")