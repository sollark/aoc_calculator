import {
  createRecipeLookups,
  createRawComponentLookups,
  findRecipe,
  findRawComponent,
} from "../../../utils/recipeUtils.js";

/**
 * Recipe calculation and breakdown service
 * Handles recipe component breakdown, validation, and list processing
 */

/**
 * Pure function to recursively break down components to raw materials
 * @param {string} componentName - Name of component to break down
 * @param {number} quantity - Quantity needed
 * @param {Set} visited - Set of visited components to prevent cycles
 * @returns {Array} Array of raw components
 */
export const breakDownToRawComponents = (
  componentName,
  quantity = 1,
  visited = new Set()
) => {
  // Prevent infinite recursion
  if (visited.has(componentName)) {
    console.warn(`Circular dependency detected for ${componentName}`);
    return [];
  }

  // Check if it's already a raw component using the correct function
  const rawComponent = findRawComponent(componentName);
  if (rawComponent) {
    return [
      {
        id: rawComponent.id,
        name: rawComponent.name,
        quantity: quantity,
        type: "raw",
        source: rawComponent.gatheringSkill || "unknown",
      },
    ];
  }

  // Check if it's a recipe that can be broken down further using the correct function
  const recipe = findRecipe(componentName);
  if (recipe && recipe.recipe && recipe.recipe.components) {
    visited.add(componentName);
    const components = [];

    recipe.recipe.components.forEach((component) => {
      const componentQuantity = (component.quantity || 1) * quantity;
      const subComponents = breakDownToRawComponents(
        component.name || component.item,
        componentQuantity,
        new Set(visited)
      );
      components.push(...subComponents);
    });

    visited.delete(componentName);
    return components;
  }

  // If we can't find it anywhere, treat as unknown raw component
  console.warn(
    `Component ${componentName} not found in recipes or raw components`
  );
  return [
    {
      id: componentName,
      name: componentName,
      quantity: quantity,
      type: "raw",
      source: "unknown",
      error: "Component not found in database",
    },
  ];
};

/**
 * Process recipe list to get consolidated raw components
 * @param {Array} recipeList - List of recipes to process
 * @returns {Array} Consolidated raw components
 */
export const processRecipeListToRawComponents = (recipeList) => {
  console.log("🔍 processRecipeListToRawComponents called with:", recipeList);

  if (!recipeList || !Array.isArray(recipeList)) {
    console.log("🔍 Invalid recipe list");
    return [];
  }

  // Extract recipes from the recipe list structure
  const recipes = recipeList
    .map((item) => {
      console.log("🔍 Processing recipe list item:", item);
      console.log("🔍 Item.recipe:", item?.recipe);

      // The item structure is: {id, recipe, quantity}
      // The recipe might have nested structure: recipe.recipe.components
      const recipeData = item?.recipe;
      if (recipeData && recipeData.recipe) {
        // If recipe has nested recipe data, use that
        return {
          ...recipeData,
          quantity: item.quantity || 1,
        };
      } else if (recipeData) {
        // If recipe data is flat, use it directly
        return {
          ...recipeData,
          quantity: item.quantity || 1,
        };
      }
      return null;
    })
    .filter(Boolean);

  console.log("🔍 Extracted recipes for processing:", recipes);

  if (recipes.length === 0) {
    console.log("🔍 No valid recipes to process");
    return [];
  }

  // Process each recipe to get its raw components
  const allComponents = [];
  recipes.forEach((recipe) => {
    const components = breakDownRecipeToRawComponents(
      recipe,
      recipe.quantity || 1
    );
    allComponents.push(...components);
  });

  console.log("🔍 All components before consolidation:", allComponents);

  // Consolidate components by ID
  const consolidated = consolidateComponentsById(allComponents);
  console.log("🔍 Final consolidated components:", consolidated);

  return consolidated;
};

/**
 * Break down a recipe to its raw components
 * @param {Object} recipe - Recipe to break down
 * @param {number} quantity - Quantity multiplier
 * @returns {Array} Array of raw components
 */
export const breakDownRecipeToRawComponents = (recipe, quantity = 1) => {
  console.log("🔍 Breaking down recipe:", recipe.name, "quantity:", quantity);

  if (!recipe.recipe || !recipe.recipe.components) {
    console.log("🔍 Recipe has no components, treating as raw component");
    return [
      {
        id: recipe.id,
        name: recipe.name,
        quantity: quantity,
        type: "raw",
        error: "No recipe data available",
      },
    ];
  }

  const components = [];
  recipe.recipe.components.forEach((component) => {
    const componentQuantity = (component.quantity || 1) * quantity;
    console.log(
      `🔍 Processing component: ${
        component.name || component.item
      } x${componentQuantity}`
    );

    // For now, treat all components as raw materials
    // In future, we could add recursive breakdown for intermediate recipes
    components.push({
      id: component.id || component.name || component.item,
      name: component.name || component.item || "Unknown Component",
      quantity: componentQuantity,
      type: "raw",
    });
  });

  return components;
};

/**
 * Consolidate components by ID, avoiding duplicates
 * @param {Array} components - Array of components to consolidate
 * @returns {Array} Consolidated array sorted by name
 */
const consolidateComponentsById = (components) => {
  const consolidated = components.reduce((acc, component) => {
    const key = component.id;
    if (acc[key]) {
      acc[key] = {
        ...acc[key],
        quantity: acc[key].quantity + component.quantity,
      };
    } else {
      acc[key] = { ...component };
    }
    return acc;
  }, {});

  return Object.values(consolidated).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

/**
 * Calculate cost breakdown for a recipe
 * @param {Object} recipe - Recipe to calculate costs for
 * @param {number} quantity - Quantity to make
 * @returns {Object} Cost breakdown
 */
export const calculateCostBreakdown = (recipe, quantity = 1) => {
  const rawComponents = breakDownRecipeToRawComponents(recipe, quantity);

  return {
    recipe: recipe.name,
    quantity,
    rawComponents,
    totalComponents: rawComponents.length,
    estimatedTime: recipe.recipe?.craftingTime
      ? recipe.recipe.craftingTime * quantity
      : null,
    artisanSkill: recipe.recipe?.artisanSkill,
    workStation: recipe.recipe?.workStation,
  };
};

/**
 * Create recipe calculation service
 * @returns {Object} Calculation service functions
 */
export const createRecipeCalculationService = () => {
  return {
    processRecipeListToRawComponents,
    breakDownRecipeToRawComponents,
    calculateCostBreakdown,
  };
};
