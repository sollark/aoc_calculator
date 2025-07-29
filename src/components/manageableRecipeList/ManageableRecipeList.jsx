import React from "react";
import PropTypes from "prop-types";
import RecipeCard from "../recipeCard/RecipeCard";
import BaseRecipeList from "../baseRecipeList/BaseRecipeList";
import { Button, IconButton } from "../ui";
import "./manageableRecipeList.css";

// ✅ EXCELLENT: Extract static props outside component
const STATIC_PROPS = {
  // Clear button static props
  clearButton: {
    variant: "danger",
    size: "small",
    icon: "🗑️",
    className: "manageable-recipe-list__clear-btn",
    children: "Clear All",
  },

  // Remove button static props
  removeButton: {
    icon: "×",
    variant: "danger",
    size: "small",
    className: "manageable-recipe-list__remove-btn",
  },

  // List static props
  list: {
    className: "manageable-recipe-list",
    emptyMessage:
      "No recipes added yet. Select a recipe and click 'Add Recipe' to get started.",
  },
};

const ManageableRecipeList = ({ recipes, onRemoveRecipe, onClearList }) => {
  // ✅ GOOD: Only dynamic props inside component
  const clearButtonDynamicProps = {
    onClick: onClearList,
    disabled: recipes.length === 0,
  };

  const listDynamicProps = {
    items: recipes,
    title: `Recipe List (${recipes.length} recipes)`,
  };

  const headerActions = (
    <Button {...STATIC_PROPS.clearButton} {...clearButtonDynamicProps} />
  );

  const renderRecipeItem = (recipe) => {
    console.log("🔍 ManageableRecipeList - renderRecipeItem recipe:", recipe);
    console.log(
      "🔍 ManageableRecipeList - recipe.id (list item ID):",
      recipe.id
    );
    console.log("🔍 ManageableRecipeList - recipe structure:", {
      id: recipe.id,
      name: recipe.name,
      hasRecipeData: !!recipe.recipe,
      originalRecipeId: recipe.recipe?.id,
      idType: typeof recipe.id,
      idValue: recipe.id,
    });

    const handleRemoveRecipe = () => {
      console.log("🗑️ Remove button clicked for recipe:", recipe.name);
      console.log("🗑️ Recipe ID being passed:", recipe.id);
      console.log("🗑️ Recipe ID type:", typeof recipe.id);
      console.log("🗑️ Recipe ID value:", recipe.id);
      console.log("🗑️ Full recipe object:", recipe);
      console.log("🗑️ About to call onRemoveRecipe with ID:", recipe.id);

      if (typeof onRemoveRecipe === "function") {
        console.log("🗑️ onRemoveRecipe is a function, calling it now");
        onRemoveRecipe(recipe.id);
      } else {
        console.error(
          "🗑️ onRemoveRecipe is not a function!",
          typeof onRemoveRecipe
        );
      }
    };

    // ✅ GOOD: Only dynamic props for remove button
    const removeButtonDynamicProps = {
      onClick: handleRemoveRecipe,
      "aria-label": `Remove ${recipe.name} recipe`,
    };

    return (
      <>
        <IconButton
          {...STATIC_PROPS.removeButton}
          {...removeButtonDynamicProps}
        />
        <RecipeCard recipe={recipe} />
      </>
    );
  };

  return (
    <BaseRecipeList
      {...STATIC_PROPS.list}
      {...listDynamicProps}
      headerActions={headerActions}
      itemRenderer={renderRecipeItem}
    />
  );
};

ManageableRecipeList.propTypes = {
  recipes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRemoveRecipe: PropTypes.func.isRequired,
  onClearList: PropTypes.func.isRequired,
};

export default ManageableRecipeList;
