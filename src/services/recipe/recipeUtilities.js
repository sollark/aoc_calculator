import * as fileOps from "./jsonFileOperations.js";
import { getAllRecipes, getRecipesByType } from "./recipeQueries.js";

/**
 * Recipe utility functions - statistics, skills, helpers
 */

/**
 * Get all unique artisan skills
 * @returns {Promise<Array>} Array of unique artisan skills
 */
export const getArtisanSkills = async () => {
  try {
    const allRecipes = await getAllRecipes();
    const skills = [
      ...new Set(
        allRecipes.map((recipe) => recipe.recipe?.artisanSkill).filter(Boolean)
      ),
    ];

    console.log(`Found ${skills.length} unique artisan skills`);
    return skills.sort();
  } catch (error) {
    console.error("Error getting artisan skills:", error);
    return [];
  }
};

/**
 * Get all unique gathering skills
 * @returns {Promise<Array>} Array of unique gathering skills
 */
export const getGatheringSkills = async () => {
  try {
    const allRecipes = await getAllRecipes();
    const skills = [
      ...new Set(
        allRecipes.map((recipe) => recipe.gathering?.skill).filter(Boolean)
      ),
    ];

    console.log(`Found ${skills.length} unique gathering skills`);
    return skills.sort();
  } catch (error) {
    console.error("Error getting gathering skills:", error);
    return [];
  }
};

/**
 * Get comprehensive recipe statistics
 * @returns {Promise<Object>} Statistics about recipes
 */
export const getStatistics = async () => {
  try {
    const recipes = await fileOps.readRecipes();
    const allRecipes = await getAllRecipes();

    const stats = {
      totalRecipes: allRecipes.length,
      byType: {},
      artisanSkills: (await getArtisanSkills()).length,
      gatheringSkills: (await getGatheringSkills()).length,
      lastUpdated: recipes.metadata?.lastUpdated || "Unknown",
    };

    // Count by type
    Object.keys(recipes).forEach((type) => {
      if (Array.isArray(recipes[type])) {
        stats.byType[type] = recipes[type].length;
      }
    });

    console.log("Recipe statistics:", stats);
    return stats;
  } catch (error) {
    console.error("Error getting statistics:", error);
    return {
      totalRecipes: 0,
      byType: {},
      artisanSkills: 0,
      gatheringSkills: 0,
      lastUpdated: "Error",
    };
  }
};

/**
 * Find recipe by identifier (ID or name)
 * @param {string|number} identifier - Recipe identifier
 * @returns {Promise<Object|null>} Recipe object or null if not found
 */
export const findRecipeByIdentifier = async (identifier) => {
  try {
    const allRecipes = await getAllRecipes();

    // Try by ID first (if identifier is numeric)
    const numericId = parseInt(identifier);
    if (!isNaN(numericId)) {
      const recipeById = allRecipes.find((recipe) => recipe.id === numericId);
      if (recipeById) return recipeById;
    }

    // Try by exact name match
    const recipeByName = allRecipes.find(
      (recipe) => recipe.name.toLowerCase() === identifier.toLowerCase()
    );
    if (recipeByName) return recipeByName;

    console.warn(`Recipe not found for identifier: ${identifier}`);
    return null;
  } catch (error) {
    console.error(`Error finding recipe by identifier ${identifier}:`, error);
    return null;
  }
};

/**
 * Find raw component by identifier (ID or name)
 * @param {string|number} identifier - Component identifier
 * @returns {Promise<Object|null>} Component object or null if not found
 */
export const findRawComponentByIdentifier = async (identifier) => {
  try {
    const rawComponents = await getRecipesByType("raw_components");

    // Try by ID first (if identifier is numeric)
    const numericId = parseInt(identifier);
    if (!isNaN(numericId)) {
      const componentById = rawComponents.find(
        (component) => component.id === numericId
      );
      if (componentById) return componentById;
    }

    // Try by exact name match
    const componentByName = rawComponents.find(
      (component) => component.name.toLowerCase() === identifier.toLowerCase()
    );
    if (componentByName) return componentByName;

    console.warn(`Raw component not found for identifier: ${identifier}`);
    return null;
  } catch (error) {
    console.error(
      `Error finding raw component by identifier ${identifier}:`,
      error
    );
    return null;
  }
};

/**
 * Initialize the recipe service with data
 * @returns {Promise<Object>} Loaded recipes data
 */
export const initialize = async () => {
  try {
    console.log("Initializing recipe service...");

    if (!fileOps.recipesFileExists()) {
      console.log("Recipe file not found, initializing with default data");
      const defaultData = fileOps.initializeRecipes();
      fileOps.writeRecipes(defaultData);
    }

    const recipes = await fileOps.readRecipes();
    console.log("Recipe service initialized successfully");

    return {
      success: true,
      message: "Recipe service initialized",
      data: recipes,
    };
  } catch (error) {
    console.error("Error initializing recipe service:", error);
    throw new Error(`Failed to initialize recipe service: ${error.message}`);
  }
};
