
import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface SharedTextEditorProps {
  websocketUrl: string;
  roomId?: string;
}

const SharedTextEditor: React.FC<SharedTextEditorProps> = ({ websocketUrl, roomId }) => {
  const { status, currentText, sendMessage, reconnect } = useWebSocket(websocketUrl);
  const [localText, setLocalText] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  
  // Синхронизация локального текста с текстом от сервера
  useEffect(() => {
    if (currentText) {
      setLocalText(currentText);
    }
  }, [currentText]);
  
  // Автофокус на текстовое поле при подключении
  useEffect(() => {
    if (status === 'connected' && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [status]);
  
  // Обработчик изменения текста с дебаунсингом
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setLocalText(newText);
    
    // Автоматическая отправка изменений с дебаунсингом
    if (debounceTimeoutRef.current) {
      window.clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = window.setTimeout(() => {
      if (status === 'connected') {
        sendMessage(newText);
      }
    }, 1000); // Задержка в 1 секунду
  };
  
  // Отправка текста на сервер
  const handleSendText = () => {
    if (status !== 'connected') {
      toast({
        title: "Ошибка",
        description: "Нет подключения к серверу",
        variant: "destructive"
      });
      return;
    }
    
    if (!localText.trim()) {
      toast({
        title: "Внимание",
        description: "Текст пуст. Нечего отправлять.",
        variant: "default"
      });
      return;
    }
    
    setIsSending(true);
    sendMessage(localText);
    
    toast({
      title: "Текст отправлен",
      description: "Изменения отправлены всем подключенным пользователям",
    });
    
    setTimeout(() => {
      setIsSending(false);
    }, 500);
  };
  
  // Обработчик нажатия Ctrl+Enter для отправки
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSendText();
    }
  };
  
  // Отображение статуса соединения
  const renderStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="flex items-center gap-1"><Wifi className="h-3 w-3" /> Подключено</Badge>;
      case 'connecting':
        return <Badge variant="outline" className="flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Подключение...</Badge>;
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Ошибка соединения</Badge>;
      default:
        return <Badge variant="secondary" className="flex items-center gap-1"><WifiOff className="h-3 w-3" /> Отключено</Badge>;
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Общий редактор текста
          {roomId && <span className="ml-2 text-sm text-gray-500">(Комната: {roomId})</span>}
        </h2>
        <div className="flex items-center gap-2">
          {renderStatusBadge()}
          {(status === 'error' || status === 'disconnected') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={reconnect}
              className="text-xs h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Переподключиться
            </Button>
          )}
        </div>
      </div>
      
      <Textarea
        ref={textAreaRef}
        value={localText}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="Введите текст, который будет доступен всем подключенным пользователям..."
        className="min-h-[300px] mb-4 font-mono text-sm"
        disabled={status !== 'connected'}
      />
      
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">Нажмите Ctrl+Enter для быстрой отправки</p>
        <Button 
          onClick={handleSendText}
          disabled={status !== 'connected' || !localText.trim() || isSending}
          className="relative"
        >
          {isSending ? 'Отправка...' : 'Отправить изменения'}
        </Button>
      </div>
    </Card>
  );
};

export default SharedTextEditor;
