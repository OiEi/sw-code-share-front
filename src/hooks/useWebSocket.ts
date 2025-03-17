
import { useState, useEffect, useCallback } from 'react';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [messages, setMessages] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState<string>('');

  // Инициализация WebSocket соединения
  useEffect(() => {
    const wsConnection = new WebSocket(url);
    
    wsConnection.onopen = () => {
      console.log('WebSocket соединение установлено');
      setStatus('connected');
    };
    
    wsConnection.onmessage = (event) => {
      console.log('Получено сообщение:', event.data);
      try {
        // Предполагаем, что бэкенд отправляет текущий текст
        setCurrentText(event.data);
        setMessages(prev => [...prev, event.data]);
      } catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
      }
    };
    
    wsConnection.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
      setStatus('error');
    };
    
    wsConnection.onclose = () => {
      console.log('WebSocket соединение закрыто');
      setStatus('disconnected');
    };
    
    setSocket(wsConnection);
    
    // Очистка при размонтировании
    return () => {
      wsConnection.close();
    };
  }, [url]);
  
  // Функция для отправки сообщений
  const sendMessage = useCallback((message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
      console.log('Отправлено сообщение:', message);
    } else {
      console.error('Невозможно отправить сообщение, соединение не установлено');
    }
  }, [socket]);
  
  return {
    status,
    messages,
    currentText,
    sendMessage,
  };
};
