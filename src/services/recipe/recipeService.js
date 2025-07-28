import * as queries from "./core/queries.js";
import * as mutations from "./core/mutations.js";
import * as calculations from "./core/calculations.js";
import * as utilities from "./core/utilities.js";

/**
 * Create recipe service functions
 *
 * This service acts as a facade/interface layer that provides access to recipe data and operations.
 * It coordinates between different core modules to provide a unified API for recipe management.
 *
 * @returns {Object} Recipe service functions organized by operation type
 */
export const createRecipeServiceFunctions = () => {
  console.log("Creating recipe service functions...");

  // Initialize calculation service with recipe service instance
  const recipeServiceInstance = {
    getAllRecipes: queries.getAllRecipes,
    getRecipesByType: queries.getRecipesByType,
    getRecipeById: queries.getRecipeById,
  };

  // Initialize the calculation service
  calculations.initializeCalculationService(recipeServiceInstance);

  return {
    // ==========================================
    // SERVICE INITIALIZATION
    // ==========================================
    /**
     * Initialize the recipe service and load data
     * DATA: Initializes JSON file reading and caching
     * @function initialize
     * @returns {Promise<boolean>} Success status of initialization
     */
    initialize: utilities.initializeService,

    // ==========================================
    // QUERY OPERATIONS (READ-ONLY)
    // Work with: JSON database files → Array of Objects
    // ==========================================

    /**
     * Get all available recipes from the database
     * DATA: JSON file → Array<RecipeObject>
     * INPUT: None
     * OUTPUT: Array of recipe objects with {id, name, description, requirements, recipe, type}
     * @function getAllRecipes
     * @returns {Promise<Array<Object>>} All recipes from JSON database
     */
    getAllRecipes: queries.getAllRecipes,

    /**
     * Filter recipes by type (e.g., 'weapon', 'armor', 'consumable')
     * DATA: JSON file → Filtered Array<RecipeObject>
     * INPUT: String (recipe type)
     * OUTPUT: Array of recipe objects matching the type
     * @function getRecipesByType
     * @param {string} type - Recipe type to filter by
     * @returns {Promise<Array<Object>>} Filtered array of recipes
     */
    getRecipesByType: queries.getRecipesByType,

    /**
     * Get a specific recipe by its unique ID
     * DATA: JSON file → Single RecipeObject or null
     * INPUT: Number/String (recipe ID)
     * OUTPUT: Single recipe object or null if not found
     * @function getRecipeById
     * @param {number|string} id - Unique recipe identifier
     * @returns {Promise<Object|null>} Single recipe object or null
     */
    getRecipeById: queries.getRecipeById,

    /**
     * Filter recipes based on multiple criteria
     * DATA: JSON file → Filtered Array<RecipeObject>
     * INPUT: Object with filter criteria
     * OUTPUT: Array of recipe objects matching all criteria
     * @function filterRecipes
     * @param {Object} filters - Filter criteria object
     * @returns {Promise<Array<Object>>} Filtered recipes array
     */
    filterRecipes: queries.filterRecipes,

    /**
     * Find recipes that use a specific component/ingredient
     * DATA: JSON file → Filtered Array<RecipeObject>
     * INPUT: String (component name)
     * OUTPUT: Array of recipes that require the component
     * @function getRecipesByComponent
     * @param {string} componentName - Name of the component to search for
     * @returns {Promise<Array<Object>>} Recipes that use the component
     */
    getRecipesByComponent: queries.getRecipesByComponent,

    /**
     * Get list of all artisan skills from recipes
     * DATA: JSON file → Unique Array<String>
     * INPUT: None
     * OUTPUT: Array of unique artisan skill names
     * @function getArtisanSkills
     * @returns {Promise<Array<string>>} Unique artisan skills array
     */
    getArtisanSkills: queries.getArtisanSkills,

    /**
     * Get list of all gathering skills from recipes
     * DATA: JSON file → Unique Array<String>
     * INPUT: None
     * OUTPUT: Array of unique gathering skill names
     * @function getGatheringSkills
     * @returns {Promise<Array<string>>} Unique gathering skills array
     */
    getGatheringSkills: queries.getGatheringSkills,

    /**
     * Get statistical information about the recipe database
     * DATA: JSON file → Statistics Object
     * INPUT: None
     * OUTPUT: Object with counts, averages, and other stats
     * @function getStatistics
     * @returns {Promise<Object>} Statistics object with database metrics
     */
    getStatistics: queries.getStatistics,

    // ==========================================
    // MUTATION OPERATIONS (WRITE)
    // Work with: Array<Object> → Modified Array<Object>
    // Note: These don't modify JSON files, only runtime data
    // ==========================================

    /**
     * Add a new recipe to the runtime recipe collection
     * DATA: Array<RecipeObject> → Array<RecipeObject> (with new item)
     * INPUT: Single recipe object
     * OUTPUT: Updated array with new recipe added
     * @function addRecipe
     * @param {Object} recipe - Recipe object to add
     * @returns {Promise<Object>} Result object with success/failure info
     */
    addRecipe: mutations.addRecipe,

    /**
     * Update an existing recipe in the runtime collection
     * DATA: Array<RecipeObject> → Array<RecipeObject> (with modified item)
     * INPUT: Recipe ID and updated recipe object
     * OUTPUT: Updated array with modified recipe
     * @function updateRecipe
     * @param {number|string} id - Recipe ID to update
     * @param {Object} updatedRecipe - New recipe data
     * @returns {Promise<Object>} Result object with success/failure info
     */
    updateRecipe: mutations.updateRecipe,

    /**
     * Remove a recipe from the runtime collection
     * DATA: Array<RecipeObject> → Array<RecipeObject> (without deleted item)
     * INPUT: Recipe ID
     * OUTPUT: Updated array without the deleted recipe
     * @function deleteRecipe
     * @param {number|string} id - Recipe ID to delete
     * @returns {Promise<Object>} Result object with success/failure info
     */
    deleteRecipe: mutations.deleteRecipe,

    // ==========================================
    // CALCULATION OPERATIONS (COMPLEX PROCESSING)
    // Work with: Array<RecipeListItem> → Array<ComponentObject>
    // ==========================================

    /**
     * Process a user's recipe list into raw components needed
     * DATA: Array<RecipeListItem> → Array<ComponentObject>
     * INPUT: Array of {id, recipe, quantity} objects (user's recipe list)
     * OUTPUT: Array of {name, quantity, sources} objects (consolidated components)
     * @function processRecipeListToRawComponents
     * @param {Array<Object>} recipeList - User's recipe list items
     * @returns {Promise<Array<Object>>} Raw components needed for all recipes
     */
    processRecipeListToRawComponents:
      calculations.processRecipeListToRawComponents,

    /**
     * Recursively break down a recipe into its raw components
     * DATA: Single RecipeObject → Array<ComponentObject>
     * INPUT: Recipe name and quantity
     * OUTPUT: Array of raw components needed (no sub-recipes)
     * @function breakDownToRawComponents
     * @param {string} recipeName - Name of recipe to break down
     * @param {number} quantity - How many of this recipe to make
     * @returns {Promise<Array<Object>>} Raw components for this recipe
     */
    breakDownToRawComponents: calculations.breakDownToRawComponents,

    /**
     * Convert a single recipe to its immediate components
     * DATA: Single RecipeObject → Array<ComponentObject>
     * INPUT: Recipe object
     * OUTPUT: Array of immediate components (may include sub-recipes)
     * @function convertRecipeToRawComponents
     * @param {Object} recipe - Recipe object to convert
     * @returns {Array<Object>} Immediate components list
     */
    convertRecipeToRawComponents: calculations.convertRecipeToRawComponents,

    // ==========================================
    // UTILITY OPERATIONS (SYSTEM FUNCTIONS)
    // Work with: Service state and metadata
    // ==========================================

    /**
     * Check if the recipe service is healthy and operational
     * DATA: Service state → Status Object
     * INPUT: None
     * OUTPUT: Object with service health information
     * @function healthCheck
     * @returns {Promise<Object>} Health status object
     */
    healthCheck: utilities.healthCheck,

    /**
     * Export recipe data in various formats
     * DATA: JSON database → Formatted export data
     * INPUT: Export format specification
     * OUTPUT: Formatted data ready for download/export
     * @function exportData
     * @param {string} format - Export format ('json', 'csv', etc.)
     * @returns {Promise<string|Object>} Exported data in requested format
     */
    exportData: utilities.exportData,
  };
};

export default createRecipeServiceFunctions;
