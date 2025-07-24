import { consolidateComponentsById } from "../utils/recipeUtils";

/**
 * Pure function to recursively break down components to raw materials
 * @param {Function} findRecipeByIdentifier - Function to find recipe
 * @param {Function} findRawComponentByIdentifier - Function to find raw component
 * @param {string} componentName - Name of component to break down
 * @param {number} quantity - Quantity needed
 * @param {Set} visited - Set of visited components to prevent cycles
 * @returns {Array} Array of raw components
 */
export const breakDownToRawComponents =
  (findRecipeByIdentifier, findRawComponentByIdentifier) =>
  (componentName, quantity = 1, visited = new Set()) => {
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
        },
      ];
    }

    // Check if it's a processing recipe
    const processingRecipe = findRecipeByIdentifier(componentName);
    if (processingRecipe?.recipe?.components) {
      const newVisited = new Set(visited);
      newVisited.add(componentName);

      const breakDownFn = breakDownToRawComponents(
        findRecipeByIdentifier,
        findRawComponentByIdentifier
      );

      const rawComponents = processingRecipe.recipe.components.flatMap(
        (component) =>
          breakDownFn(component.name, component.quantity * quantity, newVisited)
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
      },
    ];
  };

/**
 * Higher-order function that creates a recipe list processor
 * @param {Function} breakDownFn - Function to break down components
 * @returns {Function} Function that processes recipe lists
 */
export const createRecipeListProcessor = (breakDownFn) => (recipeList) => {
  if (!recipeList || recipeList.length === 0) {
    return [];
  }

  console.log(
    "Processing components for recipes:",
    recipeList.map((r) => r.name)
  );

  // Process all components using functional approach
  const allRawComponents = recipeList
    .filter((recipe) => recipe.recipe?.components)
    .flatMap((recipe) =>
      recipe.recipe.components.flatMap((component) =>
        breakDownFn(component.name, component.quantity)
      )
    );

  const consolidated = consolidateComponentsById(allRawComponents);
  console.log("Consolidated raw components:", consolidated);
  return consolidated;
};

/**
 * Pure function to check if recipe is already in the list
 * @param {Array} recipeList - Current recipe list
 * @param {Object} recipeData - Recipe to check
 * @returns {boolean} True if recipe is already in list
 */
export const isRecipeAlreadyAdded = (recipeList, recipeData) => {
  return recipeList.some((recipe) => recipe.id === recipeData.id);
};

/**
 * Higher-order function that creates a recipe validator
 * @param {Function} findRecipeByIdentifier - Function to find recipe
 * @returns {Function} Function that validates and adds recipes
 */
export const createRecipeValidator =
  (findRecipeByIdentifier) => (recipeList, recipeName) => {
    const recipeData = findRecipeByIdentifier(recipeName);

    if (!recipeData) {
      console.warn(`Recipe not found: ${recipeName}`);
      return { success: false, message: "Recipe not found", data: null };
    }

    if (isRecipeAlreadyAdded(recipeList, recipeData)) {
      console.log("Recipe already in list:", recipeData.name);
      return {
        success: false,
        message: "Recipe already in list",
        data: recipeData,
      };
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
 * Factory function to create recipe service functions
 * @param {Function} findRecipeByIdentifier - Function to find recipe
 * @param {Function} findRawComponentByIdentifier - Function to find raw component
 * @returns {Object} Object containing all recipe service functions
 */
export const createRecipeServiceFunctions = (
  findRecipeByIdentifier,
  findRawComponentByIdentifier
) => {
  const breakDownFn = breakDownToRawComponents(
    findRecipeByIdentifier,
    findRawComponentByIdentifier
  );

  const processRecipeList = createRecipeListProcessor(breakDownFn);
  const validateAndAddRecipe = createRecipeValidator(findRecipeByIdentifier);

  return {
    breakDownToRawComponents: breakDownFn,
    processRecipeListToRawComponents: processRecipeList,
    addRecipeToList: validateAndAddRecipe,
    removeRecipeFromList,
    isRecipeAlreadyAdded,
  };
};

// Default export for the main factory function
export default createRecipeServiceFunctions;
