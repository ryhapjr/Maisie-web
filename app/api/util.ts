export const getAuthToken = async () => {
  const response = await fetch(`${process.env.PCC_API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.PCC_CLIENT_ID || '',
    }),
  });
  const data = await response.json();
  return data.access_token;
};
