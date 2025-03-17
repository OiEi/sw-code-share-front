
import { useState, useEffect, useCallback, useRef } from 'react';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketMessage {
  type: string;
  content: string;
}

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [messages, setMessages] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState<string>('');
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  // Функция для создания WebSocket соединения
  const createWebSocketConnection = useCallback(() => {
    try {
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.log('Достигнуто максимальное количество попыток подключения');
        setStatus('error');
        return;
      }

      setStatus('connecting');
      const wsConnection = new WebSocket(url);
      
      wsConnection.onopen = () => {
        console.log('WebSocket соединение установлено');
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
      };
      
      wsConnection.onmessage = (event) => {
        console.log('Получено сообщение:', event.data);
        try {
          // Обработка сообщений в зависимости от их формата
          // Пробуем распарсить JSON, если это не текст
          try {
            const parsedData = JSON.parse(event.data);
            if (parsedData.type === 'text_update') {
              setCurrentText(parsedData.content);
              setMessages(prev => [...prev, parsedData.content]);
            } else {
              console.log('Получено сообщение другого типа:', parsedData);
            }
          } catch (e) {
            // Если не JSON, то обрабатываем как обычный текст
            setCurrentText(event.data);
            setMessages(prev => [...prev, event.data]);
          }
        } catch (error) {
          console.error('Ошибка при обработке сообщения:', error);
        }
      };
      
      wsConnection.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
        setStatus('error');
      };
      
      wsConnection.onclose = (event) => {
        console.log('WebSocket соединение закрыто:', event.code, event.reason);
        setStatus('disconnected');
        
        // Попытка переподключения при неожиданном закрытии
        if (event.code !== 1000) {
          reconnectAttemptsRef.current += 1;
          console.log(`Попытка переподключения ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`);
          
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            createWebSocketConnection();
          }, RECONNECT_DELAY);
        }
      };
      
      setSocket(wsConnection);
      
      return wsConnection;
    } catch (error) {
      console.error('Ошибка при создании WebSocket соединения:', error);
      setStatus('error');
      return null;
    }
  }, [url]);

  // Инициализация WebSocket соединения
  useEffect(() => {
    const wsConnection = createWebSocketConnection();
    
    // Очистка при размонтировании
    return () => {
      if (wsConnection) {
        wsConnection.close(1000, 'Компонент размонтирован');
      }
      
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [createWebSocketConnection]);
  
  // Функция для отправки сообщений
  const sendMessage = useCallback((message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        // Проверяем, является ли сообщение уже JSON-строкой
        const isJson = typeof message === 'string' && message.trim().startsWith('{');
        
        if (isJson) {
          socket.send(message);
        } else {
          // Если это обычный текст, формируем JSON объект
          const messageObject: WebSocketMessage = {
            type: 'text_update',
            content: message
          };
          socket.send(JSON.stringify(messageObject));
        }
        console.log('Отправлено сообщение:', message);
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
      }
    } else {
      console.error('Невозможно отправить сообщение, соединение не установлено');
    }
  }, [socket]);
  
  // Функция для переподключения по требованию
  const reconnect = useCallback(() => {
    if (socket) {
      socket.close(1000, 'Переподключение по требованию');
    }
    
    reconnectAttemptsRef.current = 0;
    createWebSocketConnection();
  }, [socket, createWebSocketConnection]);
  
  return {
    status,
    messages,
    currentText,
    sendMessage,
    reconnect
  };
};
