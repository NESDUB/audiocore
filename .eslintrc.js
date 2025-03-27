module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended', 'plugin:jsx-a11y/recommended', 'plugin:storybook/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y', // Accessibility
    'import', // Import validation
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx']
      }
    }
  },
  rules: {
    // React rules
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'warn',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-key': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-unescaped-entities': 'warn',
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    'react/self-closing-comp': ['warn', { component: true, html: true }],
    
    // General rules
    'no-unused-vars': ['warn', { 
      varsIgnorePattern: '^_', 
      argsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_'
    }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
    'no-var': 'warn',
    'eqeqeq': ['warn', 'always'],
    
    // Import rules
    'import/no-unresolved': 'warn',
    'import/named': 'error',
    'import/order': ['warn', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc', caseInsensitive: true }
    }],
    
    // Audio-specific rules
    'no-restricted-globals': ['error', {
      name: 'event',
      message: 'Use the parameter instead.'
    }],
    
    // Accessibility
    'jsx-a11y/media-has-caption': 'off', // Turn off for audio player components
  },
  // Override rules for specific files or directories
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx'],
      env: {
        jest: true
      },
      rules: {
        'no-undef': 'off'
      }
    },
    {
      files: ['src/features/player/**/*.js', 'src/features/player/**/*.jsx'],
      rules: {
        'no-unused-vars': 'warn'
      }
    }
  ]
};