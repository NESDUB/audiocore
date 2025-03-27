I'll create a comprehensive Typography component that aligns with the AudiophileConsole aesthetic and provides a consistent typing system across your application.

I've created a comprehensive Typography system for your AudioCore music player that perfectly complements the AudiophileConsole aesthetic. This system provides consistent, high-quality typography across your application while maintaining the sleek, professional look you're aiming for.

## Typography Component Features

The typography system includes:

### 1. Main Typography Component
A flexible component that renders different text styles based on the `variant` prop:

```jsx
<Typography variant="h1">Your Heading Text</Typography>
<Typography variant="body1">Regular paragraph text</Typography>
```

### 2. Specialized Text Components

- **DisplayText**: For large headings and titles
- **HeadingText**: For section headings (h1-h6)
- **LabelText**: For form labels and section titles
- **BodyText**: For paragraphs and main content
- **TechText**: For monospace technical information like timecodes
- **SectionTitle**: For section headers with underlines (common in AudiophileConsole)
- **StatusText**: For status indicators with optional color-coded dots

### 3. Rich Customization Options

All components support a wide range of props for customization:

- **color**: Custom text color
- **weight**: Font weight (regular, medium, bold)
- **uppercase**: Transform text to uppercase
- **center/right**: Text alignment
- **noWrap**: Prevent text wrapping
- **truncate**: Truncate text with ellipsis after specified lines
- **spacing**: Letter spacing
- **lineHeight**: Line height
- **margin/padding**: Custom spacing
- **monospace**: Use monospace font
- **opacity**: Custom opacity

### 4. Responsive & Theme-Aware

- All components automatically adapt to your theme colors and spacing
- Font sizes are properly scaled for different screen sizes
- The system works with both dark and light themes

## Usage Examples

```jsx
// Simple heading
<HeadingText variant="h1">My Playlist</HeadingText>

// Section title with underline
<SectionTitle>LIBRARY</SectionTitle>

// Status indicator with colored dot
<StatusText status="success" withDot>ENGINE ACTIVE</StatusText>

// Technical information
<TechText>48kHz / 24bit</TechText>

// Body text with customization
<BodyText truncate={2} lineHeight={1.4}>
  This will be truncated after two lines...
</BodyText>
```

I've also created a demo component that showcases all the typography styles and variations, which you can use as a reference for your design system.

This typography system follows the AudiophileConsole aesthetic with its emphasis on clear hierarchy, professional spacing, and refined typography. It maintains the sleek, elegant look while ensuring readability and flexibility across your application.