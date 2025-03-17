
import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface SharedTextEditorProps {
  websocketUrl: string;
}

const SharedTextEditor: React.FC<SharedTextEditorProps> = ({ websocketUrl }) => {
  const { status, currentText, sendMessage } = useWebSocket(websocketUrl);
  const [localText, setLocalText] = useState<string>('');
  
  // Синхронизация локального текста с текстом от сервера
  useEffect(() => {
    if (currentText) {
      setLocalText(currentText);
    }
  }, [currentText]);
  
  // Обработчик изменения текста
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setLocalText(newText);
  };
  
  // Отправка текста на сервер
  const handleSendText = () => {
    sendMessage(localText);
    toast({
      title: "Текст отправлен",
      description: "Изменения отправлены всем подключенным пользователям",
    });
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Общий редактор текста</h2>
        <Badge variant={status === 'connected' ? 'default' : 'destructive'}>
          {status === 'connected' ? 'Подключено' : 
           status === 'connecting' ? 'Подключение...' : 
           status === 'error' ? 'Ошибка соединения' : 'Отключено'}
        </Badge>
      </div>
      
      <Textarea
        value={localText}
        onChange={handleTextChange}
        placeholder="Введите текст, который будет доступен всем подключенным пользователям..."
        className="min-h-[200px] mb-4"
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSendText}
          disabled={status !== 'connected' || !localText.trim()}
        >
          Отправить изменения
        </Button>
      </div>
    </Card>
  );
};

export default SharedTextEditor;
