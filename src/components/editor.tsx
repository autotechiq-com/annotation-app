'use client';

import BulletList from '@tiptap/extension-bullet-list';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, ListOrdered, RemoveFormatting, Stars, Underline as UnderlineIcon } from 'lucide-react';
import { useDictionary } from './dictionary-provider';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

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
import { cn } from '@/lib/utils';
import { targetUserIdAtom } from '@/state/state';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { Markdown } from 'tiptap-markdown';
import { LoadingSpinner } from './ui/loading-spinner';
import { UserSelect } from './user-select';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import AIChat from './ai-chat';

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
  refetchFreeCaption,
  imageUrl,
}: {
  content: string;
  captionId: number;
  userId: number;
  userRoleId: number;
  refetchUserCaption: any;
  refetchFreeCaption: any;
  imageUrl: string;
}) {
  const t = useDictionary();
  const [loading, setLoading] = useState(false);
  const [tagetUserId] = useAtom(targetUserIdAtom);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Markdown,
        Highlight,
        Underline,
        BulletList.configure({
          HTMLAttributes: {
            class: 'list-custom-disc',
          },
        }),
      ],

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

      const getTargetUser = (
        currentUserRoleId: number,
        targetUserId: number | undefined,
        randomUserRole2: GetUserByRoleQuery | undefined,
        randomUserRole3: GetUserByRoleQuery | undefined
      ): number | undefined => {
        if (targetUserId) {
          return +targetUserId;
        }
        if (currentUserRoleId === 1) {
          return randomUserRole3?.annotation_user?.[0]?.id;
        }
        if (currentUserRoleId === 2) {
          return randomUserRole3?.annotation_user?.[0]?.id;
        }
        if (currentUserRoleId === 3) {
          return undefined;
        }
      };

      const targetId = getTargetUser(userRoleId, tagetUserId ? +tagetUserId : undefined, userRole2, userRole3);

      const data =
        t.Lang === 'en'
          ? {
              status_id: 4,
              user_id: targetId,
              interpretation: editor?.storage.markdown.getMarkdown(),
            }
          : {
              status_id: 4,
              user_id: targetId,
              interpretation_ru: editor?.storage.markdown.getMarkdown(),
            };

      const res = await fetchClient<UpdateAnnotationCaptionMutation>({
        query: UpdateAnnotationCaption,
        variables: {
          id: captionId,
          _set: data,
        },
      });

      console.log(res);

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
              user_id: targetId,
              action_id: 1,
            },
          ],
        },
      });
      await refetchFreeCaption();
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
        _set: {
          status_id: 1,
          user_id: null,
        },
      },
    });

    await refetchUserCaption();

    setLoading(false);
  };

  const onReject = async () => {
    setLoading(true);
    await fetchClient({
      query: InsertActionLog,
      variables: {
        objects: [
          {
            caption_id: captionId,
            user_id: userId,
            action_id: 3,
          },
        ],
      },
    });

    await fetchClient<UpdateAnnotationCaptionMutation>({
      query: UpdateAnnotationCaption,
      variables: {
        id: captionId,
        _set: {
          status_id: 2,
          user_id: null,
        },
      },
    });

    await refetchUserCaption();

    setLoading(false);
  };

  const setEditorText = (text: string) => {
    editor?.commands.setContent(text);
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
          <div className={buttonStyle.base} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <ListOrdered className="h-4 w-4" />
          </div>
        </div>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Stars className="h-4 w-4" />
              {t.Global.ai_chat}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>{t.Global.ai_chat}</DrawerTitle>
                {/* <DrawerDescription>{t.Global.enter_message_to_generate}</DrawerDescription> */}
              </DrawerHeader>
              <div className="p-4 pb-0">
                <AIChat
                  setDrawerOpen={setDrawerOpen}
                  setEditorText={setEditorText}
                  initialText={editor.storage.markdown.getMarkdown()}
                  imageUrl={imageUrl}
                />
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">{t.Global.close}</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
        {/* <Button variant="outline" size="sm" onClick={() => editor.commands.insertContent(content)}>
          {t.Global.discard_changes}
        </Button> */}
      </div>
      <ScrollArea className="relative h-fit max-h-full overflow-y-auto pl-1 pr-6 text-sm leading-7 rounded-none default-format-render">
        <EditorContent className="list" classID="editor" editor={editor} />
      </ScrollArea>

      <div className="relative flex justify-between items-start gap-2 mt-6">
        <UserSelect userRoleId={userRoleId} />
        <div className="flex gap-2">
          <Button disabled={loading || (userRoleId === 3 && !tagetUserId)} className="w-fit" onClick={() => onSubmit()}>
            {loading && <LoadingSpinner />} {t.Global.save_next}
          </Button>
          {userRoleId === 3 ? (
            <div className="flex gap-2">
              <Button disabled={loading} variant="destructive" onClick={() => onReject()}>
                {loading && <LoadingSpinner />} {t.Global.reject}
              </Button>
              <Button disabled={loading} className="w-fit bg-green-700" onClick={() => onApprove()}>
                {loading && <LoadingSpinner />} {t.Global.approve}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
