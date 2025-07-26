import { VALID_RECIPE_TYPES, RECIPE_TYPES } from "./constants.js";
import {
  InvalidRecipeTypeError,
  ValidationError,
  DuplicateRecipeError,
  RecipeNotFoundError,
} from "../../utils/errorHandler.js";

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
 * Validate recipe has required fields
 * @param {Object} recipe - Recipe to validate
 * @throws {ValidationError} If validation fails
 */
export const validateRecipe = (recipe) => {
  const requiredFields = ["id", "name"];

  for (const field of requiredFields) {
    if (!recipe[field]) {
      throw new ValidationError(field, `${field} is required`);
    }
  }

  // Validate ID is a number
  if (typeof recipe.id !== "number" || !Number.isInteger(recipe.id)) {
    throw new ValidationError("id", "ID must be an integer");
  }

  // Validate name is not empty string
  if (typeof recipe.name !== "string" || recipe.name.trim() === "") {
    throw new ValidationError("name", "Name must be a non-empty string");
  }
};

/**
 * Check if recipe ID already exists
 * @param {number} id - Recipe ID to check
 * @param {Array} allRecipes - Array of all recipes
 * @throws {DuplicateRecipeError} If ID already exists
 */
export const validateUniqueId = (id, allRecipes) => {
  const existing = allRecipes.find((recipe) => recipe.id === id);
  if (existing) {
    throw new DuplicateRecipeError(id);
  }
};

/**
 * Validate recipe structure based on type
 * @param {Object} recipe - Recipe to validate
 * @param {string} type - Recipe type
 * @throws {ValidationError} If structure is invalid
 */
export const validateRecipeStructure = (recipe, type) => {
  switch (type) {
    case RECIPE_TYPES.RAW_COMPONENTS:
      validateRawComponent(recipe);
      break;
    case RECIPE_TYPES.INTERMEDIATE_RECIPES:
    case RECIPE_TYPES.CRAFTED_ITEMS:
      validateCraftedRecipe(recipe);
      break;
    default:
      throw new InvalidRecipeTypeError(type, VALID_RECIPE_TYPES);
  }
};

/**
 * Validate raw component structure
 * @param {Object} component - Raw component to validate
 * @throws {ValidationError} If structure is invalid
 */
const validateRawComponent = (component) => {
  if (!component.gathering) {
    throw new ValidationError(
      "gathering",
      "Raw components must have gathering information"
    );
  }

  if (!component.gathering.skill) {
    throw new ValidationError("gathering.skill", "Gathering skill is required");
  }
};

/**
 * Validate crafted recipe structure
 * @param {Object} recipe - Crafted recipe to validate
 * @throws {ValidationError} If structure is invalid
 */
const validateCraftedRecipe = (recipe) => {
  if (!recipe.recipe) {
    throw new ValidationError(
      "recipe",
      "Crafted items must have recipe information"
    );
  }

  if (!recipe.recipe.artisanSkill) {
    throw new ValidationError(
      "recipe.artisanSkill",
      "Artisan skill is required"
    );
  }

  if (!recipe.recipe.components || !Array.isArray(recipe.recipe.components)) {
    throw new ValidationError(
      "recipe.components",
      "Components must be an array"
    );
  }
};

/**
 * Validate update data
 * @param {Object} updates - Updates to validate
 * @throws {ValidationError} If updates are invalid
 */
export const validateUpdates = (updates) => {
  if (!updates || typeof updates !== "object") {
    throw new ValidationError("updates", "Updates must be an object");
  }

  // Don't allow ID changes
  if ("id" in updates) {
    throw new ValidationError("id", "ID cannot be updated");
  }
};

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

  if (index < 0 || index >= array.length) {
    throw new RecipeNotFoundError(`${context} at index ${index} not found`);
  }
};

/**
 * Validate bulk update data structure
 * @param {Array} updates - Array of update objects
 * @throws {ValidationError} If structure is invalid
 */
export const validateBulkUpdates = (updates) => {
  if (!Array.isArray(updates)) {
    throw new ValidationError("updates", "Bulk updates must be an array");
  }

  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];

    if (!update || typeof update !== "object") {
      throw new ValidationError(`updates[${i}]`, "Update must be an object");
    }

    if (!update.id) {
      throw new ValidationError(`updates[${i}].id`, "Update must have an ID");
    }

    if (!update.updates || typeof update.updates !== "object") {
      throw new ValidationError(
        `updates[${i}].updates`,
        "Update must have updates object"
      );
    }

    // Validate individual update data
    validateUpdates(update.updates);
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
};

/**
 * Validate new recipes array for bulk operations
 * @param {Array} newRecipes - Array of recipes to validate
 * @throws {ValidationError} If array is invalid
 */
export const validateNewRecipesArray = (newRecipes) => {
  if (!Array.isArray(newRecipes)) {
    throw new ValidationError("newRecipes", "New recipes must be an array");
  }

  // Validate each recipe in the array
  newRecipes.forEach((recipe, index) => {
    try {
      validateRecipe(recipe);
    } catch (error) {
      throw new ValidationError(
        `newRecipes[${index}]`,
        `Recipe at index ${index}: ${error.message}`
      );
    }
  });
};
