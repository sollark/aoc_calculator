import recipesData from "../../db/recipes.json";
import { RecipeError } from "../../utils/errorHandler.js";

// Use imported data directly
let recipesCache = recipesData;

/**
 * Read recipes synchronously (using imported data)
 * @returns {Object} Complete recipes data
 */
export const readRecipes = async () => {
  return recipesCache;
};

/**
 * Read recipes synchronously (using imported data)
 * @returns {Object} Complete recipes data
 */
export const readRecipesSync = () => {
  return recipesCache;
};

/**
 * Write recipes data (browser environment - downloads as file)
 * @param {Object} newRecipesData - Complete recipes data to write
 */
export const writeRecipes = (newRecipesData) => {
  try {
    // Update cache
    recipesCache = newRecipesData;

    // In browser environment, trigger download
    const jsonString = JSON.stringify(newRecipesData, null, 2);
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
 * Check if recipes are loaded
 * @returns {boolean} True if recipes are available
 */
export const recipesFileExists = () => {
  return recipesCache !== null;
};

/**
 * Create backup of recipes data
 * @returns {string} Backup file name
 */
export const createBackup = () => {
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
