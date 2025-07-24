import { VALID_RECIPE_TYPES } from "./constants.js";
import { getNestedProperty, groupRecipesBy } from "./transformers.js";

/**
 * Count items by property path
 * @param {Array} items - Items to count
 * @param {string} propertyPath - Dot-notation path to property
 * @returns {Object} Count object
 */
export const countByProperty = (items, propertyPath) => {
  return items.reduce((counts, item) => {
    const value = getNestedProperty(item, propertyPath);
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
    return counts;
  }, {});
};

/**
 * Calculate basic statistics
 * @param {Object} recipes - Recipes data object
 * @param {Array} allRecipes - Flattened recipes array
 * @returns {Object} Basic statistics
 */
export const calculateBasicStatistics = (recipes, allRecipes) => ({
  total: allRecipes.length,
  byType: VALID_RECIPE_TYPES.reduce((acc, type) => {
    acc[type] = recipes[type]?.length || 0;
    return acc;
  }, {}),
});

/**
 * Calculate skill-based statistics
 * @param {Array} allRecipes - Flattened recipes array
 * @returns {Object} Skill statistics
 */
export const calculateSkillStatistics = (allRecipes) => ({
  byArtisanSkill: countByProperty(allRecipes, "recipe.artisanSkill"),
  byGatheringSkill: countByProperty(allRecipes, "gathering.skill"),
  byArtisanLevel: countByProperty(allRecipes, "requirements.artisanLevel"),
  byGatheringLevel: countByProperty(allRecipes, "gathering.skillLevel"),
  byWorkStation: countByProperty(allRecipes, "recipe.workStation"),
});

/**
 * Calculate level distribution statistics
 * @param {Array} allRecipes - Flattened recipes array
 * @returns {Object} Level statistics
 */
export const calculateLevelStatistics = (allRecipes) => {
  const levels = allRecipes
    .map((recipe) => recipe.requirements?.playerLevel || 0)
    .filter((level) => level > 0);

  if (levels.length === 0) {
    return {
      minPlayerLevel: 0,
      maxPlayerLevel: 0,
      averagePlayerLevel: 0,
      playerLevelDistribution: {},
    };
  }

  return {
    minPlayerLevel: Math.min(...levels),
    maxPlayerLevel: Math.max(...levels),
    averagePlayerLevel: Math.round(
      levels.reduce((sum, level) => sum + level, 0) / levels.length
    ),
    playerLevelDistribution: countByProperty(
      allRecipes,
      "requirements.playerLevel"
    ),
  };
};

/**
 * Calculate component complexity statistics
 * @param {Array} allRecipes - Flattened recipes array
 * @returns {Object} Component statistics
 */
export const calculateComponentStatistics = (allRecipes) => {
  const recipesWithComponents = allRecipes.filter(
    (recipe) => recipe.recipe?.components
  );

  if (recipesWithComponents.length === 0) {
    return {
      averageComponentCount: 0,
      maxComponentCount: 0,
      totalComponents: 0,
      componentCountDistribution: {},
    };
  }

  const componentCounts = recipesWithComponents.map(
    (recipe) => recipe.recipe.components.length
  );

  return {
    averageComponentCount: Math.round(
      componentCounts.reduce((sum, count) => sum + count, 0) /
        componentCounts.length
    ),
    maxComponentCount: Math.max(...componentCounts),
    totalComponents: componentCounts.reduce((sum, count) => sum + count, 0),
    componentCountDistribution: componentCounts.reduce((dist, count) => {
      dist[count] = (dist[count] || 0) + 1;
      return dist;
    }, {}),
  };
};

/**
 * Calculate comprehensive statistics
 * @param {Object} recipes - Recipes data object
 * @param {Array} allRecipes - Flattened recipes array
 * @returns {Object} Complete statistics object
 */
export const calculateComprehensiveStatistics = (recipes, allRecipes) => ({
  ...calculateBasicStatistics(recipes, allRecipes),
  ...calculateSkillStatistics(allRecipes),
  ...calculateLevelStatistics(allRecipes),
  ...calculateComponentStatistics(allRecipes),
  lastUpdated: new Date().toISOString(),
});

/**
 * Calculate statistics for specific recipe type
 * @param {Array} recipes - Recipes of specific type
 * @param {string} type - Recipe type
 * @returns {Object} Type-specific statistics
 */
export const calculateTypeStatistics = (recipes, type) => {
  const stats = {
    type,
    count: recipes.length,
  };

  if (type === "raw_components") {
    stats.gatheringSkills = countByProperty(recipes, "gathering.skill");
    stats.gatheringLevels = countByProperty(recipes, "gathering.skillLevel");
  } else {
    stats.artisanSkills = countByProperty(recipes, "recipe.artisanSkill");
    stats.artisanLevels = countByProperty(recipes, "requirements.artisanLevel");
    stats.workStations = countByProperty(recipes, "recipe.workStation");
  }

  return stats;
};
