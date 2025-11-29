import React, { useState, useEffect, useRef } from 'react';

// --- PUNTO CLAVE: Configuración de la API ---
// Usa una variable de entorno (.env) o define el endpoint aquí.
// El formato de la URL de n8n sería algo como: 'https://n8n.tudominio.com/webhook/xxxxxxxx'
const CYBER_ASSISTANT_API_ENDPOINT = 'https://n8n.tudominio.com/webhook/reemplaza-esto-con-tu-endpoint'; 

// Función para obtener/crear un session_id
const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('cyber-assistant-session-id');
  if (!sessionId) {
    // Genera un UUID simple (podría ser más robusto si fuera necesario)
    sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('cyber-assistant-session-id', sessionId);
  }
  return sessionId;
};

// Componente principal
function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Referencia para desplazar automáticamente al final del chat
  const messagesEndRef = useRef(null);

  // Inicialización del ID de Sesión al cargar el componente
  const sessionId = getOrCreateSessionId();

  // Desplazamiento automático al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Función principal para enviar el mensaje al Asistente
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    
    // 1. Agrega el mensaje del usuario al chat
    const newUserMessage = { sender: 'user', text: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        // PUNTO CLAVE: Incluir el session_id
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
      
      // 2. Extrae y agrega la respuesta del asistente (requiere `response.respuesta_asistente`)
      const assistantResponseText = data.respuesta_asistente || "El asistente no proporcionó una respuesta válida.";

      const newAssistantMessage = { sender: 'assistant', text: assistantResponseText };
      setMessages(prev => [...prev, newAssistantMessage]);

    } catch (err) {
      console.error('Error al comunicarse con la API:', err);
      setError('❌ Error: No se pudo obtener la respuesta del Asistente. Verifica el endpoint de la API.');
      
      // Si hay un error, el mensaje del usuario permanece en el chat
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h1>Ciber-Asistente 🛡️</h1>

      {/* Área de Mensajes */}
      <div className="message-area">
        <div className="message-bubble assistant-message">
            ¡Hola! Soy tu Asistente de Ciberseguridad. Mi ID de Sesión es: **{sessionId}**. Pregúntame sobre cualquier tema de seguridad informática.
        </div>
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-bubble ${msg.sender === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            {msg.text}
          </div>
        ))}

        {/* Indicador de Carga/Escribiendo */}
        {isLoading && (
          <div className="loading-indicator">
            Escribiendo...
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div ref={messagesEndRef} /> {/* Para el scroll automático */}
      </div>

      {/* Formulario de Entrada */}
      <form className="input-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Escribe tu pregunta de ciberseguridad aquí..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}

export default App;