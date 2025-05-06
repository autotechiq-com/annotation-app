'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { useDictionary } from './dictionary-provider';
import { Textarea } from './ui/textarea';
import { Alert } from './ui/alert';
import { AlertTriangle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface AIChatProps {
  initialText: string;
  imageUrl: string;
  setEditorText: (text: string) => void;
  setDrawerOpen: (open: boolean) => void;
}

export default function AIChat({ initialText, imageUrl, setEditorText, setDrawerOpen }: AIChatProps) {
  const t = useDictionary();
  const [instruction, setInstruction] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) {
      setError(t.Global.enter_message);
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initial_text: initialText,
          instruction: instruction,
          image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResponse(data.text);
    } catch (err) {
      setError('Failed to get response from AI');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2">
      {response ? (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium">{t.Global.ai_generated_text}:</h3>
          <div className="p-4 bg-gray-100 rounded">
            <ScrollArea>
              <p className="whitespace-pre-wrap text-sm h-fit max-h-[400px]">{response}</p>
            </ScrollArea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                setInstruction('');
                setResponse('');
              }}
            >
              {t.Global.reject}
            </Button>
            <Button
              className="w-full bg-green-700"
              variant="default"
              onClick={() => {
                setEditorText(response);
                setInstruction('');
                setResponse('');
                setDrawerOpen(false);
              }}
            >
              {t.Global.accept}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            id="instruction"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
            placeholder={t.Global.note_for_ai_to_generate}
          />

          {error && (
            <Alert data-slot="alert" className="w-full" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </Alert>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t.Global.loading : t.Global.send}
          </Button>
        </form>
      )}
    </div>
  );
}
