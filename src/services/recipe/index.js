/**
 * Recipe Service - Main Export
 * Organized by functionality for better developer experience
 */

// Core service
export { createRecipeServiceFunctions } from "./recipeService.js";

// Constants and types
export * from "./constants.js";

// Core operations (organized by concern)
export * as queries from "./core/queries.js";
export * as mutations from "./core/mutations.js";
export * as calculations from "./core/calculations.js";
export * as utilities from "./core/utilities.js";

// Data operations
export * as storage from "./data/storage.js";
export * as arrayOps from "./data/arrayOperations.js";

// Processing utilities
export * as filters from "./processing/filters.js";
export * as transformers from "./processing/transformers.js";
export * as validators from "./processing/validators.js";
export * as sorting from "./processing/sorting.js";

// Convenience exports for common operations
export { getAllRecipes, getRecipeById } from "./core/queries.js";

export { addRecipe, updateRecipe, deleteRecipe } from "./core/mutations.js";

export {
  processRecipeListToRawComponents,
  breakDownRecipeToRawComponents,
} from "./core/calculations.js";

// Default export
export { createRecipeServiceFunctions as default } from "./recipeService.js";
