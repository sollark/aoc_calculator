/**
 * Filter predicates for recipe filtering
 */

/**
 * Create ID filter predicate
 * @param {number|Array} id - Single ID or array of IDs
 * @returns {Function} Filter predicate
 */
export const byId = (id) => {
  const ids = Array.isArray(id) ? id : [id];
  return (recipe) => ids.includes(recipe.id);
};

/**
 * Create exact name match predicate
 * @param {string} name - Name to match
 * @returns {Function} Filter predicate
 */
export const byExactName = (name) => (recipe) =>
  recipe.name.toLowerCase() === name.toLowerCase();

/**
 * Create partial name match predicate
 * @param {string} nameContains - String that name should contain
 * @returns {Function} Filter predicate
 */
export const byNameContains = (nameContains) => (recipe) =>
  recipe.name.toLowerCase().includes(nameContains.toLowerCase());

/**
 * Create artisan skill filter predicate
 * @param {string} artisanSkill - Artisan skill to match
 * @returns {Function} Filter predicate
 */
export const byArtisanSkill = (artisanSkill) => (recipe) =>
  recipe.recipe?.artisanSkill?.toLowerCase() === artisanSkill.toLowerCase();

/**
 * Create artisan level filter predicate
 * @param {string} artisanLevel - Artisan level to match
 * @returns {Function} Filter predicate
 */
export const byArtisanLevel = (artisanLevel) => (recipe) =>
  recipe.requirements?.artisanLevel?.toLowerCase() ===
  artisanLevel.toLowerCase();

/**
 * Create gathering skill filter predicate
 * @param {string} gatheringSkill - Gathering skill to match
 * @returns {Function} Filter predicate
 */
export const byGatheringSkill = (gatheringSkill) => (recipe) =>
  recipe.gathering?.skill?.toLowerCase() === gatheringSkill.toLowerCase();

/**
 * Create gathering level filter predicate
 * @param {string} gatheringLevel - Gathering level to match
 * @returns {Function} Filter predicate
 */
export const byGatheringLevel = (gatheringLevel) => (recipe) =>
  recipe.gathering?.skillLevel?.toLowerCase() === gatheringLevel.toLowerCase();

/**
 * Create keywords search predicate
 * @param {string|Array} keywords - Keywords to search for
 * @returns {Function} Filter predicate
 */
export const byKeywords = (keywords) => {
  const keywordArray = Array.isArray(keywords) ? keywords : [keywords];
  return (recipe) => {
    const searchText = `${recipe.name} ${
      recipe.description || ""
    }`.toLowerCase();
    return keywordArray.some((keyword) =>
      searchText.includes(keyword.toLowerCase())
    );
  };
};

/**
 * Create recipe type filter predicate
 * @param {string} type - Recipe type to match
 * @returns {Function} Filter predicate
 */
export const byType = (type) => (recipe) => recipe.type === type;

/**
 * Create minimum player level filter predicate
 * @param {number} minLevel - Minimum player level
 * @returns {Function} Filter predicate
 */
export const byMinPlayerLevel = (minLevel) => (recipe) =>
  (recipe.requirements?.playerLevel || 0) >= minLevel;

/**
 * Create maximum player level filter predicate
 * @param {number} maxLevel - Maximum player level
 * @returns {Function} Filter predicate
 */
export const byMaxPlayerLevel = (maxLevel) => (recipe) =>
  (recipe.requirements?.playerLevel || 0) <= maxLevel;

/**
 * Create component usage filter predicate
 * @param {number} componentId - Component ID to search for
 * @returns {Function} Filter predicate
 */
export const byComponentUsage = (componentId) => (recipe) =>
  recipe.recipe?.components?.some((component) => component.id === componentId);

/**
 * Create workstation filter predicate
 * @param {string} workStation - Workstation to match
 * @returns {Function} Filter predicate
 */
export const byWorkStation = (workStation) => (recipe) =>
  recipe.recipe?.workStation?.toLowerCase() === workStation.toLowerCase();

/**
 * Create player level range filter predicate
 * @param {number} minLevel - Minimum level (inclusive)
 * @param {number} maxLevel - Maximum level (inclusive)
 * @returns {Function} Filter predicate
 */
export const byPlayerLevelRange = (minLevel, maxLevel) => (recipe) => {
  const level = recipe.requirements?.playerLevel || 0;
  return level >= minLevel && level <= maxLevel;
};

/**
 * Map of filter names to their corresponding functions
 */
export const FILTER_PREDICATES = {
  id: byId,
  name: byExactName,
  nameContains: byNameContains,
  artisanSkill: byArtisanSkill,
  artisanLevel: byArtisanLevel,
  gatheringSkill: byGatheringSkill,
  gatheringLevel: byGatheringLevel,
  keywords: byKeywords,
  type: byType,
  minPlayerLevel: byMinPlayerLevel,
  maxPlayerLevel: byMaxPlayerLevel,
  componentUsage: byComponentUsage,
  workStation: byWorkStation,
};

/**
 * Higher-order function to compose filter predicates
 * @param {Object} filters - Filter criteria object
 * @returns {Function} Composed filter function
 */
export const createFilterFunction = (filters) => {
  const filterFunctions = [];

  // Build array of filter functions based on provided criteria
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && FILTER_PREDICATES[key]) {
      filterFunctions.push(FILTER_PREDICATES[key](value));
    }
  });

  // Return composed filter function that applies all filters
  return (recipe) => filterFunctions.every((filterFn) => filterFn(recipe));
};
