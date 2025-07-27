import * as storage from "../data/storage.js";
import * as queries from "./queries.js";

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
    const recipes = await storage.readRecipes();
    if (!recipes) {
      throw new Error("Failed to load recipe data");
    }

    // Validate structure
    if (
      !recipes.raw_components ||
      !recipes.intermediate_recipes ||
      !recipes.crafted_items
    ) {
      console.warn(
        "Recipe data structure incomplete, initializing defaults..."
      );
      const defaultData = storage.initializeRecipes();
      storage.writeRecipes(defaultData);
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
    const recipes = await storage.readRecipes();
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

/**
 * Export backup of recipe data
 * @returns {Promise<Object>} Backup result
 */
export const exportData = async () => {
  try {
    const recipes = await storage.readRecipes();
    const exportData = {
      ...recipes,
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
        source: "AoC Calculator",
      },
    };

    storage.writeRecipes(exportData);

    return {
      success: true,
      message: "Data exported successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
