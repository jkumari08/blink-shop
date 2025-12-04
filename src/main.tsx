import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("main.tsx loaded");

const root = document.getElementById("root");
console.log("root element:", root);

if (root) {
  createRoot(root).render(<App />);
  console.log("React app mounted");
} else {
  console.error("Root element not found!");
}
