import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../providers/PlayerProvider';

/**
 * Custom hook for audio analysis and visualization
 * Provides data for visualizers, spectrum analyzers, and other audio visualization components
 */
const useAudioAnalyzer = () => {
  // State for analysis data
  const [spectrumData, setSpectrumData] = useState([]);
  const [waveformData, setWaveformData] = useState([]);
  const [signalLevel, setSignalLevel] = useState(0);
  
  // Refs for audio processing
  const audioContextRef = useRef(null);
  const analyserNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Get player context
  const { audioElement, isPlaying } = usePlayer();
  
  // Sample frequency bands for spectrum analyzer
  const frequencyBands = [30, 60, 120, 250, 500, 1000, 2000, 4000, 8000, 16000];
  
  // Initialize audio analyzer
  useEffect(() => {
    // Create audio context and analyzer if they don't exist
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserNodeRef.current = audioContextRef.current.createAnalyser();
        
        // Configure analyzer
        analyserNodeRef.current.fftSize = 2048;
        analyserNodeRef.current.smoothingTimeConstant = 0.8;
        
        // Connect analyzer to audio output
        analyserNodeRef.current.connect(audioContextRef.current.destination);
      } catch (error) {
        console.error('Error initializing audio analyzer:', error);
      }
    }
    
    // Clean up on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (audioContextRef.current) {
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
        }
        audioContextRef.current.close().catch(err => console.error('Error closing audio context:', err));
      }
    };
  }, []);
  
  // Connect audio element to analyzer when playing changes
  useEffect(() => {
    if (!audioContextRef.current || !analyserNodeRef.current || !audioElement) {
      // If not playing or not set up, generate demo data
      generateDemoData();
      return;
    }
    
    // Connect source when playing
    if (isPlaying) {
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(err => console.error('Error resuming audio context:', err));
      }
      
      // Create source node if needed
      if (!sourceNodeRef.current) {
        try {
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElement);
          sourceNodeRef.current.connect(analyserNodeRef.current);
        } catch (error) {
          console.error('Error creating media element source:', error);
          generateDemoData();
          return;
        }
      }
      
      // Start analysis
      startAnalysis();
    } else {
      // Stop analysis when not playing
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Generate demo data when not playing
      generateDemoData();
    }
  }, [isPlaying, audioElement]);
  
  // Start audio analysis
  const startAnalysis = () => {
    if (!analyserNodeRef.current) return;
    
    // Create buffers for analysis data
    const freqDataArray = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
    const timeDataArray = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
    
    // Analysis function
    const analyze = () => {
      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(analyze);
      
      // Get frequency and time domain data
      analyserNodeRef.current.getByteFrequencyData(freqDataArray);
      analyserNodeRef.current.getByteTimeDomainData(timeDataArray);
      
      // Process data
      processFrequencyData(freqDataArray);
      processWaveformData(timeDataArray);
      calculateSignalLevel(freqDataArray);
    };
    
    // Start analysis
    analyze();
  };
  
  // Process frequency data for spectrum visualization
  const processFrequencyData = (dataArray) => {
    const bufferLength = dataArray.length;
    const nyquist = audioContextRef.current?.sampleRate ? audioContextRef.current.sampleRate / 2 : 24000;
    
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
  
  // Process time domain data for waveform visualization
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
  
  // Calculate overall signal level
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
  };
  
  return {
    spectrumData,
    waveformData,
    signalLevel,
    frequencyBands,
    isAnalyzing: !!animationFrameRef.current
  };
};

export default useAudioAnalyzer;