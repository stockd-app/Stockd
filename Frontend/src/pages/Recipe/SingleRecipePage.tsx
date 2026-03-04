import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipeById, getLikedRecipes,getPantryItems,completeRecipe } from "../../services/api";
import { getIngredientIcon } from "../../utils/ingredientIconMap";
import { Clock, Star, ArrowLeft } from "lucide-react";
import image_placeholder from "../../assets/images/error_handling/image_placeholder.png";
import { formatPrepTime } from "../../utils/utils";
import { parseQuantity, resolveIngredientDisplay } from "../../utils/ingredientUnit";
import LikeButton from "../../components/LikeButton/LikeButton";
import { API_ROUTES } from "../../config/consts";
import { useNotification } from "../../components/Notification/NotificationContext";
import { NOTIFICATION_MESSAGES, NOTIFICATION_TYPES, GetNutritionItems } from "../../config/consts";


import "./singlerecipepage.css";

const normalize = (s: string) =>
  s.toLowerCase().replace(/[^a-z\s]/g, "").trim();

const SingleRecipePage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.id;
    const accessToken = localStorage.getItem("google_access_token");

    const [recipe, setRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    //`initialLiked` will no longer be undefined.
    const [initialLiked, setInitialLiked] = useState(false);
    const [likedLoading, setLikedLoading] = useState(false);
    const [pantryNames, setPantryNames] = useState<string[]>([]);
    const [missingIngredients, setMissingIngredients] = useState<string[]>([]);
    const [addedToGrocery, setAddedToGrocery] = useState<Set<string>>(new Set());
    const difficulty = recipe?.Keywords?.find((kw: string) => ["easy", "medium", "hard"].includes(kw.toLowerCase())) ?? "—";
    const isInPantry = (ingredient: string, pantry: string[]) => {
        const normIng = normalize(ingredient);
        return pantry.some(
            (p) => normIng.includes(p) || p.includes(normIng)
        );
    };
    const notify = useNotification();

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

    useEffect(() => {
        const run = async () => {
            if (!recipe?.RecipeId) return;

            try {
                setLikedLoading(true);
                const res = await getLikedRecipes();
                const likedList = res?.liked_recipes ?? [];

                const isLiked = likedList.some((item: any) => {
                    const rid =
                        item?.recipe?.RecipeId ??
                        item?.RecipeId ??
                        item?.recipe_id ??
                        item?.id;
                    return Number(rid) === Number(recipe.RecipeId);
                });

                setInitialLiked(isLiked);
            } catch (e) {
                console.error("Failed to fetch liked recipes", e);
                setInitialLiked(false);
            } finally {
                setLikedLoading(false);
            }
        };
        run();
    }, [recipe?.RecipeId]);
    
    const handleCompleteRecipe = async () => {
        try {
            const result = await completeRecipe(recipe.RecipeId);
            console.log("Recipe completed:", result);
            notify( NOTIFICATION_MESSAGES.RECIPE_COMPLETED,NOTIFICATION_TYPES.RECIPE_COMPLETED);
            setTimeout(() => { navigate("/dashboard");}, 2000); 
        } catch (err) {
            console.error("Failed to complete recipe", err);
            notify( NOTIFICATION_MESSAGES.ERROR,NOTIFICATION_TYPES.ERROR);
        }
        };

    useEffect(() => {
    if (!userId) return;

    const run = async () => {
            try {
                const res = await getPantryItems(userId);
                const pantryItems = res?.grouped_items?.Pantry || [];
                const names = pantryItems
                .map((i: any) => i?.name)     
                .filter(Boolean)              
                .map((name: string) => normalize(name));
                console.log("Pantry normalized names:", names);
                setPantryNames(names);
            } catch (e) {
                console.error("Failed to fetch pantry", e);
            }
        };

        run();
    }, [userId]);

    useEffect(() => {
    if (!recipe) return;

    const missing = recipe.RecipeIngredientParts.filter((part: string) => {
        const norm = normalize(part);

        return !pantryNames.some(
            (p) => norm.includes(p) || p.includes(norm)
            );
        });

        setMissingIngredients(missing);
    }, [recipe, pantryNames]);

    const addToGroceryList = async (
    name: string,
    qty: number,
    unit: string
  ) => {
    if (!userId || !accessToken) return;

    if (isInPantry(name, pantryNames)) {
        console.warn("Item already in pantry, skip adding:", name);
        return;
    }

    if (addedToGrocery.has(name)) {
        return;
    }
    try {
      await fetch(API_ROUTES.ADD_UPDATE_GROCERY_ITEM, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          items: [
            {
              item_name: name,
              quantity_value: qty || 1,
              quantity_unit: unit || "pcs",
            },
          ],
        }),
      });

      setAddedToGrocery((prev) => new Set(prev).add(name));
    } catch (e) {
      console.error("Failed to add grocery item", e);
    }
  };

    if (loading) return <div>Loading...</div>;
    if (!recipe) return <div>Recipe not found</div>;

    const imageUrl = recipe.Images?.[0] || image_placeholder;
    const nutritionItems = GetNutritionItems(recipe);

    return (
        <div className="recipe__page">
            <div className="recipe__container">
                <div className="recipe__hero">
                    <button
                        className="recipe__back recipe__back__overlay"
                        onClick={() => navigate(-1)}
                        aria-label="Back" >
                        <ArrowLeft size={22} />
                    </button>
                    <img className="recipe__hero-img" src={imageUrl} alt={recipe.Name} />
                </div>
                <div className="recipe__content">
                    <div className="recipe__titleRow">
                        <h1 className="recipe__title">{recipe.Name}</h1>
                        <LikeButton
                            recipeId={recipe.RecipeId}
                            initialLiked={initialLiked}
                            onLikedChange={(v) => setInitialLiked(v)}
                        />
                    </div>
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
                    
                    <div className="recipe__nutrition">
                    <h2 className="recipe__NutritionTitle">Nutritional Information</h2>
                        <div className="recipe__nutritionGrid">
                            {nutritionItems.map((item) => (
                                <div key={item.label} className="recipe__nutritionCard">
                                    <div className="recipe__nutritionTop">
                                        {item.icon && (
                                            <img
                                            src={item.icon}
                                            alt={item.label}
                                            className="recipe__nutritionIcon"
                                            />
                                        )}
                                        <span className="recipe__nutritionLabel">{item.label}</span>
                                    </div>
                                    <span className="recipe__nutritionValue">
                                        {item.value ?? "N/A"} {item.value != null ? item.unit : ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <section className="recipe__section">
                        <h2 className="recipe__section__title">Ingredients</h2>
                        <ul className="recipe__ingredients">
                            {recipe.RecipeIngredientParts?.map((part: string, i: number) => {
                                const rawQty = recipe.RecipeIngredientQuantities?.[i];
                                const qtyParsed = parseQuantity(rawQty);
                                const { qty, unit } = resolveIngredientDisplay(part, qtyParsed);
                                const isAdded = addedToGrocery.has(part);
                                const inPantry = isInPantry(part, pantryNames);
                                const checkboxDisabled = inPantry;

                                return (
                                    <li key={i} className="recipe__ingredient">
                                        <input
                                            type="checkbox"
                                            className="ingredient__checkbox"
                                            checked={isAdded || inPantry}
                                            disabled={checkboxDisabled}
                                            onChange={() => {
                                            if (!checkboxDisabled) {
                                                addToGroceryList(part, qty, unit);
                                            }
                                            }}
                                            title={
                                            inPantry
                                                ? "Already in pantry"
                                                : isAdded
                                                ? "Added to grocery list"
                                                : "Add to grocery list"
                                            }
                                        />
                                        <img
                                            src={getIngredientIcon(part)}
                                            alt={part}
                                            className="recipe__ingredient__icon"
                                        />
                                        <div className="ingredient__text">
                                            {/* <span className="recipe__ingredient__qty">
                                                {qty} {unit}
                                            </span> */}
                                            <span className="ingredient__amount">
                                                <span className="ingredient__qty">{qty}</span>
                                                <span className="ingredient__unit">{unit}</span>
                                            </span>
                                            
                                        </div>
                                        <span className="recipe__ingredient__name">{part}</span>
                                        
                                        {inPantry && <span className="ingredient__status">In Pantry</span>}
                                        {isAdded && <span className="ingredient__status">Added</span>}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <section className="recipe__section">
                        <h2 className="recipe__section__title">Instructions</h2>
                        <ol className="recipe__instructions">
                            {recipe.RecipeInstructions?.length ? (
                                recipe.RecipeInstructions.map((step: string, i: number) => (
                                    <li key={i}>{step}</li>
                                ))
                            ) : (
                                <li>No instructions available.</li>
                            )}
                        </ol>
                    </section>
                    {missingIngredients.length === 0 && (
                        <div className="recipe__complete">
                            <button className="complete__button" onClick={handleCompleteRecipe}>
                            Complete Recipe
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SingleRecipePage;
