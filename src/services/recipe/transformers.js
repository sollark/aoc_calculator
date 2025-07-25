import { VALID_RECIPE_TYPES } from "./constants.js";

/**
 * Data transformation utilities for recipes
 * Handles data structure manipulation and formatting
 */

/**
 * Add type information to recipe
 * @param {string} type - Recipe type
 * @returns {Function} Function that adds type to recipe
 */
export const addTypeToRecipe = (type) => (recipe) => ({ ...recipe, type });

/**
 * Flatten recipes from different categories into single array
 * @param {Object} recipes - Recipes data object
 * @returns {Array} Flattened array of all recipes with type information
 */
export const flattenRecipes = (recipes) => {
  return VALID_RECIPE_TYPES.reduce((acc, type) => {
    const recipesOfType = recipes[type] || [];
    const recipesWithType = recipesOfType.map(addTypeToRecipe(type));
    return [...acc, ...recipesWithType];
  }, []);
};

/**
 * Find recipe and its location in data structure
 * @param {number} id - Recipe ID to find
 * @param {Object} recipes - Recipes data object
 * @returns {Object|null} Object with recipe, type, and index or null if not found
 */
export const findRecipeLocation = (id, recipes) => {
  for (const type of VALID_RECIPE_TYPES) {
    if (recipes[type]) {
      const index = recipes[type].findIndex((recipe) => recipe.id === id);
      if (index !== -1) {
        return {
          recipe: recipes[type][index],
          type,
          index,
        };
      }
    }
  }
  return null;
};

/**
 * Group recipes by a specific property
 * @param {Array} recipes - Array of recipes
 * @param {string|Function} groupBy - Property name or function to group by
 * @returns {Object} Grouped recipes
 */
export const groupRecipesBy = (recipes, groupBy) => {
  const getGroupKey =
    typeof groupBy === "function"
      ? groupBy
      : (recipe) => getNestedProperty(recipe, groupBy);

  return recipes.reduce((groups, recipe) => {
    const key = getGroupKey(recipe) || "undefined";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(recipe);
    return groups;
  }, {});
};

/**
 * Extract unique values from recipes for a given property
 * @param {Array} recipes - Array of recipes
 * @param {string} propertyPath - Dot-notation path to property
 * @returns {Array} Sorted array of unique values
 */
export const extractUniqueValues = (recipes, propertyPath) => {
  const values = new Set(
    recipes
      .map((recipe) => getNestedProperty(recipe, propertyPath))
      .filter((value) => value !== undefined && value !== null)
  );
  return Array.from(values).sort();
};

/**
 * Get nested property value using dot notation
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot-notation path
 * @returns {any} Property value or undefined
 */
export const getNestedProperty = (obj, path) => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

/**
 * Set nested property value using dot notation
 * @param {Object} obj - Object to modify
 * @param {string} path - Dot-notation path
 * @param {any} value - Value to set
 * @returns {Object} Modified object
 */
export const setNestedProperty = (obj, path, value) => {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
  return obj;
};

/**
 * Transform recipe for API response
 * @param {Object} recipe - Recipe to transform
 * @returns {Object} Transformed recipe
 */
export const transformForResponse = (recipe) => {
  return {
    ...recipe,
    // Add any response-specific transformations here
  };
};

/**
 * Transform recipes data for export
 * @param {Object} recipes - Recipes data
 * @returns {Object} Transformed data suitable for export
 */
export const transformForExport = (recipes) => {
  return {
    ...recipes,
    metadata: {
      ...recipes.metadata,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    },
  };
};

/**
 * Normalize recipe data structure
 * @param {Object} rawRecipes - Raw recipe data that might have inconsistent structure
 * @returns {Object} Normalized recipe data
 */
export const normalizeRecipeData = (rawRecipes) => {
  const normalized = { ...rawRecipes };

  // Ensure all required arrays exist
  VALID_RECIPE_TYPES.forEach((type) => {
    if (!normalized[type]) {
      normalized[type] = [];
    }
  });

  // Ensure metadata exists
  if (!normalized.metadata) {
    normalized.metadata = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      totalRecipes: 0,
    };
  }

  return normalized;
};
