/**
 * Recipe service main export
 * Provides a clean API for importing recipe functionality
 */

import * as recipeService from "./recipeService.js";

// Main CRUD service functions
export {
  getRecipesByType,
  getAllRecipes,
  filterRecipes,
  getRecipeById,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByComponent,
  getArtisanSkills,
  getGatheringSkills,
  getStatistics,
  RECIPE_TYPES,
  VALID_RECIPE_TYPES,
} from "./recipeService.js";

// Recipe calculation service
export {
  createRecipeCalculationService,
  breakDownToRawComponents,
  calculateCostBreakdown,
  optimizeGatheringOrder,
  calculateRecipeDependencies,
} from "./recipeCalculationService.js";

// Utility modules for advanced use cases
export * as filters from "./filters.js";
export * as transformers from "./transformers.js";
export * as statistics from "./statistics.js";
export * as validators from "./validators.js";
export * as fileOperations from "./fileOperations.js";
export * as crudOperations from "./crudOperations.js";
export * as calculations from "./recipeCalculationService.js";

// Constants and types
// Error classes
export * from "utils/errorHandler.js";

// Default export for convenience (CRUD service)
export default recipeService;
