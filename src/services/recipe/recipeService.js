import * as queries from "./core/queries.js";
import * as mutations from "./core/mutations.js";
import * as calculations from "./core/calculations.js";
import * as utilities from "./core/utilities.js";

/**
 * Create recipe service functions
 * @returns {Object} Recipe service functions
 */
export const createRecipeServiceFunctions = () => {
  console.log("Creating recipe service functions...");

  // Initialize calculation service with recipe service instance
  const recipeServiceInstance = {
    getAllRecipes: queries.getAllRecipes,
    getRecipesByType: queries.getRecipesByType,
    getRecipeById: queries.getRecipeById,
  };

  // Initialize the calculation service
  calculations.initializeCalculationService(recipeServiceInstance);

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

    // Calculation operations
    processRecipeListToRawComponents:
      calculations.processRecipeListToRawComponents,
    breakDownToRawComponents: calculations.breakDownToRawComponents,
    convertRecipeToRawComponents: calculations.convertRecipeToRawComponents,

    // Utility operations
    healthCheck: utilities.healthCheck,
    exportData: utilities.exportData,
  };
};

export default createRecipeServiceFunctions;
