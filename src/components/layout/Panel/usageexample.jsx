// Example usage of the different Panel components

import React from 'react';
import Panel from './components/layout/Panel';
import { SecondaryButton } from './components/common/Button';
import Icon from './components/common/Icon';

const PanelExamples = () => {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Basic Panel */}
      <Panel 
        title="BASIC PANEL" 
        iconName="Albums"
        headerActions={
          <SecondaryButton>
            <Icon name="Settings" size="14px" style={{ marginRight: '4px' }} />
            Settings
          </SecondaryButton>
        }
      >
        <p>This is a basic panel with a title and header actions.</p>
        <p>Panels are useful for organizing content in your UI.</p>
      </Panel>
      
      {/* Collapsible Panel */}
      <Panel.Collapsible 
        title="COLLAPSIBLE PANEL" 
        iconName="Songs"
        headerControls={
          <SecondaryButton>
            <Icon name="More" size="14px" />
          </SecondaryButton>
        }
      >
        <p>This panel can be collapsed by clicking on the header.</p>
        <p>It's useful for sections that the user might want to hide temporarily.</p>
        <p>Click the header or the expand/collapse icon to toggle visibility.</p>
      </Panel.Collapsible>
      
      {/* Collapsible Panel (Initially Collapsed) */}
      <Panel.Collapsible 
        title="INITIALLY COLLAPSED" 
        iconName="Playlist"
        defaultCollapsed={true}
      >
        <p>This panel starts in the collapsed state.</p>
        <p>Click the header to expand it.</p>
      </Panel.Collapsible>
      
      {/* Resizable Panel */}
      <Panel.Resizable 
        title="RESIZABLE PANEL" 
        iconName="Equalizer"
        initialWidth="100%"
        initialHeight="200px"
        minHeight="100px"
        maxHeight="400px"
      >
        <p>This panel can be resized by dragging its edges.</p>
        <p>Try dragging the bottom edge to change its height.</p>
        <p>The right edge can be dragged to change width.</p>
        <p>The bottom-right corner can be dragged to change both dimensions at once.</p>
      </Panel.Resizable>
      
      {/* Resizable Panel (Width Only) */}
      <Panel.Resizable 
        title="WIDTH RESIZABLE ONLY" 
        iconName="WaveformIcon"
        initialWidth="100%"
        initialHeight="150px"
        resizeHeight={false}
      >
        <p>This panel can only be resized horizontally.</p>
        <p>Try dragging the right edge to change its width.</p>
      </Panel.Resizable>
      
      {/* Resizable Panel (Height Only) */}
      <Panel.Resizable 
        title="HEIGHT RESIZABLE ONLY" 
        iconName="Home"
        initialWidth="100%"
        initialHeight="150px"
        resizeWidth={false}
      >
        <p>This panel can only be resized vertically.</p>
        <p>Try dragging the bottom edge to change its height.</p>
      </Panel.Resizable>
    </div>
  );
};

export default PanelExamples;