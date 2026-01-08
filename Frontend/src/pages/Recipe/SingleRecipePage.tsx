import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipeById } from "../../services/api";
import { getIngredientIcon } from "../../utils/ingredientIconMap";
import { Clock, Star } from "lucide-react";
import image_placeholder from "../../assets/images/error_handling/image_placeholder.png";
import { formatPrepTime } from "../../utils/utils";
import { parseQuantity, resolveIngredientDisplay } from "../../utils/ingredientUnit";
import LikeButton from "../../components/LikeButton/LikeButton";


import "./singlerecipepage.css";

const SingleRecipePage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [recipe, setRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const difficulty = recipe?.Keywords?.find((kw: string) => ["easy", "medium", "hard"].includes(kw.toLowerCase())) ?? "—";

    useEffect(() => {
        if (!id) return;

        const recipeId = Number(id);
        if (isNaN(recipeId)) return;

        const fetchRecipe = async () => {
            try {
                setLoading(true);
                const data = await getRecipeById(recipeId);
                console.log("Recipe detail:", data);
                console.log("Recipe detail ID:", data.recipe.RecipeId);
                // setRecipe(data);
                // const normalizedRecipe = {
                //     ...data.recipe,
                //     id: data.recipe.recipe_id, 
                // };
                // console.log("Recipe id:", data.recipe.recipe_id);
                // console.log("Normalized recipe id:", normalizedRecipe.id);
                setRecipe(data.recipe);
                // setRecipe(normalizedRecipe);
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
        <div className="recipe__page">
            <div className="recipe__container">
                <div className="recipe__hero">
                    <button className="recipe__back recipe__back__overlay" onClick={() => navigate(-1)} aria-label="Back" > ← </button>
                    <img className="recipe__hero-img" src={imageUrl} alt={recipe.Name} />
                </div>
                <LikeButton
                    recipeId={recipe.RecipeId}
                    // initialLiked={recipe.isLiked} 
                    initialLiked={recipe.isLiked ?? false}
                />

                <div className="recipe__content">
                    <h1 className="recipe__title">{recipe.Name}</h1>
                    <span>
                        <Star size={16} color="#FFD700" fill="#FFD700" /> {recipe.AggregatedRating}
                    </span>
                    <div className="recipe__meta__cards">
                        <div className="recipe__meta__card">
                            <div className="recipe__meta__value">
                                <Clock size={16} />
                                {formatPrepTime(recipe.TotalTime)}
                            </div>
                            <div className="recipe__meta__label">Cook time</div>
                        </div>
                        <div className="recipe__meta__card recipe__meta__card__secondary">
                            {/* <div className="recipe__meta__value">
                                <Clock size={16} />
                                {formatPrepTime(recipe.TotalTime)}
                            </div> */}
                            <div className="recipe__meta__value">{difficulty}</div>
                            <div className="recipe__meta__label">Difficulty</div>
                        </div>
                    </div>
                    <p className="recipe__description">{recipe.Description}</p>

                    <section className="recipe__section">
                        <h2 className="recipe__section__title">Ingredients</h2>
                        <ul className="recipe__ingredients">
                            {recipe.RecipeIngredientParts?.map((part: string, i: number) => {
                                const rawQty = recipe.RecipeIngredientQuantities?.[i];
                                const qtyParsed = parseQuantity(rawQty);
                                const { qty, unit } = resolveIngredientDisplay(part, qtyParsed);

                                return (
                                    <li key={i} className="recipe__ingredient">
                                        <img
                                            src={getIngredientIcon(part)}
                                            alt={part}
                                            className="recipe__ingredient__icon"
                                        />
                                        <span className="recipe__ingredient__qty">
                                            {qty} {unit}
                                        </span>
                                        <span className="recipe__ingredient__name">{part}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <section className="recipe__section">
                        <h2 className="recipe__section__title">Instructions</h2>
                        {/* <ol className="recipe__instructions">
                            {recipe.Instructions?.map((step: string, i: number) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ol> */}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SingleRecipePage;
