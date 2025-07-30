import React from "react";
import RecipeManagement from "./recipeManagement/RecipeManagement";
import ComponentList from "./componentList/ComponentList";
import { useComponentCalculation } from "../hooks/useComponentCalculation";

const InnerApp = () => {
  const consolidatedComponents = useComponentCalculation();

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏗️ Ashes of Creation Calculator</h1>
        <p>Plan your crafting recipes and calculate required components.</p>
      </header>

      <main className="App-main">
        <section className="App-section">
          <h2>📋 Recipe Management</h2>
          <RecipeManagement />
        </section>

        <section className="App-section">
          <h2>🧱 Required Components</h2>
          <ComponentList
            components={consolidatedComponents}
            title="Consolidated Components"
            showQuantityControls={true}
            showBreakdown={true}
          />
        </section>
      </main>

      <footer className="App-footer">
        <p>&copy; 2025 AoC Calculator</p>
      </footer>
    </div>
  );
};

export default InnerApp;
