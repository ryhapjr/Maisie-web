import axios from 'axios';
import { NextResponse } from 'next/server';
import queryString from 'query-string';

export async function POST(request: Request) {
  const { code, tokenUrl } = await request.json();
  console.log({ code });

  try {
    const { data } = await axios.post(
      tokenUrl,
      queryString.stringify({
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://growing-loudly-elk.ngrok-free.app/launch',
        client_id: process.env.PCC_CLIENT_ID,
        client_secret: process.env.PCC_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    console.log('Token data:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.log('Error exchanging code for token:', error);
    console.log('Error exchanging code for token:', error?.response?.data);
    return NextResponse.json(
      { error: 'Token exchange failed' },
      { status: 500 }
    );
  }
}
