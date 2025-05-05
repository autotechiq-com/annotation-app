import { useQuery } from '@tanstack/react-query';
import { useDictionary } from './dictionary-provider';
import fetchClient from '@/lib/fetch-client';
import {
  GetActionLogByCaptionId,
  GetActionLogByCaptionIdQuery,
  GetCaptionByUserIdQuery,
  GetCaptionVersionByCaptionId,
  GetCaptionVersionByCaptionIdQuery,
} from '@/graphql/types';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ArrowRight } from 'lucide-react';

import MarkdownToJsx from 'markdown-to-jsx';

export function Logs({ captionId, captionData }: { captionId: number; captionData: GetCaptionByUserIdQuery['annotation_caption'][0] }) {
  const t = useDictionary();

  const { data } = useQuery({
    queryKey: ['annotation_action_log', captionId],
    queryFn: () => fetchClient<GetActionLogByCaptionIdQuery>({ query: GetActionLogByCaptionId, variables: { caption_id: captionId } }),
  });

  const { data: versions } = useQuery({
    queryKey: ['annotation_caption_version', captionId],
    queryFn: () =>
      fetchClient<GetCaptionVersionByCaptionIdQuery>({ query: GetCaptionVersionByCaptionId, variables: { caption_id: captionId } }),
  });

  const versionsData = versions?.annotation_caption_version;

  return (
    <div className="h-fit">
      <span className="relative text-lg font-medium mb-4 block">{t.Global.history}</span>
      <ScrollArea className="h-[300px]">
        {data?.annotation_action_log.map((item, index) => {
          const version = versionsData?.find((v) => v.user_id === item.user_id && item.action_id === 4);

          const text = t.Lang === 'en' ? version?.interpretation : version?.interpretation_ru;

          return (
            <div key={item.id} className="relative w-full h-full flex items-start gap-2 pb-4">
              <div className="relative h-full flex-shrink-0 w-[15px] flex items-center justify-center">
                <div className="relative mt-2 bg-neutral-700 flex size-2 items-center justify-center rounded-md z-20"></div>
                <div className="absolute mt-2 left-1/2 -translate-x-1/2 top-0 h-[55px] w-[1px] bg-neutral-400"></div>
              </div>
              <div className="text-sm flex flex-col">
                <Badge variant="outline">{new Date(item.updated_at).toLocaleString()}</Badge>
                <span className="px-2 mt-1 font-medium">
                  {t.Lang === 'en' ? item.action?.name : item.action?.name_ru} - <span>{item.user?.username}</span>
                </span>
                {text ? (
                  <Dialog>
                    <DialogTrigger className="text-xs text-blue-600 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer ml-2">
                      {t.Global.new_version} <ArrowRight size={12} />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t.Global.new_version}</DialogTitle>
                        <DialogDescription asChild>
                          <div className="text-sm h-fit max-h-[70vh] overflow-y-auto pr-6 mt-4">
                            <MarkdownToJsx className="text-foreground">{text}</MarkdownToJsx>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                ) : null}
                {index === 0 ? (
                  <Dialog>
                    <DialogTrigger className="text-xs text-blue-600 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer ml-2">
                      {t.Global.inital_version} <ArrowRight size={12} />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t.Global.inital_version}</DialogTitle>
                        <DialogDescription asChild>
                          <div className="text-sm h-fit max-h-[70vh] overflow-y-auto pr-6 mt-4">
                            <MarkdownToJsx className="text-foreground">
                              {t.Lang === 'en' ? captionData?.src_interpretation ?? '' : captionData?.src_interpretation_ru ?? ''}
                            </MarkdownToJsx>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                ) : null}
              </div>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}
