from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
import os
from db.mongo import get_database
from db.models import User, UserRole
from bson import ObjectId

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey_change_in_production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    db = get_database()
    try:
        user_data = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise credentials_exception

    if user_data is None:
        raise credentials_exception

    user = User(**user_data)
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    # Store string version of ID for easier usage
    user.id = str(user_data["_id"])
    return user

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user

async def get_optional_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False))):
    if not token:
        return None
    try:
        return await get_current_user(token)
    except Exception:
        return None
