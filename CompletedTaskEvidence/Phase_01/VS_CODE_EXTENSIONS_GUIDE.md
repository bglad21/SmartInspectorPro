# VS Code Extensions - Manual Installation Guide

## Option 1: Install via VS Code Extensions Panel (Recommended)

### Instructions:
1. Open VS Code
2. Click on the Extensions icon in the left sidebar (or press `Cmd+Shift+X`)
3. Search for each extension and click "Install"

### Essential Extensions to Install:

#### 1. React Native Tools
- **Extension ID**: `msjsdiag.vscode-react-native`
- **Search**: "React Native Tools"
- **Publisher**: Microsoft
- **Features**: Debugging, IntelliSense, commands for React Native

#### 2. ESLint
- **Extension ID**: `dbaeumer.vscode-eslint`
- **Search**: "ESLint"
- **Publisher**: Microsoft
- **Features**: JavaScript/TypeScript linting

#### 3. Prettier - Code Formatter
- **Extension ID**: `esbenp.prettier-vscode`
- **Search**: "Prettier"
- **Publisher**: Prettier
- **Features**: Automatic code formatting

#### 4. ES7+ React/Redux/React-Native snippets
- **Extension ID**: `dsznajder.es7-react-js-snippets`
- **Search**: "ES7 React"
- **Publisher**: dsznajder
- **Features**: Code snippets for React Native

#### 5. Path Intellisense
- **Extension ID**: `christian-kohler.path-intellisense`
- **Search**: "Path Intellisense"
- **Publisher**: Christian Kohler
- **Features**: File path autocomplete

#### 6. npm Intellisense
- **Extension ID**: `christian-kohler.npm-intellisense`
- **Search**: "npm Intellisense"
- **Publisher**: Christian Kohler
- **Features**: npm module autocomplete

#### 7. GitLens
- **Extension ID**: `eamodio.gitlens`
- **Search**: "GitLens"
- **Publisher**: GitKraken
- **Features**: Enhanced Git capabilities

#### 8. React Native Snippet
- **Extension ID**: `jundat95.react-native-snippet`
- **Search**: "React Native Snippet"
- **Publisher**: Jundat
- **Features**: Additional React Native snippets

#### 9. Auto Close Tag
- **Extension ID**: `formulahendry.auto-close-tag`
- **Search**: "Auto Close Tag"
- **Publisher**: Jun Han
- **Features**: Auto close JSX/HTML tags

---

## Option 2: Enable 'code' Command (For Command Line Installation)

### Enable the 'code' command in PATH:
1. Open VS Code
2. Press `Cmd+Shift+P` to open Command Palette
3. Type "Shell Command: Install 'code' command in PATH"
4. Select it and press Enter

### Then run this command in terminal:
```bash
code --install-extension msjsdiag.vscode-react-native && \
code --install-extension dbaeumer.vscode-eslint && \
code --install-extension esbenp.prettier-vscode && \
code --install-extension dsznajder.es7-react-js-snippets && \
code --install-extension christian-kohler.path-intellisense && \
code --install-extension christian-kohler.npm-intellisense && \
code --install-extension eamodio.gitlens && \
code --install-extension jundat95.react-native-snippet && \
code --install-extension formulahendry.auto-close-tag
```

---

## Verification

After installing extensions, verify in VS Code:
1. Press `Cmd+Shift+X` to open Extensions
2. Check that all 9 extensions are installed
3. Look for "React Native Tools" in the list

---

## Recommended VS Code Settings

Create or update `.vscode/settings.json` in your project:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "files.associations": {
    "*.js": "javascriptreact"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Next Steps After Installing Extensions

1. ✅ Restart VS Code to activate all extensions
2. ✅ Open a React Native project to test IntelliSense
3. ✅ Verify React Native Tools debugger is available
4. ✅ Check that Prettier formats code on save

---

**Please install these 9 extensions manually through VS Code Extensions panel.**
