I'll create a reusable Dropdown component that matches the AudiophileConsole aesthetic for your music player. This will follow the sleek, minimal design language of your other components.

I've created a comprehensive Dropdown component for your AudioCore music player. This component follows the sleek, refined aesthetic of the AudiophileConsole design while providing powerful functionality.

## Features

1. **Flexible Options Format**
   - Supports both flat option lists and grouped options
   - Can display icons or custom content in options

2. **Multiple Modes**
   - Controlled mode (with value/onChange props)
   - Uncontrolled mode (manages its own state)
   - Searchable mode for filtering options

3. **Customizable Appearance**
   - Compatible with your theming system
   - Compact mode for space-constrained UIs
   - Customizable width and height

4. **Accessibility**
   - Keyboard navigation support
   - Proper ARIA attributes
   - Focus management

5. **Visual Polish**
   - Smooth animations when opening/closing
   - Visual indicators for selected items
   - Consistent with your existing components

## Usage Examples

```jsx
// Basic usage
<Dropdown
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ]}
  placeholder="Select an option"
  onChange={(value) => console.log('Selected:', value)}
/>

// With option groups
<Dropdown
  options={[
    { 
      label: 'Group 1', 
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ]
    },
    { 
      label: 'Group 2', 
      options: [
        { value: 'option3', label: 'Option 3' },
        { value: 'option4', label: 'Option 4' }
      ]
    }
  ]}
/>

// Searchable dropdown
<Dropdown
  options={trackOptions}
  searchable
  placeholder="Search tracks..."
/>
```

The dropdown component integrates with your Icon system for the expand/collapse indicators and selected item checkmarks. It also uses your theme tokens for consistent spacing, colors, and animations.

This component will be particularly useful for filter controls in your library browser, output device selection, and anywhere else you need to provide users with a list of options in a compact, elegant interface.