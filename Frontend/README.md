## 🚀 Stockd: Frontend Repo

### 1️⃣ Clone the repository
```bash
git clone https://github.com/stockd-app/Stockd.git
cd Frontend
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Run main.tsx
```bash
npm run dev
```
- The server will run at: http://localhost:5173/

### Deploy to HTTPS
```bash
npm run deploy
```
- Before running script, ensure .env in Backend folder are updated (ENV=prod/ENV=dev + your device's IPv4 address)
- This automated script will:
- 1. npm run build -> Builds distribution folder and its content
- 2. Copy over dist content to Backend/app/static/frontend to be served in a single tunnel(Frontend + Backend) by ngrok.
- 3. Activate virtual environment (Creates one and activate if none exist)
- 4. pip install -r requirements.txt
- 5. uvicorn app.main:app --reload
- 6. ngrok http 8000

### Frontend Development Guideline.
1. React Components starts with capital letter. (e.g. Profile.tsx)
2. Static variable store in consts.ts, with capitalised variable name. (e.g. GOOGLE_CLIENT_ID)
3. For each function implemented, comment it's functionality, parameters, and returns.
4. Follow BEM convention for CSS classname, Block__Element-Modifier.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
