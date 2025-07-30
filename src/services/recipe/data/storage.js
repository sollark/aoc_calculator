import recipesData from "../../../db/recipes.json";
import { RecipeError } from "../../../utils/errorHandler.js";
import { RECIPE_TYPES, SKILL_LEVELS, GATHERING_SKILLS } from "../constants.js";

// Use imported data directly
let recipesCache = recipesData;

/**
 * Read recipes synchronously (using imported data)
 * @returns {Object} Complete recipes data
 */
export const readRecipes = async () => {
  restrictToStorageOperations();

  return recipesCache;
};

/**
 * Write recipes data (browser environment - downloads as file)
 * @param {Object} newRecipesData - Complete recipes data to write
 */
export const writeRecipes = (newRecipesData) => {
  restrictToStorageOperations();

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
    return true;
  } catch (error) {
    console.error("Error downloading recipes file:", error);
    throw new RecipeError(`Failed to download recipes: ${error.message}`);
  }
};

/**
 * Initialize recipes data with default structure
 * @returns {Object} Default recipes structure
 */
export const initializeRecipes = () => {
  restrictToStorageOperations();

  const defaultData = {
    [RECIPE_TYPES.RAW_COMPONENTS]: [],
    [RECIPE_TYPES.INTERMEDIATE_RECIPES]: [],
    [RECIPE_TYPES.CRAFTED_ITEMS]: [],
    artisan_levels: [
      {
        level: SKILL_LEVELS.NOVICE,
        order: 1,
        description: "Entry level crafting",
      },
      {
        level: SKILL_LEVELS.APPRENTICE,
        order: 2,
        description: "Intermediate crafting skills",
      },
      {
        level: SKILL_LEVELS.JOURNEYMAN,
        order: 3,
        description: "Advanced crafting techniques",
      },
      {
        level: SKILL_LEVELS.EXPERT,
        order: 4,
        description: "Master level crafting",
      },
    ],
    gathering_skills: [
      {
        skill: GATHERING_SKILLS.MINING,
        description: "Extract ores and stones from nodes",
      },
      {
        skill: GATHERING_SKILLS.LUMBERJACKING,
        description: "Harvest wood from trees",
      },
      {
        skill: GATHERING_SKILLS.HERBALISM,
        description: "Gather herbs and plants",
      },
      {
        skill: GATHERING_SKILLS.FISHING,
        description: "Catch fish from rivers, lakes, and oceans",
      },
      {
        skill: GATHERING_SKILLS.HUNTING,
        description: "Hunt animals for hides, bones, and meat",
      },
      {
        skill: GATHERING_SKILLS.VENDOR,
        description: "Items purchased from vendors",
      },
    ],
  };

  recipesCache = defaultData;
  return defaultData;
};

// Helper function to restrict access to storage operations
// This function checks if the current call stack includes storageOperations.js
// If not, it throws an error to prevent direct access to storage.js functions.
// This is to ensure that all storage operations go through the designated operations file.
function restrictToStorageOperations() {
  const stack = new Error().stack;
  // Check if storageOperations.js is in the stack trace
  if (!stack.includes("storageOperations.js")) {
    throw new Error(
      "Direct access to storage.js functions is not allowed. Use storageOperations.js instead."
    );
  }
}
