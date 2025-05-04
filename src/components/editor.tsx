'use client';

import { Bold, Heading1, Heading2, Italic, RemoveFormatting, Type, Underline as UnderlineIcon } from 'lucide-react';
import { useDictionary } from './dictionary-provider';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Heading from '@tiptap/extension-heading';
import Underline from '@tiptap/extension-underline';

import { Markdown } from 'tiptap-markdown';
import { cn } from '@/lib/utils';
import {
  GetCaptionVersionByCaptionId,
  GetCaptionVersionByCaptionIdQuery,
  GetUserByRole,
  GetUserByRoleQuery,
  InsertActionLog,
  InsertCaptionVersion,
  InsertCaptionVersionMutation,
  UpdateAnnotationCaption,
  UpdateAnnotationCaptionMutation,
} from '@/graphql/types';
import fetchClient from '@/lib/fetch-client';
import { useState } from 'react';
import { LoadingSpinner } from './ui/loading-spinner';
import { UserSelect } from './user-select';
import { useAtom } from 'jotai';
import { targetUserIdAtom } from '@/state/state';

const buttonStyle = {
  base: 'flex items-center justify-center h-8 w-8 border rounded-md cursor-pointer hover:bg-background-secondary shadow-2xs',
  active: 'bg-neutral-300 border-neutral-300 hover:bg-neutral-200 hover:border-neutral-200',
};

export function Editor({
  content,
  captionId,
  userId,
  userRoleId,
  refetchUserCaption,
}: {
  content: string;
  captionId: number;
  userId: number;
  userRoleId: number;
  refetchUserCaption: any;
}) {
  const t = useDictionary();
  const [loading, setLoading] = useState(false);
  const [tagetUserId] = useAtom(targetUserIdAtom);
  const editor = useEditor(
    {
      extensions: [StarterKit, Markdown, Highlight, Underline],
      content: content,
    },
    [content]
  );

  const onSubmit = async () => {
    setLoading(true);
    const res = await fetchClient<GetCaptionVersionByCaptionIdQuery>({
      query: GetCaptionVersionByCaptionId,
      variables: { caption_id: captionId },
    });
    const lastVersion = res.annotation_caption_version?.[0]?.version ?? 0;

    const dataVersion =
      t.Lang === 'en'
        ? {
            user_id: userId,
            interpretation: editor?.storage.markdown.getMarkdown(),
            caption_id: captionId,
            version: lastVersion + 1,
          }
        : {
            user_id: userId,
            interpretation_ru: editor?.storage.markdown.getMarkdown(),
            caption_id: captionId,
            version: lastVersion + 1,
          };
    const res2 = await fetchClient<InsertCaptionVersionMutation>({
      query: InsertCaptionVersion,
      variables: {
        objects: [dataVersion],
      },
    });

    if (res2.insert_annotation_caption_version?.returning[0]?.id) {
      const userRole2 = await fetchClient<GetUserByRoleQuery>({
        query: GetUserByRole,
        variables: { role_id: 2 },
      });
      const userRole3 = await fetchClient<GetUserByRoleQuery>({
        query: GetUserByRole,
        variables: { role_id: 3 },
      });

      const data =
        t.Lang === 'en'
          ? {
              id: captionId,
              status_id: 4,
              user_id: (tagetUserId ? +tagetUserId : undefined) ?? userRole2.annotation_user?.[0]?.id ?? userRole3.annotation_user?.[0]?.id,
              interpretation: editor?.storage.markdown.getMarkdown(),
            }
          : {
              id: captionId,
              status_id: 4,
              user_id: (tagetUserId ? +tagetUserId : undefined) ?? userRole2.annotation_user?.[0]?.id ?? userRole3.annotation_user?.[0]?.id,
              interpretation_ru: editor?.storage.markdown.getMarkdown(),
            };

      await fetchClient<UpdateAnnotationCaptionMutation>({
        query: UpdateAnnotationCaption,
        variables: data,
      });

      await fetchClient({
        query: InsertActionLog,
        variables: {
          objects: [
            {
              caption_id: captionId,
              user_id: userId,
              action_id: 4,
            },
            {
              caption_id: captionId,
              user_id: (tagetUserId ? +tagetUserId : undefined) ?? userRole2.annotation_user?.[0]?.id ?? userRole3.annotation_user?.[0]?.id,
              action_id: 1,
            },
          ],
        },
      });

      await refetchUserCaption();
    }

    setLoading(false);
  };

  const onApprove = async () => {
    setLoading(true);
    await fetchClient({
      query: InsertActionLog,
      variables: {
        objects: [
          {
            caption_id: captionId,
            user_id: userId,
            action_id: 2,
          },
        ],
      },
    });

    await fetchClient<UpdateAnnotationCaptionMutation>({
      query: UpdateAnnotationCaption,
      variables: {
        id: captionId,
        status_id: 1,
      },
    });

    setLoading(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="relative w-full h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex justify-between gap-2 mb-4">
        <div className="flex gap-1">
          <div
            className={cn(buttonStyle.base, editor.isActive('bold') ? buttonStyle.active : '')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </div>
          <div
            className={cn(buttonStyle.base, editor.isActive('italic') && buttonStyle.active)}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </div>
          <div
            className={cn(buttonStyle.base, editor.isActive('underline') && buttonStyle.active)}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </div>
          <div className={buttonStyle.base} onClick={() => editor.chain().focus().unsetAllMarks().run()}>
            <RemoveFormatting className="h-4 w-4" />
          </div>
        </div>
        {/* <Button variant="outline" size="sm" onClick={() => editor.commands.insertContent(content)}>
          {t.Global.discard_changes}
        </Button> */}
      </div>
      <ScrollArea className="relative h-fit max-h-full overflow-y-auto pl-1 pr-6 text-sm leading-7 rounded-none">
        <EditorContent classID="editor" editor={editor} />
      </ScrollArea>

      <div className="relative flex justify-between items-center gap-2 mt-6">
        <UserSelect userRoleId={userRoleId} />
        <div className="flex gap-2">
          <Button disabled={loading} className="w-fit" onClick={() => onSubmit()}>
            {loading && <LoadingSpinner />} {t.Global.save_next}
          </Button>
          {userRoleId === 3 ? (
            <Button disabled={loading} className="w-fit bg-green-700" onClick={() => onApprove()}>
              {loading && <LoadingSpinner />} {t.Global.approve}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
