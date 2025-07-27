import * as transformers from "../processing/transformers.js";
import * as storage from "../data/storage.js";
import * as arrayOps from "../data/storageOperations.js";

/**
 * Recipe mutation operations - create, update, delete functions
 */

/**
 * Add a new recipe
 * @param {string} type - Recipe type
 * @param {Object} recipe - Recipe object to add
 * @returns {Promise<Object>} Success response with added recipe
 */
export const addRecipe = async (type, recipe) => {
  try {
    console.log(`Adding recipe to ${type}:`, recipe);
    const currentData = await storage.readRecipes();
    const updatedData = arrayOps.addRecipeToData(currentData, type, recipe);

    storage.writeRecipes(updatedData);

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
 * @returns {Promise<Object>} Success response with updated recipe
 */
export const updateRecipe = async (id, updates) => {
  try {
    console.log(`Updating recipe ${id} with:`, updates);
    const currentData = await storage.readRecipes();

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

    storage.writeRecipes(result.recipes);

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
 * @returns {Promise<Object>} Success response with deleted recipe
 */
export const deleteRecipe = async (id) => {
  try {
    console.log(`Deleting recipe with ID: ${id}`);
    const currentData = await storage.readRecipes();

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

    storage.writeRecipes(result.recipes);

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
