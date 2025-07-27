import * as queries from "./core/queries.js";
import * as mutations from "./core/mutations.js";
import * as calculations from "./core/calculations.js";
import * as utilities from "./core/utilities.js";
import * as arrayOps from "./data/storageOperations.js";

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
 * Create recipe service functions
 * @returns {Object} Recipe service functions
 */
export const createRecipeServiceFunctions = () => {
  console.log("Creating recipe service functions...");

  return {
    // Initialize service
    initialize: utilities.initializeService,

    // Query operations
    getAllRecipes: queries.getAllRecipes,
    getRecipesByType: queries.getRecipesByType,
    getRecipeById: queries.getRecipeById,
    filterRecipes: queries.filterRecipes,
    getRecipesByComponent: queries.getRecipesByComponent,
    getArtisanSkills: queries.getArtisanSkills,
    getGatheringSkills: queries.getGatheringSkills,
    getStatistics: queries.getStatistics,

    // Mutation operations
    addRecipe: mutations.addRecipe,
    updateRecipe: mutations.updateRecipe,
    deleteRecipe: mutations.deleteRecipe,

    // Calculation operations - use correct function names
    processRecipeListToRawComponents:
      calculations.processRecipeListToRawComponents,
    breakDownRecipeToRawComponents: calculations.breakDownRecipeToRawComponents,
    calculateCostBreakdown: calculations.calculateCostBreakdown,

    // Utility operations
    healthCheck: utilities.healthCheck,
    exportData: utilities.exportData,

    // Array operations for state management
    removeRecipeFromList: (recipeList, recipeId) => {
      return recipeList.filter((item) => item.id !== recipeId);
    },
  };
};

export default createRecipeServiceFunctions;
