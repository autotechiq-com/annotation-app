import { GetInspectionImageById, GetInspectionImageByIdQuery } from '@/graphql/types';
import fetchClient from '@/lib/fetch-client';
import { useQuery } from '@tanstack/react-query';
import { useDictionary } from './dictionary-provider';

export function TopicInfo({ inspectionImageId }: { inspectionImageId: number }) {
  const t = useDictionary();
  const { data } = useQuery({
    queryKey: ['dvi_tool_inspection_image', inspectionImageId],
    queryFn: () =>
      fetchClient<GetInspectionImageByIdQuery>({
        query: GetInspectionImageById,
        variables: { id: inspectionImageId },
      }),
  });

  console.log(data);

  const topic = data?.dvi_tool_inspection_image?.[0];

  if (!topic) return null;
  return (
    <div className="flex flex-col font-medium text-sm">
      <span>
        <span className="opacity-50">{t.Global.topic}:</span> {topic.topic_name}
      </span>
      <span>
        <span className="opacity-50">{t.Global.model}:</span> {topic.vehicle_year} {topic.vehicle_make} {topic.vehicle_model}
      </span>
      <span>
        <span className="opacity-50">{t.Global.status}:</span>
        <div className="h-2 w-2 rounded-full inline-flex mr-1 ml-1" style={{ backgroundColor: `#${topic.status_color}` }}></div>
        {topic.status_name}
      </span>
      <span>
        <span className="opacity-50">{t.Global.condition}:</span> {topic.condition_names}
      </span>
      <span>
        <span className="opacity-50">{t.Global.odometer}:</span> {topic.odometer} mi
      </span>
    </div>
  );
}
