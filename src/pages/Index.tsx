
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import SharedTextEditor from '@/components/SharedTextEditor';

const Index = () => {
  const [websocketUrl, setWebsocketUrl] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  // Попытаться загрузить последний использованный URL из localStorage
  useEffect(() => {
    const savedUrl = localStorage.getItem('lastWebsocketUrl');
    if (savedUrl) {
      setWebsocketUrl(savedUrl);
    } else {
      // Предложить значение по умолчанию, если нет сохраненного URL
      setWebsocketUrl('ws://localhost:8080/ws');
    }
  }, []);
  
  const handleConnect = () => {
    if (!websocketUrl) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите WebSocket URL",
        variant: "destructive"
      });
      return;
    }
    
    setIsConnecting(true);
    
    // Сохраняем URL в localStorage для будущего использования
    localStorage.setItem('lastWebsocketUrl', websocketUrl);
    
    // Имитация проверки соединения (в реальности это будет делать useWebSocket)
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      toast({
        title: "Подключено",
        description: `Успешное подключение к ${websocketUrl}`,
      });
    }, 1000);
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
            <h2 className="text-xl font-semibold mb-4">Подключение к серверу</h2>
            <div className="flex gap-3">
              <Input
                type="text"
                value={websocketUrl}
                onChange={(e) => setWebsocketUrl(e.target.value)}
                placeholder="Введите WebSocket URL (например, ws://localhost:8080/ws)"
                className="flex-1"
              />
              <Button 
                onClick={handleConnect}
                disabled={!websocketUrl || isConnecting}
              >
                {isConnecting ? 'Подключение...' : 'Подключиться'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
            <div>
              <p className="text-sm text-gray-600">Подключено к: <span className="font-medium">{websocketUrl}</span></p>
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
          <SharedTextEditor websocketUrl={websocketUrl} />
        )}
      </div>
    </div>
  );
};

export default Index;
