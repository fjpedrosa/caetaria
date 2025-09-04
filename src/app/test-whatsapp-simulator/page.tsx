'use client';

import React, { useCallback, useEffect,useRef, useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import {
  Activity,
  Award,
  Bug,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Eye,
  EyeOff,
  MessageSquare,
  Monitor,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Smartphone,
  Tablet,
  Zap} from 'lucide-react';

// Import the simulator container
import { WhatsAppSimulatorContainer } from '@/modules/whatsapp-simulator/presentation/containers/whatsapp-simulator-container';
import { restaurantReservationScenario } from '@/modules/whatsapp-simulator/scenarios/restaurant-reservation-scenario';

// Create additional test scenarios
const testScenarios = {
  restaurant: {
    ...restaurantReservationScenario,
    metadata: {
      ...restaurantReservationScenario.metadata,
      title: 'Reserva de Restaurante',
      description: 'Flujo completo de reserva con IA y WhatsApp Flow'
    }
  },
  medical: {
    metadata: {
      id: 'medical-appointment',
      title: 'Cita Médica',
      description: 'Programación de cita médica automatizada',
      tags: ['medical', 'appointment', 'healthcare'],
      businessName: 'Clínica Salud',
      businessPhoneNumber: '+1234567890',
      userPhoneNumber: '+1987654321',
      language: 'es',
      category: 'healthcare'
    },
    messages: [
      {
        sender: 'user',
        type: 'text',
        content: { text: 'Hola, necesito agendar una cita médica' },
        delayBeforeTyping: 3000,
        typingDuration: 1500
      },
      {
        sender: 'business',
        type: 'text',
        content: { text: '¡Hola! Con gusto te ayudo a agendar tu cita. ¿Para qué especialidad necesitas?' },
        delayBeforeTyping: 1000,
        typingDuration: 1800
      },
      {
        sender: 'user',
        type: 'text',
        content: { text: 'Medicina general' },
        delayBeforeTyping: 2000,
        typingDuration: 1000
      },
      {
        sender: 'business',
        type: 'text',
        content: { text: 'Perfecto. Tenemos disponibilidad esta semana. Te voy a mostrar las opciones disponibles 📅' },
        delayBeforeTyping: 1000,
        typingDuration: 2000
      }
    ],
    educationalBadges: [],
    flowSteps: [],
    timing: {
      initialDelay: 3000,
      messageTimings: [],
      restartDelay: 20000
    }
  },
  support: {
    metadata: {
      id: 'customer-support',
      title: 'Soporte al Cliente',
      description: 'Atención al cliente automatizada 24/7',
      tags: ['support', 'customer-service', 'help'],
      businessName: 'TechCorp Support',
      businessPhoneNumber: '+1234567890',
      userPhoneNumber: '+1987654321',
      language: 'es',
      category: 'support'
    },
    messages: [
      {
        sender: 'user',
        type: 'text',
        content: { text: 'Mi pedido no ha llegado' },
        delayBeforeTyping: 2500,
        typingDuration: 1200
      },
      {
        sender: 'business',
        type: 'text',
        content: { text: 'Lamento escuchar eso. Voy a revisar el estado de tu pedido inmediatamente 🔍' },
        delayBeforeTyping: 800,
        typingDuration: 1600
      },
      {
        sender: 'business',
        type: 'text',
        content: { text: '¿Podrías proporcionarme tu número de orden?' },
        delayBeforeTyping: 1500,
        typingDuration: 1400
      },
      {
        sender: 'user',
        type: 'text',
        content: { text: 'ORD-2024-1234' },
        delayBeforeTyping: 2000,
        typingDuration: 1000
      },
      {
        sender: 'business',
        type: 'text',
        content: { text: 'Gracias. He localizado tu pedido. Está en camino y llegará hoy antes de las 6 PM 📦✅' },
        delayBeforeTyping: 2000,
        typingDuration: 2000
      }
    ],
    educationalBadges: [],
    flowSteps: [],
    timing: {
      initialDelay: 2500,
      messageTimings: [],
      restartDelay: 25000
    }
  }
};

export default function TestWhatsAppSimulatorPage() {
  // State for configuration
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof testScenarios>('restaurant');
  const [device, setDevice] = useState<'iphone14' | 'android' | 'desktop'>('iphone14');
  const [autoPlay, setAutoPlay] = useState(true); // Changed to true for testing autoplay
  const [enableBadges, setEnableBadges] = useState(true);
  const [enableGifExport, setEnableGifExport] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showDebug, setShowDebug] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [simulatorKey, setSimulatorKey] = useState(Date.now());

  // State for simulator control
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulatorState, setSimulatorState] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    messageCount: 0,
    fps: 0,
    memoryUsage: 0
  });

  // Sections collapse state
  const [sectionsExpanded, setSectionsExpanded] = useState({
    scenario: true,
    configuration: true,
    controls: true,
    debug: false,
    metrics: false
  });

  // Refs
  const simulatorRef = useRef<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Toggle section expansion
  const toggleSection = (section: keyof typeof sectionsExpanded) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Log function
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), `[${timestamp}] ${message}`]);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Event handlers
  const handleComplete = useCallback(() => {
    addLog('✅ Conversation completed');
    setIsPlaying(false);
  }, [addLog]);

  const handleBadgeShow = useCallback((badge: any) => {
    addLog(`🏷️ Badge shown: ${badge.title}`);
  }, [addLog]);

  const handleFlowStep = useCallback((step: any) => {
    addLog(`📋 Flow step: ${step.id}`);
  }, [addLog]);

  const handleStateChange = useCallback((state: any) => {
    setSimulatorState(state);

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      messageCount: state.conversation?.messages?.length || 0
    }));
  }, []);

  // Control functions
  const handlePlay = () => {
    setIsPlaying(true);
    addLog('▶️ Playing conversation');
  };

  const handlePause = () => {
    setIsPlaying(false);
    addLog('⏸️ Paused conversation');
  };

  const handleReset = () => {
    setIsPlaying(false);
    addLog('🔄 Reset conversation');
    // Force re-render by changing key
    setSimulatorKey(Date.now());
  };

  const handleExport = () => {
    addLog('📸 Starting GIF export...');
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    addLog('Console cleared');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp Simulator Test Lab</h1>
              <p className="text-sm text-gray-600 mt-1">
                Prueba interactiva del simulador con todas las funcionalidades
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isPlaying ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isPlaying ? 'Playing' : 'Stopped'}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                v1.0.0
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Scenario Selector */}
            <div className="bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => toggleSection('scenario')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">Escenario</span>
                </div>
                {sectionsExpanded.scenario ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {sectionsExpanded.scenario && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 space-y-2 overflow-hidden"
                  >
                    {Object.entries(testScenarios).map(([key, scenario]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedScenario(key as keyof typeof testScenarios);
                          setSimulatorKey(Date.now()); // Force remount with new key
                          addLog(`📝 Scenario changed to: ${scenario.metadata.title}`);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedScenario === key
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="font-medium">{scenario.metadata.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{scenario.metadata.description}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Configuration */}
            <div className="bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => toggleSection('configuration')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">Configuración</span>
                </div>
                {sectionsExpanded.configuration ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {sectionsExpanded.configuration && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 space-y-4 overflow-hidden"
                  >
                    {/* Device Selector */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Dispositivo</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setDevice('iphone14')}
                          className={`p-2 rounded-lg border transition-colors flex flex-col items-center gap-1 ${
                            device === 'iphone14' ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                          }`}
                        >
                          <Smartphone className="w-4 h-4" />
                          <span className="text-xs">iPhone</span>
                        </button>
                        <button
                          onClick={() => setDevice('android')}
                          className={`p-2 rounded-lg border transition-colors flex flex-col items-center gap-1 ${
                            device === 'android' ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                          }`}
                        >
                          <Tablet className="w-4 h-4" />
                          <span className="text-xs">Android</span>
                        </button>
                        <button
                          onClick={() => setDevice('desktop')}
                          className={`p-2 rounded-lg border transition-colors flex flex-col items-center gap-1 ${
                            device === 'desktop' ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                          }`}
                        >
                          <Monitor className="w-4 h-4" />
                          <span className="text-xs">Desktop</span>
                        </button>
                      </div>
                    </div>

                    {/* Speed Control */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Velocidad: {playbackSpeed}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.25"
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.5x</span>
                        <span>1x</span>
                        <span>2x</span>
                      </div>
                    </div>

                    {/* Feature Toggles */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-gray-700">Auto Play</span>
                        <button
                          onClick={() => setAutoPlay(!autoPlay)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            autoPlay ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              autoPlay ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-gray-700">Badges Educativos</span>
                        <button
                          onClick={() => setEnableBadges(!enableBadges)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            enableBadges ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              enableBadges ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-gray-700">Exportar GIF</span>
                        <button
                          onClick={() => setEnableGifExport(!enableGifExport)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            enableGifExport ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              enableGifExport ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-gray-700">Debug Mode</span>
                        <button
                          onClick={() => setShowDebug(!showDebug)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            showDebug ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              showDebug ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Playback Controls */}
            <div className="bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => toggleSection('controls')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">Controles</span>
                </div>
                {sectionsExpanded.controls ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {sectionsExpanded.controls && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handlePlay}
                        disabled={isPlaying}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Play
                      </button>

                      <button
                        onClick={handlePause}
                        disabled={!isPlaying}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>

                      <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </button>

                      <button
                        onClick={handleExport}
                        disabled={!enableGifExport}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Center - Simulator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Simulador</h2>
                <div className="flex items-center gap-2">
                  {showDebug && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      Debug ON
                    </span>
                  )}
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Ready
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <WhatsAppSimulatorContainer
                  key={simulatorKey}
                  scenario={testScenarios[selectedScenario]}
                  device={device}
                  autoPlay={autoPlay}
                  enableEducationalBadges={enableBadges}
                  enableGifExport={enableGifExport}
                  onComplete={handleComplete}
                  onBadgeShow={handleBadgeShow}
                  onFlowStep={handleFlowStep}
                  debug={showDebug}
                  onStateChange={handleStateChange}
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Debug & Metrics */}
          <div className="lg:col-span-1 space-y-4">
            {/* Debug Console */}
            <div className="bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => toggleSection('debug')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Bug className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">Debug Console</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{logs.length}</span>
                </div>
                {sectionsExpanded.debug ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {sectionsExpanded.debug && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Últimos 50 eventos</span>
                        <button
                          onClick={clearLogs}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="bg-gray-900 text-green-400 text-xs font-mono p-3 rounded-lg h-64 overflow-y-auto">
                        {logs.length === 0 ? (
                          <div className="text-gray-500">No logs yet...</div>
                        ) : (
                          logs.map((log, index) => (
                            <div key={index} className="py-0.5">
                              {log}
                            </div>
                          ))
                        )}
                        <div ref={logsEndRef} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Metrics */}
            <div className="bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => toggleSection('metrics')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">Métricas</span>
                </div>
                {sectionsExpanded.metrics ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {sectionsExpanded.metrics && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Renders</div>
                        <div className="text-xl font-semibold">{metrics.renderCount}</div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Mensajes</div>
                        <div className="text-xl font-semibold">{metrics.messageCount}</div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">FPS</div>
                        <div className="text-xl font-semibold">{metrics.fps}</div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Memory</div>
                        <div className="text-xl font-semibold">{metrics.memoryUsage}MB</div>
                      </div>
                    </div>

                    {/* State Viewer */}
                    {simulatorState && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Estado del Simulador</h4>
                        <div className="bg-gray-100 rounded-lg p-3 text-xs font-mono max-h-48 overflow-y-auto">
                          <pre>{JSON.stringify(simulatorState, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                Acciones Rápidas
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setAutoPlay(true);
                    handlePlay();
                  }}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  🚀 Demo Completa
                </button>
                <button
                  onClick={() => {
                    setShowDebug(!showDebug);
                    setShowMetrics(!showMetrics);
                  }}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  🔍 Toggle Debug Mode
                </button>
                <button
                  onClick={() => {
                    setDevice('iphone14');
                    setEnableBadges(true);
                    setAutoPlay(true);
                  }}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  📱 Preset Mobile
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-600" />
                Tips de Uso
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Cambia entre escenarios para ver diferentes flujos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Activa Debug Mode para ver el estado interno</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Usa el console para rastrear eventos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Exporta GIFs para compartir demos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}