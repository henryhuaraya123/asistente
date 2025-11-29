import React, { useState, useEffect, useRef } from 'react';
import { Shield, Send, Loader2, AlertCircle, Moon, Sun, Menu, X, Info, BookOpen, Target } from 'lucide-react';

const CYBER_ASSISTANT_API_ENDPOINT = 'https://henrydenilson.app.n8n.cloud/webhook/nueva-consulta';

const getOrCreateSessionId = () => {
  let sessionId = sessionStorage.getItem('cyber-assistant-session-id');
  if (!sessionId) {
    sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('cyber-assistant-session-id', sessionId);
  }
  return sessionId;
};

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionId = getOrCreateSessionId();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedTheme = sessionStorage.getItem('cyber-assistant-theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    sessionStorage.setItem('cyber-assistant-theme', newMode ? 'dark' : 'light');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    const newUserMessage = { sender: 'user', text: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        session_id: sessionId,
        mensaje_usuario: userMessage,
      };

      const response = await fetch(CYBER_ASSISTANT_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error en la API: Código ${response.status}`);
      }

      const data = await response.json();
      const assistantResponseText = data.respuesta_asistente || "El asistente no proporcionó una respuesta válida.";
      const newAssistantMessage = { sender: 'assistant', text: assistantResponseText };
      setMessages(prev => [...prev, newAssistantMessage]);

    } catch (err) {
      console.error('Error al comunicarse con la API:', err);
      setError('No se pudo obtener respuesta del asistente. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' 
    : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100';
  
  const containerClass = darkMode 
    ? 'bg-slate-800/50 border-slate-700/50' 
    : 'bg-white/80 border-blue-200/50';
  
  const textClass = darkMode ? 'text-slate-100' : 'text-slate-800';
  const textSecondaryClass = darkMode ? 'text-slate-300' : 'text-slate-600';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300 flex flex-col`}>
      {/* Main Container */}
      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-2 sm:p-4 lg:p-6">
        <div className={`flex-1 ${containerClass} backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-colors duration-300`}>
          
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-cyan-600 p-3 sm:p-4 lg:p-6 flex items-center gap-2 sm:gap-3 shadow-lg">
            <div className="bg-white/20 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">Ciber-Asistente IA</h1>
              <p className="text-blue-100 text-xs sm:text-sm hidden sm:block">Educación y Concienciación en Ciberseguridad</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
                aria-label="Cambiar tema"
              >
                {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
              </button>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
                aria-label="Información"
              >
                {showInfo ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
              </button>
            </div>
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className={`${darkMode ? 'bg-slate-700/80' : 'bg-blue-50/80'} backdrop-blur-sm p-3 sm:p-4 lg:p-6 border-b ${darkMode ? 'border-slate-600' : 'border-blue-200'} animate-slideDown`}>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <BookOpen className={`w-5 h-5 shrink-0 mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <h3 className={`font-semibold ${textClass} text-sm sm:text-base`}>Descripción del Proyecto</h3>
                    <p className={`${textSecondaryClass} text-xs sm:text-sm mt-1`}>
                      Asistente virtual basado en IA que proporciona formación y concienciación en ciberseguridad. 
                      Responde preguntas, ofrece consejos personalizados y simula escenarios de seguridad para ayudarte 
                      a entender y aplicar buenas prácticas.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Target className={`w-5 h-5 shrink-0 mt-1 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  <div>
                    <h3 className={`font-semibold ${textClass} text-sm sm:text-base`}>Objetivos</h3>
                    <p className={`${textSecondaryClass} text-xs sm:text-sm mt-1`}>
                      Mejorar la educación y concienciación en ciberseguridad mediante formación personalizada e interactiva.
                    </p>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} rounded-lg p-3 sm:p-4`}>
                  <h4 className={`font-semibold ${textClass} text-xs sm:text-sm mb-2`}>Temas que puedo ayudarte:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div className={`${textSecondaryClass} flex items-center gap-2`}>
                      <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>•</span> Seguridad de contraseñas
                    </div>
                    <div className={`${textSecondaryClass} flex items-center gap-2`}>
                      <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>•</span> Phishing y fraudes
                    </div>
                    <div className={`${textSecondaryClass} flex items-center gap-2`}>
                      <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>•</span> Protección de datos
                    </div>
                    <div className={`${textSecondaryClass} flex items-center gap-2`}>
                      <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>•</span> Mejores prácticas
                    </div>
                    <div className={`${textSecondaryClass} flex items-center gap-2`}>
                      <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>•</span> Vulnerabilidades comunes
                    </div>
                    <div className={`${textSecondaryClass} flex items-center gap-2`}>
                      <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>•</span> Escenarios de ataque
                    </div>
                  </div>
                </div>

                <div className="text-xs sm:text-sm">
                  <span className={`${textSecondaryClass}`}>Sesión actual: </span>
                  <span className={`font-mono ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{sessionId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
            {/* Welcome Message */}
            <div className="flex gap-2 sm:gap-3 animate-fadeIn">
              <div className="shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600/30' : 'bg-white border-blue-200'} backdrop-blur-sm rounded-2xl rounded-tl-none p-3 sm:p-4 shadow-lg border`}>
                  <p className={`${textClass} leading-relaxed text-sm sm:text-base`}>
                    ¡Hola! Soy tu Asistente Virtual de Ciberseguridad. Estoy aquí para ayudarte a aprender y mejorar tus conocimientos en seguridad informática. 
                    Puedes preguntarme sobre vulnerabilidades, buenas prácticas, o pedirme que simule escenarios de seguridad. ¡Comencemos! 🛡️
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2 sm:gap-3 animate-fadeIn ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className="shrink-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    msg.sender === 'user' 
                      ? 'bg-linear-to-br from-emerald-500 to-teal-500' 
                      : 'bg-linear-to-br from-blue-500 to-cyan-500'
                  }`}>
                    {msg.sender === 'user' ? (
                      <span className="text-white font-bold text-xs sm:text-sm">TÚ</span>
                    ) : (
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1 max-w-[85%] sm:max-w-[80%]">
                  <div className={`rounded-2xl p-3 sm:p-4 shadow-lg text-sm sm:text-base ${
                    msg.sender === 'user'
                      ? 'bg-linear-to-br from-emerald-600 to-teal-600 rounded-tr-none text-white'
                      : darkMode 
                        ? 'bg-slate-700/50 backdrop-blur-sm rounded-tl-none text-slate-100 border border-slate-600/30'
                        : 'bg-white rounded-tl-none text-slate-800 border border-blue-200'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2 sm:gap-3 animate-fadeIn">
                <div className="shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600/30' : 'bg-white border-blue-200'} backdrop-blur-sm rounded-2xl rounded-tl-none p-3 sm:p-4 shadow-lg border`}>
                  <div className="flex items-center gap-2">
                    <Loader2 className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'} animate-spin`} />
                    <span className={`${textSecondaryClass} text-sm sm:text-base`}>Analizando tu consulta...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex gap-2 sm:gap-3 animate-fadeIn">
                <div className="shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  </div>
                </div>
                <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl rounded-tl-none p-3 sm:p-4 shadow-lg border border-red-500/30">
                  <p className="text-red-300 text-sm sm:text-base">{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-3 sm:p-4 lg:p-6 ${darkMode ? 'bg-slate-800/80' : 'bg-blue-50/80'} backdrop-blur-sm border-t ${darkMode ? 'border-slate-700/50' : 'border-blue-200/50'}`}>
            <div className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta sobre ciberseguridad..."
                disabled={isLoading}
                className={`flex-1 ${darkMode ? 'bg-slate-700/50 text-white placeholder-slate-400 border-slate-600/30' : 'bg-white text-slate-800 placeholder-slate-400 border-blue-200'} rounded-lg sm:rounded-xl px-3 sm:px-4 lg:px-5 py-3 sm:py-3 lg:py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed border transition-all text-sm sm:text-base`}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-linear-to-r from-blue-600 to-cyan-600 text-white px-4 sm:px-5 lg:px-6 py-3 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="hidden sm:inline text-sm lg:text-base">Enviar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;