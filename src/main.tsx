import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/**
 * Application Entry Point
 * 
 * Mounts the React application to the DOM.
 */
createRoot(document.getElementById("root")!).render(<App />);
