from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base
from pydantic import BaseModel
from typing import List, Optional

class User(Base):
    __tablename__ = "Users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    picture = Column(String(255))
    client_id = Column(String(255))
    role = Column(Enum("admin", "user", "guest"), default="guest")
    created_at = Column(DateTime, default=datetime.utcnow)

    pantry_items = relationship("PantryItem", back_populates="owner")

class PantryItem(Base):
    __tablename__ = "PantryItems"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.id", ondelete="CASCADE"))
    item_name = Column(String(255), nullable=False)
    category = Column(String(255))
    storage = Column(String(255))
    quantity_value = Column(Float, default=0)
    quantity_unit = Column(String(100))
    added_on = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="pantry_items")
    recipe_ingredients = relationship("RecipeIngredient", back_populates="pantry_item")
    
class PantryItemInput(BaseModel):
    item_name: str
    quantity_value: Optional[float] = 0
    quantity_unit: Optional[str] = "pcs"
    category: Optional[str] = "Uncategorized"
    storage: Optional[str] = "Pantry"

class PantryItemsRequest(BaseModel):
    user_id: int
    items: List[PantryItemInput]

class Recipe(Base):
    __tablename__ = "Recipes"
    id = Column(Integer, primary_key=True, index=True)
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
