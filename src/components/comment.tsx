import {
  GetCommentByCaptionId,
  GetCommentByCaptionIdQuery,
  InsertAnnotationComment,
  InsertAnnotationCommentMutation,
} from '@/graphql/types';
import fetchClient from '@/lib/fetch-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Textarea } from './ui/textarea';
import { useDictionary } from './dictionary-provider';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

export function Comment({ captionId, userId }: { captionId: number; userId: number }) {
  const t = useDictionary();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollBlockRef = useRef<HTMLDivElement>(null);
  const {
    data: comments,
    isLoading: isCommentsLoading,
    refetch,
  } = useQuery({
    queryKey: ['annotation_comment', captionId],
    queryFn: () => fetchClient<GetCommentByCaptionIdQuery>({ query: GetCommentByCaptionId, variables: { caption_id: captionId } }),
  });

  const onSubmit = async () => {
    if (!text) return;
    setLoading(true);
    const res = await fetchClient<InsertAnnotationCommentMutation>({
      query: InsertAnnotationComment,
      variables: { objects: [{ caption_id: captionId, user_id: userId, comment: text }] },
    });
    console.log(res);
    await refetch();

    setLoading(false);
    setText('');
  };

  const commentsDates = comments?.annotation_comment?.map((item) => {
    return new Date(item.created_at).toLocaleDateString();
  });

  const commentsDatesWithoutDuplicates = [...new Set(commentsDates)];

  useEffect(() => {
    // Get the scroll viewport from the ScrollArea component
    const scrollArea = scrollBlockRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [comments]);

  return (
    <div className="relative h-full max-h-[calc(100vh-110px)]">
      <span className="relative text-lg font-medium mb-4">{t.Global.comment}</span>
      <div>
        {comments?.annotation_comment && comments?.annotation_comment?.length > 0 ? (
          <ScrollArea ref={scrollBlockRef} className="relative my-4 h-fit pl-1 pr-4 text-sm leading-7 rounded-md">
            <div className="max-h-[calc(100vh-470px)]">
              {commentsDatesWithoutDuplicates?.map((date) => {
                const commentsForDate = comments?.annotation_comment?.filter((comment) => {
                  return new Date(comment.created_at).toLocaleDateString() === date;
                });
                return (
                  <div key={date} className="text-sm mb-4">
                    <div className="flex items-center justify-center pb-4">
                      <Badge className="relative font-bold mx-auto">{date}</Badge>
                    </div>
                    {commentsForDate?.map((comment) => (
                      <div key={comment.id} className="text-sm mb-6">
                        <div className="flex items-center gap-2">
                          <div className="font-bold">{comment.user?.username}</div>
                          <Badge variant="outline">{new Date(comment.created_at).toLocaleTimeString()}</Badge>
                          {/* <div className="opacity-50">{comment.user?.email}</div> */}
                        </div>
                        <div>{comment.comment}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-10 bg-background-secondary text-sm opacity-50 mb-4">{t.Global.no_comment}</div>
        )}
      </div>
      <Textarea className="max-h-[150px]" value={text} onChange={(e) => setText(e.target.value)} />
      <Button disabled={loading || isCommentsLoading || !text} onClick={onSubmit} className="mt-2 w-full">
        {t.Global.send_comment}
      </Button>
    </div>
  );
}
