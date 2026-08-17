"""
Seed the MongoDB products collection with sample books.
Run with:  python seed_mongo.py   (from the backend/ directory)
"""
import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "bookstore")

SAMPLE_BOOKS = [
    {"title": "Atomic Habits", "author": "James Clear", "category": "Self Help", "price": 499, "original_price": 599, "rating": 4.8, "image": "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg", "description": "Atomic Habits teaches practical, proven strategies for building good habits and breaking bad ones. Learn how tiny changes lead to remarkable results.", "publisher": "Penguin Random House", "language": "English", "pages": 320, "isbn": "9780735211292", "stock": 25},
    {"title": "Deep Work", "author": "Cal Newport", "category": "Self Help", "price": 450, "original_price": 550, "rating": 4.7, "image": "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg", "description": "Deep Work is the ability to focus without distraction on a cognitively demanding task. Learn how to master this skill in a distracted world.", "publisher": "Grand Central Publishing", "language": "English", "pages": 304, "isbn": "9781455586691", "stock": 20},
    {"title": "The Power of Habit", "author": "Charles Duhigg", "category": "Self Help", "price": 399, "original_price": 499, "rating": 4.6, "image": "https://covers.openlibrary.org/b/isbn/9780812981605-L.jpg", "description": "An award-winning business reporter explains why habits exist, how they can be changed, and their immense power to shape our lives.", "publisher": "Random House", "language": "English", "pages": 416, "isbn": "9780812981605", "stock": 22},
    {"title": "Mindset", "author": "Carol S. Dweck", "category": "Self Help", "price": 420, "original_price": 520, "rating": 4.5, "image": "https://covers.openlibrary.org/b/isbn/9780345472328-L.jpg", "description": "Carol Dweck shows how success in school, work, sports, the arts, and almost every area of human endeavor can be dramatically influenced by how we think about our talents.", "publisher": "Ballantine Books", "language": "English", "pages": 320, "isbn": "9780345472328", "stock": 14},
    {"title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "category": "Self Help", "price": 550, "original_price": 699, "rating": 4.7, "image": "https://covers.openlibrary.org/b/isbn/9780374275631-L.jpg", "description": "A tour of the mind and an explanation of the two systems that drive the way we think.", "publisher": "Farrar, Straus and Giroux", "language": "English", "pages": 499, "isbn": "9780374275631", "stock": 16},
    {"title": "Clean Code", "author": "Robert C. Martin", "category": "Programming", "price": 799, "original_price": 999, "rating": 4.9, "image": "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg", "description": "A handbook of agile software craftsmanship. Clean Code is divided into three parts: description of patterns, practice, and code case studies.", "publisher": "Prentice Hall", "language": "English", "pages": 464, "isbn": "9780132350884", "stock": 18},
    {"title": "The Pragmatic Programmer", "author": "Andrew Hunt", "category": "Programming", "price": 899, "original_price": 1099, "rating": 4.8, "image": "https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg", "description": "One of the most significant books on software development, covering topics from career development to architectural techniques.", "publisher": "Addison-Wesley", "language": "English", "pages": 352, "isbn": "9780135957059", "stock": 12},
    {"title": "Introduction to Algorithms", "author": "Thomas H. Cormen", "category": "Programming", "price": 1499, "original_price": 1899, "rating": 4.7, "image": "https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg", "description": "A comprehensive and standard guide to algorithm design and analysis. Widely used as a textbook in universities globally.", "publisher": "MIT Press", "language": "English", "pages": 1312, "isbn": "9780262033848", "stock": 8},
    {"title": "Design Patterns", "author": "Erich Gamma", "category": "Programming", "price": 999, "original_price": 1199, "rating": 4.6, "image": "https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg", "description": "The seminal book establishing object-oriented design patterns, written by the Gang of Four. Highly influential for software architecture.", "publisher": "Addison-Wesley", "language": "English", "pages": 395, "isbn": "9780201633610", "stock": 15},
    {"title": "Dune", "author": "Frank Herbert", "category": "Science Fiction", "price": 599, "original_price": 749, "rating": 4.8, "image": "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg", "description": "Frank Herbert's epic masterpiece set in the desert planet Arrakis. A story of politics, religion, ecology, and the destiny of Paul Atreides.", "publisher": "Chilton Books", "language": "English", "pages": 604, "isbn": "9780441172719", "stock": 30},
    {"title": "Foundation", "author": "Isaac Asimov", "category": "Science Fiction", "price": 350, "original_price": 450, "rating": 4.7, "image": "https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg", "description": "The first novel in Asimov's historic Foundation Saga. Hari Seldon foresees the fall of the Galactic Empire and creates psychohistory to preserve knowledge.", "publisher": "Gnome Press", "language": "English", "pages": 255, "isbn": "9780553293357", "stock": 25},
    {"title": "Neuromancer", "author": "William Gibson", "category": "Science Fiction", "price": 499, "original_price": 599, "rating": 4.5, "image": "https://covers.openlibrary.org/b/isbn/9780441569595-L.jpg", "description": "The classic cyberpunk novel that coined the term cyberspace and defined a subgenre, following Case, a washed-up computer hacker.", "publisher": "Ace Books", "language": "English", "pages": 271, "isbn": "9780441569595", "stock": 15},
    {"title": "The Hitchhiker's Guide to the Galaxy", "author": "Douglas Adams", "category": "Science Fiction", "price": 299, "original_price": 399, "rating": 4.8, "image": "https://covers.openlibrary.org/b/isbn/9780345391803-L.jpg", "description": "A hilarious science fiction comedy following Arthur Dent's travels across the universe after the Earth is demolished to make way for a bypass.", "publisher": "Pan Books", "language": "English", "pages": 216, "isbn": "9780345391803", "stock": 40},
    {"title": "Snow Crash", "author": "Neal Stephenson", "category": "Science Fiction", "price": 499, "original_price": 599, "rating": 4.6, "image": "https://covers.openlibrary.org/b/isbn/9780553380958-L.jpg", "description": "A mind-altering romp through a future America where the Metaverse is the playground and Hiro Protagonist is hacker royalty.", "publisher": "Bantam Books", "language": "English", "pages": 470, "isbn": "9780553380958", "stock": 12},
    {"title": "Zero to One", "author": "Peter Thiel", "category": "Business", "price": 550, "original_price": 699, "rating": 4.7, "image": "https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg", "description": "Notes on startups, or how to build the future. Peter Thiel explores how to find unique business opportunities and create monopolies.", "publisher": "Crown Publishing", "language": "English", "pages": 224, "isbn": "9780804139298", "stock": 19},
    {"title": "The Lean Startup", "author": "Eric Ries", "category": "Business", "price": 600, "original_price": 750, "rating": 4.6, "image": "https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg", "description": "How today's entrepreneurs use continuous innovation to create radically successful businesses. Focuses on the Build-Measure-Learn feedback loop.", "publisher": "Crown Business", "language": "English", "pages": 336, "isbn": "9780307887894", "stock": 18},
    {"title": "The Intelligent Investor", "author": "Benjamin Graham", "category": "Business", "price": 699, "original_price": 899, "rating": 4.8, "image": "https://covers.openlibrary.org/b/isbn/9780060555665-L.jpg", "description": "The classic text on value investing, teaching Benjamin Graham's philosophy of loss minimization and long-term risk management.", "publisher": "HarperBusiness", "language": "English", "pages": 640, "isbn": "9780060555665", "stock": 14},
    {"title": "Good to Great", "author": "Jim Collins", "category": "Business", "price": 590, "original_price": 750, "rating": 4.7, "image": "https://covers.openlibrary.org/b/isbn/9780066620992-L.jpg", "description": "Jim Collins identifies how average companies transition into great companies, and why others fail to make the leap.", "publisher": "HarperBusiness", "language": "English", "pages": 320, "isbn": "9780066620992", "stock": 10},
    {"title": "The Hard Thing About Hard Things", "author": "Ben Horowitz", "category": "Business", "price": 650, "original_price": 799, "rating": 4.8, "image": "https://covers.openlibrary.org/b/isbn/9780062273208-L.jpg", "description": "Building a business when there are no easy answers. Ben Horowitz offers essential advice on building and running a startup.", "publisher": "HarperBusiness", "language": "English", "pages": 304, "isbn": "9780062273208", "stock": 11},
    {"title": "1984", "author": "George Orwell", "category": "Fiction", "price": 299, "original_price": 399, "rating": 4.9, "image": "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg", "description": "Orwell's dystopian classic about a totalitarian state governed by Big Brother. Deals with surveillance, censorship, and control over thoughts.", "publisher": "Secker & Warburg", "language": "English", "pages": 328, "isbn": "9780451524935", "stock": 35},
    {"title": "To Kill a Mockingbird", "author": "Harper Lee", "category": "Fiction", "price": 320, "original_price": 420, "rating": 4.9, "image": "https://covers.openlibrary.org/b/isbn/9780446310789-L.jpg", "description": "A Pulitzer Prize-winning novel focusing on racial injustice and the destruction of innocence in the American South.", "publisher": "J. B. Lippincott & Co.", "language": "English", "pages": 281, "isbn": "9780446310789", "stock": 25},
    {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "category": "Fiction", "price": 250, "original_price": 350, "rating": 4.7, "image": "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg", "description": "A critique of the American Dream in the Roaring Twenties, chronicling Nick Carraway's interactions with the mysterious millionaire Jay Gatsby.", "publisher": "Charles Scribner's Sons", "language": "English", "pages": 180, "isbn": "9780743273565", "stock": 20},
    {"title": "Brave New World", "author": "Aldous Huxley", "category": "Fiction", "price": 349, "original_price": 449, "rating": 4.6, "image": "https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg", "description": "Set in a futuristic World State where citizens are conditioned for happiness through genetic engineering and psychological manipulation.", "publisher": "Chatto & Windus", "language": "English", "pages": 311, "isbn": "9780060850524", "stock": 18},
    {"title": "The Hobbit", "author": "J.R.R. Tolkien", "category": "Fiction", "price": 399, "original_price": 499, "rating": 4.9, "image": "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg", "description": "The prequel to The Lord of the Rings. Bilbo Baggins is swept into an epic quest by the wizard Gandalf and thirteen dwarves.", "publisher": "George Allen & Unwin", "language": "English", "pages": 310, "isbn": "9780547928227", "stock": 30},
    {"title": "Pride and Prejudice", "author": "Jane Austen", "category": "Fiction", "price": 199, "original_price": 299, "rating": 4.8, "image": "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg", "description": "A romantic novel following Elizabeth Bennet as she navigates issues of manners, morality, marriage, and misconceptions in 19th century England.", "publisher": "T. Egerton, Whitehall", "language": "English", "pages": 432, "isbn": "9780141439518", "stock": 28},
]


async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    collection = db["products"]

    existing = await collection.count_documents({})
    if existing > 0:
        print(f"WARNING: products collection already has {existing} docs. Dropping and re-seeding...")
        await collection.drop()

    now = datetime.now(timezone.utc)
    for book in SAMPLE_BOOKS:
        book["created_at"] = now

    result = await collection.insert_many(SAMPLE_BOOKS)
    print(f"SUCCESS: Inserted {len(result.inserted_ids)} books into {DATABASE_NAME}.products")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
