/**
 * Pure function to initialize default recipe selection
 * @param {Array} allRecipes - All available recipes
 * @param {string} currentSelection - Current selected recipe
 * @returns {string} Recipe name to select
 */
export const initializeDefaultRecipe = (allRecipes, currentSelection) => {
  if (allRecipes.length > 0 && !currentSelection) {
    return allRecipes[0].name;
  }
  return currentSelection;
};

/**
 * Pure function to log application initialization data
 * @param {Array} allRecipes - All loaded recipes
 * @param {Object} recipeLookups - Recipe lookup maps
 * @param {Object} rawComponentLookups - Raw component lookup maps
 */
export const logInitializationData = (
  allRecipes,
  recipeLookups,
  rawComponentLookups
) => {
  if (process.env.NODE_ENV === "development") {
    console.log("All Recipes Loaded:", allRecipes);
    console.log("Recipe Lookups:", recipeLookups);
    console.log("Raw Component Lookups:", rawComponentLookups);
  }
};

/**
 * Higher-order function that creates a recipe addition handler
 * @param {Function} setRecipeList - State setter function
 * @returns {Function} Function that handles recipe addition results
 */
export const createRecipeAdditionHandler = (setRecipeList) => (result) => {
  if (result.success) {
    setRecipeList((prev) => [...prev, result.data]);
  }
  // Could add toast notifications here based on result.message
  return result;
};

/**
 * Higher-order function that creates a recipe removal handler
 * @param {Function} removeFunction - Function to remove recipe
 * @param {Function} setRecipeList - State setter function
 * @returns {Function} Function that handles recipe removal
 */
export const createRecipeRemovalHandler =
  (removeFunction, setRecipeList) => (recipeId) => {
    const updatedList = removeFunction(recipeId);
    setRecipeList(updatedList);
    return updatedList;
  };

/**
 * Compose state management functions
 * @param {Function} setRecipeList - State setter function
 * @param {Object} recipeServiceFunctions - Recipe service functions
 * @returns {Object} Composed state management functions
 */
export const createStateManagers = (setRecipeList, recipeServiceFunctions) => {
  const handleRecipeAddition = createRecipeAdditionHandler(setRecipeList);
  const handleRecipeRemoval = createRecipeRemovalHandler(
    recipeServiceFunctions.removeRecipeFromList,
    setRecipeList
  );

  return {
    handleRecipeAddition,
    handleRecipeRemoval,
    clearRecipeList: () => setRecipeList([]),
  };
};

// Default export for the main factory function
export default createStateManagers;
