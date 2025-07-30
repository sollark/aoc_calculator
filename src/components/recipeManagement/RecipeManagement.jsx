import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useAvailableList } from "../../contexts/AvailableListContext.js";
import { useSelectedList } from "../../contexts/SelectedListContext.js";
import { useRecipeSelection } from "../../hooks/useRecipeSelection.js";
import { useRecipeStats } from "../../hooks/useRecipeStats.js";
import { useRecipeValidation } from "../../hooks/useRecipeValidation.js";
import RecipeSelector from "../recipeSelector/RecipeSelector.jsx";
import ManageableRecipeList from "../manageableRecipeList/ManageableRecipeList.jsx";
import "./recipeManagement.css";

const RecipeManagement = () => {
  const { isLoading, error } = useAvailableList();
  const { recipeList, addRecipe, removeRecipe, clearList } = useSelectedList();
  const { craftableRecipes, ...stats } = useRecipeStats();
  const { selectedRecipe, handleRecipeChange } =
    useRecipeSelection(craftableRecipes);
  const validation = useRecipeValidation(selectedRecipe);

  const handleAddClick = useCallback(
    async (event) => {
      event.preventDefault();
      if (!validation.canAddSelected || !selectedRecipe) return;
      try {
        await addRecipe(selectedRecipe);
      } catch (error) {
        console.error("❌ Error adding recipe:", error);
      }
    },
    [selectedRecipe, validation, addRecipe]
  );

  const handleRemoveRecipe = useCallback(
    (recipeId) => {
      removeRecipe(recipeId);
    },
    [removeRecipe]
  );

  const handleClearList = useCallback(() => {
    clearList();
  }, [clearList]);

  // Debug logging only
  React.useEffect(() => {
    console.log(
      "📋 RecipeManagement - craftable recipes:",
      craftableRecipes?.length || 0
    );
    console.log(
      "📋 RecipeManagement - selected recipes:",
      recipeList?.length || 0
    );
  }, [craftableRecipes, recipeList]);

  if (isLoading) {
    return (
      <div className="recipe-management">
        <div className="recipe-management__loading">Loading recipes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipe-management">
        <div className="recipe-management__error">
          Error loading recipes: {error}
        </div>
      </div>
    );
  }

  const transformedRecipeList = recipeList.map((item) => {
    if (typeof item.recipe === "string") {
      return {
        id: item.id,
        name: item.recipe,
        quantity: item.quantity || 1,
        error: "Recipe stored as string instead of object",
      };
    }
    return {
      ...item.recipe,
      id: item.id,
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

// Remove unused prop type
RecipeManagement.propTypes = {};

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
