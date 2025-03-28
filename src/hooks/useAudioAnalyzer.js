import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../providers/PlayerProvider';
import audioService from '../../../services/AudioService';

/**
 * Custom hook for audio analysis and visualization
 * Uses the enhanced AudioService with SignalProcessor and FrequencyMapper
 */
const useAudioAnalyzer = (options = {}) => {
  // Options with defaults
  const {
    fftSize = 2048,
    smoothingTimeConstant = 0.8,
    useDemoData = false
  } = options;

  // State for analysis data
  const [spectrumData, setSpectrumData] = useState([]);
  const [waveformData, setWaveformData] = useState([]);
  const [signalLevel, setSignalLevel] = useState(0);
  const [spectralData, setSpectralData] = useState({
    centroid: 0,
    flatness: 0,
    spread: 0
  });

  // Refs for processing
  const animationFrameRef = useRef(null);
  const engineComponentsRef = useRef(null);

  // Get player context
  const { isPlaying, analyser } = usePlayer();

  // Sample frequency bands for spectrum analyzer
  const frequencyBands = [30, 60, 120, 250, 500, 1000, 2000, 4000, 8000, 16000];

  // Initialize audio analyzer
  useEffect(() => {
    // Get advanced engine components
    const components = audioService.getEngineComponents();
    engineComponentsRef.current = components;

    // Clean up on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Start/stop analysis based on playback state
  useEffect(() => {
    if (!useDemoData && isPlaying && engineComponentsRef.current) {
      startAnalysis();
    } else {
      // Stop ongoing analysis
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Generate demo data when not playing
      if (useDemoData || !isPlaying) {
        generateDemoData();
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, useDemoData]);

  // Start audio analysis using enhanced audio engine
  const startAnalysis = () => {
    // Use the advanced SignalProcessor from the audio engine if available
    const signalProcessor = engineComponentsRef.current?.core?.SignalProcessor || null;
    
    // If no SignalProcessor is available, fall back to standard analyzer
    const analyzerNode = signalProcessor || analyser;
    
    if (!analyzerNode) {
      console.warn('No analyzer available for audio visualization');
      generateDemoData();
      return;
    }

    // Analysis function
    const analyze = () => {
      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(analyze);

      // Use SignalProcessor for advanced analysis if available
      if (signalProcessor) {
        // Get frequency and time domain data from SignalProcessor
        const frequencyData = signalProcessor.getFrequencyData(true); // true for Float32Array
        const waveformData = signalProcessor.getWaveformData(true);
        
        // Get band energy from SignalProcessor
        const bands = signalProcessor.analyzeFrequencyBands ? 
          signalProcessor.analyzeFrequencyBands() : null;
        
        // Get advanced features from SignalProcessor
        const features = signalProcessor.getFeatures ?
          signalProcessor.getFeatures() : {};
        
        // Process the data
        if (frequencyData) processAdvancedFrequencyData(frequencyData, bands);
        if (waveformData) processAdvancedWaveformData(waveformData);
        
        // Set spectral features if available
        if (features.spectral) {
          setSpectralData({
            centroid: features.spectral.centroid || 0,
            flatness: features.spectral.flatness || 0,
            spread: features.spectral.rolloff ? features.spectral.rolloff / 20000 : 0
          });
        }
        
        // Calculate overall signal level
        if (bands) {
          const total = calculateOverallEnergy(bands);
          setSignalLevel(total);
        }
      } 
      // Fall back to basic AnalyserNode API if necessary
      else if (analyser) {
        // Create buffers for analysis data
        const freqDataArray = new Uint8Array(analyser.frequencyBinCount);
        const timeDataArray = new Uint8Array(analyser.frequencyBinCount);

        // Get frequency and time domain data
        analyser.getByteFrequencyData(freqDataArray);
        analyser.getByteTimeDomainData(timeDataArray);

        // Process data
        processFrequencyData(freqDataArray);
        processWaveformData(timeDataArray);
        calculateSignalLevel(freqDataArray);
      }
    };

    // Start analysis
    analyze();
  };

  // Process frequency data using advanced SignalProcessor
  const processAdvancedFrequencyData = (frequencyData, bands) => {
    if (!frequencyData) return;
    
    // If we have band data, use that for spectrum visualization
    if (bands) {
      const spectrum = frequencyBands.map(freq => {
        // Find closest band
        if (freq <= 250) return bands.bass?.energy || 0;
        if (freq <= 500) return bands.lowMid?.energy || 0;
        if (freq <= 2000) return bands.mid?.energy || 0;
        if (freq <= 4000) return bands.highMid?.energy || 0;
        return bands.high?.energy || 0;
      });
      
      setSpectrumData(spectrum);
    } 
    // Otherwise process raw frequency data
    else {
      const bufferLength = frequencyData.length;
      const nyquist = engineComponentsRef.current?.core?.getContext()?.sampleRate 
        ? engineComponentsRef.current.core.getContext().sampleRate / 2 
        : 24000;

      // Map frequency bands to their corresponding FFT bins
      const spectrum = frequencyBands.map(freq => {
        const index = Math.round((freq / nyquist) * bufferLength);

        // Get a range of bins around the target frequency (for smoother response)
        const rangeStart = Math.max(0, index - 2);
        const rangeEnd = Math.min(bufferLength - 1, index + 2);

        // Get average value in the range
        let sum = 0;
        let count = 0;
        
        for (let i = rangeStart; i <= rangeEnd; i++) {
          // Handle both Float32Array (dB scale) and Uint8Array
          if (frequencyData instanceof Float32Array) {
            // Convert from dB to linear scale (approximately)
            sum += (frequencyData[i] + 100) / 100; // Normalize -100 to 0 dB to 0-1 range
          } else {
            sum += frequencyData[i] / 255;
          }
          count++;
        }
        
        return count > 0 ? sum / count : 0;
      });

      setSpectrumData(spectrum);
    }
  };

  // Process waveform data using advanced SignalProcessor
  const processAdvancedWaveformData = (waveformData) => {
    if (!waveformData || !waveformData.length) return;
    
    // Sample the data (we don't need all points)
    const samples = 100;
    const sampleRate = Math.floor(waveformData.length / samples);

    const waveform = Array.from({ length: samples }, (_, i) => {
      const index = i * sampleRate;
      // Data is already in -1 to 1 range if it's Float32Array
      return waveformData[index];
    });

    setWaveformData(waveform);
  };

  // Calculate overall energy from band data
  const calculateOverallEnergy = (bands) => {
    if (!bands) return 0;
    
    // Calculate weighted average of all bands
    let totalEnergy = 0;
    let totalWeight = 0;
    
    const weights = {
      bass: 1.0,
      lowMid: 0.8,
      mid: 0.8,
      highMid: 0.7,
      high: 0.6
    };

    // Process each band that exists
    Object.entries(bands).forEach(([bandName, bandData]) => {
      if (bandData && bandData.energy !== undefined && weights[bandName]) {
        totalEnergy += bandData.energy * weights[bandName];
        totalWeight += weights[bandName];
      }
    });

    return totalWeight > 0 ? totalEnergy / totalWeight : 0;
  };

  // Process frequency data using standard AnalyserNode (fallback)
  const processFrequencyData = (dataArray) => {
    const bufferLength = dataArray.length;
    const nyquist = 24000; // Assume 48kHz sample rate

    // Map frequency bands to their corresponding FFT bins
    const spectrum = frequencyBands.map(freq => {
      const index = Math.round((freq / nyquist) * bufferLength);

      // Get a range of bins around the target frequency (for smoother response)
      const rangeStart = Math.max(0, index - 2);
      const rangeEnd = Math.min(bufferLength - 1, index + 2);

      // Get average value in the range
      let sum = 0;
      for (let i = rangeStart; i <= rangeEnd; i++) {
        sum += dataArray[i];
      }
      const average = sum / (rangeEnd - rangeStart + 1);

      // Normalize to 0-1
      return average / 255;
    });

    setSpectrumData(spectrum);
  };

  // Process time domain data for waveform visualization (fallback)
  const processWaveformData = (dataArray) => {
    // Sample the data (we don't need all points)
    const samples = 100;
    const sampleRate = Math.floor(dataArray.length / samples);

    const waveform = Array.from({ length: samples }, (_, i) => {
      const index = i * sampleRate;
      // Convert from 0-255 to -1 to 1
      return (dataArray[index] / 128) - 1;
    });

    setWaveformData(waveform);
  };

  // Calculate overall signal level (fallback)
  const calculateSignalLevel = (freqData) => {
    // Calculate RMS of frequency data
    let sum = 0;
    for (let i = 0; i < freqData.length; i++) {
      sum += (freqData[i] / 255) ** 2;
    }
    const rms = Math.sqrt(sum / freqData.length);

    // Set signal level (0-1)
    setSignalLevel(Math.min(1, rms * 2.5)); // Scale up for better visibility
  };

  // Generate demo data for when audio isn't playing
  const generateDemoData = () => {
    // Generate spectrum data
    const demoSpectrum = frequencyBands.map((_, i) => {
      const baseHeight = 0.4;
      const rand = Math.random() * 0.3;

      // Create a bell curve peaking in the mid frequencies
      const curve = 1 - Math.abs(
        (i - frequencyBands.length / 2) / (frequencyBands.length / 2)
      );

      return baseHeight + rand * curve;
    });

    // Generate waveform data
    const demoWaveform = Array.from({ length: 100 }, (_, i) => {
      const base = Math.sin(i * 0.2) * 0.3;
      const noise = Math.sin(i * 0.5) * 0.1 + Math.sin(i * 0.33) * 0.05;
      return base + noise;
    });

    // Set demo data
    setSpectrumData(demoSpectrum);
    setWaveformData(demoWaveform);
    setSignalLevel(0.6 + Math.random() * 0.2);
    
    // Set demo spectral data
    setSpectralData({
      centroid: 1000 + Math.random() * 2000,
      flatness: 0.3 + Math.random() * 0.4,
      spread: 0.4 + Math.random() * 0.3
    });
  };

  return {
    spectrumData,
    waveformData,
    signalLevel,
    spectralData,
    frequencyBands,
    isAnalyzing: !!animationFrameRef.current
  };
};

export default useAudioAnalyzer;