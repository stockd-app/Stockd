import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipeById } from "../../services/api";

import image_placeholder from "../../assets/images/error_handling/image_placeholder.png";

const SingleRecipePage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [recipe, setRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchRecipe = async () => {
            try {
                setLoading(true);
                const data = await getRecipeById(id);
                console.log("Recipe detail:", data);
                setRecipe(data);
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

    const imageUrl =
        recipe.Images?.[0] || image_placeholder;

    return (
        <div style={{ padding: 24 }}>
            <button onClick={() => navigate(-1)}>← Back</button>

            <h1>{recipe.Name}</h1>
            <h2>Instructions</h2>
            <p>{recipe.Description}</p>


            <img
                src={imageUrl}
                alt={recipe.Name}
                style={{ maxWidth: 400 }}
            />

            <h2>Ingredients</h2>
            <ul>
                {recipe.RecipeIngredientParts?.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>

            <h2>Ingredients</h2>
            <ul>
                {recipe.RecipeIngredientParts?.map((part: string, i: number) => (
                    <li key={i}>
                        {recipe.RecipeIngredientQuantities?.[i]} {part}
                    </li>
                ))}
            </ul>

            <h2>Instructions</h2>
            <ol>
                {recipe.RecipeInstructions?.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                ))}
            </ol>
        </div>
    );
};

export default SingleRecipePage;
