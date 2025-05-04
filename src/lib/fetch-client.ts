import { DocumentNode } from 'graphql';

export default async function fetchClient<T>({
  query,
  variables,
}: {
  query: DocumentNode;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const data = await res.json();
  return data;
}
