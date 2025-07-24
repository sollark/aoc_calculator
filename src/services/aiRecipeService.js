import {
  ID_RANGES,
  getNextAvailableId,
  validateId,
} from "../db/idAssignmentRules";

export const aiRecipeService = {
  getRulesForAI: () => ({
    idRanges: ID_RANGES,
    instructions:
      "Use getNextAvailableId() for new IDs, validateId() to check them",
  }),

  generateNewId: (itemType, category) => getNextAvailableId(itemType, category),
  validateNewId: (id, itemType, category) => validateId(id, itemType, category),
};
