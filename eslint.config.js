// Removed: import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";


export default [ // Removed defineConfig wrapper
  // 1. Apply base JS recommended rules & settings
  js.configs.recommended,

  // 2. Apply React recommended rules & settings (uses flat config format)
  pluginReact.configs.flat.recommended,

  // 3. Configure language options (like globals) and specific rules overrides
  //    This can often be merged or refined, but let's keep it separate for clarity first.
  {
    files: ["**/*.{js,mjs,cjs,jsx}"], // Target relevant files
    languageOptions: {
      globals: {
        ...globals.browser // Use browser globals
        // Add other globals if needed: ...globals.node
      },
      // Ensure React settings are applied (often done by pluginReact.configs.flat.recommended)
      parserOptions: {
         ecmaFeatures: { jsx: true },
      },
    },
    // You might want to customize plugin settings or rules here
    settings: {
      react: {
        version: "detect" // Automatically detect React version
      }
    },
    // Example: Add specific rule overrides if needed
    // rules: {
    //   'react/prop-types': 'off'
    // }
  },

  // Optional: Add ignore patterns
  {
    ignores: ["dist/", "node_modules/", "build/"] // Add patterns for ignored directories/files
  }

  // Note: The original line 8 ({ files: ["**/*.{js,mjs,cjs,jsx}"] })
  //       was likely redundant as the other configs specify files.
];