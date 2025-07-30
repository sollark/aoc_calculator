import * as queries from "./queries.js";
import { getAllRecipesFromStorage } from "../data/storageOperations";

/**
 * Recipe utility functions for common operations
 */

/**
 * Initialize recipe service
 * @returns {Promise<Object>} Initialization result
 */
export const initializeService = async () => {
  try {
    console.log("Initializing recipe service...");

    // Test reading recipes
    const recipes = await getAllRecipesFromStorage();
    if (!recipes) {
      throw new Error("Failed to load recipe data");
    }

    // Validate structure
    if (
      !recipes.raw_components ||
      !recipes.intermediate_recipes ||
      !recipes.crafted_items
    ) {
      console.warn("Recipe data structure incomplete.");
    }

    console.log("Recipe service initialized successfully");
    return {
      success: true,
      message: "Recipe service initialized successfully",
    };
  } catch (error) {
    console.error("Failed to initialize recipe service:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Validate recipe service health
 * @returns {Promise<Object>} Health check result
 */
export const healthCheck = async () => {
  try {
    const recipes = await await getAllRecipesFromStorage();
    const stats = await queries.getStatistics();

    return {
      healthy: true,
      timestamp: new Date().toISOString(),
      stats,
      dataLoaded: Boolean(recipes),
    };
  } catch (error) {
    return {
      healthy: false,
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
};
