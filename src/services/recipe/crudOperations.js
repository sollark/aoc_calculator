/**
 * CRUD operations for recipe data manipulation
 */

/**
 * Add recipe to data structure
 * @param {Object} recipes - Current recipes data
 * @param {string} type - Recipe type
 * @param {Object} recipe - Recipe to add
 * @returns {Object} Updated recipes data
 */
export const addRecipeToData = (recipes, type, recipe) => {
  const updatedRecipes = { ...recipes };
  if (!updatedRecipes[type]) {
    updatedRecipes[type] = [];
  }
  updatedRecipes[type] = [...updatedRecipes[type], recipe];
  return updatedRecipes;
};

/**
 * Update recipe in data structure
 * @param {Object} recipes - Current recipes data
 * @param {string} type - Recipe type
 * @param {number} index - Recipe index
 * @param {Object} updates - Updates to apply
 * @returns {Object} Updated recipes data and recipe
 */
export const updateRecipeInData = (recipes, type, index, updates) => {
  const updatedRecipes = { ...recipes };
  updatedRecipes[type] = [...updatedRecipes[type]];
  updatedRecipes[type][index] = {
    ...updatedRecipes[type][index],
    ...updates,
  };
  return {
    recipes: updatedRecipes,
    updatedRecipe: updatedRecipes[type][index],
  };
};

/**
 * Remove recipe from data structure
 * @param {Object} recipes - Current recipes data
 * @param {string} type - Recipe type
 * @param {number} index - Recipe index
 * @returns {Object} Updated recipes data and deleted recipe
 */
export const removeRecipeFromData = (recipes, type, index) => {
  const updatedRecipes = { ...recipes };
  const deletedRecipe = updatedRecipes[type][index];
  updatedRecipes[type] = updatedRecipes[type].filter((_, i) => i !== index);
  return {
    recipes: updatedRecipes,
    deletedRecipe,
  };
};

/**
 * Bulk add recipes to data structure
 * @param {Object} recipes - Current recipes data
 * @param {string} type - Recipe type
 * @param {Array} newRecipes - Array of recipes to add
 * @returns {Object} Updated recipes data
 */
export const bulkAddRecipes = (recipes, type, newRecipes) => {
  const updatedRecipes = { ...recipes };
  if (!updatedRecipes[type]) {
    updatedRecipes[type] = [];
  }
  updatedRecipes[type] = [...updatedRecipes[type], ...newRecipes];
  return updatedRecipes;
};

/**
 * Bulk update recipes in data structure
 * @param {Object} recipes - Current recipes data
 * @param {Array} updates - Array of {id, updates} objects
 * @returns {Object} Updated recipes data and results
 */
export const bulkUpdateRecipes = (recipes, updates) => {
  let updatedRecipes = { ...recipes };
  const results = [];

  for (const { id, updates: recipeUpdates } of updates) {
    // Find recipe location
    let found = false;
    for (const type of Object.keys(updatedRecipes)) {
      const index = updatedRecipes[type]?.findIndex(
        (recipe) => recipe.id === id
      );
      if (index !== -1) {
        const result = updateRecipeInData(
          updatedRecipes,
          type,
          index,
          recipeUpdates
        );
        updatedRecipes = result.recipes;
        results.push({
          id,
          success: true,
          recipe: result.updatedRecipe,
          type,
        });
        found = true;
        break;
      }
    }

    if (!found) {
      results.push({
        id,
        success: false,
        error: `Recipe with ID ${id} not found`,
      });
    }
  }

  return {
    recipes: updatedRecipes,
    results,
  };
};

/**
 * Replace entire recipe type data
 * @param {Object} recipes - Current recipes data
 * @param {string} type - Recipe type
 * @param {Array} newRecipes - New recipes array
 * @returns {Object} Updated recipes data
 */
export const replaceRecipeType = (recipes, type, newRecipes) => {
  return {
    ...recipes,
    [type]: [...newRecipes],
  };
};
