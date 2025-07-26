import * as queries from "./recipeQueries.js";
import * as mutations from "./recipeMutations.js";
import * as utilities from "./recipeUtilities.js";
import * as arrayOps from "./recipeArrayOperations.js";
import { processRecipeListToRawComponents } from "./recipeCalculationService.js";

/**
 * Main recipe service - aggregates all recipe operations
 * This is the main entry point for recipe functionality
 */

// Re-export all functions with organized grouping
export const {
  getAllRecipes,
  getRecipesByType,
  getRecipeById,
  getRecipesByComponent,
  filterRecipes,
  searchRecipes,
} = queries;

export const { addRecipe, updateRecipe, deleteRecipe } = mutations;

export const {
  getArtisanSkills,
  getGatheringSkills,
  getStatistics,
  findRecipeByIdentifier,
  findRawComponentByIdentifier,
  initialize,
} = utilities;

/**
 * Factory function to create recipe service functions
 * @returns {Object} Object containing all recipe service functions
 */
export const createRecipeServiceFunctions = () => {
  return {
    // CRUD operations (now async)
    getAllRecipes,
    getRecipesByType,
    getRecipeById,
    addRecipe,
    updateRecipe,
    deleteRecipe,

    // Filtering and searching (now async)
    filterRecipes,
    searchRecipes,
    getRecipesByComponent,

    // Utility functions (now async)
    getArtisanSkills,
    getGatheringSkills,
    getStatistics,
    isRecipeAlreadyAdded: arrayOps.isRecipeAlreadyAdded,

    // Recipe processing functions
    processRecipeListToRawComponents,

    // Helper functions (now async)
    findRecipeByIdentifier,
    findRawComponentByIdentifier,

    // Initialization (already async)
    initialize,
  };
};

const recipeService = {
  ...createRecipeServiceFunctions(),
};

export default recipeService;
