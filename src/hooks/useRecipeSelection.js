import { useState, useEffect, useCallback } from "react";
import { initializeDefaultRecipe } from "../services/appStateService";

/**
 * Custom hook for managing recipe selection
 * @param {Array} availableRecipes - Available recipes to choose from
 * @returns {Object} Recipe selection state and handlers
 */
export const useRecipeSelection = (availableRecipes) => {
  const [selectedRecipe, setSelectedRecipe] = useState("");

  // Auto-select default recipe when recipes become available
  useEffect(() => {
    if (availableRecipes.length > 0 && !selectedRecipe) {
      const defaultRecipe = initializeDefaultRecipe(
        availableRecipes,
        selectedRecipe
      );
      setSelectedRecipe(defaultRecipe);
    }
  }, [availableRecipes, selectedRecipe]);

  const handleRecipeChange = useCallback((recipeName) => {
    setSelectedRecipe(recipeName);
  }, []);

  return {
    selectedRecipe,
    handleRecipeChange,
  };
};
