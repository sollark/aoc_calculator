import { VALID_RECIPE_TYPES, RECIPE_TYPES } from "../constants.js";
import {
  InvalidRecipeTypeError,
  ValidationError,
  RecipeNotFoundError,
} from "../../../utils/errorHandler.js";

/**
 * RECIPE VALIDATION MODULE
 *
 * This module provides comprehensive validation for recipe data across all operations.
 * Supports both full recipe validation (for creates) and partial validation (for updates).
 *
 * DESIGN PRINCIPLES:
 * - Single source of truth for validation logic
 * - Flexible validation for create vs update scenarios
 * - Type-specific structure validation
 * - Clear, actionable error messages
 */

// ==========================================
// CORE VALIDATION FUNCTIONS
// ==========================================

/**
 * Validate recipe type
 * @param {string} type - Recipe type to validate
 * @throws {InvalidRecipeTypeError} If type is invalid
 */
export const validateRecipeType = (type) => {
  if (!VALID_RECIPE_TYPES.includes(type)) {
    throw new InvalidRecipeTypeError(type, VALID_RECIPE_TYPES);
  }
};

/**
 * Validate recipe data with support for create vs update scenarios
 *
 * @param {Object} recipe - Recipe to validate
 * @param {boolean} isUpdate - Whether this is an update operation (makes some fields optional)
 * @throws {ValidationError} If validation fails
 *
 * @example
 * // For creating new recipes (all required fields must be present):
 * validateRecipe(newRecipe, false);
 *
 * @example
 * // For updating existing recipes (only provided fields are validated):
 * validateRecipe(updates, true);
 */
export const validateRecipe = (recipe, isUpdate = false) => {
  if (!recipe || typeof recipe !== "object") {
    throw new ValidationError("recipe", "Recipe must be an object");
  }

  // ==========================================
  // ID VALIDATION
  // ==========================================

  // For updates, ID changes are not allowed but ID field is optional if not provided
  if (isUpdate && "id" in recipe) {
    throw new ValidationError("id", "ID cannot be updated");
  }

  // For new recipes, ID is required; for updates, it's optional
  if (!isUpdate && !recipe.id) {
    throw new ValidationError("id", "ID is required for new recipes");
  }

  // Validate ID format if present
  if (recipe.id !== undefined) {
    if (typeof recipe.id !== "number" || !Number.isInteger(recipe.id)) {
      throw new ValidationError("id", "ID must be an integer");
    }

    if (recipe.id <= 0) {
      throw new ValidationError("id", "ID must be a positive integer");
    }
  }

  // ==========================================
  // NAME VALIDATION
  // ==========================================

  // For updates, name is optional; for new recipes, it's required
  if (!isUpdate && !recipe.name) {
    throw new ValidationError("name", "Name is required for new recipes");
  }

  // Validate name format if present
  if (recipe.name !== undefined) {
    if (typeof recipe.name !== "string" || recipe.name.trim() === "") {
      throw new ValidationError("name", "Name must be a non-empty string");
    }

    if (recipe.name.length > 100) {
      throw new ValidationError("name", "Name must be 100 characters or less");
    }
  }

  // ==========================================
  // OPTIONAL FIELD VALIDATION
  // ==========================================

  // Validate description if present (regardless of create/update)
  if (recipe.description !== undefined) {
    if (typeof recipe.description !== "string") {
      throw new ValidationError("description", "Description must be a string");
    }

    if (recipe.description.length > 500) {
      throw new ValidationError(
        "description",
        "Description must be 500 characters or less"
      );
    }
  }

  // Validate requirements if present
  if (recipe.requirements !== undefined) {
    if (
      typeof recipe.requirements !== "object" ||
      recipe.requirements === null
    ) {
      throw new ValidationError(
        "requirements",
        "Requirements must be an object"
      );
    }
  }

  // Validate recipe composition if present
  if (recipe.recipe !== undefined) {
    validateRecipeComposition(recipe.recipe);
  }

  // Validate gathering information if present (for raw components)
  if (recipe.gathering !== undefined) {
    validateGatheringInfo(recipe.gathering);
  }
};

/**
 * Validate recipe structure based on type
 *
 * @param {Object} recipe - Recipe to validate
 * @param {string} type - Recipe type
 * @param {boolean} isUpdate - Whether this is an update operation
 * @throws {ValidationError} If structure is invalid
 */
export const validateRecipeStructure = (recipe, type, isUpdate = false) => {
  validateRecipeType(type);

  switch (type) {
    case RECIPE_TYPES.RAW_COMPONENTS:
      validateRawComponentStructure(recipe, isUpdate);
      break;
    case RECIPE_TYPES.INTERMEDIATE_RECIPES:
    case RECIPE_TYPES.CRAFTED_ITEMS:
      validateCraftedRecipeStructure(recipe, isUpdate);
      break;
    default:
      throw new InvalidRecipeTypeError(type, VALID_RECIPE_TYPES);
  }
};

// ==========================================
// SPECIFIC STRUCTURE VALIDATORS
// ==========================================

/**
 * Validate raw component structure
 * @param {Object} component - Raw component to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @throws {ValidationError} If structure is invalid
 */
const validateRawComponentStructure = (component, isUpdate = false) => {
  // For new raw components, gathering info is required
  if (!isUpdate && !component.gathering) {
    throw new ValidationError(
      "gathering",
      "Raw components must have gathering information"
    );
  }

  // If gathering info is provided (create or update), validate it
  if (component.gathering) {
    validateGatheringInfo(component.gathering);
  }
};

/**
 * Validate crafted recipe structure
 * @param {Object} recipe - Crafted recipe to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @throws {ValidationError} If structure is invalid
 */
const validateCraftedRecipeStructure = (recipe, isUpdate = false) => {
  // For new crafted items, recipe info is required
  if (!isUpdate && !recipe.recipe) {
    throw new ValidationError(
      "recipe",
      "Crafted items must have recipe information"
    );
  }

  // If recipe info is provided (create or update), validate it
  if (recipe.recipe) {
    validateRecipeComposition(recipe.recipe);
  }
};

/**
 * Validate recipe composition details
 * @param {Object} recipeInfo - Recipe composition to validate
 * @throws {ValidationError} If composition is invalid
 */
const validateRecipeComposition = (recipeInfo) => {
  if (!recipeInfo || typeof recipeInfo !== "object") {
    throw new ValidationError("recipe", "Recipe composition must be an object");
  }

  // Validate artisan skill if present
  if (recipeInfo.artisanSkill !== undefined) {
    if (
      typeof recipeInfo.artisanSkill !== "string" ||
      recipeInfo.artisanSkill.trim() === ""
    ) {
      throw new ValidationError(
        "recipe.artisanSkill",
        "Artisan skill must be a non-empty string"
      );
    }
  }

  // Validate work station if present
  if (recipeInfo.workStation !== undefined) {
    if (
      typeof recipeInfo.workStation !== "string" ||
      recipeInfo.workStation.trim() === ""
    ) {
      throw new ValidationError(
        "recipe.workStation",
        "Work station must be a non-empty string"
      );
    }
  }

  // Validate components if present
  if (recipeInfo.components !== undefined) {
    if (!Array.isArray(recipeInfo.components)) {
      throw new ValidationError(
        "recipe.components",
        "Components must be an array"
      );
    }

    // Validate each component
    recipeInfo.components.forEach((component, index) => {
      validateComponent(component, `recipe.components[${index}]`);
    });
  }
};

/**
 * Validate gathering information
 * @param {Object} gatheringInfo - Gathering info to validate
 * @throws {ValidationError} If gathering info is invalid
 */
const validateGatheringInfo = (gatheringInfo) => {
  if (!gatheringInfo || typeof gatheringInfo !== "object") {
    throw new ValidationError(
      "gathering",
      "Gathering information must be an object"
    );
  }

  if (gatheringInfo.skill !== undefined) {
    if (
      typeof gatheringInfo.skill !== "string" ||
      gatheringInfo.skill.trim() === ""
    ) {
      throw new ValidationError(
        "gathering.skill",
        "Gathering skill must be a non-empty string"
      );
    }
  }

  if (gatheringInfo.level !== undefined) {
    if (typeof gatheringInfo.level !== "number" || gatheringInfo.level < 0) {
      throw new ValidationError(
        "gathering.level",
        "Gathering level must be a non-negative number"
      );
    }
  }
};

/**
 * Validate individual component
 * @param {Object} component - Component to validate
 * @param {string} fieldPath - Field path for error messages
 * @throws {ValidationError} If component is invalid
 */
const validateComponent = (component, fieldPath) => {
  if (!component || typeof component !== "object") {
    throw new ValidationError(fieldPath, "Component must be an object");
  }

  // Validate component ID
  if (component.id !== undefined) {
    if (typeof component.id !== "number" || !Number.isInteger(component.id)) {
      throw new ValidationError(
        `${fieldPath}.id`,
        "Component ID must be an integer"
      );
    }
  }

  // Validate component name (either name or item field)
  const componentName = component.name || component.item;
  if (componentName !== undefined) {
    if (typeof componentName !== "string" || componentName.trim() === "") {
      throw new ValidationError(
        `${fieldPath}.name`,
        "Component name must be a non-empty string"
      );
    }
  }

  // Validate quantity
  if (component.quantity !== undefined) {
    if (typeof component.quantity !== "number" || component.quantity <= 0) {
      throw new ValidationError(
        `${fieldPath}.quantity`,
        "Component quantity must be a positive number"
      );
    }
  }
};

// ==========================================
// UTILITY VALIDATORS
// ==========================================

/**
 * Validate array index exists
 * @param {Array} array - Array to check
 * @param {number} index - Index to validate
 * @param {string} context - Context for error message
 * @throws {RecipeNotFoundError} If index is invalid
 */
export const validateArrayIndex = (array, index, context = "item") => {
  if (!array || !Array.isArray(array)) {
    throw new RecipeNotFoundError(`Invalid array for ${context}`);
  }

  if (!Number.isInteger(index) || index < 0 || index >= array.length) {
    throw new RecipeNotFoundError(`${context} at index ${index} not found`);
  }
};

/**
 * Validate recipes data structure
 * @param {Object} recipes - Recipes data to validate
 * @throws {ValidationError} If structure is invalid
 */
export const validateRecipesData = (recipes) => {
  if (!recipes || typeof recipes !== "object") {
    throw new ValidationError("recipes", "Recipes must be an object");
  }

  // Validate each recipe type if present
  VALID_RECIPE_TYPES.forEach((type) => {
    if (recipes[type] !== undefined && !Array.isArray(recipes[type])) {
      throw new ValidationError(`recipes.${type}`, `${type} must be an array`);
    }
  });
};

/**
 * Validate that a recipe ID is unique within a type
 * @param {Array} existingRecipes - Array of existing recipes of the same type
 * @param {number|string} newId - ID to check for uniqueness
 * @param {number|string} [excludeId] - ID to exclude from uniqueness check (for updates)
 * @throws {ValidationError} If ID is not unique
 */
export const validateUniqueId = (existingRecipes, newId, excludeId = null) => {
  if (!Array.isArray(existingRecipes)) {
    return; // No existing recipes to check against
  }

  const isDuplicate = existingRecipes.some((recipe) => {
    const recipeId = recipe.id;
    const isCurrentRecipe =
      excludeId !== null &&
      (recipeId === excludeId ||
        recipeId === String(excludeId) ||
        recipeId === Number(excludeId));

    return (
      !isCurrentRecipe &&
      (recipeId === newId ||
        recipeId === String(newId) ||
        recipeId === Number(newId))
    );
  });

  if (isDuplicate) {
    throw new ValidationError("id", `Recipe with ID ${newId} already exists`);
  }
};

// ==========================================
// REMOVED FUNCTIONS (for reference)
// ==========================================

/**
 * REMOVED: validateUpdates() - Use validateRecipe(updates, true) instead
 *
 * Old function name preserved in comments for backward compatibility tracking:
 * - validateUpdates() -> validateRecipe(data, true)
 */
