import * as transformers from "./transformers.js";
import * as filters from "./filters.js";
import * as sorting from "./sorting.js";
import * as fileOps from "./jsonFileOperations.js";
import * as arrayOps from "./recipeArrayOperations.js";
import { processRecipeListToRawComponents } from "./recipeCalculationService.js";

/**
 * Recipe service providing comprehensive recipe management functionality
 * All operations work with cached data for optimal performance
 */

/**
 * Get all recipes of a specific type
 * @param {string} type - Recipe type (raw_components, intermediate_recipes, etc.)
 * @returns {Array} Array of recipes of the specified type
 */
export const getRecipesByType = (type) => {
  try {
    console.log(`Getting recipes by type: ${type}`);
    const recipes = fileOps.readRecipes();

    if (!recipes || !recipes[type]) {
      console.warn(`No recipes found for type: ${type}`);
      return [];
    }

    const recipesWithType = recipes[type].map((recipe) => ({
      ...recipe,
      type: type,
    }));

    console.log(`Found ${recipesWithType.length} recipes of type ${type}`);
    return recipesWithType;
  } catch (error) {
    console.error(`Error getting recipes by type ${type}:`, error);
    return [];
  }
};

/**
 * Get all recipes as flattened array with type information
 * @returns {Array} Array of all recipes
 */
export const getAllRecipes = () => {
  try {
    console.log("Getting all recipes");
    const recipes = fileOps.readRecipes();
    const flattened = transformers.flattenRecipes(recipes);
    console.log(`Found ${flattened.length} total recipes`);
    return flattened;
  } catch (error) {
    console.error("Error getting all recipes:", error);
    return [];
  }
};

/**
 * Filter recipes by various criteria
 * @param {Object} filterCriteria - Filtering options
 * @returns {Array} Filtered recipes
 */
export const filterRecipes = (filterCriteria = {}) => {
  try {
    console.log("Filtering recipes with criteria:", filterCriteria);
    const allRecipes = getAllRecipes();

    if (Object.keys(filterCriteria).length === 0) {
      return allRecipes;
    }

    const filterFunction = filters.createFilterFunction(filterCriteria);
    const filtered = allRecipes.filter(filterFunction);

    console.log(`Filtered to ${filtered.length} recipes`);
    return filtered;
  } catch (error) {
    console.error("Error filtering recipes:", error);
    return [];
  }
};

/**
 * Get recipe by ID
 * @param {number} id - Recipe ID
 * @returns {Object|null} Recipe object or null if not found
 */
export const getRecipeById = (id) => {
  try {
    const allRecipes = getAllRecipes();
    const recipe = allRecipes.find((recipe) => recipe.id === id);

    if (!recipe) {
      console.warn(`Recipe with ID ${id} not found`);
      return null;
    }

    return recipe;
  } catch (error) {
    console.error(`Error getting recipe by ID ${id}:`, error);
    return null;
  }
};

/**
 * Add a new recipe
 * @param {string} type - Recipe type
 * @param {Object} recipe - Recipe object to add
 * @returns {Object} Success response with added recipe
 */
export const addRecipe = (type, recipe) => {
  try {
    console.log(`Adding recipe to ${type}:`, recipe);
    const currentData = fileOps.readRecipes();
    // Use arrayOps instead of transformers for CRUD operations
    const updatedData = arrayOps.addRecipeToData(currentData, type, recipe);

    fileOps.writeRecipes(updatedData);

    console.log("Recipe added successfully");
    return {
      success: true,
      message: "Recipe added successfully",
      data: recipe,
    };
  } catch (error) {
    console.error("Error adding recipe:", error);
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
};

/**
 * Update an existing recipe
 * @param {number} id - Recipe ID to update
 * @param {Object} updates - Fields to update
 * @returns {Object} Success response with updated recipe
 */
export const updateRecipe = (id, updates) => {
  try {
    console.log(`Updating recipe ${id} with:`, updates);
    const currentData = fileOps.readRecipes();

    // Find recipe location first
    const location = transformers.findRecipeLocation(id, currentData);
    if (!location) {
      return {
        success: false,
        message: `Recipe with ID ${id} not found`,
        data: null,
      };
    }

    // Use arrayOps for the actual update
    const result = arrayOps.updateRecipeInData(
      currentData,
      location.type,
      location.index,
      updates
    );

    fileOps.writeRecipes(result.recipes);

    console.log("Recipe updated successfully");
    return {
      success: true,
      message: "Recipe updated successfully",
      data: result.updatedRecipe,
    };
  } catch (error) {
    console.error("Error updating recipe:", error);
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
};

/**
 * Delete a recipe by ID
 * @param {number} id - Recipe ID to delete
 * @returns {Object} Success response with deleted recipe
 */
export const deleteRecipe = (id) => {
  try {
    console.log(`Deleting recipe with ID: ${id}`);
    const currentData = fileOps.readRecipes();

    // Find recipe location first
    const location = transformers.findRecipeLocation(id, currentData);
    if (!location) {
      return {
        success: false,
        message: `Recipe with ID ${id} not found`,
        data: null,
      };
    }

    // Use arrayOps for the actual deletion
    const result = arrayOps.removeRecipeFromData(
      currentData,
      location.type,
      location.index
    );

    fileOps.writeRecipes(result.recipes);

    console.log("Recipe deleted successfully");
    return {
      success: true,
      message: "Recipe deleted successfully",
      data: result.deletedRecipe,
    };
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
};

/**
 * Get recipes that use a specific component
 * @param {number} componentId - Component ID to search for
 * @returns {Array} Recipes that use this component
 */
export const getRecipesByComponent = (componentId) => {
  try {
    console.log(`Finding recipes that use component ID: ${componentId}`);
    const allRecipes = getAllRecipes();
    const recipesUsingComponent = allRecipes.filter((recipe) =>
      recipe.recipe?.components?.some(
        (component) => component.id === componentId
      )
    );

    console.log(
      `Found ${recipesUsingComponent.length} recipes using component ${componentId}`
    );
    return recipesUsingComponent;
  } catch (error) {
    console.error("Error finding recipes by component:", error);
    return [];
  }
};

/**
 * Get all unique artisan skills
 * @returns {Array} Array of unique artisan skills
 */
export const getArtisanSkills = () => {
  try {
    const allRecipes = getAllRecipes();
    const skills = [
      ...new Set(
        allRecipes.map((recipe) => recipe.recipe?.artisanSkill).filter(Boolean)
      ),
    ];

    console.log(`Found ${skills.length} unique artisan skills`);
    return skills.sort();
  } catch (error) {
    console.error("Error getting artisan skills:", error);
    return [];
  }
};

/**
 * Get all unique gathering skills
 * @returns {Array} Array of unique gathering skills
 */
export const getGatheringSkills = () => {
  try {
    const allRecipes = getAllRecipes();
    const skills = [
      ...new Set(
        allRecipes.map((recipe) => recipe.gathering?.skill).filter(Boolean)
      ),
    ];

    console.log(`Found ${skills.length} unique gathering skills`);
    return skills.sort();
  } catch (error) {
    console.error("Error getting gathering skills:", error);
    return [];
  }
};

/**
 * Get comprehensive recipe statistics
 * @returns {Object} Statistics about recipes
 */
export const getStatistics = () => {
  try {
    const recipes = fileOps.readRecipes();
    const allRecipes = getAllRecipes();

    const stats = {
      totalRecipes: allRecipes.length,
      byType: {},
      artisanSkills: getArtisanSkills().length,
      gatheringSkills: getGatheringSkills().length,
      lastUpdated: recipes.metadata?.lastUpdated || "Unknown",
    };

    // Count by type
    Object.keys(recipes).forEach((type) => {
      if (Array.isArray(recipes[type])) {
        stats.byType[type] = recipes[type].length;
      }
    });

    console.log("Recipe statistics:", stats);
    return stats;
  } catch (error) {
    console.error("Error getting statistics:", error);
    return {
      totalRecipes: 0,
      byType: {},
      artisanSkills: 0,
      gatheringSkills: 0,
      lastUpdated: "Error",
    };
  }
};

/**
 * Search recipes with advanced options
 * @param {Object} searchOptions - Search criteria and options
 * @returns {Object} Search results with metadata
 */
export const searchRecipes = (searchOptions = {}) => {
  const {
    filters: filterCriteria,
    sortBy = "name",
    sortOrder = "asc",
    limit,
    offset = 0,
  } = searchOptions;

  let results = filterRecipes(filterCriteria || {});

  // Use dedicated sorting service
  if (sortBy) {
    results = sorting.sortRecipes(results, sortBy, sortOrder);
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
    console.log("Initializing recipe service...");

    if (!fileOps.recipesFileExists()) {
      console.log("Recipe file not found, initializing with default data");
      const defaultData = fileOps.initializeRecipes();
      fileOps.writeRecipes(defaultData);
    }

    const recipes = fileOps.readRecipes();
    console.log("Recipe service initialized successfully");

    return {
      success: true,
      message: "Recipe service initialized",
      data: recipes,
    };
  } catch (error) {
    console.error("Error initializing recipe service:", error);
    throw new Error(`Failed to initialize recipe service: ${error.message}`);
  }
};

// Helper functions for finding recipes by identifier
export const findRecipeByIdentifier = (identifier) => {
  try {
    const allRecipes = getAllRecipes();

    // Try by ID first (if identifier is numeric)
    const numericId = parseInt(identifier);
    if (!isNaN(numericId)) {
      const recipeById = allRecipes.find((recipe) => recipe.id === numericId);
      if (recipeById) return recipeById;
    }

    // Try by exact name match
    const recipeByName = allRecipes.find(
      (recipe) => recipe.name.toLowerCase() === identifier.toLowerCase()
    );
    if (recipeByName) return recipeByName;

    console.warn(`Recipe not found for identifier: ${identifier}`);
    return null;
  } catch (error) {
    console.error(`Error finding recipe by identifier ${identifier}:`, error);
    return null;
  }
};

export const findRawComponentByIdentifier = (identifier) => {
  try {
    const rawComponents = getRecipesByType("raw_components");

    // Try by ID first (if identifier is numeric)
    const numericId = parseInt(identifier);
    if (!isNaN(numericId)) {
      const componentById = rawComponents.find(
        (component) => component.id === numericId
      );
      if (componentById) return componentById;
    }

    // Try by exact name match
    const componentByName = rawComponents.find(
      (component) => component.name.toLowerCase() === identifier.toLowerCase()
    );
    if (componentByName) return componentByName;

    console.warn(`Raw component not found for identifier: ${identifier}`);
    return null;
  } catch (error) {
    console.error(
      `Error finding raw component by identifier ${identifier}:`,
      error
    );
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
    getRecipesByType,
    getRecipeById,
    addRecipe,
    updateRecipe,
    deleteRecipe,

    // Filtering and searching
    filterRecipes,
    searchRecipes,
    getRecipesByComponent,

    // Utility functions
    getArtisanSkills,
    getGatheringSkills,
    getStatistics,
    isRecipeAlreadyAdded: arrayOps.isRecipeAlreadyAdded,

    // Recipe processing functions
    processRecipeListToRawComponents, // Add this missing function

    // Helper functions
    findRecipeByIdentifier,
    findRawComponentByIdentifier,

    // Initialization
    initialize,
  };
};

export default {
  ...createRecipeServiceFunctions(),
};
