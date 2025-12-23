import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipeById } from "../../services/api";
import { getIngredientIcon } from "../../utils/ingredientIconMap";
import { Clock, Star } from "lucide-react";
import image_placeholder from "../../assets/images/error_handling/image_placeholder.png";
import { formatPrepTime } from "../../utils/utils";

import "./singlerecipepage.css";

const SingleRecipePage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [recipe, setRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const recipeId = Number(id);
        if (isNaN(recipeId)) return;

        const fetchRecipe = async () => {
            try {
                setLoading(true);
                const data = await getRecipeById(recipeId);
                console.log("Recipe detail:", data);
                // setRecipe(data);
                setRecipe(data.recipe);
            } catch (err) {
                console.error("Failed to fetch recipe", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!recipe) return <div>Recipe not found</div>;

    const imageUrl = recipe.Images?.[0] || image_placeholder;

    return (
        <div className="recipe-page">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            {/* <div className="pid__header">
                <button className="pid__back" onClick={onClose}>←</button>
            </div> */}

            <img className="recipe-hero" src={imageUrl} alt={recipe.Name} />

            <div className="recipe-content">
                <h1 className="recipe-title">{recipe.Name}</h1>

                <div className="recipe-meta">
                    {/* <span><Clock size={16} /> {recipe.TotalTime?.replace("PT", "")}</span> */}
                    <span><Clock size={16} /> {formatPrepTime(recipe.TotalTime)}</span>
                    <span><Star size={16} color="#FFD700" fill="#FFD700" /> {recipe.AggregatedRating}</span>
                    {/* <span>🍽 {recipe.RecipeCategory}</span> */}
                </div>

                <p className="recipe-description">{recipe.Description}</p>

                <section className="recipe-section">
                    <h2>Ingredients</h2>
                    <ul>
                        {recipe.RecipeIngredientParts?.map((part: string, i: number) => (
                            <li key={i}>
                                <img
                                    src={getIngredientIcon(part)}
                                    alt={part}
                                    className="ingredient-icon"
                                    loading="lazy"
                                />
                                <span className="qty">{recipe.RecipeIngredientQuantities?.[i]}</span>
                                <span>{part}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="recipe-section">
                    <h2>Instructions</h2>
                    <ol>
                        {recipe.Instructions?.map((step: string, i: number) => (
                            <li key={i}>{step}</li>
                        ))}
                    </ol>
                </section>
            </div>
        </div>

    );
};

export default SingleRecipePage;
