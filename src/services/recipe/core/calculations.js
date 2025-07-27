/**
 * Recipe calculation and breakdown service
 * Handles recipe component breakdown, validation, and list processing
 */

// We need access to the recipe service to find recipes and raw components
let recipeServiceInstance = null;

/**
 * Initialize the calculation service with recipe service instance
 * @param {Object} recipeService - Recipe service instance
 */
export const initializeCalculationService = (recipeService) => {
  recipeServiceInstance = recipeService;
};

/**
 * Find a recipe by name in the recipe database
 * @param {string} recipeName - Name of recipe to find
 * @returns {Object|null} Recipe object or null if not found
 */
const findRecipeByName = async (recipeName) => {
  if (!recipeServiceInstance) {
    console.warn("Recipe service not initialized");
    return null;
  }

  try {
    // Use async getAllRecipes since it's an async function
    const allRecipes = await recipeServiceInstance.getAllRecipes();
    if (!allRecipes || !Array.isArray(allRecipes)) {
      console.warn("No recipes array returned from getAllRecipes");
      return null;
    }

    console.log(
      `🔍 Searching for recipe: "${recipeName}" in ${allRecipes.length} recipes`
    );

    const found = allRecipes.find(
      (recipe) => recipe.name.toLowerCase() === recipeName.toLowerCase()
    );

    if (found) {
      console.log(`✅ Found recipe: ${found.name}`);
    } else {
      console.warn(`❌ Recipe "${recipeName}" not found in database`);
      // Debug: show first few recipe names
      console.log(
        "Available recipes:",
        allRecipes.slice(0, 5).map((r) => r.name)
      );
    }

    return found || null;
  } catch (error) {
    console.warn("Error finding recipe:", error);
    return null;
  }
};

/**
 * Check if a component is a raw material (has no recipe)
 * @param {string} componentName - Name of component to check
 * @returns {Object|null} Raw component info or null if it's not raw
 */
const findRawComponentByName = async (componentName) => {
  if (!recipeServiceInstance) {
    console.warn("Recipe service not initialized");
    return null;
  }

  try {
    const allRecipes = await recipeServiceInstance.getAllRecipes();
    if (!allRecipes || !Array.isArray(allRecipes)) {
      return null;
    }

    // Check if there's a recipe for this component
    const hasRecipe = allRecipes.some(
      (recipe) => recipe.name.toLowerCase() === componentName.toLowerCase()
    );

    // If no recipe exists, treat as raw component
    if (!hasRecipe) {
      console.log(`✅ ${componentName} is a raw component (no recipe found)`);
      return {
        id: componentName,
        name: componentName,
        type: "raw_component",
      };
    }

    return null;
  } catch (error) {
    console.warn("Error checking raw component:", error);
    return null;
  }
};

/**
 * Process recipe list to get consolidated raw components
 * Main function that handles the recipe list and calls breakdown functions
 * @param {Array} recipeList - List of recipes to process
 * @returns {Array} Consolidated raw components
 */
export const processRecipeListToRawComponents = async (recipeList) => {
  console.log("🔍 processRecipeListToRawComponents called with:", recipeList);

  if (!recipeList || !Array.isArray(recipeList)) {
    console.log("🔍 Invalid recipe list");
    return [];
  }

  // Extract recipes from the recipe list structure
  const recipes = recipeList
    .map((item) => {
      console.log("🔍 Processing recipe list item:", item);
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

  console.log("🔍 Valid recipes for processing:", recipes);

  if (recipes.length === 0) {
    console.log("🔍 No valid recipes to process");
    return [];
  }

  // Use recursive breakdown for each recipe
  const allComponents = [];
  for (const recipe of recipes) {
    console.log("🔍 Breaking down recipe recursively:", recipe.name);
    const components = await breakDownToRawComponents(
      recipe.name,
      recipe.quantity || 1,
      new Set()
    );
    allComponents.push(...components);
  }

  console.log("🔍 All components before consolidation:", allComponents);

  // Consolidate components by ID
  const consolidated = consolidateComponents(allComponents);
  console.log("🔍 Final consolidated components:", consolidated);

  return consolidated;
};

/**
 * Recursively break down components to raw materials
 * Handles multi-tier recipe breakdown for AoC crafting system
 * @param {string} componentName - Name of component to break down
 * @param {number} quantity - Quantity needed
 * @param {Set} visited - Set of visited components to prevent cycles
 * @returns {Array} Array of raw components
 */
export const breakDownToRawComponents = async (
  componentName,
  quantity = 1,
  visited = new Set()
) => {
  console.log(`🔍 Breaking down: ${componentName} x${quantity}`);

  // Prevent infinite recursion
  if (visited.has(componentName)) {
    console.warn(`Circular dependency detected for ${componentName}`);
    return [];
  }

  // Check if it's already a raw component
  const rawComponent = await findRawComponentByName(componentName);
  if (rawComponent) {
    console.log(`✅ ${componentName} is a raw component`);
    return [
      {
        id: rawComponent.id,
        name: rawComponent.name,
        quantity: quantity,
        type: "raw",
        source: "gathering",
      },
    ];
  }

  // Check if it's a recipe that can be broken down further
  const recipe = await findRecipeByName(componentName);
  if (recipe && recipe.recipe && recipe.recipe.components) {
    console.log(`🔧 ${componentName} has recipe, breaking down further...`);

    visited.add(componentName);
    const components = [];

    for (const component of recipe.recipe.components) {
      const componentQuantity = (component.quantity || 1) * quantity;
      const componentName = component.name || component.item;

      console.log(`  📦 Component: ${componentName} x${componentQuantity}`);

      const subComponents = await breakDownToRawComponents(
        componentName,
        componentQuantity,
        new Set(visited) // Create new Set to avoid mutation issues
      );
      components.push(...subComponents);
    }

    visited.delete(componentName);
    return components;
  }

  // If we can't find it anywhere, treat as unknown raw component
  console.warn(
    `⚠️ Component ${componentName} not found in recipes or raw components`
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
 * Break down a single recipe to its raw components (non-recursive)
 * This treats all recipe components as raw materials
 * @param {Object} recipe - Recipe to break down
 * @param {number} quantity - Quantity multiplier
 * @returns {Array} Array of raw components
 */
export const convertRecipeToRawComponents = (recipe, quantity = 1) => {
  console.log(
    "🔍 Converting recipe to raw components:",
    recipe.name,
    "x",
    quantity
  );

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

    // Treat all components as raw materials for now
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
 * Consolidate duplicate components by ID and sum quantities
 * @param {Array} components - Array of components to consolidate
 * @returns {Array} Consolidated array sorted by name
 */
const consolidateComponents = (components) => {
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
 * @param {Object} recipeService - Recipe service instance
 * @returns {Object} Calculation service functions
 */
export const createRecipeCalculationService = (recipeService) => {
  // Initialize the service with recipe data access
  initializeCalculationService(recipeService);

  return {
    processRecipeListToRawComponents,
    breakDownToRawComponents,
    convertRecipeToRawComponents,
    initializeCalculationService,
  };
};
