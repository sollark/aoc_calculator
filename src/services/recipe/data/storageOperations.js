// Formerly: arrayOperations.js
import {
  validateRecipeType,
  validateRecipe,
  validateRecipeStructure,
  validateArrayIndex,
  validateRecipesData,
  validateUniqueId,
} from "../processing/validators.js";
import { RecipeNotFoundError } from "../../../utils/errorHandler.js";
import * as storage from "./storage.js";

/**
 * RECIPE STORAGE OPERATIONS MODULE
 *
 * This module provides CRUD operations for recipe storage manipulation.
 * All functions work directly with JSON file data through the storage layer,
 * maintaining data persistence and consistency.
 *
 * DATA FLOW:
 * JSON Files ↔ storage.js ↔ storageOperations.js ↔ queries.js ↔ Application Layer
 *
 * DESIGN PRINCIPLES:
 * - Functions used by queries.js for complete CRUD operations
 * - Comprehensive validation and error handling
 * - Direct JSON file integration for persistence
 * - Consistent return structures for all operations
 */

// ==========================================
// READ OPERATIONS
// ==========================================

/**
 * Get all recipes from JSON storage
 *
 * USED BY: queries.js → loadAndCacheMetadata()
 *
 * Retrieves the complete recipe database from JSON files through the storage layer.
 * This is the primary data access point for all recipe information.
 *
 * DATA FLOW: JSON Files → storage.readRecipes() → Complete Recipe Database
 *
 * @async
 * @function getAllRecipesFromStorage
 * @returns {Promise<Object>} Complete recipes database object
 * @returns {Array} returns.crafted_items - Array of crafted item recipes
 * @returns {Array} returns.raw_components - Array of raw component recipes
 * @returns {Array} returns.intermediate_recipes - Array of intermediate recipes
 * @returns {Array} returns.artisan_levels - Array of artisan skill definitions
 * @returns {Array} returns.gathering_skills - Array of gathering skill definitions
 *
 * @throws {Error} When JSON files cannot be read or parsed
 *
 * @example
 * // Get complete recipe database:
 * const allRecipes = await getAllRecipesFromStorage();
 * console.log(`Found ${allRecipes.crafted_items.length} crafted items`);
 */
export const getAllRecipesFromStorage = async () => {
  try {
    console.log("📖 Reading all recipes from JSON storage");
    const recipes = await storage.readRecipes();

    // Validate the loaded data structure
    validateRecipesData(recipes);

    console.log("✅ Successfully loaded recipes from storage");
    return recipes;
  } catch (error) {
    console.error("❌ Error loading recipes from storage:", error);
    throw new Error(`Failed to load recipes: ${error.message}`);
  }
};

/**
 * Get recipes by specific type from JSON storage
 *
 * USED BY: queries.js → loadAndCacheRecipesByType()
 *
 * Retrieves recipes from a specific category without loading the entire database.
 * More efficient than getAllRecipes when you only need one category.
 *
 * DATA FLOW: JSON Files → storage.readRecipes() → Extract Type → Type-specific Array
 *
 * @async
 * @function getRecipesByTypeFromStorage
 * @param {string} type - Recipe type ('crafted_items', 'raw_components', 'intermediate_recipes')
 * @returns {Promise<Array>} Array of recipes for the specified type
 *
 * @throws {Error} When invalid type provided or storage read fails
 *
 * @example
 * // Get only crafted items:
 * const craftedItems = await getRecipesByTypeFromStorage('crafted_items');
 */
export const getRecipesByTypeFromStorage = async (type) => {
  try {
    validateRecipeType(type);

    console.log(`📖 Reading ${type} recipes from JSON storage`);
    const recipes = await storage.readRecipes();

    return recipes[type] || [];
  } catch (error) {
    console.error(`❌ Error loading ${type} recipes:`, error);
    throw new Error(`Failed to load ${type} recipes: ${error.message}`);
  }
};

// ==========================================
// CREATE OPERATIONS
// ==========================================

/**
 * Add a new recipe to JSON storage
 *
 * USED BY: queries.js → addRecipe()
 *
 * Adds a recipe to the specified type category and persists changes to JSON files.
 * Validates recipe data before adding and ensures storage consistency.
 *
 * DATA FLOW:
 * 1. Load current JSON data
 * 2. Validate and add new recipe
 * 3. Save updated data to JSON files
 *
 * @async
 * @function addRecipeToStorage
 * @param {string} type - Recipe type category to add to
 * @param {Object} recipe - Recipe object to add
 * @param {number|string} recipe.id - Unique recipe identifier
 * @param {string} recipe.name - Recipe name
 * @param {string} [recipe.description] - Recipe description
 * @param {Object} [recipe.requirements] - Recipe requirements
 * @param {Object} [recipe.recipe] - Recipe composition details
 * @returns {Promise<Object>} Operation result with success status and data
 * @returns {boolean} returns.success - Whether operation succeeded
 * @returns {string} returns.message - Success/error message
 * @returns {Object} returns.addedRecipe - The recipe that was added
 * @returns {Object} returns.updatedStorage - Complete updated storage object
 *
 * @throws {Error} When validation fails or storage write fails
 *
 * @example
 * // Add new crafted item:
 * const newSword = {
 *   id: 5000,
 *   name: "Epic Dragon Sword",
 *   description: "Legendary weapon",
 *   requirements: { artisan_level: 50 },
 *   recipe: { artisanSkill: "weaponsmithing", components: [...] }
 * };
 *
 * const result = await addRecipeToStorage('crafted_items', newSword);
 * if (result.success) {
 *   console.log(`Added: ${result.addedRecipe.name}`);
 * }
 */
export const addRecipeToStorage = async (type, recipe) => {
  try {
    // ==========================================
    // COMPREHENSIVE VALIDATION
    // ==========================================

    // Validate recipe type
    validateRecipeType(type);

    // Validate basic recipe structure (new recipe = false)
    validateRecipe(recipe, false);

    console.log(`➕ Adding recipe "${recipe.name}" to ${type}`);

    // Load current storage data
    const currentRecipes = await storage.readRecipes();

    // Validate ID uniqueness within the type
    const existingRecipes = currentRecipes[type] || [];
    validateUniqueId(existingRecipes, recipe.id);

    // Validate type-specific structure
    validateRecipeStructure(recipe, type, false);

    // ==========================================
    // STORAGE OPERATION
    // ==========================================

    // Create updated storage structure (immutable operation)
    const updatedRecipes = {
      ...currentRecipes,
      [type]: [...existingRecipes, recipe],
    };

    // Persist changes to JSON files
    await storage.writeRecipes(updatedRecipes);

    console.log(`✅ Successfully added recipe "${recipe.name}" to storage`);

    return {
      success: true,
      message: `Recipe "${recipe.name}" added successfully`,
      addedRecipe: recipe,
      updatedStorage: updatedRecipes,
    };
  } catch (error) {
    console.error(`❌ Error adding recipe to storage:`, error);
    return {
      success: false,
      message: `Failed to add recipe: ${error.message}`,
      addedRecipe: null,
      updatedStorage: null,
    };
  }
};

// ==========================================
// UPDATE OPERATIONS
// ==========================================

/**
 * Update an existing recipe in JSON storage
 *
 * USED BY: queries.js → updateRecipeById() (via index conversion)
 *
 * Updates a recipe by type and index, applying partial updates while preserving
 * existing data. Persists changes to JSON files.
 *
 * DATA FLOW:
 * 1. Load current JSON data
 * 2. Locate recipe by type and index
 * 3. Apply updates (merge with existing data)
 * 4. Save updated data to JSON files
 *
 * @async
 * @function updateRecipeInStorage
 * @param {string} type - Recipe type category
 * @param {number} index - Array index of recipe to update
 * @param {Object} updates - Partial updates to apply to the recipe
 * @returns {Promise<Object>} Operation result with success status and data
 * @returns {boolean} returns.success - Whether operation succeeded
 * @returns {string} returns.message - Success/error message
 * @returns {Object} returns.updatedRecipe - The recipe after updates
 * @returns {Object} returns.updatedStorage - Complete updated storage object
 *
 * @throws {Error} When recipe not found or validation fails
 *
 * @example
 * // Update recipe description:
 * const result = await updateRecipeInStorage('crafted_items', 0, {
 *   description: "Updated description",
 *   requirements: { artisan_level: 25 }
 * });
 */
export const updateRecipeInStorage = async (type, index, updates) => {
  try {
    // ==========================================
    // COMPREHENSIVE VALIDATION
    // ==========================================

    // Validate recipe type
    validateRecipeType(type);

    // ✅ FIXED: Use validateRecipe with isUpdate=true instead of validateUpdates
    validateRecipe(updates, true);

    console.log(`📝 Updating recipe at ${type}[${index}]`);

    // Load current storage data
    const currentRecipes = await storage.readRecipes();

    // Validate recipe type exists
    if (!currentRecipes[type]) {
      throw new RecipeNotFoundError(`Recipe type ${type} not found`);
    }

    // Validate array index
    validateArrayIndex(currentRecipes[type], index, `Recipe in type ${type}`);

    // Get the current recipe
    const currentRecipe = currentRecipes[type][index];

    // Create merged recipe for validation
    const mergedRecipe = {
      ...currentRecipe,
      ...updates,
    };

    // Validate the final merged recipe structure
    validateRecipeStructure(mergedRecipe, type, true);

    // If ID is being set (shouldn't happen due to validateRecipe, but double-check)
    if (updates.id && updates.id !== currentRecipe.id) {
      // Validate new ID uniqueness (excluding current recipe)
      validateUniqueId(currentRecipes[type], updates.id, currentRecipe.id);
    }

    // ==========================================
    // STORAGE OPERATION
    // ==========================================

    // Create updated storage structure (immutable operation)
    const updatedRecipes = { ...currentRecipes };
    updatedRecipes[type] = [...updatedRecipes[type]];
    updatedRecipes[type][index] = mergedRecipe;

    // Persist changes to JSON files
    await storage.writeRecipes(updatedRecipes);

    console.log(`✅ Successfully updated recipe "${mergedRecipe.name}"`);

    return {
      success: true,
      message: `Recipe "${mergedRecipe.name}" updated successfully`,
      updatedRecipe: mergedRecipe,
      updatedStorage: updatedRecipes,
    };
  } catch (error) {
    console.error(`❌ Error updating recipe in storage:`, error);
    return {
      success: false,
      message: `Failed to update recipe: ${error.message}`,
      updatedRecipe: null,
      updatedStorage: null,
    };
  }
};

// ==========================================
// DELETE OPERATIONS
// ==========================================

/**
 * Remove a recipe from JSON storage by ID
 *
 * USED BY: queries.js → removeRecipeById()
 *
 * Removes a recipe by type and ID, returning the deleted recipe for reference.
 * Persists changes to JSON files. More reliable than index-based deletion.
 *
 * DATA FLOW:
 * 1. Load current JSON data
 * 2. Locate recipe by type and ID
 * 3. Remove recipe and save updated data to JSON files
 *
 * @async
 * @function removeRecipeFromStorage
 * @param {string} type - Recipe type category
 * @param {number|string} recipeId - Unique ID of recipe to remove
 * @returns {Promise<Object>} Operation result with success status and data
 * @returns {boolean} returns.success - Whether operation succeeded
 * @returns {string} returns.message - Success/error message
 * @returns {Object} returns.deletedRecipe - The recipe that was removed
 * @returns {Object} returns.updatedStorage - Complete updated storage object
 *
 * @throws {Error} When recipe not found or storage write fails
 *
 * @example
 * // Remove recipe by ID:
 * const result = await removeRecipeFromStorage('crafted_items', 4000);
 * if (result.success) {
 *   console.log(`Removed: ${result.deletedRecipe.name}`);
 * }
 */
export const removeRecipeFromStorage = async (type, recipeId) => {
  try {
    // ==========================================
    // VALIDATION
    // ==========================================

    // Validate recipe type
    validateRecipeType(type);

    if (recipeId === null || recipeId === undefined) {
      throw new Error("Recipe ID is required");
    }

    console.log(`🗑️ Removing recipe with ID ${recipeId} from ${type}`);

    // Load current storage data
    const currentRecipes = await storage.readRecipes();

    // Validate recipe type exists
    if (!currentRecipes[type]) {
      throw new RecipeNotFoundError(`Recipe type ${type} not found`);
    }

    // ==========================================
    // FIND AND REMOVE RECIPE
    // ==========================================

    // Find the recipe by ID
    const recipeIndex = currentRecipes[type].findIndex(
      (recipe) =>
        recipe.id === recipeId ||
        recipe.id === String(recipeId) ||
        recipe.id === Number(recipeId)
    );

    if (recipeIndex === -1) {
      throw new RecipeNotFoundError(
        `Recipe with ID ${recipeId} not found in type ${type}`
      );
    }

    const deletedRecipe = currentRecipes[type][recipeIndex];

    // ==========================================
    // STORAGE OPERATION
    // ==========================================

    // Create updated storage structure (immutable operation)
    const updatedRecipes = { ...currentRecipes };
    updatedRecipes[type] = updatedRecipes[type].filter(
      (_, i) => i !== recipeIndex
    );

    // Persist changes to JSON files
    await storage.writeRecipes(updatedRecipes);

    console.log(
      `✅ Successfully removed recipe "${deletedRecipe.name}" (ID: ${recipeId}) at index ${recipeIndex}`
    );

    return {
      success: true,
      message: `Recipe "${deletedRecipe.name}" removed successfully`,
      deletedRecipe,
      updatedStorage: updatedRecipes,
    };
  } catch (error) {
    console.error(`❌ Error removing recipe from storage:`, error);
    return {
      success: false,
      message: `Failed to remove recipe: ${error.message}`,
      deletedRecipe: null,
      updatedStorage: null,
    };
  }
};

// ==========================================
// MODULE EXPORTS
// ==========================================

/**
 * Export object with only the functions used by queries.js
 *
 * CLEANED UP: Removed all unused functions for better maintainability
 * - Removed deprecated index-based removal functions
 * - Removed pure data manipulation functions (not used by queries.js)
 * - Kept only the essential CRUD operations that queries.js actually uses
 */
const storageOperations = {
  // READ operations (USED BY queries.js)
  getAllRecipesFromStorage, // USED BY: loadAndCacheMetadata()
  getRecipesByTypeFromStorage, // USED BY: loadAndCacheRecipesByType()

  // WRITE operations (USED BY queries.js)
  addRecipeToStorage, // USED BY: addRecipe()
  updateRecipeInStorage, // USED BY: updateRecipeById()
  removeRecipeFromStorage, // USED BY: removeRecipeById()
};

export default storageOperations;
