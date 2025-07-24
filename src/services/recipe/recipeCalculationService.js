import { consolidateComponentsById } from "../../utils/recipeUtils.js";

/**
 * Recipe calculation and breakdown service
 * Handles recipe component breakdown, validation, and list processing
 */

/**
 * Pure function to recursively break down components to raw materials
 * @param {Function} findRecipeByIdentifier - Function to find recipe
 * @param {Function} findRawComponentByIdentifier - Function to find raw component
 * @param {string} componentName - Name of component to break down
 * @param {number} quantity - Quantity needed
 * @param {Set} visited - Set of visited components to prevent cycles
 * @returns {Array} Array of raw components
 */
export const breakDownToRawComponents =
  (findRecipeByIdentifier, findRawComponentByIdentifier) =>
  (componentName, quantity = 1, visited = new Set()) => {
    // Prevent infinite recursion
    if (visited.has(componentName)) {
      console.warn(`Circular dependency detected for ${componentName}`);
      return [];
    }

    // Check if it's already a raw component
    const rawComponent = findRawComponentByIdentifier(componentName);
    if (rawComponent) {
      return [
        {
          id: rawComponent.id,
          name: componentName,
          quantity: quantity,
          isRaw: true,
          description: rawComponent.description,
          gatheringSkill: rawComponent.gathering?.skill,
          gatheringLevel: rawComponent.gathering?.skillLevel,
        },
      ];
    }

    // Check if it's a processing recipe
    const processingRecipe = findRecipeByIdentifier(componentName);
    if (processingRecipe?.recipe?.components) {
      const newVisited = new Set(visited);
      newVisited.add(componentName);

      const breakDownFn = breakDownToRawComponents(
        findRecipeByIdentifier,
        findRawComponentByIdentifier
      );

      const rawComponents = processingRecipe.recipe.components.flatMap(
        (component) =>
          breakDownFn(component.name, component.quantity * quantity, newVisited)
      );

      return rawComponents;
    }

    // Component not found - treat as unknown
    console.warn(
      `Component ${componentName} not found in raw or processing recipes`
    );
    return [
      {
        id: `unknown_${componentName}`,
        name: componentName,
        quantity: quantity,
        isRaw: false,
        isUnknown: true,
        error: "Component not found in recipe database",
      },
    ];
  };

/**
 * Higher-order function that creates a recipe list processor
 * @param {Function} breakDownFn - Function to break down components
 * @returns {Function} Function that processes recipe lists
 */
export const createRecipeListProcessor = (breakDownFn) => (recipeList) => {
  if (!recipeList || recipeList.length === 0) {
    return [];
  }

  console.log(
    "Processing components for recipes:",
    recipeList.map((r) => r.name)
  );

  // Process all components using functional approach
  const allRawComponents = recipeList
    .filter((recipe) => recipe.recipe?.components)
    .flatMap((recipe) =>
      recipe.recipe.components.flatMap((component) =>
        breakDownFn(component.name, component.quantity)
      )
    );

  const consolidated = consolidateComponentsById(allRawComponents);
  console.log("Consolidated raw components:", consolidated);
  return consolidated;
};

/**
 * Pure function to check if recipe is already in the list
 * @param {Array} recipeList - Current recipe list
 * @param {Object} recipeData - Recipe to check
 * @returns {boolean} True if recipe is already in list
 */
export const isRecipeAlreadyAdded = (recipeList, recipeData) => {
  return recipeList.some((recipe) => recipe.id === recipeData.id);
};

/**
 * Higher-order function that creates a recipe validator
 * @param {Function} findRecipeByIdentifier - Function to find recipe
 * @returns {Function} Function that validates and adds recipes
 */
export const createRecipeValidator =
  (findRecipeByIdentifier) => (recipeList, recipeName) => {
    const recipeData = findRecipeByIdentifier(recipeName);

    if (!recipeData) {
      console.warn(`Recipe not found: ${recipeName}`);
      return { success: false, message: "Recipe not found", data: null };
    }

    if (isRecipeAlreadyAdded(recipeList, recipeData)) {
      console.log("Recipe already in list:", recipeData.name);
      return {
        success: false,
        message: "Recipe already in list",
        data: recipeData,
      };
    }

    console.log("Adding recipe:", recipeData);
    return {
      success: true,
      message: "Recipe added successfully",
      data: recipeData,
    };
  };

/**
 * Pure function to remove recipe from list by ID
 * @param {Array} recipeList - Current recipe list
 * @param {string|number} recipeId - ID of recipe to remove
 * @returns {Array} New recipe list without the specified recipe
 */
export const removeRecipeFromList = (recipeList, recipeId) => {
  return recipeList.filter((recipe) => recipe.id !== recipeId);
};

/**
 * Pure function to calculate total cost breakdown for recipes
 * @param {Array} rawComponents - Array of raw components with quantities
 * @returns {Object} Cost breakdown by gathering skill
 */
export const calculateCostBreakdown = (rawComponents) => {
  const breakdown = rawComponents.reduce((acc, component) => {
    const skill = component.gatheringSkill || "unknown";
    if (!acc[skill]) {
      acc[skill] = {
        skill,
        components: [],
        totalItems: 0,
      };
    }

    acc[skill].components.push(component);
    acc[skill].totalItems += component.quantity;
    return acc;
  }, {});

  return {
    breakdown,
    totalUniqueComponents: rawComponents.length,
    totalItems: rawComponents.reduce((sum, comp) => sum + comp.quantity, 0),
    skillsRequired: Object.keys(breakdown),
  };
};

/**
 * Pure function to optimize gathering order based on efficiency
 * @param {Array} rawComponents - Array of raw components
 * @param {Object} skillEfficiency - Optional efficiency ratings per skill
 * @returns {Array} Optimized gathering order
 */
export const optimizeGatheringOrder = (rawComponents, skillEfficiency = {}) => {
  const grouped = rawComponents.reduce((acc, component) => {
    const skill = component.gatheringSkill || "unknown";
    if (!acc[skill]) {
      acc[skill] = [];
    }
    acc[skill].push(component);
    return acc;
  }, {});

  // Sort skills by efficiency (higher efficiency first)
  const sortedSkills = Object.keys(grouped).sort((a, b) => {
    const effA = skillEfficiency[a] || 1;
    const effB = skillEfficiency[b] || 1;
    return effB - effA;
  });

  return sortedSkills.map((skill) => ({
    skill,
    components: grouped[skill],
    totalQuantity: grouped[skill].reduce((sum, comp) => sum + comp.quantity, 0),
    efficiency: skillEfficiency[skill] || 1,
  }));
};

/**
 * Pure function to find recipe dependencies
 * @param {Array} recipeList - List of recipes
 * @param {Function} findRecipeByIdentifier - Function to find recipe
 * @returns {Object} Dependency graph
 */
export const calculateRecipeDependencies = (
  recipeList,
  findRecipeByIdentifier
) => {
  const dependencies = {};

  recipeList.forEach((recipe) => {
    if (recipe.recipe?.components) {
      dependencies[recipe.id] = recipe.recipe.components
        .map((component) => {
          const dependentRecipe = findRecipeByIdentifier(component.name);
          return dependentRecipe
            ? {
                id: dependentRecipe.id,
                name: component.name,
                quantity: component.quantity,
              }
            : null;
        })
        .filter(Boolean);
    }
  });

  return dependencies;
};

/**
 * Factory function to create recipe calculation service functions
 * @param {Function} findRecipeByIdentifier - Function to find recipe
 * @param {Function} findRawComponentByIdentifier - Function to find raw component
 * @returns {Object} Object containing all recipe calculation service functions
 */
export const createRecipeCalculationService = (
  findRecipeByIdentifier,
  findRawComponentByIdentifier
) => {
  const breakDownFn = breakDownToRawComponents(
    findRecipeByIdentifier,
    findRawComponentByIdentifier
  );

  const processRecipeList = createRecipeListProcessor(breakDownFn);
  const validateAndAddRecipe = createRecipeValidator(findRecipeByIdentifier);

  return {
    // Core breakdown functions
    breakDownToRawComponents: breakDownFn,
    processRecipeListToRawComponents: processRecipeList,

    // Recipe list management
    addRecipeToList: validateAndAddRecipe,
    removeRecipeFromList,
    isRecipeAlreadyAdded,

    // Analysis and optimization
    calculateCostBreakdown,
    optimizeGatheringOrder,
    calculateRecipeDependencies: (recipeList) =>
      calculateRecipeDependencies(recipeList, findRecipeByIdentifier),
  };
};

// Default export for the main factory function
export default createRecipeCalculationService;
