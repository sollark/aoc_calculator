import {
  createMultipleLookups,
  findWithFallback,
  createSearchFunction,
} from "./lookupUtils.js";
import { sortByName } from "../services/recipe/sorting.js";

/**
 * Configuration for recipe lookup maps
 */
const RECIPE_LOOKUP_CONFIGS = [
  { name: "byId", keySelector: "id" },
  { name: "byName", keySelector: "name" },
  { name: "nameToId", keySelector: "name", valueSelector: "id" },
];

/**
 * Configuration for raw component lookup maps
 */
const RAW_COMPONENT_LOOKUP_CONFIGS = [
  { name: "byId", keySelector: "id" },
  { name: "byName", keySelector: "name" },
  { name: "nameToId", keySelector: "name", valueSelector: "id" },
];

/**
 * Creates comprehensive lookup maps for recipes
 * @param {Array} recipes - Array of recipe objects
 * @returns {Object} Object containing different lookup maps
 */
const createRecipeLookups = (recipes) => {
  return createMultipleLookups(recipes, RECIPE_LOOKUP_CONFIGS);
};

/**
 * Creates comprehensive lookup maps for raw components
 * @param {Array} components - Array of raw component objects
 * @returns {Object} Object containing different lookup maps
 */
const createRawComponentLookups = (components) => {
  return createMultipleLookups(components, RAW_COMPONENT_LOOKUP_CONFIGS);
};

/**
 * Creates search functions for recipes
 * @returns {Object} Object containing different search functions
 */
const createRecipeSearchFunctions = () => {
  return {
    byName: createSearchFunction(["name"]),
    byDescription: createSearchFunction(["description"]),
    byNameOrDescription: createSearchFunction(["name", "description"]),
    byWorkStation: createSearchFunction(["recipe.workStation"]),
    byArtisanSkill: createSearchFunction(["recipe.artisanSkill"]),
  };
};

/**
 * Pure function to find recipe with multiple lookup strategies
 * @param {Object} lookups - Recipe lookup maps
 * @param {Array} originalRecipes - Original recipes array for fallback
 * @param {string|number} identifier - ID or name to search for
 * @returns {Object|undefined} Found recipe or undefined
 */
const findRecipe = (lookups, originalRecipes, identifier) => {
  // Try by ID first
  let result = lookups.byId[identifier];
  if (result) return result;

  // Try by name
  result = lookups.byName[identifier];
  if (result) return result;

  // Fallback search (shouldn't be needed if lookups are complete)
  return findWithFallback(lookups.byName, originalRecipes, identifier, "name");
};

/**
 * Pure function to find raw component with multiple lookup strategies
 * @param {Object} lookups - Raw component lookup maps
 * @param {Array} originalComponents - Original components array for fallback
 * @param {string|number} identifier - ID or name to search for
 * @returns {Object|undefined} Found component or undefined
 */
const findRawComponent = (lookups, originalComponents, identifier) => {
  // Try by ID first
  let result = lookups.byId[identifier];
  if (result) return result;

  // Try by name
  result = lookups.byName[identifier];
  if (result) return result;

  // Fallback search
  return findWithFallback(
    lookups.byName,
    originalComponents,
    identifier,
    "name"
  );
};

/**
 * Pure function to consolidate components by ID, avoiding duplicates
 * @param {Array} components - Array of components to consolidate
 * @returns {Array} Consolidated array sorted by name
 */
const consolidateComponentsById = (components) => {
  const consolidated = components.reduce((acc, component) => {
    const key = component.id;
    if (acc[key]) {
      acc[key] = {
        ...acc[key],
        quantity: acc[key].quantity + component.quantity,
      };
    } else {
      acc[key] = { ...component };
    }
    return acc;
  }, {});

  // Use dedicated sorting service instead of inline sort
  const consolidatedArray = Object.values(consolidated);
  return sortByName(consolidatedArray, "asc");
};

export {
  createRecipeLookups,
  createRawComponentLookups,
  createRecipeSearchFunctions,
  findRecipe,
  findRawComponent,
  consolidateComponentsById,
  RECIPE_LOOKUP_CONFIGS,
  RAW_COMPONENT_LOOKUP_CONFIGS,
};
