from sqlalchemy import Boolean, Column, Integer, String, Float, Enum, DateTime, ForeignKey, Text, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.utils.encrypted_type import EncryptedString
from app.database.database import Base
from pydantic import BaseModel
from typing import List, Optional

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class User(Base):
    __tablename__ = "Users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(EncryptedString, nullable=False)
    email = Column(EncryptedString, nullable=False, unique=True)
    email_hash = Column(String(64), nullable=False, unique=True)
    picture = Column(String(255))
    client_id = Column(EncryptedString)
    allergens = Column(JSON, nullable=True)
    role = Column(Enum("admin", "user", "guest"), default="guest")
    created_at = Column(DateTime, default=datetime.utcnow)

    pantry_items = relationship("PantryItem", back_populates="owner", passive_deletes=True )
    liked_recipes = relationship("LikedRecipe", back_populates="user", passive_deletes=True)
    
class UserAllergensRequest(BaseModel):
    allergens: List[str]

class PantryItem(Base):
    __tablename__ = "PantryItems"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.id", ondelete="CASCADE"))
    item_name = Column(String(255), nullable=False)
    normalized_name = Column(String(255))
    category = Column(String(255))
    storage = Column(String(255))
    quantity_value = Column(Float, default=0)
    quantity_unit = Column(String(100))
    item_image = Column(String(255))
    added_on = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="pantry_items")
    recipe_ingredients = relationship("RecipeIngredient", back_populates="pantry_item")
    
class PantryItemInput(BaseModel):
    id: Optional[int] = None
    item_name: str
    quantity_value: Optional[float] = 0
    quantity_unit: Optional[str] = "pcs"
    category: Optional[str] = "Uncategorized"
    storage: Optional[str] = "Pantry"
    item_image: Optional[str] = None

class PantryItemsRequest(BaseModel):
    user_id: int
    items: List[PantryItemInput]
    
class ItemClassification(Base):
    __tablename__ = "item_classifications"

    id = Column(Integer, primary_key=True)
    normalized_name = Column(String(255), unique=True, index=True, nullable=False)
    is_food = Column(Boolean, nullable=False)
    category = Column(String(255))
    storage = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
    
class PantryItemsDeleteRequest(BaseModel):
    pantry_item_ids: List[int]

class GroceryItem(Base):
    __tablename__ = "GroceryItems"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.id", ondelete="CASCADE"))
    item_name = Column(String(255), nullable=False)
    quantity_value = Column(Float, default=0)
    quantity_unit = Column(String(100))
    is_purchased = Column(Boolean, default=False)
    added_on = Column(DateTime, default=datetime.utcnow)
    updated_on = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", foreign_keys=[user_id])

class GroceryItemInput(BaseModel):
    id: Optional[int] = None
    item_name: str
    quantity_value: Optional[float] = 0
    quantity_unit: Optional[str] = "pcs"

class GroceryItemsRequest(BaseModel):
    user_id: int
    items: List[GroceryItemInput]

class GroceryItemsDeleteRequest(BaseModel):
    grocery_item_ids: List[int]

class GroceryItemMarkRequest(BaseModel):
    grocery_item_ids: List[int]

class Recipe(Base):
    __tablename__ = "Recipes"
    id = Column(Integer, primary_key=True, index=True)
    dataset_recipe_id = Column(Integer, nullable=False, unique=True)
    recipe_name = Column(String(255), nullable=False)
    recipe_image = Column(String(255))
    steps = Column(Text)
    prep_time = Column(Integer)
    cook_time = Column(Integer)

    ingredients = relationship("RecipeIngredient", back_populates="recipe")

class RecipeIngredient(Base):
    __tablename__ = "RecipeIngredients"
    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("Recipes.id", ondelete="CASCADE"))
    pantry_item_id = Column(Integer, ForeignKey("PantryItems.id", ondelete="SET NULL"), nullable=True)
    ingredient_name = Column(String(255), nullable=False)
    quantity = Column(String(100))

    recipe = relationship("Recipe", back_populates="ingredients")
    pantry_item = relationship("PantryItem", back_populates="recipe_ingredients")
    
class LikedRecipe(Base):
    __tablename__ = "LikedRecipes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.id", ondelete="CASCADE"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("Recipes.id", ondelete="CASCADE"), nullable=False)
    liked_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id', 'recipe_id', name='unique_user_recipe_like'),
    )
    user = relationship("User", back_populates="liked_recipes", passive_deletes=True)

class FoodImageCache(Base):
    __tablename__ = "FoodImageCache"
    id = Column(Integer, primary_key=True)
    normalized_name = Column(String, unique=True, index=True)
    image_url = Column(String)
    source = Column(String, default="pexels")
    updated_at = Column(DateTime, default=datetime.utcnow)
