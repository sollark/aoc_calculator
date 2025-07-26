import * as transformers from "../processing/transformers.js";
import * as filters from "../processing/filters.js";
import * as storage from "../data/storage.js";

// Cache for recipes to prevent multiple reads
let cachedRecipes = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60000; // Cache for 1 minute

/**
 * Get all recipes as flattened array with type information
 * @returns {Promise<Array>} Array of all recipes
 */
export const getAllRecipes = async () => {
  try {
    // Check if we have valid cached data
    const now = Date.now();
    if (
      cachedRecipes &&
      cacheTimestamp &&
      now - cacheTimestamp < CACHE_DURATION
    ) {
      console.log("🔍 Returning cached recipes");
      return cachedRecipes;
    }

    console.log("Getting all recipes");
    const recipes = await storage.readRecipes();
    const flattened = transformers.flattenRecipes(recipes);

    // Cache the results
    cachedRecipes = flattened;
    cacheTimestamp = now;

    console.log(`Found ${flattened.length} total recipes`);
    return flattened;
  } catch (error) {
    console.error("Error getting all recipes:", error);
    return [];
  }
};

/**
 * Filter recipes based on criteria
 * @param {Object} criteria - Filter criteria
 * @returns {Promise<Array>} Filtered recipes
 */
export const filterRecipes = async (criteria) => {
  try {
    const allRecipes = await getAllRecipes();

    // Create a simple filter function if applyFilters doesn't exist
    let filteredRecipes = allRecipes;

    if (criteria.type) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.type === criteria.type
      );
    }

    if (criteria.name) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.name.toLowerCase().includes(criteria.name.toLowerCase())
      );
    }

    if (criteria.artisanSkill) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.recipe?.artisanSkill === criteria.artisanSkill
      );
    }

    return filteredRecipes;
  } catch (error) {
    console.error("Error filtering recipes:", error);
    return [];
  }
};

/**
 * Get recipes by type
 * @param {string} type - Recipe type to filter by
 * @returns {Promise<Array>} Array of recipes of specified type
 */
export const getRecipesByType = async (type) => {
  try {
    const recipes = await storage.readRecipes();
    return recipes[type] || [];
  } catch (error) {
    console.error(`Error getting recipes by type ${type}:`, error);
    return [];
  }
};

/**
 * Get recipe by ID
 * @param {number} id - Recipe ID
 * @returns {Promise<Object|null>} Recipe object or null if not found
 */
export const getRecipeById = async (id) => {
  try {
    const allRecipes = await getAllRecipes();
    return allRecipes.find((recipe) => recipe.id === id) || null;
  } catch (error) {
    console.error(`Error getting recipe by ID ${id}:`, error);
    return null;
  }
};

/**
 * Get recipes that use a specific component
 * @param {string} componentName - Name of the component
 * @returns {Promise<Array>} Recipes using the component
 */
export const getRecipesByComponent = async (componentName) => {
  try {
    const allRecipes = await getAllRecipes();
    return allRecipes.filter((recipe) =>
      recipe.recipe?.components?.some(
        (comp) => comp.name === componentName || comp.item === componentName
      )
    );
  } catch (error) {
    console.error(
      `Error getting recipes by component ${componentName}:`,
      error
    );
    return [];
  }
};

/**
 * Get available artisan skills
 * @returns {Promise<Array>} List of artisan skills
 */
export const getArtisanSkills = async () => {
  try {
    const recipes = await storage.readRecipes();
    return recipes.artisan_levels || [];
  } catch (error) {
    console.error("Error getting artisan skills:", error);
    return [];
  }
};

/**
 * Get available gathering skills
 * @returns {Promise<Array>} List of gathering skills
 */
export const getGatheringSkills = async () => {
  try {
    const recipes = await storage.readRecipes();
    return recipes.gathering_skills || [];
  } catch (error) {
    console.error("Error getting gathering skills:", error);
    return [];
  }
};

/**
 * Get recipe statistics
 * @returns {Promise<Object>} Recipe statistics
 */
export const getStatistics = async () => {
  try {
    const recipes = await storage.readRecipes();
    const allRecipes = transformers.flattenRecipes(recipes);

    return {
      totalRecipes: allRecipes.length,
      byType: {
        raw_components: recipes.raw_components?.length || 0,
        intermediate_recipes: recipes.intermediate_recipes?.length || 0,
        crafted_items: recipes.crafted_items?.length || 0,
      },
      artisanSkills: recipes.artisan_levels?.length || 0,
      gatheringSkills: recipes.gathering_skills?.length || 0,
    };
  } catch (error) {
    console.error("Error getting statistics:", error);
    return {
      totalRecipes: 0,
      byType: {},
      artisanSkills: 0,
      gatheringSkills: 0,
    };
  }
};
