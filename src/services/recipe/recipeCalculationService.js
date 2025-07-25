import { consolidateComponentsById } from "../../utils/recipeUtils.js";
import {
  findRecipeByIdentifier,
  findRawComponentByIdentifier,
} from "./recipeService.js";

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

  // Check if it's already a raw component
  const rawComponent = findRawComponentByIdentifier(componentName);
  if (rawComponent) {
    return [
      {
        id: rawComponent.id,
        name: componentName,
        quantity: quantity,
        isRaw: true,
        description: rawComponent.description,
        gatheringSkill: rawComponent.gathering?.skill,
        gatheringLevel: rawComponent.gathering?.skillLevel,
      },
    ];
  }

  // Check if it's a processing recipe
  const processingRecipe = findRecipeByIdentifier(componentName);
  if (processingRecipe?.recipe?.components) {
    const newVisited = new Set(visited);
    newVisited.add(componentName);

    const rawComponents = processingRecipe.recipe.components.flatMap(
      (component) =>
        breakDownToRawComponents(
          component.name,
          component.quantity * quantity,
          newVisited
        )
    );

    return rawComponents;
  }

  // Component not found - treat as unknown
  console.warn(
    `Component ${componentName} not found in raw or processing recipes`
  );
  return [
    {
      id: `unknown_${componentName}`,
      name: componentName,
      quantity: quantity,
      isRaw: false,
      isUnknown: true,
      error: "Component not found in recipe database",
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
        return recipeData.recipe;
      }
      return recipeData;
    })
    .filter(Boolean);

  console.log("🔍 Extracted recipes:", recipes);

  // Add more debugging to see what properties each recipe has
  recipes.forEach((recipe, index) => {
    console.log(`🔍 Recipe ${index} properties:`, Object.keys(recipe || {}));
    console.log(
      `🔍 Recipe ${index} components:`,
      recipe?.components || recipe?.ingredients
    );
  });

  // Check if recipes have the expected structure
  const validRecipes = recipes.filter((recipe) => recipe?.components);

  if (validRecipes.length === 0) {
    console.warn("No valid recipes with components found");
    return [];
  }

  // Process all components
  const allRawComponents = validRecipes.flatMap((recipe) =>
    recipe.components.flatMap((component) =>
      breakDownToRawComponents(component.name, component.quantity)
    )
  );

  const consolidated = consolidateComponentsById(allRawComponents);
  console.log("Consolidated raw components:", consolidated);
  return consolidated;
};

/**
 * Validate and add recipe to list
 * @param {Array} recipeList - Current recipe list
 * @param {string} recipeName - Name of recipe to add
 * @returns {Object} Validation result with success status and data
 */
export const addRecipeToList = (recipeList, recipeName) => {
  console.log("Validating recipe:", recipeName);

  const recipeData = findRecipeByIdentifier(recipeName);
  console.log("Found recipe data:", recipeData);

  if (!recipeData) {
    console.warn(`Recipe not found: ${recipeName}`);
    return { success: false, message: "Recipe not found", data: null };
  }

  console.log("Adding recipe:", recipeData);
  return {
    success: true,
    message: "Recipe added successfully",
    data: recipeData,
  };
};

/**
 * Pure function to remove recipe from list by ID
 * @param {Array} recipeList - Current recipe list
 * @param {string|number} recipeId - ID of recipe to remove
 * @returns {Array} New recipe list without the specified recipe
 */
export const removeRecipeFromList = (recipeList, recipeId) => {
  return recipeList.filter((recipe) => recipe.id !== recipeId);
};

/**
 * Pure function to calculate total cost breakdown for recipes
 * @param {Array} rawComponents - Array of raw components with quantities
 * @returns {Object} Cost breakdown by gathering skill
 */
export const calculateCostBreakdown = (rawComponents) => {
  const breakdown = rawComponents.reduce((acc, component) => {
    const skill = component.gatheringSkill || "unknown";
    if (!acc[skill]) {
      acc[skill] = {
        skill,
        components: [],
        totalItems: 0,
      };
    }

    acc[skill].components.push(component);
    acc[skill].totalItems += component.quantity;
    return acc;
  }, {});

  return {
    breakdown,
    totalUniqueComponents: rawComponents.length,
    totalItems: rawComponents.reduce((sum, comp) => sum + comp.quantity, 0),
    skillsRequired: Object.keys(breakdown),
  };
};

/**
 * Pure function to optimize gathering order based on efficiency
 * @param {Array} rawComponents - Array of raw components
 * @param {Object} skillEfficiency - Optional efficiency ratings per skill
 * @returns {Array} Optimized gathering order
 */
export const optimizeGatheringOrder = (rawComponents, skillEfficiency = {}) => {
  const grouped = rawComponents.reduce((acc, component) => {
    const skill = component.gatheringSkill || "unknown";
    if (!acc[skill]) {
      acc[skill] = [];
    }
    acc[skill].push(component);
    return acc;
  }, {});

  // Sort skills by efficiency (higher efficiency first)
  const sortedSkills = Object.keys(grouped).sort((a, b) => {
    const effA = skillEfficiency[a] || 1;
    const effB = skillEfficiency[b] || 1;
    return effB - effA;
  });

  return sortedSkills.map((skill) => ({
    skill,
    components: grouped[skill],
    totalQuantity: grouped[skill].reduce((sum, comp) => sum + comp.quantity, 0),
    efficiency: skillEfficiency[skill] || 1,
  }));
};

/**
 * Pure function to find recipe dependencies
 * @param {Array} recipeList - List of recipes
 * @returns {Object} Dependency graph
 */
export const calculateRecipeDependencies = (recipeList) => {
  const dependencies = {};

  recipeList.forEach((recipe) => {
    if (recipe.recipe?.components) {
      dependencies[recipe.id] = recipe.recipe.components
        .map((component) => {
          const dependentRecipe = findRecipeByIdentifier(component.name);
          return dependentRecipe
            ? {
                id: dependentRecipe.id,
                name: component.name,
                quantity: component.quantity,
              }
            : null;
        })
        .filter(Boolean);
    }
  });

  return dependencies;
};

/**
 * Check if a recipe is already added to the recipe list
 * @param {Array} recipeList - Current recipe list
 * @param {Object} recipeData - Recipe to check
 * @returns {boolean} True if recipe is already in list
 */
export const isRecipeAlreadyAdded = (recipeList, recipeData) => {
  if (!recipeList || !Array.isArray(recipeList) || !recipeData) {
    return false;
  }

  return recipeList.some(
    (item) => item.recipe && item.recipe.id === recipeData.id
  );
};

export const recipeCalculationService = {
  breakDownToRawComponents,
  processRecipeListToRawComponents,
  addRecipeToList,
  removeRecipeFromList,
  calculateCostBreakdown,
  optimizeGatheringOrder,
  calculateRecipeDependencies,
  isRecipeAlreadyAdded,
};

export default recipeCalculationService;
