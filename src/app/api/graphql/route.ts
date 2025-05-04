import { NextRequest } from 'next/server';

import request from 'graphql-request';

const HASURA_SECRET = process.env.HASURA_SECRET;
const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;

export async function POST(req: NextRequest) {
  if (!HASURA_SECRET || !HASURA_ENDPOINT) {
    return new Response(JSON.stringify({ error: 'No HASURA_ENDPOINT or HASURA_SECRET provided' }), { status: 200 });
  }
  const { query, variables } = await req.json();

  try {
    const response = await request(HASURA_ENDPOINT, query, variables || {}, {
      Authorization: `Bearer ${HASURA_SECRET}`,
    });

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    console.log('err', error);
    return new Response(JSON.stringify(error), { status: 200 });
  }
}
