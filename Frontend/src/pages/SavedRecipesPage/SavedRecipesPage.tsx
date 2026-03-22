import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecipeItemCard from "../../components/RecipeItemCard/RecipeItemCard";
import BottomNavBar from "../../components/NavigationBar/BottomNavBar/BottomNavBar";
import { getLikedRecipes } from "../../services/api";
import { formatPrepTime } from "../../utils/utils";
import image_placeholder from "../../assets/images/error_handling/image_placeholder.png";
import DOMPurify from "dompurify";
import "./savedrecipespage.css";

const SavedRecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user) return;

        const res = await getLikedRecipes();

        const formatted = res.liked_recipes.map((item: any) => {
          const r = item.recipe;
          return {
            id: r.RecipeId,
            name: DOMPurify.sanitize(r.Name),
            image: r.Images?.[0] || image_placeholder,
            rating: Number(r.AggregatedRating) || 0,
            time: formatPrepTime(r.PrepTime),
            liked: true,
          };
        });

        setRecipes(formatted);
      } catch (err) {
        console.error("Failed to fetch saved recipes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, []);

  const handleLikedChange = (id: number, liked: boolean) => {
    if (!liked) {
      setRecipes(prev => prev.filter(r => r.id !== id));
    } 
  };

  return (
    <div className="savedRecipes__container">
      <div className="savedRecipes__header">
        <h2>Liked Recipes</h2>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : recipes.length === 0 ? (
        <div className="savedRecipes__empty">
          <p>No liked recipes yet</p>
          <span>Tap the heart icon to like recipes</span>
        </div>
      ) : (
        <div className="savedRecipes__grid">
          {recipes.map(recipe => (
            <RecipeItemCard
              key={recipe.id}
              recipeId={recipe.id}
              name={recipe.name}
              image={recipe.image}
              rating={recipe.rating}
              time={recipe.time}
              initialLiked={recipe.liked} 
              onLikedChange={(liked) => handleLikedChange(recipe.id, liked)}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
            />
          ))}
        </div>
      )}

      <BottomNavBar />
    </div>
  );
};

export default SavedRecipesPage;
