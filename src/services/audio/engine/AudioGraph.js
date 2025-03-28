// src/components/Core/AudioGraph.js

/**
 * AudioGraph - Manages the connections between audio nodes, creating a flexible
 * routing system for audio signal processing. It provides a higher-level abstraction
 * over direct node connections, supporting complex routing topologies and
 * dynamic reconfiguration.
 */
class AudioGraph {
  /**
   * Creates a new AudioGraph instance
   * @param {Object} options - Configuration options
   * @param {AudioContext} options.audioContext - Web Audio API AudioContext
   * @param {Object} [options.errorManager] - Error manager for handling errors
   * @param {function} [options.onEvent] - Event callback function
   */
  constructor(options = {}) {
    if (!options.audioContext) {
      throw new Error('AudioGraph requires an AudioContext');
    }

    this.audioContext = options.audioContext;
    this.errorManager = options.errorManager;
    this.onEvent = options.onEvent || (() => {});

    // Track nodes and connections
    this.nodes = new Map(); // id -> node
    this.connections = new Map(); // id -> connection data
    
    // Bidirectional connection tracking
    this.connectionsBySource = new Map(); // sourceId -> Set of connectionIds
    this.connectionsByDestination = new Map(); // destinationId -> Set of connectionIds
    
    this.routeTemplates = new Map(); // template name -> connection pattern

    // Counter for generating IDs
    this.nextNodeId = 1;
    this.nextConnectionId = 1;

    // Configuration
    this.config = {
      validateConnections: options.validateConnections !== false,
      trackNodes: options.trackNodes !== false,
      maxNodes: options.maxNodes || 100,
      autoConnect: options.autoConnect !== false
    };

    this.initialized = true;
    this._emitEvent('initialized', {});
  }

  /**
   * Register an audio node with the graph
   * @param {AudioNode} node - Audio node to register
   * @param {Object} [metadata={}] - Node metadata
   * @returns {string} Node ID
   */
  registerNode(node, metadata = {}) {
    if (!node) {
      throw new Error('Cannot register null node');
    }

    // Check if node is already registered
    for (const [id, existingNode] of this.nodes.entries()) {
      if (existingNode.node === node) {
        return id;
      }
    }

    // Generate a new node ID
    const nodeId = `node_${this.nextNodeId++}`;

    // Register the node
    this.nodes.set(nodeId, {
      node,
      type: metadata.type || this._detectNodeType(node),
      metadata,
      connections: [],
      createdAt: Date.now()
    });

    // Initialize bidirectional tracking entries for this node
    this.connectionsBySource.set(nodeId, new Set());
    this.connectionsByDestination.set(nodeId, new Set());

    this._emitEvent('node:registered', {
      nodeId,
      type: this.nodes.get(nodeId).type
    });

    return nodeId;
  }

  /**
   * Register an audio node with the graph
   * @param {AudioNode} node - Audio node to register
   * @param {Object} [metadata={}] - Node metadata
   * @returns {string} Node ID
   */
  registerNode(node, metadata = {}) {
    if (!node) {
      throw new Error('Cannot register null node');
    }
    
    // Check if node is already registered
    for (const [id, existingNode] of this.nodes.entries()) {
      if (existingNode.node === node) {
        return id;
      }
    }
    
    // Generate a new node ID
    const nodeId = `node_${this.nextNodeId++}`;
    
    // Register the node
    this.nodes.set(nodeId, {
      node,
      type: metadata.type || this._detectNodeType(node),
      metadata,
      connections: [],
      createdAt: Date.now()
    });
    
    // Initialize bidirectional tracking entries for this node
    this.connectionsBySource.set(nodeId, new Set());
    this.connectionsByDestination.set(nodeId, new Set());
    
    this._emitEvent('node:registered', {
      nodeId,
      type: this.nodes.get(nodeId).type
    });
    
    return nodeId;
  }
  
  /**
   * Detects the type of an AudioNode
   * @private
   * @param {AudioNode} node - The node to detect type for
   * @returns {string} The node type
   */
  _detectNodeType(node) {
    // Check for standard Web Audio API node types
    if (node instanceof AnalyserNode) {
      return 'analyser';
    } else if (node instanceof AudioBufferSourceNode) {
      return 'source';
    } else if (node instanceof GainNode) {
      return 'gain';
    } else if (node instanceof BiquadFilterNode) {
      return 'filter';
    } else if (node instanceof DelayNode) {
      return 'delay';
    } else if (node instanceof DynamicsCompressorNode) {
      return 'compressor';
    } else if (node instanceof ConvolverNode) {
      return 'convolver';
    } else if (node instanceof WaveShaperNode) {
      return 'waveshaper';
    } else if (node instanceof OscillatorNode) {
      return 'oscillator';
    } else if (node instanceof PannerNode) {
      return 'panner';
    } else if (node instanceof StereoPannerNode) {
      return 'stereopanner';
    }
    
    // Check for custom node types
    if (node.constructor && node.constructor.name) {
      const name = node.constructor.name.toLowerCase();
      if (name.includes('signalprocessor')) {
        return 'signalprocessor';
      } else if (name.includes('analyser')) {
        return 'analyser';
      }
    }
    
    // Check for type property (for custom nodes)
    if (node.type) {
      return node.type;
    }
    
    // Default fallback
    return 'unknown';
  }

  /**
   * Connect two audio nodes
   * @param {AudioNode|string} source - Source node or node ID
   * @param {AudioNode|string} destination - Destination node or node ID
   * @param {Object} [options={}] - Connection options
   * @returns {string} Connection ID
   */
  connect(source, destination, options = {}) {
    try {
      // Resolve nodes if IDs were provided
      const sourceNode = this._resolveNode(source);
      const destNode = this._resolveNode(destination);

      if (!sourceNode || !destNode) {
        throw new Error('Invalid source or destination node');
      }

      // Determine output/input indices
      const outputIndex = options.outputIndex || 0;
      const inputIndex = options.inputIndex || 0;

      // Generate a unique connection ID
      const connectionId = `conn_${this.nextConnectionId++}`;

      // Create actual Web Audio API connection
      try {
        if (options.audioParam && destNode[options.audioParam] instanceof AudioParam) {
          // Connect to an AudioParam
          sourceNode.connect(destNode[options.audioParam], outputIndex);
        } else {
          // Standard node-to-node connection
          sourceNode.connect(destNode, outputIndex, inputIndex);
        }
      } catch (error) {
        throw new Error(`Failed to create connection: ${error.message}`);
      }

      // Get or create node IDs
      const sourceId = this._getNodeId(source);
      const destId = this._getNodeId(destination);

      // Store connection data
      const connectionData = {
        id: connectionId,
        sourceId,
        destinationId: destId,
        sourceNode,
        destinationNode: destNode,
        outputIndex,
        inputIndex,
        audioParam: options.audioParam,
        metadata: options.metadata || {},
        createdAt: Date.now()
      };

      this.connections.set(connectionId, connectionData);

      // Add to bidirectional tracking
      this.connectionsBySource.get(sourceId)?.add(connectionId);
      this.connectionsByDestination.get(destId)?.add(connectionId);

      // Add connection to node's connection list
      if (this.nodes.has(sourceId)) {
        this.nodes.get(sourceId).connections.push(connectionId);
      }

      this._emitEvent('connection:created', {
        connectionId,
        sourceId,
        destinationId: destId,
        audioParam: options.audioParam
      });

      return connectionId;
    } catch (error) {
      if (this.errorManager) {
        this.errorManager.handleError(error, {
          component: 'AudioGraph',
          operation: 'connect',
          source: source instanceof AudioNode ? 'AudioNode' : source,
          destination: destination instanceof AudioNode ? 'AudioNode' : destination
        });
      }
      throw error;
    }
  }

  /**
   * Disconnect nodes
   * @param {string} connectionId - ID of connection to remove
   * @returns {boolean} Success status
   */
  disconnect(connectionId) {
    try {
      if (!this.connections.has(connectionId)) {
        return false;
      }

      const connection = this.connections.get(connectionId);
      const { sourceNode, destinationNode, outputIndex, inputIndex, audioParam } = connection;
      const { sourceId, destinationId } = connection;

      // Perform the actual disconnection
      try {
        if (audioParam && destinationNode[audioParam] instanceof AudioParam) {
          sourceNode.disconnect(destinationNode[audioParam], outputIndex);
        } else {
          // Try to disconnect specific destination if possible
          try {
            sourceNode.disconnect(destinationNode, outputIndex, inputIndex);
          } catch (specificError) {
            // If specific disconnect fails, try generic disconnect
            sourceNode.disconnect();
          }
        }
      } catch (error) {
        console.warn('Error during disconnection, node may already be disconnected:', error);
      }

      // Remove from bidirectional tracking
      this.connectionsBySource.get(sourceId)?.delete(connectionId);
      this.connectionsByDestination.get(destinationId)?.delete(connectionId);

      // Remove from connections map
      this.connections.delete(connectionId);

      // Remove from node's connection list
      if (this.nodes.has(connection.sourceId)) {
        const node = this.nodes.get(connection.sourceId);
        node.connections = node.connections.filter(id => id !== connectionId);
      }

      this._emitEvent('connection:removed', {
        connectionId,
        sourceId: connection.sourceId,
        destinationId: connection.destinationId
      });

      return true;
    } catch (error) {
      if (this.errorManager) {
        this.errorManager.handleError(error, {
          component: 'AudioGraph',
          operation: 'disconnect',
          connectionId
        });
      }
      return false;
    }
  }

  /**
   * Disconnect all connections from a source node
   * @param {string} nodeId - ID of node to disconnect from
   * @returns {number} Number of connections removed
   */
  disconnectAllFromSource(nodeId) {
    try {
      if (!this.connectionsBySource.has(nodeId)) {
        return 0;
      }

      const connectionIds = [...this.connectionsBySource.get(nodeId)];
      let disconnectedCount = 0;

      for (const connectionId of connectionIds) {
        if (this.disconnect(connectionId)) {
          disconnectedCount++;
        }
      }

      this._emitEvent('node:disconnected-outputs', {
        nodeId,
        count: disconnectedCount
      });

      return disconnectedCount;
    } catch (error) {
      if (this.errorManager) {
        this.errorManager.handleError(error, {
          component: 'AudioGraph',
          operation: 'disconnectAllFromSource',
          nodeId
        });
      }
      return 0;
    }
  }

  /**
   * Disconnect all connections to a destination node
   * @param {string} nodeId - ID of node to disconnect to
   * @returns {number} Number of connections removed
   */
  disconnectAllToDestination(nodeId) {
    try {
      if (!this.connectionsByDestination.has(nodeId)) {
        return 0;
      }

      const connectionIds = [...this.connectionsByDestination.get(nodeId)];
      let disconnectedCount = 0;

      for (const connectionId of connectionIds) {
        if (this.disconnect(connectionId)) {
          disconnectedCount++;
        }
      }

      this._emitEvent('node:disconnected-inputs', {
        nodeId,
        count: disconnectedCount
      });

      return disconnectedCount;
    } catch (error) {
      if (this.errorManager) {
        this.errorManager.handleError(error, {
          component: 'AudioGraph',
          operation: 'disconnectAllToDestination',
          nodeId
        });
      }
      return 0;
    }
  }

  /**
   * Get all connections from a source node
   * @param {string} nodeId - Source node ID
   * @returns {Array} Array of connection objects
   */
  getConnectionsFromSource(nodeId) {
    if (!this.connectionsBySource.has(nodeId)) {
      return [];
    }

    const connectionIds = this.connectionsBySource.get(nodeId);
    return Array.from(connectionIds).map(id => this.connections.get(id)).filter(Boolean);
  }

  /**
   * Get all connections to a destination node
   * @param {string} nodeId - Destination node ID
   * @returns {Array} Array of connection objects
   */
  getConnectionsToDestination(nodeId) {
    if (!this.connectionsByDestination.has(nodeId)) {
      return [];
    }

    const connectionIds = this.connectionsByDestination.get(nodeId);
    return Array.from(connectionIds).map(id => this.connections.get(id)).filter(Boolean);
  }

  /**
   * Find all downstream nodes connected to a source
   * @param {string} nodeId - Source node ID
   * @returns {Array} Array of connected node IDs
   */
  findConnectedDestinations(nodeId) {
    const result = new Set();
    
    if (!this.connectionsBySource.has(nodeId)) {
      return [];
    }
    
    const connections = this.getConnectionsFromSource(nodeId);
    
    for (const connection of connections) {
      result.add(connection.destinationId);
    }
    
    return Array.from(result);
  }

  /**
   * Find all upstream nodes connected to a destination
   * @param {string} nodeId - Destination node ID
   * @returns {Array} Array of connected node IDs
   */
  findConnectedSources(nodeId) {
    const result = new Set();
    
    if (!this.connectionsByDestination.has(nodeId)) {
      return [];
    }
    
    const connections = this.getConnectionsToDestination(nodeId);
    
    for (const connection of connections) {
      result.add(connection.sourceId);
    }
    
    return Array.from(result);
  }

  /**
   * Create a serial chain of nodes (output of one connected to input of next)
   * @param {Array<AudioNode|string>} nodeArray - Array of nodes or node IDs
   * @param {Object} [options={}] - Connection options
   * @returns {Array<string>} Array of connection IDs
   */
  createChain(nodeArray, options = {}) {
    if (!nodeArray || nodeArray.length < 2) {
      throw new Error('Chain requires at least 2 nodes');
    }

    const connectionIds = [];
    
    // Connect each node to the next
    for (let i = 0; i < nodeArray.length - 1; i++) {
      const source = nodeArray[i];
      const destination = nodeArray[i + 1];
      
      const connectionId = this.connect(source, destination, options);
      connectionIds.push(connectionId);
    }

    this._emitEvent('chain:created', {
      nodeCount: nodeArray.length,
      connectionIds
    });

    return connectionIds;
  }

  /**
   * Create a parallel routing structure (one input to many, many to one output)
   * @param {AudioNode|string} inputNode - Input node or ID
   * @param {Array<AudioNode|string>} processingNodes - Processing nodes array
   * @param {AudioNode|string} outputNode - Output node or ID
   * @param {Object} [options={}] - Connection options
   * @returns {Object} Created connection IDs
   */
  createParallel(inputNode, processingNodes, outputNode, options = {}) {
    if (!inputNode || !processingNodes || !outputNode) {
      throw new Error('Parallel route requires input, processing nodes, and output');
    }

    if (!Array.isArray(processingNodes) || processingNodes.length === 0) {
      throw new Error('Processing nodes must be a non-empty array');
    }

    const connectionIds = {
      input: [],
      output: []
    };

    // Connect input to each processing node
    for (const node of processingNodes) {
      const connectionId = this.connect(inputNode, node, options);
      connectionIds.input.push(connectionId);
    }

    // Connect each processing node to output
    for (const node of processingNodes) {
      const connectionId = this.connect(node, outputNode, options);
      connectionIds.output.push(connectionId);
    }

    this._emitEvent('parallel:created', {
      inputConnectionCount: connectionIds.input.length,
      outputConnectionCount: connectionIds.output.length
    });

    return connectionIds;
  }

  /**
   * Get a node by ID
   * @param {string} nodeId - Node ID
   * @returns {AudioNode|null} The audio node or null if not found
   */
  getNode(nodeId) {
    if (this.nodes.has(nodeId)) {
      return this.nodes.get(nodeId).node;
    }
    return null;
  }

  /**
   * Get node ID for a node (creates one if it doesn't exist)
   * @private
   */
  _getNodeId(nodeOrId) {
    if (typeof nodeOrId === 'string') {
      return nodeOrId;
    }
    
    if (nodeOrId instanceof AudioNode) {
      // Check if node is already registered
      for (const [id, data] of this.nodes.entries()) {
        if (data.node === nodeOrId) {
          return id;
        }
      }

      // Register if tracking is enabled
      if (this.config.trackNodes) {
        return this.registerNode(nodeOrId);
      }
    }
    
    return null;
  }

  /**
   * Resolve a node from ID or AudioNode object
   * @private
   */
  _resolveNode(nodeOrId) {
    if (nodeOrId instanceof AudioNode) {
      return nodeOrId;
    }
    
    if (typeof nodeOrId === 'string' && this.nodes.has(nodeOrId)) {
      return this.nodes.get(nodeOrId).node;
    }
    
    return null;
  }

  /**
   * Create a visual representation of the graph (for debugging)
   * @returns {Object} Graph representation
   */
  getGraphRepresentation() {
    const graph = {
      nodes: [],
      connections: []
    };

    // Add nodes
    for (const [id, data] of this.nodes.entries()) {
      graph.nodes.push({
        id,
        type: data.type,
        metadata: data.metadata,
        connectionCount: data.connections.length
      });
    }

    // Add connections
    for (const [id, connection] of this.connections.entries()) {
      graph.connections.push({
        id,
        sourceId: connection.sourceId,
        destinationId: connection.destinationId,
        audioParam: connection.audioParam
      });
    }

    return graph;
  }

  /**
   * Emit an event through the callback
   * @private
   */
  _emitEvent(type, data) {
    this.onEvent({
      type,
      data,
      timestamp: Date.now(),
      component: 'AudioGraph'
    });
  }

  /**
   * Dispose and clean up all connections
   */
  dispose() {
    // Disconnect all connections
    for (const connectionId of this.connections.keys()) {
      this.disconnect(connectionId);
    }

    // Clear data structures
    this.nodes.clear();
    this.connections.clear();
    this.connectionsBySource.clear();
    this.connectionsByDestination.clear();
    this.routeTemplates.clear();

    this.initialized = false;
    this._emitEvent('disposed', {});
  }
}

export default AudioGraph;