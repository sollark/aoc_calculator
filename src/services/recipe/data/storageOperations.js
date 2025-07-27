// Formerly: arrayOperations.js
import {
  validateRecipeType,
  validateRecipe,
  validateUpdates,
  validateArrayIndex,
  validateRecipesData,
} from "../processing/validators.js";
import { RecipeNotFoundError } from "../../../utils/errorHandler.js";

/**
 * CRUD operations for recipe storage manipulation
 * Pure functions that work with recipe storage structures
 */

/**
 * Add recipe to storage structure
 * @param {Object} recipes - Current recipes storage
 * @param {string} type - Recipe type
 * @param {Object} recipe - Recipe to add
 * @returns {Object} Updated recipes storage
 */
export const addRecipeToData = (recipes, type, recipe) => {
  validateRecipesData(recipes);
  validateRecipeType(type);
  validateRecipe(recipe);

  const updatedRecipes = { ...recipes };
  if (!updatedRecipes[type]) {
    updatedRecipes[type] = [];
  }
  updatedRecipes[type] = [...updatedRecipes[type], recipe];
  return updatedRecipes;
};

/**
 * Update recipe in storage structure
 * @param {Object} recipes - Current recipes storage
 * @param {string} type - Recipe type
 * @param {number} index - Recipe index
 * @param {Object} updates - Updates to apply
 * @returns {Object} Updated recipes storage and recipe
 */
export const updateRecipeInData = (recipes, type, index, updates) => {
  validateRecipesData(recipes);
  validateRecipeType(type);
  validateUpdates(updates);

  if (!recipes[type]) {
    throw new RecipeNotFoundError(`Recipe type ${type} not found`);
  }

  validateArrayIndex(recipes[type], index, `Recipe in type ${type}`);

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
 * Remove recipe from storage structure
 * @param {Object} recipes - Current recipes storage
 * @param {string} type - Recipe type
 * @param {number} index - Recipe index
 * @returns {Object} Updated recipes storage and deleted recipe
 */
export const removeRecipeFromData = (recipes, type, index) => {
  validateRecipesData(recipes);
  validateRecipeType(type);

  if (!recipes[type]) {
    throw new RecipeNotFoundError(`Recipe type ${type} not found`);
  }

  validateArrayIndex(recipes[type], index, `Recipe in type ${type}`);

  const updatedRecipes = { ...recipes };
  const deletedRecipe = updatedRecipes[type][index];
  updatedRecipes[type] = updatedRecipes[type].filter((_, i) => i !== index);

  return {
    recipes: updatedRecipes,
    deletedRecipe,
  };
};

// Only export the functions that are actually used
const storageOperations = {
  addRecipeToData,
  updateRecipeInData,
  removeRecipeFromData,
};

export default storageOperations;
