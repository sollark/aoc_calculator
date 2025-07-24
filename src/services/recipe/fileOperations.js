import { RecipeError } from "./errors.js";

// In-memory storage for browser environment
let recipesCache = null;

// Base path for recipes file
const RECIPES_FILE_PATH = "/src/db/recipes.json";

/**
 * Read recipes from JSON file (browser-compatible)
 * @returns {Promise<Object>} Complete recipes data
 * @throws {RecipeError} If file cannot be read or parsed
 */
export const readRecipes = async () => {
  try {
    // Return cached data if available
    if (recipesCache) {
      return recipesCache;
    }

    // Fetch from public directory in browser
    const response = await fetch(RECIPES_FILE_PATH);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    recipesCache = data;
    return data;
  } catch (error) {
    console.error("Error reading recipes file:", error);
    throw new RecipeError(`Failed to read recipes file: ${error.message}`);
  }
};

/**
 * Read recipes synchronously (using cached data)
 * @returns {Object} Complete recipes data
 * @throws {RecipeError} If no cached data available
 */
export const readRecipesSync = () => {
  if (!recipesCache) {
    throw new RecipeError("No recipes data cached. Call readRecipes() first.");
  }
  return recipesCache;
};

/**
 * Write recipes data (browser environment - downloads as file)
 * @param {Object} recipesData - Complete recipes data to write
 */
export const writeRecipes = (recipesData) => {
  try {
    // Update cache
    recipesCache = recipesData;

    // In browser environment, trigger download
    const jsonString = JSON.stringify(recipesData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "recipes.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("Recipes file downloaded successfully");
  } catch (error) {
    console.error("Error writing recipes file:", error);
    throw new RecipeError(`Failed to write recipes file: ${error.message}`);
  }
};

/**
 * Check if recipes are loaded in cache
 * @returns {boolean} True if recipes are cached
 */
export const recipesFileExists = () => {
  return recipesCache !== null;
};

/**
 * Create backup of recipes data (browser environment)
 * @returns {string} Backup file name
 */
export const createBackup = () => {
  if (!recipesCache) {
    throw new RecipeError("No recipes data to backup. Load recipes first.");
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `recipes-backup-${timestamp}.json`;

    const jsonString = JSON.stringify(recipesCache, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = backupFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return backupFileName;
  } catch (error) {
    throw new RecipeError(`Failed to create backup: ${error.message}`);
  }
};

/**
 * Clear cached recipes data
 */
export const clearCache = () => {
  recipesCache = null;
};

/**
 * Load recipes data from uploaded file
 * @param {File} file - File object from file input
 * @returns {Promise<Object>} Loaded recipes data
 */
export const loadRecipesFromFile = async (file) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    recipesCache = data;
    return data;
  } catch (error) {
    throw new RecipeError(`Failed to load recipes from file: ${error.message}`);
  }
};

/**
 * Initialize recipes data with default structure
 * @returns {Object} Default recipes structure
 */
export const initializeRecipes = () => {
  const defaultData = {
    raw_components: [],
    intermediate_recipes: [],
    crafted_items: [],
    artisan_levels: [
      { level: "novice", order: 1, description: "Entry level crafting" },
      {
        level: "apprentice",
        order: 2,
        description: "Intermediate crafting skills",
      },
      {
        level: "journeyman",
        order: 3,
        description: "Advanced crafting techniques",
      },
      { level: "expert", order: 4, description: "Master level crafting" },
    ],
    gathering_skills: [
      { skill: "mining", description: "Extract ores and stones from nodes" },
      { skill: "lumberjacking", description: "Harvest wood from trees" },
      { skill: "herbalism", description: "Gather herbs and plants" },
      {
        skill: "fishing",
        description: "Catch fish from rivers, lakes, and oceans",
      },
      {
        skill: "hunting",
        description: "Hunt animals for hides, bones, and meat",
      },
      { skill: "vendor", description: "Items purchased from vendors" },
    ],
  };

  recipesCache = defaultData;
  return defaultData;
};
