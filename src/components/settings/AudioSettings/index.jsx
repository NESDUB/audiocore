import React, { useState } from 'react';
import styled from 'styled-components';
import SettingsSection, { 
  Setting, 
  SettingSelect, 
  SettingCheckbox, 
  SettingRange 
} from '../SettingsPanel/SettingsSection';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

// Output device mock data (would come from Web Audio API in real app)
const outputDevices = [
  { value: 'default', label: 'System Default' },
  { value: 'speakers', label: 'Computer Speakers' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'external', label: 'External Audio Interface' }
];

// Sample rate options
const sampleRates = [
  { value: '44100', label: '44.1 kHz' },
  { value: '48000', label: '48 kHz' },
  { value: '88200', label: '88.2 kHz' },
  { value: '96000', label: '96 kHz' }
];

// Bit depth options
const bitDepths = [
  { value: '16', label: '16-bit' },
  { value: '24', label: '24-bit' },
  { value: '32', label: '32-bit (Float)' }
];

// Buffer size options
const bufferSizes = [
  { value: '128', label: '128 (Lowest latency)' },
  { value: '256', label: '256' },
  { value: '512', label: '512' },
  { value: '1024', label: '1024' },
  { value: '2048', label: '2048 (Highest stability)' }
];

// Format quality options
const formatQualities = [
  { value: 'original', label: 'Original format' },
  { value: 'high', label: 'High quality (320kbps)' },
  { value: 'medium', label: 'Medium quality (192kbps)' },
  { value: 'low', label: 'Low quality (128kbps)' }
];

// Resampling quality options
const resamplingQualities = [
  { value: 'best', label: 'Best quality (Slowest)' },
  { value: 'medium', label: 'Medium quality' },
  { value: 'fastest', label: 'Fastest (Lowest quality)' }
];

const AudioSettings = () => {
  // Device settings
  const [outputDevice, setOutputDevice] = useState('default');
  const [exclusiveMode, setExclusiveMode] = useState(false);
  
  // Quality settings
  const [sampleRate, setSampleRate] = useState('48000');
  const [bitDepth, setBitDepth] = useState('24');
  const [bufferSize, setBufferSize] = useState('512');
  
  // Playback settings
  const [volume, setVolume] = useState(75);
  const [normalization, setNormalization] = useState(true);
  const [formatQuality, setFormatQuality] = useState('original');
  const [gaplessPlayback, setGaplessPlayback] = useState(true);
  
  // Processing settings
  const [resampling, setResampling] = useState('medium');
  const [dithering, setDithering] = useState(true);
  
  // Effects
  const [equalizer, setEqualizer] = useState(false);
  const [reverb, setReverb] = useState(false);
  const [compression, setCompression] = useState(false);
  
  return (
    <Container>
      <SettingsSection 
        title="Output Device" 
        icon="VolumeUp"
        description="Configure your audio output device settings."
      >
        <Setting label="Output Device">
          <SettingSelect 
            value={outputDevice}
            onChange={(e) => setOutputDevice(e.target.value)}
            options={outputDevices}
          />
        </Setting>
        
        <Setting 
          label="Exclusive Mode" 
          description="Request exclusive access to the audio device. This may provide better sound quality but prevents other applications from using audio."
        >
          <SettingCheckbox 
            id="exclusive-mode"
            checked={exclusiveMode}
            onChange={(e) => setExclusiveMode(e.target.checked)}
            label="Enable exclusive mode"
          />
        </Setting>
      </SettingsSection>
      
      <SettingsSection 
        title="Audio Quality" 
        icon="Equalizer"
        description="Configure the quality settings for audio processing."
        collapsible
      >
        <Setting label="Sample Rate">
          <SettingSelect 
            value={sampleRate}
            onChange={(e) => setSampleRate(e.target.value)}
            options={sampleRates}
          />
        </Setting>
        
        <Setting label="Bit Depth">
          <SettingSelect 
            value={bitDepth}
            onChange={(e) => setBitDepth(e.target.value)}
            options={bitDepths}
          />
        </Setting>
        
        <Setting 
          label="Buffer Size" 
          description="Lower values reduce latency but may cause audio dropouts. Higher values increase stability but add latency."
        >
          <SettingSelect 
            value={bufferSize}
            onChange={(e) => setBufferSize(e.target.value)}
            options={bufferSizes}
          />
        </Setting>
      </SettingsSection>
      
      <SettingsSection 
        title="Playback" 
        icon="Play"
        collapsible
      >
        <Setting label="Volume">
          <SettingRange 
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            formatValue={(val) => `${val}%`}
          />
        </Setting>
        
        <Setting 
          label="Volume Normalization" 
          description="Automatically adjust volume to maintain consistent levels across tracks."
        >
          <SettingCheckbox 
            id="normalization"
            checked={normalization}
            onChange={(e) => setNormalization(e.target.checked)}
            label="Enable normalization"
          />
        </Setting>
        
        <Setting label="Format Quality">
          <SettingSelect 
            value={formatQuality}
            onChange={(e) => setFormatQuality(e.target.value)}
            options={formatQualities}
          />
        </Setting>
        
        <Setting 
          label="Gapless Playback" 
          description="Eliminate gaps between tracks for a continuous listening experience."
        >
          <SettingCheckbox 
            id="gapless-playback"
            checked={gaplessPlayback}
            onChange={(e) => setGaplessPlayback(e.target.checked)}
            label="Enable gapless playback"
          />
        </Setting>
      </SettingsSection>
      
      <SettingsSection 
        title="Audio Processing" 
        icon="WaveformIcon"
        collapsible
        defaultCollapsed
      >
        <Setting label="Resampling Quality">
          <SettingSelect 
            value={resampling}
            onChange={(e) => setResampling(e.target.value)}
            options={resamplingQualities}
          />
        </Setting>
        
        <Setting 
          label="Dithering" 
          description="Apply noise shaping to improve sound quality when reducing bit depth."
        >
          <SettingCheckbox 
            id="dithering"
            checked={dithering}
            onChange={(e) => setDithering(e.target.checked)}
            label="Enable dithering"
          />
        </Setting>
      </SettingsSection>
      
      <SettingsSection 
        title="Effects" 
        icon="Equalizer"
        description="Enable or disable audio processing effects."
        collapsible
        defaultCollapsed
        columns={2}
      >
        <Setting>
          <SettingCheckbox 
            id="equalizer"
            checked={equalizer}
            onChange={(e) => setEqualizer(e.target.checked)}
            label="Equalizer"
          />
        </Setting>
        
        <Setting>
          <SettingCheckbox 
            id="reverb"
            checked={reverb}
            onChange={(e) => setReverb(e.target.checked)}
            label="Reverb"
          />
        </Setting>
        
        <Setting>
          <SettingCheckbox 
            id="compression"
            checked={compression}
            onChange={(e) => setCompression(e.target.checked)}
            label="Dynamic Compression"
          />
        </Setting>
      </SettingsSection>
    </Container>
  );
};

export default AudioSettings;