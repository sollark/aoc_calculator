import React from "react";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import RecipeManagement from "./components/recipeManagement/RecipeManagement";
import ComponentList from "./components/componentList/ComponentList";
import { useComponentCalculation } from "./hooks/useComponentCalculation";

const InnerApp = () => {
  const consolidatedComponents = useComponentCalculation();

  return (
    <div className="App">
      <Header />
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
      <Footer />
    </div>
  );
};

export default InnerApp;
