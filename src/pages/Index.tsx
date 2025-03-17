
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import SharedTextEditor from '@/components/SharedTextEditor';
import { useSearchParams } from 'react-router-dom';

const Index = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId') || '';
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [websocketUrl, setWebsocketUrl] = useState<string>('');
  
  // Формируем URL для WebSocket, используя порт 8080 для бэкенда
  useEffect(() => {
    // Получаем хост без порта
    const host = window.location.hostname;
    // Формируем URL с явным указанием порта 8080
    const dynamicWsUrl = `ws://${host}:8080/ws?roomId=${roomId}`;
    setWebsocketUrl(dynamicWsUrl);
  }, [roomId]);
  
  const handleConnect = () => {
    if (!websocketUrl) {
      toast({
        title: "Ошибка",
        description: "Не удалось сформировать WebSocket URL",
        variant: "destructive"
      });
      return;
    }
    
    setIsConnected(true);
    toast({
      title: "Подключение",
      description: `Подключение к комнате: ${roomId || 'общая комната'}`,
    });
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "Отключено",
      description: "Соединение закрыто",
    });
  };
  
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Rusky Lingo Buddy - Совместное редактирование</h1>
        
        {!isConnected ? (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Подключение к комнате</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Комната: <span className="font-medium">{roomId || 'общая комната'}</span></p>
              <p className="text-sm text-gray-600">WebSocket URL: <span className="font-medium">{websocketUrl}</span></p>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleConnect}>
                Подключиться
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
            <div>
              <p className="text-sm text-gray-600">Комната: <span className="font-medium">{roomId || 'общая комната'}</span></p>
              <p className="text-sm text-gray-600">WebSocket URL: <span className="font-medium">{websocketUrl}</span></p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
            >
              Отключиться
            </Button>
          </div>
        )}
        
        {isConnected && (
          <SharedTextEditor websocketUrl={websocketUrl} roomId={roomId} />
        )}
      </div>
    </div>
  );
};

export default Index;
