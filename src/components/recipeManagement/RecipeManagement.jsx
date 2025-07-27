import React, { useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useRecipeContext } from "../../contexts/RecipeContext.js";
import { useRecipeList } from "../../hooks/useRecipeList.js";
import { useRecipeSelection } from "../../hooks/useRecipeSelection.js";
import { useRecipeStats } from "../../hooks/useRecipeStats.js";
import { useRecipeValidation } from "../../hooks/useRecipeValidation.js";
import RecipeSelector from "../recipeSelector/RecipeSelector.jsx";
import ManageableRecipeList from "../manageableRecipeList/ManageableRecipeList.jsx"; // Use your existing component
import "./recipeManagement.css";

const RecipeManagement = ({ onRecipeListChange }) => {
  // Get recipes from context
  const { availableRecipes, isLoading, error, stateManagers } =
    useRecipeContext();

  // Use availableRecipes from context
  const allRecipes = React.useMemo(
    () => availableRecipes || [],
    [availableRecipes]
  );

  // Initialize hooks with correct data
  const { selectedRecipe, handleRecipeChange } = useRecipeSelection(allRecipes);
  const { recipeList, handleAddRecipe, handleRemoveRecipe, handleClearList } =
    useRecipeList(stateManagers);
  const stats = useRecipeStats(allRecipes, recipeList);
  const validation = useRecipeValidation(
    selectedRecipe,
    recipeList,
    allRecipes
  );

  // Handle add recipe button click
  const handleAddClick = useCallback(
    async (event) => {
      event.preventDefault();
      console.log("🔧 Add recipe button clicked!");
      console.log("📋 Selected recipe:", selectedRecipe?.name);
      console.log("✅ Can add selected:", validation.canAddSelected);
      console.log("📚 All recipes count:", allRecipes?.length);
      console.log("🏗️ Current recipe list:", recipeList);
      console.log("🔍 Validation details:", validation);

      // Debug logs for structures
      console.log("🔍 Selected recipe full structure:", {
        name: selectedRecipe?.name,
        id: selectedRecipe?.id,
        type: typeof selectedRecipe,
        isString: typeof selectedRecipe === "string",
        fullObject: selectedRecipe,
      });
      console.log("🔍 Recipe list full structure:", recipeList);
      console.log("🔍 Validation breakdown:", {
        hasSelection: validation.hasSelection,
        canAddSelected: validation.canAddSelected,
        isAlreadyInList: validation.isAlreadyInList,
        canClearList: validation.canClearList,
      });

      // Check validation
      if (!validation.canAddSelected) {
        console.log("❌ Cannot add recipe: validation failed");
        if (!validation.hasSelection) {
          console.log("❌ Reason: No recipe selected");
        } else if (validation.isAlreadyInList) {
          console.log("❌ Reason: Recipe already in list");
        } else {
          console.log(
            "❌ Reason: Unknown validation issue - check useRecipeValidation logic"
          );
        }
        return;
      }

      if (!selectedRecipe) {
        console.log("❌ No recipe selected");
        return;
      }

      try {
        console.log("🎯 Recipe to add:", selectedRecipe);
        console.log("➕ Calling handleAddRecipe with:", selectedRecipe);

        const result = await handleAddRecipe(selectedRecipe);
        console.log("📤 AddRecipe result:", result);

        if (result && result.success) {
          console.log("✅ Recipe added successfully!");
        } else {
          console.warn("⚠️ AddRecipe returned unsuccessful result:", result);
        }
      } catch (error) {
        console.error("❌ Error adding recipe:", error);
      }
    },
    [selectedRecipe, validation, handleAddRecipe, allRecipes, recipeList]
  );

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
      "📋 RecipeManagement - availableRecipes from context:",
      availableRecipes?.length || 0
    );
    console.log("📋 RecipeManagement - isLoading:", isLoading);
    console.log("📋 RecipeManagement - error:", error);
  }, [availableRecipes, isLoading, error]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="recipe-management">
        <div className="recipe-management__loading">Loading recipes...</div>
      </div>
    );
  }

  // Show error state
  // TODO: Error component
  if (error) {
    return (
      <div className="recipe-management">
        <div className="recipe-management__error">
          Error loading recipes: {error}
        </div>
      </div>
    );
  }

  // Transform recipeList to match ManageableRecipeList expectations
  const transformedRecipeList = recipeList.map((item) => {
    console.log("🔍 Transforming item:", item);

    // Handle case where recipe is stored as string (current bug)
    if (typeof item.recipe === "string") {
      return {
        id: item.id,
        name: item.recipe, // Use the string as name
        quantity: item.quantity || 1,
        error: "Recipe stored as string instead of object",
      };
    }

    // Handle correct case where recipe is an object
    return {
      id: item.id,
      name: item.recipe?.name || "Unknown Recipe",
      ...item.recipe, // Spread the recipe data
      quantity: item.quantity || 1,
    };
  });

  return (
    <div className="recipe-management">
      <div className="recipe-management__selector">
        <RecipeSelector
          recipes={allRecipes}
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
        Total Available: {stats?.totalRecipes || 0}
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
