import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request)
{
  try
  {
    const { initial_text, instruction, image_url } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' });

    const prompt = `У пользователя есть описание изображения:
${initial_text}

Пользователь оставил следующую заметку/инструкцию к описанию:
${instruction}

Перепиши описание изображения в соответствии с заметкой/инструкцией пользователя

Если на изображении показаны какие-либо проблемы, опиши их подробно и используйте следующий шаблон ответа:

1. [Выявленные проблемы]:
  * [Проблема 1]:
    - Название компонента: ...
    - Состояние: ...
    - Описание проблемы: ...
    - Серьезность: незначительная, значительная, критическая
  * [Проблема 2]:
    - Название компонента: ...
    - Состояние: ...
    - Описание проблемы: ...
    - Серьезность: незначительная, значительная, критическая
  * [Проблема 3]:
    - Название компонента: ...
    - Состояние: ...
    - Описание проблемы: ...
    - Серьезность: незначительная, значительная, критическая
2. [Сводка] краткое описание проблем: ...
3. [Рекомендации]: рекомендации по ремонту или замене компонентов ...

Если никаких проблем нет, используй следующий шаблон ответа:

1. [Выявленные проблемы]: отсутствуют
2. [Сводка] краткое описание того, что показано на изображении ...
3. [Рекомендации]: отсутствуют

Не добаляй текст вроде "Вот описание изображения с внесенными изменениями:" или "Вот исправленный текст".

`;

    let result;

    if (image_url)
    {
      const imageResponse = await fetch(image_url);
      const imageData = await imageResponse.arrayBuffer();
      const imageMimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

      const imagePart = {
        inlineData: {
          data: Buffer.from(imageData).toString('base64'),
          mimeType: imageMimeType,
        },
      };

      result = await model.generateContent([prompt, imagePart]);

      console.log(result);
    } else
    {
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error)
  {
    console.error('Error processing AI request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
