import React, { useState } from "react";
import CraftComponent from "../craftComponent/CraftComponent";

const TestRecipeData = {
  id: 5001,
  name: "Magic Powder",
  icon: null,
  description: "Base powder used in scrolls and inks",
  type: "crafted_material",
  recipe: {
    workStation: "alchemy_station",
    artisanSkill: "alchemy",
    components: [
      { id: 6001, name: "Essence Crystal", quantity: 1 },
      { id: 6002, name: "Snowdrop", quantity: 1 },
      { id: 6003, name: "Daffodil", quantity: 1 },
    ],
  },

  usedInRecipes: [],
};

const Recipe = ({ recipeData }) => {
  if (!recipeData) recipeData = TestRecipeData;
    console.log(`Recipe component rendered with data:`, recipeData);

  const [quantity, setQuantity] = useState(5);
  const [playerHasQuantity, setPlayerHasQuantity] = useState(0);

  const {
    name,
    icon,
    description,
    recipe: { workStation, artisanSkill, components = [] } = {},
  } = recipeData;

  console.log(`components:`, components);

  return (
    <div className="recipe">
      <h2>
        {icon ? <img src={icon} alt={name} /> : null} {name}
      </h2>
      <p>{description}</p>
      <div>
        <strong>Work Station:</strong> {workStation}
      </div>
      <div>
        <strong>Artisan Skill:</strong> {artisanSkill}
      </div>
      <div>
        <strong>Components:</strong>
        <ul>
          {components.map((component) => (
            <li key={component.id}>
              <CraftComponent
                name={component.name}
                quantity={component.quantity}
                onQuantityChange={(name, value) => {
                  console.log(`Updated ${name} quantity to ${value}`);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Recipe;
