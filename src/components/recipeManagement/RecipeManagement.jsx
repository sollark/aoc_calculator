import React, { useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useAvailableList } from "../../contexts/AvailableListContext.js";
import { useSelectedList } from "../../contexts/SelectedListContext.js";
import { useRecipeSelection } from "../../hooks/useRecipeSelection.js";
import { useRecipeStats } from "../../hooks/useRecipeStats.js";
import { useRecipeValidation } from "../../hooks/useRecipeValidation.js";
import RecipeSelector from "../recipeSelector/RecipeSelector.jsx";
import ManageableRecipeList from "../manageableRecipeList/ManageableRecipeList.jsx";
import "./recipeManagement.css";

const RecipeManagement = ({ onRecipeListChange }) => {
  // ✅ CONTEXT: Get loading/error states
  const { isLoading, error } = useAvailableList();

  // ✅ CONTEXT: Get selected recipes directly
  const { recipeList, addRecipe, removeRecipe, clearList } = useSelectedList();

  // ✅ SIMPLIFIED: Get stats and craftable recipes from hook (which uses context)
  const { craftableRecipes, ...stats } = useRecipeStats();

  // Initialize other hooks
  const { selectedRecipe, handleRecipeChange } =
    useRecipeSelection(craftableRecipes);
  const validation = useRecipeValidation(selectedRecipe);

  // Handle add recipe button click
  const handleAddClick = useCallback(
    async (event) => {
      event.preventDefault();
      console.log("🔧 Add recipe button clicked!");
      console.log("📋 Selected recipe:", selectedRecipe?.name);
      console.log("✅ Can add selected:", validation.canAddSelected);

      if (!validation.canAddSelected) {
        console.log("❌ Cannot add recipe: validation failed");
        return;
      }

      if (!selectedRecipe) {
        console.log("❌ No recipe selected");
        return;
      }

      try {
        const result = await addRecipe(selectedRecipe);
        if (result && result.success) {
          console.log("✅ Recipe added successfully!");
        }
      } catch (error) {
        console.error("❌ Error adding recipe:", error);
      }
    },
    [selectedRecipe, validation, addRecipe]
  );

  // Handle remove recipe
  const handleRemoveRecipe = useCallback(
    (recipeId) => {
      console.log("🗑️ Removing recipe with ID:", recipeId);
      removeRecipe(recipeId);
    },
    [removeRecipe]
  );

  // Handle clear list
  const handleClearList = useCallback(() => {
    console.log("🧹 Clearing recipe list");
    clearList();
  }, [clearList]);

  // Update parent when recipe list changes
  useEffect(() => {
    console.log("🎯 Recipe list updated:", recipeList);
    if (onRecipeListChange) {
      onRecipeListChange(recipeList);
    }
  }, [recipeList, onRecipeListChange]);

  // Debug logging
  useEffect(() => {
    console.log(
      "📋 RecipeManagement - craftable recipes:",
      craftableRecipes?.length || 0
    );
    console.log(
      "📋 RecipeManagement - selected recipes:",
      recipeList?.length || 0
    );
  }, [craftableRecipes, recipeList]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="recipe-management">
        <div className="recipe-management__loading">Loading recipes...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="recipe-management">
        <div className="recipe-management__error">
          Error loading recipes: {error}
        </div>
      </div>
    );
  }

  // Transform recipe list for display
  const transformedRecipeList = recipeList.map((item) => {
    // Handle case where recipe is stored as string (legacy bug)
    if (typeof item.recipe === "string") {
      return {
        id: item.id,
        name: item.recipe,
        quantity: item.quantity || 1,
        error: "Recipe stored as string instead of object",
      };
    }

    // Handle correct case where recipe is an object
    return {
      ...item.recipe,
      id: item.id, // Use list item ID for removal operations
      name: item.recipe?.name || "Unknown Recipe",
      quantity: item.quantity || 1,
    };
  });

  return (
    <div className="recipe-management">
      <div className="recipe-management__selector">
        <RecipeSelector
          recipes={craftableRecipes}
          selectedRecipe={selectedRecipe}
          onRecipeChange={handleRecipeChange}
          onAddRecipe={handleAddClick}
          recipeListCount={recipeList.length}
        />
        <RecipeSelectionStats stats={stats} validation={validation} />
      </div>

      <div className="recipe-management__list">
        <ManageableRecipeList
          recipes={transformedRecipeList}
          onRemoveRecipe={handleRemoveRecipe}
          onClearList={handleClearList}
        />
      </div>
    </div>
  );
};

/**
 * Component for displaying recipe selection statistics
 */
const RecipeSelectionStats = ({ stats, validation }) => (
  <div className="recipe-management__stats">
    <div className="recipe-management__stat-group">
      <span className="recipe-management__stat">
        Craftable Recipes: {stats?.totalRecipes || 0}
      </span>
      <span className="recipe-management__stat">
        Selected: {stats?.selectedCount || 0}
      </span>
      <span className="recipe-management__stat">
        Remaining: {stats?.availableCount || 0}
      </span>
    </div>

    {stats?.duplicateCount > 0 && (
      <div className="recipe-management__warning">
        ⚠️ {stats.duplicateCount} duplicate recipes detected
      </div>
    )}

    <div className="recipe-management__status">
      {validation?.canAddSelected ? (
        <span className="recipe-management__status--ready">
          ✅ Ready to add recipe
        </span>
      ) : validation?.hasSelection ? (
        <span className="recipe-management__status--duplicate">
          ⚠️ Recipe already in list
        </span>
      ) : (
        <span className="recipe-management__status--none">
          📝 Select a recipe to add
        </span>
      )}
    </div>
  </div>
);

// PropTypes
RecipeManagement.propTypes = {
  onRecipeListChange: PropTypes.func,
};

RecipeSelectionStats.propTypes = {
  stats: PropTypes.shape({
    totalRecipes: PropTypes.number,
    selectedCount: PropTypes.number,
    availableCount: PropTypes.number,
    duplicateCount: PropTypes.number,
    hasRecipes: PropTypes.bool,
    canAddMore: PropTypes.bool,
  }),
  validation: PropTypes.shape({
    canAddSelected: PropTypes.bool,
    canClearList: PropTypes.bool,
    hasSelection: PropTypes.bool,
    isAlreadyInList: PropTypes.bool,
  }),
};

export default RecipeManagement;
