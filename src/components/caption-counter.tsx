import { GetCaptionCountByUserId, GetCaptionCountByUserIdQuery } from '@/graphql/types';
import fetchClient from '@/lib/fetch-client';
import { useQuery } from '@tanstack/react-query';
import { useDictionary } from './dictionary-provider';

export function CaptionCounter({ userId }: { userId: number }) {
  const t = useDictionary();
  const { data } = useQuery({
    queryKey: ['annotation_caption_count', userId],
    queryFn: () => fetchClient<GetCaptionCountByUserIdQuery>({ query: GetCaptionCountByUserId, variables: { user_id: userId } }),
    refetchInterval: 3000,
  });
  return (
    <div>
      {t.Global.captions_to_check}: {data?.annotation_caption_aggregate.aggregate?.count ?? 0}
    </div>
  );
}
