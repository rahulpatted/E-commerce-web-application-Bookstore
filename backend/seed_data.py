# backend/seed_data.py
"""Seed the SQLite database with sample books, users, and admin.
This script can be run with `python -m backend.seed_data`.
"""
import datetime

# Rich catalog of 25 books across 5 distinct categories
_SAMPLE_BOOKS = [
    # 1. Programming
    {
        "title": "Atomic Habits",
        "author": "James Clear",
        "category": "Self Help",
        "price": 499,
        "original_price": 599,
        "rating": 4.8,
        "image": "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
        "description": "Atomic Habits teaches practical, proven strategies for building good habits and breaking bad ones. Learn how tiny changes lead to remarkable results.",
        "publisher": "Penguin Random House",
        "language": "English",
        "pages": 320,
        "isbn": "9780735211292",
        "stock": 25,
    },
    {
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "category": "Programming",
        "price": 799,
        "original_price": 999,
        "rating": 4.9,
        "image": "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
        "description": "A handbook of agile software craftsmanship. Clean Code is divided into three parts: description of patterns, practice, and code case studies.",
        "publisher": "Prentice Hall",
        "language": "English",
        "pages": 464,
        "isbn": "9780132350884",
        "stock": 18,
    },
    {
        "title": "The Pragmatic Programmer",
        "author": "Andrew Hunt",
        "category": "Programming",
        "price": 899,
        "original_price": 1099,
        "rating": 4.8,
        "image": "https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg",
        "description": "One of the most significant books on software development, covering topics from career development to architectural techniques to keep code flexible.",
        "publisher": "Addison-Wesley",
        "language": "English",
        "pages": 352,
        "isbn": "9780135957059",
        "stock": 12,
    },
    {
        "title": "Introduction to Algorithms",
        "author": "Thomas H. Cormen",
        "category": "Programming",
        "price": 1499,
        "original_price": 1899,
        "rating": 4.7,
        "image": "https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg",
        "description": "A comprehensive and standard guide to algorithm design and analysis. Widely used as a textbook in universities globally.",
        "publisher": "MIT Press",
        "language": "English",
        "pages": 1312,
        "isbn": "9780262033848",
        "stock": 8,
    },
    {
        "title": "Design Patterns",
        "author": "Erich Gamma",
        "category": "Programming",
        "price": 999,
        "original_price": 1199,
        "rating": 4.6,
        "image": "https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg",
        "description": "The seminal book establishing object-oriented design patterns, written by the 'Gang of Four' (GoF). Highly influential for software architecture.",
        "publisher": "Addison-Wesley",
        "language": "English",
        "pages": 395,
        "isbn": "9780201633610",
        "stock": 15,
    },

    # 2. Self Help
    {
        "title": "Deep Work",
        "author": "Cal Newport",
        "category": "Self Help",
        "price": 450,
        "original_price": 550,
        "rating": 4.7,
        "image": "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg",
        "description": "Deep Work is the ability to focus without distraction on a cognitively demanding task. Learn how to master this skill in a distracted world.",
        "publisher": "Grand Central Publishing",
        "language": "English",
        "pages": 304,
        "isbn": "9781455586691",
        "stock": 20,
    },
    {
        "title": "The Power of Habit",
        "author": "Charles Duhigg",
        "category": "Self Help",
        "price": 399,
        "original_price": 499,
        "rating": 4.6,
        "image": "https://covers.openlibrary.org/b/isbn/9780812981605-L.jpg",
        "description": "An award-winning business reporter explains why habits exist, how they can be changed, and their immense power to shape our lives.",
        "publisher": "Random House",
        "language": "English",
        "pages": 416,
        "isbn": "9780812981605",
        "stock": 22,
    },
    {
        "title": "Mindset",
        "author": "Carol S. Dweck",
        "category": "Self Help",
        "price": 420,
        "original_price": 520,
        "rating": 4.5,
        "image": "https://covers.openlibrary.org/b/isbn/9780345472328-L.jpg",
        "description": "Carol Dweck shows how success in school, work, sports, the arts, and almost every area of human endeavor can be dramatically influenced by how we think about our talents.",
        "publisher": "Ballantine Books",
        "language": "English",
        "pages": 320,
        "isbn": "9780345472328",
        "stock": 14,
    },
    {
        "title": "Thinking, Fast and Slow",
        "author": "Daniel Kahneman",
        "category": "Self Help",
        "price": 550,
        "original_price": 699,
        "rating": 4.7,
        "image": "https://covers.openlibrary.org/b/isbn/9780374275631-L.jpg",
        "description": "A tour of the mind and an explanation of the two systems that drive the way we think—System 1 (fast, intuitive, emotional) and System 2 (slow, deliberative, logical).",
        "publisher": "Farrar, Straus and Giroux",
        "language": "English",
        "pages": 499,
        "isbn": "9780374275631",
        "stock": 16,
    },

    # 3. Science Fiction
    {
        "title": "Dune",
        "author": "Frank Herbert",
        "category": "Science Fiction",
        "price": 599,
        "original_price": 749,
        "rating": 4.8,
        "image": "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
        "description": "Frank Herbert's epic masterpiece set in the desert planet Arrakis. A story of politics, religion, ecology, and the destiny of Paul Atreides.",
        "publisher": "Chilton Books",
        "language": "English",
        "pages": 604,
        "isbn": "9780441172719",
        "stock": 30,
    },
    {
        "title": "Foundation",
        "author": "Isaac Asimov",
        "category": "Science Fiction",
        "price": 350,
        "original_price": 450,
        "rating": 4.7,
        "image": "https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg",
        "description": "The first novel in Asimov's historic Foundation Saga. Hari Seldon foresees the fall of the Galactic Empire and creates psychohistory to preserve knowledge.",
        "publisher": "Gnome Press",
        "language": "English",
        "pages": 255,
        "isbn": "9780553293357",
        "stock": 25,
    },
    {
        "title": "Neuromancer",
        "author": "William Gibson",
        "category": "Science Fiction",
        "price": 499,
        "original_price": 599,
        "rating": 4.5,
        "image": "https://covers.openlibrary.org/b/isbn/9780441569595-L.jpg",
        "description": "The classic cyberpunk novel that coined the term 'cyberspace' and defined a subgenre, following Case, a washed-up computer hacker.",
        "publisher": "Ace Books",
        "language": "English",
        "pages": 271,
        "isbn": "9780441569595",
        "stock": 15,
    },
    {
        "title": "The Hitchhiker's Guide to the Galaxy",
        "author": "Douglas Adams",
        "category": "Science Fiction",
        "price": 299,
        "original_price": 399,
        "rating": 4.8,
        "image": "https://covers.openlibrary.org/b/isbn/9780345391803-L.jpg",
        "description": "A hilarious science fiction comedy following Arthur Dent's travels across the universe after the Earth is demolished to make way for a bypass.",
        "publisher": "Pan Books",
        "language": "English",
        "pages": 216,
        "isbn": "9780345391803",
        "stock": 40,
    },
    {
        "title": "Snow Crash",
        "author": "Neal Stephenson",
        "category": "Science Fiction",
        "price": 499,
        "original_price": 599,
        "rating": 4.6,
        "image": "https://covers.openlibrary.org/b/isbn/9780553380958-L.jpg",
        "description": "A mind-altering romp through a future America corporate franchise-land, where the Metaverse is the playground and Hiro Protagonist is hacker royalty.",
        "publisher": "Bantam Books",
        "language": "English",
        "pages": 470,
        "isbn": "9780553380958",
        "stock": 12,
    },

    # 4. Business & Finance
    {
        "title": "Zero to One",
        "author": "Peter Thiel",
        "category": "Business",
        "price": 550,
        "original_price": 699,
        "rating": 4.7,
        "image": "https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg",
        "description": "Notes on startups, or how to build the future. Peter Thiel explores how to find unique business opportunities and create monopolies.",
        "publisher": "Crown Publishing",
        "language": "English",
        "pages": 224,
        "isbn": "9780804139298",
        "stock": 19,
    },
    {
        "title": "The Lean Startup",
        "author": "Eric Ries",
        "category": "Business",
        "price": 600,
        "original_price": 750,
        "rating": 4.6,
        "image": "https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg",
        "description": "How today's entrepreneurs use continuous innovation to create radically successful businesses. Focuses on the Build-Measure-Learn feedback loop.",
        "publisher": "Crown Business",
        "language": "English",
        "pages": 336,
        "isbn": "9780307887894",
        "stock": 18,
    },
    {
        "title": "The Intelligent Investor",
        "author": "Benjamin Graham",
        "category": "Business",
        "price": 699,
        "original_price": 899,
        "rating": 4.8,
        "image": "https://covers.openlibrary.org/b/isbn/9780060555665-L.jpg",
        "description": "The classic text on value investing, teaching Benjamin Graham's philosophy of loss minimization and long-term risk management.",
        "publisher": "HarperBusiness",
        "language": "English",
        "pages": 640,
        "isbn": "9780060555665",
        "stock": 14,
    },
    {
        "title": "Good to Great",
        "author": "Jim Collins",
        "category": "Business",
        "price": 590,
        "original_price": 750,
        "rating": 4.7,
        "image": "https://covers.openlibrary.org/b/isbn/9780066620992-L.jpg",
        "description": "Jim Collins identifies how average companies transition into great companies, and why others fail to make the leap.",
        "publisher": "HarperBusiness",
        "language": "English",
        "pages": 320,
        "isbn": "9780066620992",
        "stock": 10,
    },
    {
        "title": "The Hard Thing About Hard Things",
        "author": "Ben Horowitz",
        "category": "Business",
        "price": 650,
        "original_price": 799,
        "rating": 4.8,
        "image": "https://covers.openlibrary.org/b/isbn/9780062273208-L.jpg",
        "description": "Building a business when there are no easy answers. Ben Horowitz offers essential advice on building and running a startup from first-hand experience.",
        "publisher": "HarperBusiness",
        "language": "English",
        "pages": 304,
        "isbn": "9780062273208",
        "stock": 11,
    },

    # 5. Fiction & Literature
    {
        "title": "1984",
        "author": "George Orwell",
        "category": "Fiction",
        "price": 299,
        "original_price": 399,
        "rating": 4.9,
        "image": "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
        "description": "Orwell's dystopian classic about a totalitarian state governed by Big Brother. Deals with surveillance, censorship, and control over thoughts.",
        "publisher": "Secker & Warburg",
        "language": "English",
        "pages": 328,
        "isbn": "9780451524935",
        "stock": 35,
    },
    {
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "category": "Fiction",
        "price": 320,
        "original_price": 420,
        "rating": 4.9,
        "image": "https://covers.openlibrary.org/b/isbn/9780446310789-L.jpg",
        "description": "A Pulitzer Prize-winning novel focusing on racial injustice and the destruction of innocence in the American South, viewed through Scout Finch's eyes.",
        "publisher": "J. B. Lippincott & Co.",
        "language": "English",
        "pages": 281,
        "isbn": "9780446310789",
        "stock": 25,
    },
    {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "category": "Fiction",
        "price": 250,
        "original_price": 350,
        "rating": 4.7,
        "image": "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
        "description": "A critique of the American Dream in the Roaring Twenties, chronicling Nick Carraway's interactions with the mysterious millionaire Jay Gatsby.",
        "publisher": "Charles Scribner's Sons",
        "language": "English",
        "pages": 180,
        "isbn": "9780743273565",
        "stock": 20,
    },
    {
        "title": "Brave New World",
        "author": "Aldous Huxley",
        "category": "Fiction",
        "price": 350,
        "original_price": 450,
        "rating": 4.6,
        "image": "https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg",
        "description": "Huxley's dystopian masterpiece depicting a futuristic society structured on psychological conditioning, genetic modifications, and consumerism.",
        "publisher": "Chatto & Windus",
        "language": "English",
        "pages": 268,
        "isbn": "9780060850524",
        "stock": 15,
    },
    {
        "title": "The Catcher in the Rye",
        "author": "J. D. Salinger",
        "category": "Fiction",
        "price": 280,
        "original_price": 380,
        "rating": 4.5,
        "image": "https://covers.openlibrary.org/b/isbn/9780316769174-L.jpg",
        "description": "A novel following Holden Caulfield's alienation and disillusionment in New York City after being expelled from his prep school.",
        "publisher": "Little, Brown and Company",
        "language": "English",
        "pages": 277,
        "isbn": "9780316769174",
        "stock": 22,
    },
    {
        "title": "The Hobbit",
        "author": "J. R. R. Tolkien",
        "category": "Fiction",
        "price": 450,
        "original_price": 599,
        "rating": 4.8,
        "image": "https://covers.openlibrary.org/b/isbn/9780345339683-L.jpg",
        "description": "The classic high-fantasy novel following Bilbo Baggins as he is swept into a quest to reclaim the lonely mountain and its treasure from Smaug.",
        "publisher": "George Allen & Unwin",
        "language": "English",
        "pages": 310,
        "isbn": "9780345339683",
        "stock": 30,
    }
]

def seed_books(session):
    for book_data in _SAMPLE_BOOKS:
        # Check if book already exists (by title & author) to avoid duplicates.
        exists = (
            session.query(models.Book)
            .filter(models.Book.title == book_data["title"], models.Book.author == book_data["author"])
            .first()
        )
        if not exists:
            session.add(models.Book(**book_data))
        else:
            # Update existing book with new fields (original_price, isbn)
            for key, value in book_data.items():
                if key not in ("title", "author"):
                    setattr(exists, key, value)
    session.commit()

def seed_ratings(session):
    # Ensure tables are clean first to avoid duplicate rating conflicts on seed reload
    session.query(models.Rating).delete()
    # Only delete non-admin users
    session.query(models.User).filter(models.User.role == "USER").delete()
    session.commit()

    # Create 5 demo users with password 'password123'
    hashed_pwd = get_password_hash("password123")

    users_data = [
        {"email": "alice@example.com", "name": "Alice Johnson", "favorite_genres": "Programming,Self Help", "favorite_authors": "Robert C. Martin,James Clear"},
        {"email": "bob@example.com", "name": "Bob Smith", "favorite_genres": "Science Fiction,Fiction", "favorite_authors": "Isaac Asimov,George Orwell"},
        {"email": "charlie@example.com", "name": "Charlie Brown", "favorite_genres": "Business,Self Help", "favorite_authors": "Peter Thiel,Cal Newport"},
        {"email": "david@example.com", "name": "David Wilson", "favorite_genres": "Programming,Science Fiction", "favorite_authors": "Thomas H. Cormen,William Gibson"},
        {"email": "eve@example.com", "name": "Eve Davis", "favorite_genres": "Fiction,Business", "favorite_authors": "J. R. R. Tolkien,Benjamin Graham"},
    ]

    users = []
    for u in users_data:
        db_user = models.User(
            email=u["email"],
            hashed_password=hashed_pwd,
            name=u["name"],
            favorite_genres=u["favorite_genres"],
            favorite_authors=u["favorite_authors"],
            role="USER",
        )
        session.add(db_user)
        users.append(db_user)
    session.commit()

    # Reload users to get their IDs
    users = session.query(models.User).filter(models.User.role == "USER").all()
    books = session.query(models.Book).all()

    # Deterministic rating seeding
    for u_idx, user in enumerate(users):
        for book in books:
            cat = book.category
            rating_val = 0
            if u_idx == 0: # Alice
                if cat in ["Programming", "Self Help"]:
                    rating_val = 5 if "Code" in book.title or "Habits" in book.title else 4
                elif cat == "Business":
                    rating_val = 3
            elif u_idx == 1: # Bob
                if cat in ["Science Fiction", "Fiction"]:
                    rating_val = 5 if book.title in ["Dune", "1984"] else 4
                elif cat == "Self Help":
                    rating_val = 3
            elif u_idx == 2: # Charlie
                if cat in ["Business", "Self Help"]:
                    rating_val = 5 if book.title in ["Zero to One", "Deep Work"] else 4
                elif cat == "Programming":
                    rating_val = 2
            elif u_idx == 3: # David
                if cat in ["Programming", "Science Fiction"]:
                    rating_val = 5 if book.title in ["Introduction to Algorithms", "Neuromancer"] else 4
                elif cat == "Fiction":
                    rating_val = 3
            elif u_idx == 4: # Eve
                if cat in ["Fiction", "Business"]:
                    rating_val = 5 if book.title in ["The Hobbit", "The Intelligent Investor"] else 4
                elif cat == "Self Help":
                    rating_val = 2

            if rating_val > 0:
                session.add(models.Rating(
                    user_id=user.id,
                    book_id=book.id,
                    rating=rating_val,
                    timestamp=datetime.datetime.now(datetime.UTC)
                ))
    session.commit()


def seed_admin(session):
    """Create a default admin user if one doesn't exist."""
    admin = session.query(models.User).filter(models.User.role == "ADMIN").first()
    if not admin:
        hashed_pwd = get_password_hash("admin123")
        admin_user = models.User(
            email="admin@bookstore.com",
            hashed_password=hashed_pwd,
            name="Admin",
            role="ADMIN",
        )
        session.add(admin_user)
        session.commit()
        print("Admin user created: admin@bookstore.com / admin123")
    else:
        print("Admin user already exists.")


def main():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_admin(db)
        seed_books(db)
        seed_ratings(db)
    print("Database seeded successfully with 25 books, 5 users, and 1 admin.")

if __name__ == "__main__":
    main()
