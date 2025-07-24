import { useState, useEffect } from "react";

/**
 * Custom hook for calculating consolidated components from recipe list
 * @param {Array} recipeList - List of recipes to process
 * @param {Object} recipeServiceFunctions - Recipe service functions
 * @returns {Array} Consolidated components
 */
export const useComponentCalculation = (recipeList, recipeServiceFunctions) => {
  const [consolidatedComponents, setConsolidatedComponents] = useState([]);

  useEffect(() => {
    if (!recipeServiceFunctions || recipeList.length === 0) {
      setConsolidatedComponents([]);
      return;
    }

    try {
      const consolidated =
        recipeServiceFunctions.processRecipeListToRawComponents(recipeList);
      setConsolidatedComponents(consolidated);
    } catch (err) {
      console.error("Error processing recipe list:", err);
      setConsolidatedComponents([]);
    }
  }, [recipeList, recipeServiceFunctions]);

  return consolidatedComponents;
};
