import { useState, useEffect, useCallback } from "react";
import { initializeDefaultRecipe } from "../services/appStateService";

/**
 * Custom hook for managing recipe selection
 * @param {Array} availableRecipes - Available recipes to choose from
 * @returns {Object} Recipe selection state and handlers
 */
export const useRecipeSelection = (allRecipes) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Auto-select default recipe when recipes become available
  useEffect(() => {
    if (allRecipes.length > 0 && !selectedRecipe) {
      const defaultRecipe = initializeDefaultRecipe(allRecipes, selectedRecipe);
      setSelectedRecipe(defaultRecipe);
    }
  }, [allRecipes, selectedRecipe]);

  const handleRecipeChange = (recipeInput) => {
    console.log("🔍 handleRecipeChange called with:", recipeInput);

    if (!recipeInput) {
      setSelectedRecipe(null);
      return;
    }

    // If it's already a full recipe object, use it directly
    if (typeof recipeInput === "object" && recipeInput.id) {
      console.log("🔍 Received full recipe object:", recipeInput);
      setSelectedRecipe(recipeInput);
      return;
    }

    // If it's a string (recipe name), find the full recipe
    if (typeof recipeInput === "string") {
      const foundRecipe = allRecipes.find(
        (recipe) => recipe.name === recipeInput
      );

      if (foundRecipe) {
        console.log("🔍 Found full recipe:", foundRecipe);
        setSelectedRecipe(foundRecipe);
      } else {
        console.warn("⚠️ Recipe not found:", recipeInput);
        setSelectedRecipe(null);
      }
      return;
    }

    console.error("❌ Invalid recipe input:", recipeInput);
    setSelectedRecipe(null);
  };

  return {
    selectedRecipe,
    handleRecipeChange,
  };
};
