import { VALID_RECIPE_TYPES } from "./constants.js";
import {
  InvalidRecipeTypeError,
  RecipeNotFoundError,
} from "../../utils/errorHandler.js";

/**
 * CRUD operations for recipe data manipulation
 * Pure functions that work with recipe data structures
 */

/**
 * Validate recipe type
 * @param {string} type - Recipe type to validate
 * @throws {InvalidRecipeTypeError} If type is invalid
 */
const validateRecipeType = (type) => {
  if (!VALID_RECIPE_TYPES.includes(type)) {
    throw new InvalidRecipeTypeError(type, VALID_RECIPE_TYPES);
  }
};

/**
 * Add recipe to data structure
 * @param {Object} recipes - Current recipes data
 * @param {string} type - Recipe type
 * @param {Object} recipe - Recipe to add
 * @returns {Object} Updated recipes data
 */
export const addRecipeToData = (recipes, type, recipe) => {
  validateRecipeType(type);

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
  validateRecipeType(type);

  if (!recipes[type] || index < 0 || index >= recipes[type].length) {
    throw new RecipeNotFoundError(`Recipe at index ${index} in type ${type}`);
  }

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
  validateRecipeType(type);

  if (!recipes[type] || index < 0 || index >= recipes[type].length) {
    throw new RecipeNotFoundError(`Recipe at index ${index} in type ${type}`);
  }

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
  validateRecipeType(type);

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
    for (const type of VALID_RECIPE_TYPES) {
      if (updatedRecipes[type]) {
        const index = updatedRecipes[type].findIndex(
          (recipe) => recipe.id === id
        );
        if (index !== -1) {
          try {
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
          } catch (error) {
            results.push({
              id,
              success: false,
              error: error.message,
            });
            found = true;
            break;
          }
        }
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
  validateRecipeType(type);

  return {
    ...recipes,
    [type]: [...newRecipes],
  };
};

/**
 * Check if a recipe is already added to the recipe list
 * Pure function to check recipe existence in array
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

export default {
  addRecipeToData,
  updateRecipeInData,
  removeRecipeFromData,
  bulkAddRecipes,
  bulkUpdateRecipes,
  replaceRecipeType,
  isRecipeAlreadyAdded, // Add to exports
};
