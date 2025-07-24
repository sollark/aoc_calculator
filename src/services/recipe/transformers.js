import { VALID_RECIPE_TYPES } from "./constants.js";

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
 * Sort recipes by multiple criteria
 * @param {Array} recipes - Recipes to sort
 * @param {Array} sortCriteria - Array of sort criteria objects
 * @returns {Array} Sorted recipes
 */
export const sortRecipes = (recipes, sortCriteria = []) => {
  if (sortCriteria.length === 0) {
    return [...recipes];
  }

  return [...recipes].sort((a, b) => {
    for (const { field, direction = "asc" } of sortCriteria) {
      const aValue = getNestedProperty(a, field);
      const bValue = getNestedProperty(b, field);

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      else if (aValue > bValue) comparison = 1;

      if (comparison !== 0) {
        return direction === "desc" ? -comparison : comparison;
      }
    }
    return 0;
  });
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
 * @returns {Object} New object with updated property
 */
export const setNestedProperty = (obj, path, value) => {
  const keys = path.split(".");
  const lastKey = keys.pop();

  const target = keys.reduce(
    (current, key) => {
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
      return current[key];
    },
    { ...obj }
  );

  target[lastKey] = value;
  return obj;
};

/**
 * Transform recipe for API response
 * @param {Object} recipe - Recipe to transform
 * @returns {Object} Transformed recipe
 */
export const transformForResponse = (recipe) => ({
  ...recipe,
  // Add computed fields
  hasComponents: Boolean(recipe.recipe?.components?.length),
  componentCount: recipe.recipe?.components?.length || 0,
  isGatherable: Boolean(recipe.gathering),
  isCraftable: Boolean(recipe.recipe),
});
