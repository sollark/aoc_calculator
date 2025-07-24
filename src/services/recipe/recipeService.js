import * as fileOps from "./fileOperations.js";
import * as validators from "./validators.js";
import * as transformers from "./transformers.js";
import * as filters from "./filters.js";
import * as statistics from "./statistics.js";
import * as crudOps from "./crudOperations.js";
import { RECIPE_TYPES, VALID_RECIPE_TYPES } from "./constants.js";
import { RecipeNotFoundError } from "./errors.js";

/**
 * Get all recipes of a specific type
 * @param {string} type - Recipe type
 * @returns {Array} Array of recipes (sync version for browser compatibility)
 */
export const getRecipesByType = (type) => {
  validators.validateRecipeType(type);
  const recipes = fileOps.readRecipesSync();
  return recipes[type] || [];
};

/**
 * Get all recipes as flattened array with type information
 * @returns {Array} Array of all recipes
 */
export const getAllRecipes = () => {
  const recipes = fileOps.readRecipesSync();
  return transformers.flattenRecipes(recipes);
};

/**
 * Get all recipes synchronously (using cached data)
 * @returns {Array} Array of all recipes
 */
export const getAllRecipesSync = () => {
  const recipes = fileOps.readRecipesSync();
  return transformers.flattenRecipes(recipes);
};

/**
 * Filter recipes by various criteria
 * @param {Object} filterCriteria - Filtering options
 * @returns {Array} Filtered recipes
 */
export const filterRecipes = (filterCriteria = {}) => {
  const allRecipes = getAllRecipes();
  const filterFunction = filters.createFilterFunction(filterCriteria);
  return allRecipes.filter(filterFunction);
};

/**
 * Filter recipes synchronously (using cached data)
 * @param {Object} filterCriteria - Filtering options
 * @returns {Array} Filtered recipes
 */
export const filterRecipesSync = (filterCriteria = {}) => {
  const allRecipes = getAllRecipesSync();
  const filterFunction = filters.createFilterFunction(filterCriteria);
  return allRecipes.filter(filterFunction);
};

/**
 * Get recipe by ID
 * @param {number} id - Recipe ID
 * @returns {Object|null} Recipe object or null if not found
 */
export const getRecipeById = (id) => {
  const allRecipes = getAllRecipes();
  return allRecipes.find((recipe) => recipe.id === id) || null;
};

/**
 * Get recipe by ID synchronously
 * @param {number} id - Recipe ID
 * @returns {Object|null} Recipe object or null if not found
 */
export const getRecipeByIdSync = (id) => {
  const allRecipes = getAllRecipesSync();
  return allRecipes.find((recipe) => recipe.id === id) || null;
};

/**
 * Add a new recipe
 * @param {string} type - Recipe type
 * @param {Object} recipe - Recipe object to add
 * @returns {Object} Success response with added recipe
 */
export const addRecipe = (type, recipe) => {
  validators.validateRecipeType(type);
  validators.validateRecipe(recipe);
  validators.validateRecipeStructure(recipe, type);

  const allRecipes = getAllRecipes();
  validators.validateUniqueId(recipe.id, allRecipes);

  const recipes = fileOps.readRecipesSync();
  const updatedRecipes = crudOps.addRecipeToData(recipes, type, recipe);

  fileOps.writeRecipes(updatedRecipes);

  return {
    success: true,
    recipe: transformers.transformForResponse(recipe),
    type,
  };
};

/**
 * Update an existing recipe
 * @param {number} id - Recipe ID to update
 * @param {Object} updates - Fields to update
 * @returns {Object} Success response with updated recipe
 */
export const updateRecipe = (id, updates) => {
  validators.validateUpdates(updates);

  const recipes = fileOps.readRecipesSync();
  const location = transformers.findRecipeLocation(id, recipes);

  if (!location) {
    throw new RecipeNotFoundError(id);
  }

  const { recipes: updatedRecipes, updatedRecipe } = crudOps.updateRecipeInData(
    recipes,
    location.type,
    location.index,
    updates
  );

  fileOps.writeRecipes(updatedRecipes);

  return {
    success: true,
    recipe: transformers.transformForResponse(updatedRecipe),
    type: location.type,
  };
};

/**
 * Delete a recipe by ID
 * @param {number} id - Recipe ID to delete
 * @returns {Object} Success response with deleted recipe
 */
export const deleteRecipe = (id) => {
  const recipes = fileOps.readRecipesSync();
  const location = transformers.findRecipeLocation(id, recipes);

  if (!location) {
    throw new RecipeNotFoundError(id);
  }

  const { recipes: updatedRecipes, deletedRecipe } =
    crudOps.removeRecipeFromData(recipes, location.type, location.index);

  fileOps.writeRecipes(updatedRecipes);

  return {
    success: true,
    deletedRecipe: transformers.transformForResponse(deletedRecipe),
    type: location.type,
  };
};

/**
 * Get recipes that use a specific component
 * @param {number} componentId - Component ID to search for
 * @returns {Array} Recipes that use this component
 */
export const getRecipesByComponent = (componentId) => {
  return filterRecipes({ componentUsage: componentId });
};

/**
 * Get all unique artisan skills
 * @returns {Array} Array of unique artisan skills
 */
export const getArtisanSkills = () => {
  const allRecipes = getAllRecipes();
  return transformers.extractUniqueValues(allRecipes, "recipe.artisanSkill");
};

/**
 * Get all unique gathering skills
 * @returns {Array} Array of unique gathering skills
 */
export const getGatheringSkills = () => {
  const allRecipes = getAllRecipes();
  return transformers.extractUniqueValues(allRecipes, "gathering.skill");
};

/**
 * Get comprehensive recipe statistics
 * @returns {Object} Statistics about recipes
 */
export const getStatistics = () => {
  const recipes = fileOps.readRecipesSync();
  const allRecipes = transformers.flattenRecipes(recipes);
  return statistics.calculateComprehensiveStatistics(recipes, allRecipes);
};

/**
 * Search recipes with advanced options
 * @param {Object} searchOptions - Search criteria and options
 * @returns {Object} Search results with metadata
 */
export const searchRecipes = (searchOptions = {}) => {
  const { filters: filterCriteria, sort, limit, offset = 0 } = searchOptions;

  let results = filterRecipes(filterCriteria || {});

  if (sort && transformers.sortRecipes) {
    results = transformers.sortRecipes(results, sort);
  }

  const total = results.length;

  if (limit) {
    results = results.slice(offset, offset + limit);
  }

  return {
    results: results.map(transformers.transformForResponse),
    metadata: {
      total,
      limit,
      offset,
      hasMore: limit && offset + limit < total,
    },
  };
};

/**
 * Initialize the recipe service with data
 * @returns {Promise<Object>} Loaded recipes data
 */
export const initialize = async () => {
  try {
    return await fileOps.readRecipes();
  } catch (error) {
    console.warn(
      "Could not load recipes, initializing with defaults:",
      error.message
    );
    return fileOps.initializeRecipes();
  }
};

// Helper functions for finding recipes by identifier
export const findRecipeByIdentifier = (identifier) => {
  try {
    const allRecipes = getAllRecipesSync();
    return allRecipes.find(
      (recipe) => recipe.name === identifier || recipe.id === identifier
    );
  } catch (error) {
    console.warn("Could not find recipe:", identifier);
    return null;
  }
};

export const findRawComponentByIdentifier = (identifier) => {
  try {
    const recipes = fileOps.readRecipesSync();
    const rawComponents = recipes.raw_components || [];
    return rawComponents.find(
      (component) =>
        component.name === identifier || component.id === identifier
    );
  } catch (error) {
    console.warn("Could not find raw component:", identifier);
    return null;
  }
};

/**
 * Factory function to create recipe service functions
 * @returns {Object} Object containing all recipe service functions
 */
export const createRecipeServiceFunctions = () => {
  return {
    // CRUD operations
    getAllRecipes,
    getAllRecipesSync,
    getRecipesByType,
    getRecipeById,
    getRecipeByIdSync,
    addRecipe,
    updateRecipe,
    deleteRecipe,

    // Filtering and searching
    filterRecipes,
    filterRecipesSync,
    searchRecipes,
    getRecipesByComponent,

    // Metadata operations
    getArtisanSkills,
    getGatheringSkills,
    getStatistics,

    // Helper functions
    findRecipeByIdentifier,
    findRawComponentByIdentifier,

    // Initialization
    initialize,

    // Constants
    RECIPE_TYPES,
    VALID_RECIPE_TYPES,
  };
};

// Export constants
export { RECIPE_TYPES, VALID_RECIPE_TYPES };

// Re-export error classes
export * from "./errors.js";
