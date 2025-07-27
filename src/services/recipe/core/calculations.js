import { findRecipe, findRawComponent } from "../../../utils/recipeUtils.js";

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
      const recipeData = item?.recipe;
      if (recipeData && recipeData.recipe) {
        return {
          ...recipeData,
          quantity: item.quantity || 1,
        };
      } else if (recipeData) {
        return {
          ...recipeData,
          quantity: item.quantity || 1,
        };
      }
      return null;
    })
    .filter(Boolean);

  if (recipes.length === 0) {
    return [];
  }

  // Use recursive breakdown for each recipe
  const allComponents = [];
  recipes.forEach((recipe) => {
    // Use the recursive function instead of the simple one
    const components = breakDownToRawComponents(
      recipe.name,
      recipe.quantity || 1,
      new Set()
    );
    allComponents.push(...components);
  });

  // Consolidate components by ID
  const consolidated = consolidateComponentsById(allComponents);
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
 * Create recipe calculation service
 * @returns {Object} Calculation service functions
 */
export const createRecipeCalculationService = () => {
  return {
    processRecipeListToRawComponents,
    breakDownRecipeToRawComponents,
  };
};
