import React, { useState } from "react";
import Recipe from "./components/recipe/Recipe";
import "./App.css";

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <h1>AoC Calculator</h1>
        <p>A helpful tool for crafting in Ashes of Creation</p>
      </header>
      <main>
        <p>Welcome to the AoC Calculator!</p>

        <Recipe />

      </main>
      <footer className="App-footer">
        <p>&copy; 2025 AoC Calculator</p>
      </footer>
    </div>
  );
}

export default App;
