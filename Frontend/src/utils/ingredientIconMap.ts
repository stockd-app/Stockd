// src/utils/ingredientIconMap.ts

type IngredientIconMap = {
    keywords: string[];
    icon: string; // CDN image url
};

const ingredientIconMap: IngredientIconMap[] = [
    {
        keywords: [
            "chicken", "beef", "pork", "lamb", "meat",
            "turkey", "duck", "bacon", "ham", "sausage",
            "steak", "veal", "mince", "ground"
        ],
        icon: "https://cdn-icons-png.flaticon.com/512/1718/1718484.png",
    },
    {
        keywords: [
            "fish", "salmon", "tuna", "shrimp", "prawn",
            "cod", "tilapia", "crab", "lobster", "mussel",
            "clam", "scallop", "anchovy", "sardine"
        ],
        icon: "https://cdn-icons-png.flaticon.com/512/7780/7780149.png",
    },
    {
        keywords: [
            "tofu", "soy", "tempeh", "bean", "lentil", "chickpea"
        ],
        icon: "https://cdn-icons-png.flaticon.com/512/4721/4721241.png",
    },
    {
        keywords: [
            "vegetable", "carrot", "broccoli", "spinach", "onion",
            "garlic", "shallot", "leek", "celery", "pepper",
            "zucchini", "courgette", "eggplant", "aubergine",
            "mushroom", "tomato", "cucumber", "lettuce", "kale", "cabbage",
            "pumpkin", "squash", "parsnips"
        ],
        icon: "https://cdn-icons-png.flaticon.com/512/9862/9862079.png",
    },
    {
        keywords: [
            "potato", "sweet potato"
        ],
        icon: "https://cdn-icons-png.flaticon.com/512/5579/5579812.png",
    },
    {
        keywords: [
            "apple", "banana", "lemon", "lime", "orange",
            "berry", "strawberry", "blueberry", "grape",
            "avocado", "pineapple", "mango"
        ],
        icon: "https://cdn-icons-png.flaticon.com/512/1625/1625048.png",
    },
    {
        keywords: [
            "parsley", "basil", "cilantro", "coriander",
            "thyme", "rosemary", "oregano", "mint", "dill",
            "bay leaf"
        ],
        icon: "https://cdn-icons-png.flaticon.com/512/5014/5014958.png",
    },
    {
        keywords: [
            "pasta", "spaghetti", "linguine", "noodle",
            "rice", "risotto", "quinoa", "barley", "oat",
            "bread", "bun", "flour", "wrap", "tortilla"
        ],
        icon: "https://cdn-icons-png.flaticon.com/512/11827/11827739.png",
    },
    {
        keywords: [
            "milk", "cream", "cheese", "butter",
            "yogurt", "yoghurt", "parmesan", "cheddar",
            "mozzarella", "ricotta"
        ],
        icon: "https://cdn-icons-png.flaticon.com/512/3070/3070925.png",
    },
    {
        keywords: [
            "oil", "olive oil", "vegetable oil",
            "canola", "sunflower", "sesame oil",
            "lard", "ghee"
        ],
        icon: "https://cdn-icons-png.flaticon.com/512/5473/5473711.png",
    },
    {
        keywords: [
            "salt", "pepper", "paprika", "cumin",
            "chili", "chilli", "curry", "spice",
            "garam masala", "nutmeg", "cinnamon"
        ],
        icon: "https://cdn-icons-png.flaticon.com/512/5110/5110473.png",
    },
    {
        keywords: [
            "sugar", "brown sugar", "honey",
            "maple syrup", "syrup", "molasses"
        ],
        icon: "https://cdn-icons-png.flaticon.com/512/10552/10552057.png",
    },
    {
        keywords: [
            "water", "stock", "broth", "chicken stock",
            "beef stock", "vegetable stock",
            "wine", "white wine", "red wine",
            "vinegar", "soy sauce"
        ],
        icon: "https://cdn-icons-png.flaticon.com/512/2447/2447774.png",
    },
    {
        keywords: ["egg", "eggs", "egg white", "egg yolk"],
        icon: "https://cdn-icons-png.flaticon.com/512/2713/2713474.png",
    },
    {
        keywords: ["ketchup", "mustard", "mayonnaise", "sauce", "dressing"],
        icon: "https://cdn-icons-png.flaticon.com/512/3082/3082037.png",
    }
];

// fallback icon
const defaultIcon =
    "https://cdn-icons-png.flaticon.com/512/3523/3523063.png";

export function getIngredientIcon(ingredientName: string): string {
    const lower = ingredientName.toLowerCase();

    const match = ingredientIconMap.find((map) =>
        map.keywords.some((keyword) => lower.includes(keyword))
    );

    return match?.icon || defaultIcon;
}
