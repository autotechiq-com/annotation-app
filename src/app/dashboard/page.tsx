'use client';

import { Container } from '@/components/ui/container';
import {
  GetCaptionByUserId,
  GetCaptionByUserIdQuery,
  GetCaptionWithoutUserId,
  GetCaptionWithoutUserIdQuery,
  GetUserByEmail,
  GetUserByEmailQuery,
  InsertActionLog,
  UpdateAnnotationCaption,
  UpdateAnnotationCaptionMutation,
} from '@/graphql/types';
import { authClient } from '@/lib/auth-client';
import fetchClient from '@/lib/fetch-client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Editor } from '@/components/editor';
import { ImagePreview } from '@/components/image-preview';
import { Card, CardContent } from '@/components/ui/card';
import { useDictionary } from '@/components/dictionary-provider';
import { Comment } from '@/components/comment';
import { Logs } from '@/components/logs';
import { object } from 'zod';

export default function DashboardMainPage() {
  const t = useDictionary();
  const [text, setText] = useState('');

  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['annotation_user', session?.user.email],
    queryFn: () => fetchClient<GetUserByEmailQuery>({ query: GetUserByEmail, variables: { email: session?.user.email } }),
    enabled: !!session?.user.email,
    refetchOnWindowFocus: false,
  });

  const {
    data: userCaption,
    isLoading: isUserCaptionLoading,
    refetch: refetchUserCaption,
  } = useQuery({
    queryKey: ['annotation_user_caption', user?.annotation_user?.[0]?.id],
    queryFn: () =>
      fetchClient<GetCaptionByUserIdQuery>({ query: GetCaptionByUserId, variables: { user_id: user?.annotation_user?.[0]?.id } }),
    enabled: !!user?.annotation_user?.[0]?.id,
    refetchOnWindowFocus: false,
  });

  const { data: freeCaption, isLoading: isFreeCaptionLoading } = useQuery({
    queryKey: ['annotation_free_caption'],
    queryFn: () => fetchClient<GetCaptionWithoutUserIdQuery>({ query: GetCaptionWithoutUserId }),
    refetchOnWindowFocus: false,
  });

  async function updateCaption() {
    await fetchClient<UpdateAnnotationCaptionMutation>({
      query: UpdateAnnotationCaption,
      variables: {
        id: freeCaption?.annotation_caption?.[0]?.id,
        user_id: user?.annotation_user?.[0]?.id,
        status_id: 3,
        interpretation: freeCaption?.annotation_caption?.[0]?.interpretation,
        interpretation_ru: freeCaption?.annotation_caption?.[0]?.interpretation_ru,
      },
    });
    await fetchClient({
      query: InsertActionLog,
      variables: {
        objects: [
          {
            caption_id: freeCaption?.annotation_caption?.[0]?.id,
            user_id: user?.annotation_user?.[0]?.id,
            action_id: 1,
          },
        ],
      },
    });
    await refetchUserCaption();
  }

  useEffect(() => {
    if (
      !user?.annotation_user?.[0]?.id ||
      isUserCaptionLoading ||
      user.annotation_user?.[0].role_id == 2 ||
      user.annotation_user?.[0].role_id == 3
    ) {
      return;
    }
    if (!userCaption?.annotation_caption?.[0]?.id) {
      updateCaption();
    }
  }, [userCaption?.annotation_caption?.[0]?.id, user?.annotation_user?.[0]?.id, isUserCaptionLoading]);

  useEffect(() => {
    if (t.Lang === 'en') {
      setText(userCaption?.annotation_caption?.[0]?.interpretation ?? '');
    } else {
      setText(userCaption?.annotation_caption?.[0]?.interpretation_ru ?? '');
    }
  }, [userCaption, t.Lang]);

  if (isSessionLoading || isUserLoading || isUserCaptionLoading || isFreeCaptionLoading) {
    return (
      <Container className="relative pt-20 h-[60vh] grid grid-cols-[1fr_2fr_1fr] gap-6 ">
        <Skeleton className="relative w-full h-full" />
        <Skeleton className="relative w-full h-full" />
        <Skeleton className="relative w-full h-full" />
      </Container>
    );
  }

  if (!userCaption?.annotation_caption?.[0]) {
    return (
      <Container className="relative pt-20">
        <Card className="shadow-none h-fit max-h-[calc(100vh-150px)]">
          <CardContent>
            <span>{t.Global.no_captions}</span>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="relative pt-20 h-full grid grid-cols-[1fr_2fr_1fr] gap-6">
      <div className="flex flex-col gap-6">
        <Card className="shadow-none h-fit max-h-[calc(100vh-150px)]">
          <CardContent>
            <ImagePreview src={`${process.env.NEXT_PUBLIC_IMAGES_ORIGIN}/${userCaption?.annotation_caption?.[0]?.image_path}`} />
          </CardContent>
        </Card>
        <Card className="shadow-none h-fit max-h-[calc(100vh-150px)]">
          <CardContent>
            <Logs captionId={userCaption?.annotation_caption?.[0]?.id ?? 0} />
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-none h-fit max-h-[calc(100vh-4rem)]">
        <CardContent>
          <Editor
            refetchUserCaption={refetchUserCaption}
            content={text}
            captionId={userCaption?.annotation_caption?.[0]?.id ?? 0}
            userId={user?.annotation_user?.[0]?.id ?? 0}
            userRoleId={user?.annotation_user?.[0]?.role_id ?? 0}
          />
        </CardContent>
      </Card>
      <Card className="shadow-none h-fit max-h-[calc(100vh-120px)]">
        <CardContent>
          <Comment captionId={userCaption?.annotation_caption?.[0]?.id ?? 0} userId={user?.annotation_user?.[0]?.id ?? 0} />
        </CardContent>
      </Card>
    </Container>
  );
}
