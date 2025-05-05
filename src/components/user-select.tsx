import { GetUser, GetUserQuery } from '@/graphql/types';
import fetchClient from '@/lib/fetch-client';
import { useQuery } from '@tanstack/react-query';
import { useDictionary } from './dictionary-provider';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { useAtom } from 'jotai';
import { targetUserIdAtom } from '@/state/state';
import { useState } from 'react';

export function UserSelect({ userRoleId }: { userRoleId: number }) {
  const t = useDictionary();
  const [key, setKey] = useState(+new Date());
  const [tagetUserId, setTagetUserId] = useAtom(targetUserIdAtom);
  const { data: users } = useQuery({
    queryKey: ['annotation_user'],
    queryFn: () => fetchClient<GetUserQuery>({ query: GetUser }),
  });

  const usersFilteredByRole = users?.annotation_user.filter((user) =>
    userRoleId === 1
      ? user.role_id === 2 || user.role_id === 3
      : userRoleId === 2
      ? user.role_id === 1 || user.role_id === 3
      : user.role_id === 1 || user.role_id === 2
  );

  console.log(tagetUserId);

  return (
    <div className="flex flex-col gap-2">
      <Select key={key} value={tagetUserId} onValueChange={setTagetUserId}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder={t.Global.select_target_user} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{t.Global.select_target_user}</SelectLabel>
            {usersFilteredByRole?.map((item) => {
              return (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.username} <span className="text-xs opacity-50">({item.email})</span>
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
      {tagetUserId && (
        <span
          onClick={() => {
            setTagetUserId(undefined);
            setKey(+new Date());
          }}
          className="text-xs opacity-50 ml-3 hover:underline hover:opacity-100 cursor-pointer"
        >
          {t.Global.clear_target_user}
        </span>
      )}
    </div>
  );
}
