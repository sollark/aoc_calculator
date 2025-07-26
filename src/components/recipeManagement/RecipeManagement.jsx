import React, { useCallback, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import RecipeSelector from "../recipeSelector/RecipeSelector";
import ManageableRecipeList from "../manageableRecipeList/ManageableRecipeList";
import { useRecipeContext } from "../../contexts/RecipeContext.js";
import { useRecipeSelection } from "../../hooks/useRecipeSelection";
import { useRecipeList } from "../../hooks/useRecipeList";
import { useRecipeStats } from "../../hooks/useRecipeStats";
import { useRecipeValidation } from "../../hooks/useRecipeValidation";
import "./recipeManagement.css";

/**
 * Self-contained recipe management component
 * Gets all recipes from context using recipeService
 */
const RecipeManagement = ({ onRecipeListChange }) => {
  // Get recipes from context (not from service directly)
  const { availableRecipes, isLoading, error, recipeService, stateManagers } =
    useRecipeContext();

  // Use availableRecipes from context instead of calling service directly
  const allRecipes = availableRecipes || [];

  // Internal state management using custom hooks
  const { selectedRecipe, handleRecipeChange } = useRecipeSelection(allRecipes);
  const {
    recipeList,
    handleAddRecipe: addRecipe,
    handleRemoveRecipe,
    handleClearList: clearList,
  } = useRecipeList(stateManagers);

  // Statistics and validation
  const recipeStats = useRecipeStats(allRecipes, recipeList);
  const recipeValidation = useRecipeValidation(
    selectedRecipe,
    recipeList,
    allRecipes,
    recipeService
  );

  // Notify parent component when recipe list changes
  React.useEffect(() => {
    if (onRecipeListChange) {
      onRecipeListChange(recipeList);
    }
  }, [recipeList, onRecipeListChange]);

  /**
   * Enhanced add recipe handler with validation
   */
  const handleAddRecipeWithValidation = useCallback(() => {
    console.log("🔧 Add recipe button clicked!");
    console.log("📋 Selected recipe:", selectedRecipe);
    console.log("✅ Can add selected:", recipeValidation.canAddSelected);
    console.log("📚 All recipes count:", allRecipes.length);
    console.log("🏗️ Current recipe list:", recipeList);

    if (!recipeValidation.canAddSelected) {
      console.warn("❌ Cannot add recipe: validation failed");
      console.log("🔍 Validation details:", recipeValidation);
      return;
    }

    // Find the actual recipe object by name
    const recipeToAdd = allRecipes.find(
      (recipe) => recipe.name === selectedRecipe
    );

    console.log("🎯 Recipe to add:", recipeToAdd);

    if (!recipeToAdd) {
      console.error("❌ Recipe not found:", selectedRecipe);
      return;
    }

    console.log("➕ Calling addRecipe with:", recipeToAdd);

    // Pass the recipe object, not just the name
    const result = addRecipe(recipeToAdd);
    console.log("📤 AddRecipe result:", result);
  }, [addRecipe, selectedRecipe, allRecipes, recipeList, recipeValidation]);

  /**
   * Enhanced clear list handler with confirmation
   */
  const handleClearListWithConfirmation = useCallback(() => {
    if (recipeStats.selectedCount > 0) {
      const shouldClear = window.confirm(
        `Are you sure you want to clear all ${recipeStats.selectedCount} recipes?`
      );

      if (shouldClear) {
        clearList();
      }
    }
  }, [clearList, recipeStats.selectedCount]);

  /**
   * Render recipe selector section
   */
  const renderRecipeSelector = useCallback(
    () => (
      <section className="recipe-management__selector-section">
        <h3 className="recipe-management__section-title">Recipe Selection</h3>
        <RecipeSelector
          recipes={allRecipes}
          selectedRecipe={selectedRecipe}
          onRecipeChange={handleRecipeChange}
          onAddRecipe={handleAddRecipeWithValidation}
          recipeListCount={recipeStats.selectedCount}
          disabled={!recipeValidation.hasSelection}
          canAdd={recipeValidation.canAddSelected}
        />
        <RecipeSelectionStats
          stats={recipeStats}
          validation={recipeValidation}
        />
      </section>
    ),
    [
      allRecipes,
      selectedRecipe,
      handleRecipeChange,
      handleAddRecipeWithValidation,
      recipeStats,
      recipeValidation,
    ]
  );

  /**
   * Render recipe list section
   */
  const renderRecipeList = useCallback(
    () => (
      <section className="recipe-management__list-section">
        <h3 className="recipe-management__section-title">Selected Recipes</h3>
        <ManageableRecipeList
          recipes={recipeList}
          onRemoveRecipe={handleRemoveRecipe}
          onClearList={handleClearListWithConfirmation}
          showStats={true}
          stats={recipeStats}
        />
      </section>
    ),
    [
      recipeList,
      handleRemoveRecipe,
      handleClearListWithConfirmation,
      recipeStats,
    ]
  );

  // Add this debug after the recipeList state is updated
  useEffect(() => {
    console.log("🎯 Recipe list updated:", recipeList);
    recipeList.forEach((item, index) => {
      console.log(`🎯 Recipe ${index}:`, item);
      console.log(`🎯 Recipe ${index} data:`, item.recipe);
    });
  }, [recipeList]);

  // Debug logging for RecipeManagement (allRecipes)
  useEffect(() => {
    console.log(
      "📋 RecipeManagement - availableRecipes from context:",
      availableRecipes?.length || 0
    );
    console.log("📋 RecipeManagement - isLoading:", isLoading);
    console.log("📋 RecipeManagement - error:", error);
  }, [availableRecipes, isLoading, error]);

  return (
    <div className="recipe-management">
      {renderRecipeSelector()}
      {renderRecipeList()}
    </div>
  );
};

/**
 * Pure component for displaying recipe selection statistics
 */
const RecipeSelectionStats = ({ stats, validation }) => (
  <div className="recipe-management__stats">
    <div className="recipe-management__stat-group">
      <span className="recipe-management__stat">
        Total Available: {stats.totalRecipes}
      </span>
      <span className="recipe-management__stat">
        Selected: {stats.selectedCount}
      </span>
      <span className="recipe-management__stat">
        Remaining: {stats.availableCount}
      </span>
    </div>

    {stats.duplicateCount > 0 && (
      <div className="recipe-management__warning">
        ⚠️ {stats.duplicateCount} duplicate recipes detected
      </div>
    )}

    <div className="recipe-management__status">
      {validation.canAddSelected ? (
        <span className="recipe-management__status--ready">
          ✅ Ready to add recipe
        </span>
      ) : validation.hasSelection ? (
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

/**
 * Simplified PropTypes
 */
RecipeManagement.propTypes = {
  onRecipeListChange: PropTypes.func, // Optional callback for parent updates
};

RecipeSelectionStats.propTypes = {
  stats: PropTypes.shape({
    totalRecipes: PropTypes.number.isRequired,
    selectedCount: PropTypes.number.isRequired,
    availableCount: PropTypes.number.isRequired,
    duplicateCount: PropTypes.number.isRequired,
    hasRecipes: PropTypes.bool.isRequired,
    canAddMore: PropTypes.bool.isRequired,
  }).isRequired,
  validation: PropTypes.shape({
    canAddSelected: PropTypes.bool.isRequired,
    canClearList: PropTypes.bool.isRequired,
    hasSelection: PropTypes.bool.isRequired,
  }).isRequired,
};

export default RecipeManagement;
