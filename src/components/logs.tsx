import { useQuery } from '@tanstack/react-query';
import { useDictionary } from './dictionary-provider';
import fetchClient from '@/lib/fetch-client';
import { GetActionLogByCaptionId, GetActionLogByCaptionIdQuery } from '@/graphql/types';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

export function Logs({ captionId }: { captionId: number }) {
  const t = useDictionary();

  const { data, isLoading } = useQuery({
    queryKey: ['annotation_action_log', captionId],
    queryFn: () => fetchClient<GetActionLogByCaptionIdQuery>({ query: GetActionLogByCaptionId, variables: { caption_id: captionId } }),
  });

  return (
    <div className="h-fit">
      <span className="relative text-lg font-medium mb-4 block">{t.Global.history}</span>
      <ScrollArea className="h-[300px]">
        {data?.annotation_action_log.map((item) => (
          <div key={item.id} className="relative w-full h-full flex items-start gap-2 pb-4">
            <div className="relative h-full flex-shrink-0 w-[15px] flex items-center justify-center">
              <div className="relative mt-2 bg-neutral-700 flex size-2 items-center justify-center rounded-md z-20"></div>
              <div className="absolute mt-2 left-1/2 -translate-x-1/2 top-0 h-[55px] w-[1px] bg-neutral-400"></div>
            </div>
            <div className="text-sm flex flex-col">
              <Badge variant="outline">{new Date(item.updated_at).toLocaleString()}</Badge>
              <span className="px-2 mt-1">
                {t.Lang === 'en' ? item.action?.name : item.action?.name_ru} - <span>{item.user?.username}</span>
              </span>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
