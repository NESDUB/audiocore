I'll create these two panel component variations that follow the same AudiophileConsole styling pattern and incorporate our new icon system.
</thinking>

I've created the CollapsiblePanel and ResizablePanel components for your AudioCore project. These components extend the base Panel functionality with additional features while maintaining the AudiophileConsole styling.

I've also updated the main Panel component to incorporate these new panel variants and created a usage example to demonstrate how they work:

The Panel components I've created follow the AudiophileConsole styling and provide powerful UI elements for your music player. Here's a breakdown of what each component offers:

## CollapsiblePanel
This component creates a panel that can be expanded or collapsed with a click on its header:

- **Smooth animations** for expanding and collapsing content
- **Header with icon** support using our icon system
- **Customizable controls** in the header alongside the collapse indicator
- **Callback function** when expanded/collapsed state changes
- **Default collapsed state** option

## ResizablePanel
This component creates a panel that can be resized by the user by dragging its edges:

- **Interactive resizing** from edges and corners with visual feedback
- **Configurable resize constraints** (min/max width and height)
- **Resize direction control** (horizontal, vertical, or both)
- **Initial size customization**
- **Resize callback function** to respond to user resizing
- **Subtle resize handles** that appear on hover

## Updated Panel System
I've also updated the base Panel component to incorporate these variants through a consistent API:

```jsx
// Base Panel
<Panel title="BASIC PANEL" iconName="Albums">
  Content goes here
</Panel>

// Collapsible Panel
<Panel.Collapsible title="COLLAPSIBLE PANEL" iconName="Songs">
  Content goes here
</Panel.Collapsible>

// Resizable Panel
<Panel.Resizable title="RESIZABLE PANEL" iconName="Equalizer">
  Content goes here
</Panel.Resizable>
```

These panels will be extremely useful for creating flexible UI layouts in your music player. For example:

- Use CollapsiblePanel for sections like playlists, equalizer controls, or metadata displays
- Use ResizablePanel for visualization areas, track listings, or any section where the user might want to adjust the view

The components maintain the sleek, minimal aesthetic of your AudiophileConsole design while adding sophisticated interaction capabilities that professional audio applications typically offer.