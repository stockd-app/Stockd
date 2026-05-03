import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipeById, getLikedRecipes, getPantryItems, completeRecipe } from "../../services/api";
import { getIngredientIcon } from "../../utils/ingredientIconMap";
import { Clock, Star } from "lucide-react";
import recipe_placeholder from "../../assets/images/error_handling/recipe_placeholder.png"
import { formatPrepTime } from "../../utils/utils";
import { parseQuantity, resolveIngredientDisplay } from "../../utils/ingredientUnit";
import LikeButton from "../../components/LikeButton/LikeButton";
import { API_ROUTES } from "../../config/consts";
import { useNotification } from "../../components/Notification/NotificationContext";
import { formatQuantityUnit } from "../../utils/unitStandardizer";
import { NOTIFICATION_MESSAGES, NOTIFICATION_TYPES, GetNutritionItems } from "../../config/consts";
import Button from "../../components/Button/Button";
import { buildNutritionDisplayItems, getNutritionOverview } from "../../utils/nutritionVisual";

import "./singlerecipepage.css";

const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z\s]/g, "").trim();

// Ingredients most users are expected to have already.
// These are treated the same as pantry items, so they are checked and not added to groceries.
const COMMON_INGREDIENTS = [
    // Salt & seasoning
    "salt",
    "table salt",
    "sea salt",
    "kosher salt",
    "pepper",
    "black pepper",
    "ground black pepper",

    // Flour & baking basics
    "flour",
    "plain flour",
    "all purpose flour",
    "all-purpose flour",
    "self raising flour",
    "self-raising flour",
    "baking powder",
    "baking soda",
    "bicarbonate of soda",

    // Liquids
    "water",
    "olive oil",
    "vegetable oil",
    "sunflower oil",
    "cooking oil",

    // Sweeteners
    "sugar",
    "white sugar",
    "brown sugar",
    "caster sugar",
    "icing sugar",
    "powdered sugar",
    "honey",

    // Dairy basics
    "butter",
    "milk",

    // Eggs
    "egg",
    "eggs",

    // Common aromatics (optional — remove if too aggressive)
    "garlic",
    "garlic powder",
    "onion powder",

    // Herbs & spices (generic)
    "mixed herbs",
    "italian seasoning",
    "oregano",
    "basil",
    "thyme",
    "cinnamon",
    "paprika",

    // Condiments
    "soy sauce",
    "vinegar",
    "white vinegar",
    "apple cider vinegar",
    "mustard",
    "ketchup",
];

const isCommonIngredient = (ingredient: string) => {
    const normIng = normalize(ingredient);

    // Avoid auto-ticking vegetables like "bell pepper" as the pantry staple "pepper".
    if (/\b(bell|red|green|yellow|orange|chili|chilli|jalapeno|poblano) pepper\b/.test(normIng)) {
        return false;
    }

    return COMMON_INGREDIENTS.some((common) => {
        const normCommon = normalize(common);
        return new RegExp(`(^|\\s)${normCommon}(\\s|$)`).test(normIng);
    });
};


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
    const [pantryNames, setPantryNames] = useState<string[]>([]);
    const [missingIngredients, setMissingIngredients] = useState<string[]>([]);
    const [addedToGrocery, setAddedToGrocery] = useState<Map<string, number>>(new Map());
    const [showMoreNutrition, setShowMoreNutrition] = useState(false);
    const [useMetric, setUseMetric] = useState(true);

    const isInPantry = (ingredient: string, pantry: string[]) => {
        const normIng = normalize(ingredient);
        return pantry.some(
            (p) => normIng.includes(p) || p.includes(normIng)
        );
    };

    const isIngredientAvailable = (ingredient: string, pantry: string[]) =>
        isCommonIngredient(ingredient) || isInPantry(ingredient, pantry);

    const notify = useNotification();
    const calorieTarget = Math.max(Number("1000") || 0, 1);

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
            }
        };
        run();
    }, [recipe?.RecipeId]);

    const handleCompleteRecipe = async () => {
        try {
            const result = await completeRecipe(recipe.RecipeId);
            console.log("Recipe completed:", result);
            notify(NOTIFICATION_MESSAGES.RECIPE_COMPLETED, NOTIFICATION_TYPES.RECIPE_COMPLETED);
            setTimeout(() => { navigate("/dashboard"); }, 2000);
        } catch (err) {
            console.error("Failed to complete recipe", err);
            notify(NOTIFICATION_MESSAGES.ERROR, NOTIFICATION_TYPES.ERROR);
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

            return !isIngredientAvailable(norm, pantryNames);
        });

        setMissingIngredients(missing);
    }, [recipe, pantryNames]);

    const addToGroceryList = async (name: string, qty: number, unit: string) => {
        if (!userId || !accessToken) return;

        try {
            const res = await fetch(API_ROUTES.ADD_UPDATE_GROCERY_ITEM, {
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

            const data = await res.json();
            const groceryId = data.items?.[0]?.id;
            setAddedToGrocery(prev => {
                const newMap = new Map(prev);
                newMap.set(normalize(name), groceryId);
                return newMap;
            });

            localStorage.setItem("groceryBadge", "true");
            window.dispatchEvent(new Event("grocery-updated"));

        } catch (e) {
            console.error("Failed to add grocery item", e);
        }
    };

    const removeFromGroceryList = async (name: string) => {
        const itemId = addedToGrocery.get(normalize(name));
        if (!itemId || !accessToken) return;

        try {
            await fetch(API_ROUTES.DELETE_GROCERY_ITEM, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    grocery_item_ids: [itemId],
                }),
            });

            setAddedToGrocery(prev => {
                const newMap = new Map(prev);
                newMap.delete(normalize(name));
                if (newMap.size === 0) {
                    localStorage.setItem("groceryBadge", "false");
                    window.dispatchEvent(new Event("grocery-cleared"));
                }
                return newMap;
            });

        } catch (e) {
            console.error("Failed to delete grocery item", e);
        }
    };

    useEffect(() => {
        const fetchGroceryItems = async () => {
            if (!userId || !accessToken) return;

            try {
                const res = await fetch(`${API_ROUTES.GET_GROCERY_ITEMS}/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                const data = await res.json();

                const groceryMap = new Map<string, number>();

                data.items.forEach((item: any) => {
                    groceryMap.set(normalize(item.item_name), item.id);
                });

                setAddedToGrocery(groceryMap);

            } catch (err) {
                console.error("Failed to fetch grocery items", err);
            }
        };

        fetchGroceryItems();
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (!recipe) return <div>Recipe not found</div>;

    const imageUrl = recipe.Images?.[0] || recipe_placeholder;
    const nutritionItems = GetNutritionItems(recipe);
    const nutritionDisplayItems = buildNutritionDisplayItems(
        nutritionItems,
        recipe?.RecipeServings,
        {
            Calories: calorieTarget,
        }
    );

    const nutritionOverview = getNutritionOverview(nutritionDisplayItems);

    return (
        <div className="recipe__page">
            <div className="recipe__hero">
                <Button
                    variant="back"
                    className="recipe__back recipe__back__overlay"
                    onClick={() => navigate(-1)}
                    aria-label="Back" />
                <img className="recipe__hero-img" src={imageUrl} alt={recipe.Name} />
                <LikeButton
                    recipeId={recipe.RecipeId}
                    initialLiked={initialLiked}
                    onLikedChange={(v) => setInitialLiked(v)}
                />
            </div>
            <div className="recipe__container">
                <div className="recipe__content">
                    <div className="recipe__titleRow">
                        <h1 className="recipe__title">{recipe.Name}</h1>
                    </div>
                    <div className="recipe__source">
                        Recipe obtained from{" "}
                        <a
                            href="https://www.food.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Food.com
                        </a>
                    </div>
                    <div className="recipe__ratingRow">
                        <span className="recipe__rating">
                            {Array.from({ length: 5 }, (_, index) => (
                                <Star
                                    key={index}
                                    size={16}
                                    color={index < recipe.AggregatedRating ? "#FFD700" : "#CCCCCC"}
                                    fill={index < recipe.AggregatedRating ? "#FFD700" : "none"}
                                />
                            ))}
                            <span className="rating-number">{recipe.AggregatedRating}</span>
                        </span>
                    </div>
                    <div className="recipe__meta__cards">
                        <div className="recipe__meta__card">
                            <div className="recipe__meta__value">
                                <Clock size={16} />
                                {formatPrepTime(recipe.TotalTime)}
                            </div>
                            <div className="recipe__meta__label">Cook time</div>
                        </div>
                        <div className="recipe__meta__card">
                            <div className="recipe__meta__value">
                                <Clock size={16} />
                                {formatPrepTime(recipe.PrepTime)}
                            </div>
                            <div className="recipe__meta__label">Prep time</div>
                        </div>
                    </div>
                    {recipe.Allergens && recipe.Allergens.length > 0 && (
                        <div className="recipe__allergens__section">
                            <div className="recipe__allergens__header">
                                <span className="recipe__allergens__title">Allergen Tag(s)</span>
                            </div>
                            <div className="recipeitemcard__allergens">
                                {recipe.Allergens.map((allergen: string) => (
                                    <span key={allergen} className="recipeitemcard__allergen">
                                        {allergen}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="recipe__description">{recipe.Description}</p>
                    <section className="recipe__section">
                        <div className="recipe__section__header">
                            <h2 className="recipe__section__title">Ingredients</h2>
                            <div className="recipe__unit__toggle">
                                <button
                                    className={`recipe__unit__btn ${!useMetric ? 'active' : ''}`}
                                    onClick={() => setUseMetric(false)}
                                    title="Show US measurements"
                                >
                                    US
                                </button>
                                <button
                                    className={`recipe__unit__btn ${useMetric ? 'active' : ''}`}
                                    onClick={() => setUseMetric(true)}
                                    title="Show UK/Irish measurements"
                                >
                                    UK
                                </button>
                            </div>
                        </div>
                        <ul className="recipe__ingredients">
                            {/* Use standardized ingredients if available, otherwise fall back to original */}
                            {(recipe.ingredients_standardized && recipe.ingredients_standardized.length > 0
                                ? recipe.ingredients_standardized
                                : recipe.RecipeIngredientParts?.map((part: string, i: number) => {
                                    const rawQty = recipe.RecipeIngredientQuantities?.[i];
                                    const qtyParsed = parseQuantity(rawQty);
                                    const { qty, unit } = resolveIngredientDisplay(part, qtyParsed);
                                    return { name: part, quantity: qty, unit: unit };
                                })
                            )?.map((ingredient: any, i: number) => {
                                const ingredientName = ingredient.name || ingredient.original || "";

                                // Determine which units to display based on toggle
                                let qty, unit, displayQtyUnit, showFullOriginal = false;

                                if (useMetric) {
                                    qty = ingredient.quantity || 1;
                                    unit = ingredient.unit || "piece";
                                    displayQtyUnit = formatQuantityUnit(qty, unit);
                                } else {
                                    if (ingredient.original) {
                                        displayQtyUnit = ingredient.original;
                                        showFullOriginal = true;
                                        const match = ingredient.original.match(/^([\d./\s]+)/);
                                        qty = match ? parseFloat(match[1]) : 1;
                                        unit = "";
                                    } else {
                                        const originalIndex = recipe.RecipeIngredientParts?.indexOf(ingredientName);
                                        if (originalIndex !== -1 && recipe.RecipeIngredientQuantities?.[originalIndex]) {
                                            const rawQty = recipe.RecipeIngredientQuantities[originalIndex];
                                            const qtyParsed = parseQuantity(rawQty);
                                            const resolved = resolveIngredientDisplay(ingredientName, qtyParsed);
                                            qty = resolved.qty;
                                            unit = resolved.unit;
                                            displayQtyUnit = `${qty} ${unit}`;
                                        } else {
                                            qty = ingredient.quantity || 1;
                                            unit = ingredient.unit || "piece";
                                            displayQtyUnit = `${qty} ${unit}`;
                                        }
                                    }
                                }

                                const isAdded = addedToGrocery.has(normalize(ingredientName));
                                const isCommon = isCommonIngredient(ingredientName);
                                const inPantry = isInPantry(ingredientName, pantryNames);
                                const isAvailable = isCommon || inPantry;
                                const checkboxDisabled = isAvailable;

                                return (
                                    <li key={i} className="recipe__ingredient">
                                        <input
                                            type="checkbox"
                                            className="ingredient__checkbox"
                                            checked={isAdded || isAvailable}
                                            disabled={checkboxDisabled}
                                            onChange={() => {
                                                if (checkboxDisabled) return;

                                                if (isAdded) {
                                                    removeFromGroceryList(ingredientName);
                                                } else {
                                                    addToGroceryList(ingredientName, qty, unit);
                                                }
                                            }}
                                            title={
                                                isCommon
                                                    ? "Common ingredient"
                                                    : inPantry
                                                        ? "Already in pantry"
                                                        : isAdded
                                                            ? "Added to grocery list"
                                                            : "Add to grocery list"
                                            }
                                        />
                                        <img
                                            src={getIngredientIcon(ingredientName)}
                                            alt={ingredientName}
                                            className="recipe__ingredient__icon"
                                        />
                                        <div className="ingredient__text">
                                            {showFullOriginal ? (
                                                // When showing original US format, display the full string
                                                <span className="ingredient__full">
                                                    {displayQtyUnit}
                                                </span>
                                            ) : (
                                                // When showing metric, display quantity separately
                                                <span className="ingredient__amount">
                                                    <span className="ingredient__qty">{qty}</span>
                                                    <span className="ingredient__unit">{unit}</span>
                                                </span>
                                            )}
                                        </div>
                                        {!showFullOriginal && (
                                            <span className="recipe__ingredient__name">
                                                {ingredientName}
                                            </span>
                                        )}
                                        {inPantry && (
                                            <span className="ingredient__status">
                                                In Pantry
                                            </span>
                                        )}
                                        {isAdded && (
                                            <span className="ingredient__status">
                                                Added
                                            </span>
                                        )}
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
                    <section className="recipe__section recipe__nutrition">
                        <h2 className="recipe__section__title recipe__nutrition__title">
                            Nutritional Information
                        </h2>

                        <div className="recipe__nutrition__overview">
                            <p className="recipe__nutrition__overview__subtitle">
                                Recipe nutrition overview
                            </p>

                            <div className="recipe__nutrition__overview__main">
                                {nutritionOverview.caloriesIcon && (
                                    <img
                                        src={nutritionOverview.caloriesIcon}
                                        alt="Calories"
                                        className="recipe__nutrition__overview__icon"
                                    />
                                )}

                                <span className="recipe__nutrition__overview__value">
                                    {nutritionOverview.caloriesValue}
                                </span>

                                <span className="recipe__nutrition__overview__unit">
                                    {nutritionOverview.caloriesUnit}
                                </span>
                            </div>

                            {/* <p className="recipe__nutrition__overview__text">
                                {nutritionOverview.caloriesPercent} of daily calorie target
                            </p> */}

                            <div className="recipe__nutrition__overview__meta">
                                {/* <div className="recipe__nutrition__overview__meta__card">
                                    <span className="recipe__nutrition__overview__meta__label">
                                        Adjust your daily calorie target
                                    </span>
                                    <span className="recipe__nutrition__overview__meta__value">
                                        {nutritionOverview.caloriesTarget}
                                    </span>
                                    <input
                                    id="calorieTarget"
                                    type="text"
                                    inputMode="numeric"
                                    value={calorieTargetInput}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, "");
                                        const cleaned = raw.replace(/^0+(?=\d)/, "");
                                        if (!cleaned) {
                                            setCalorieTargetInput("");
                                            return;
                                        }
                                        const numericValue = Number(cleaned);
                                        if (numericValue > MAX_CALORIE_TARGET) {
                                            setCalorieTargetInput(String(MAX_CALORIE_TARGET));
                                            return;
                                        }
                                        setCalorieTargetInput(cleaned);
                                    }}
                                    className="recipe__nutrition__target__input"
                                />
                                </div> */}

                                <div className="recipe__nutrition__overview__meta__card">
                                    <span className="recipe__nutrition__overview__meta__label">
                                        Level
                                    </span>
                                    <span
                                        className={`recipe__nutrition__overview__meta__value recipe__nutrition__level recipe__nutrition__level__${nutritionOverview.level.toLowerCase()}`}
                                    >
                                        {nutritionOverview.level}
                                    </span>
                                </div>
                            </div>

                            {/* <div className="recipe__nutrition__ring__wrap">
                                <div
                                    className="recipe__nutrition__ring"
                                    style={
                                        {
                                            ["--progress" as any]: `${nutritionOverview.ringPercent}%`,
                                        } as React.CSSProperties
                                    }
                                >
                                    <div className="recipe__nutrition__ring__inner">
                                        <span className="recipe__nutrition__ring__number">
                                            {nutritionOverview.caloriesPercent}
                                        </span>
                                        <span className="recipe__nutrition__ring__label">
                                            target
                                        </span>
                                    </div>
                                </div>
                            </div> */}

                            <button
                                type="button"
                                className="recipe__nutrition__button"
                                onClick={() => setShowMoreNutrition((prev) => !prev)}
                            >
                                {showMoreNutrition ? "See less" : "See more"}
                            </button>
                        </div>

                        <div
                            className={`recipe__nutrition__tableWrap ${showMoreNutrition ? "expanded" : "collapsed"}`}
                        >
                            {showMoreNutrition && (
                                <div className="recipe__nutrition__tableInner">
                                    <div className="recipe__nutrition__tableHeader">
                                        <span className="recipe__nutrition__tableTitle">Nutrition breakdown</span>
                                        <span className="recipe__nutrition__tableSubtitle">Per recipe estimate</span>
                                    </div>

                                    <div className="recipe__nutrition__table">
                                        {nutritionDisplayItems
                                            .filter((item) => item.label !== "Calories")
                                            .map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="recipe__nutrition__tableRow"
                                                >
                                                    <div className="recipe__nutrition__tableCell recipe__nutrition__tableCell__name">
                                                        <div className="recipe__nutrition__tableCell__nameWrap">
                                                            {item.icon && (
                                                                <img
                                                                    src={item.icon}
                                                                    alt={item.label}
                                                                    className="recipe__nutrition__tableIcon"
                                                                />
                                                            )}
                                                            <span className="recipe__nutrition__tableLabel">
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="recipe__nutrition__tableCell">
                                                        <span className="recipe__nutrition__tableValue">
                                                            {item.formattedValue}
                                                            {item.unit}
                                                        </span>
                                                    </div>

                                                    <div className="recipe__nutrition__tableCell">
                                                        <span className="recipe__nutrition__tableTarget">
                                                            {item.targetLabel}
                                                        </span>
                                                    </div>

                                                    <div className="recipe__nutrition__tableCell">
                                                        <div className="recipe__nutrition__tableProgress">
                                                            <div className="recipe__nutrition__tableProgress__track">
                                                                <div
                                                                    className={`recipe__nutrition__tableProgress__fill recipe__nutrition__tableProgress__fill__${item.level}`}
                                                                    style={{ width: item.percentText }}
                                                                />
                                                            </div>
                                                            <span className="recipe__nutrition__tablePercent">
                                                                {item.percentText}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="recipe__nutrition__tableCell">
                                                        <span
                                                            className={`recipe__nutrition__tableBadge recipe__nutrition__tableBadge__${item.level}`}
                                                        >
                                                            {item.level === "low"
                                                                ? "Low"
                                                                : item.level === "medium"
                                                                    ? "Medium"
                                                                    : "High"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="recipe__source recipe__source__bottom">
                        Recipe obtained from{" "}
                        <a
                            href="https://www.food.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Food.com
                        </a>
                    </div>

                    {missingIngredients.length === 0 && (
                        <div className="recipe__complete">
                            <Button variant="primary" onClick={handleCompleteRecipe}>
                                Complete Recipe
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SingleRecipePage;

