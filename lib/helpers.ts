import axios from 'axios';
import queryString from 'query-string';
import { SCOPES } from './constants';

const CLIENT_ID = process.env.NEXT_PUBLIC_PCC_CLIENT_ID;

export const decodeIdToken = async (token: string) => {
  const { data } = await axios.post('/api/decode-id-token', { token });
  return data;
};

export const initiateSmartLaunch = async (
  fhirBaseUrl: string,
  launchContext: string,
  redirectUri: string,
  iss: string,
  setAuthUrl: (url: string) => void,
  setTokenUrl: (url: string) => void
) => {
  // check metadata
  const metadataResponse = await fetch(`${iss}/metadata`);
  const metadata = await metadataResponse.json();
  console.log('metadata', metadata);

  const authUrl = metadata.rest[0].security.extension[0].extension[1].valueUri;

  setAuthUrl(authUrl);

  const tokenUrl = metadata.rest[0].security.extension[0].extension[0].valueUri;

  setTokenUrl(tokenUrl);

  console.log({ CLIENT_ID });

  // Construct the authorization URL
  const launchParams = {
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: SCOPES.join(' '),
    // scope: 'launch',
    launch: launchContext,
    state: 'YOUR_STATE', // Optional state parameter for security
    aud: fhirBaseUrl,
  };

  const authRedirectUrl = `${authUrl}?${queryString.stringify(launchParams)}`;

  console.log('authRedirectUrl', authRedirectUrl);

  window.location.href = authRedirectUrl; // Redirect to PCC authorization
};

export const exchangeCodeForToken = async (
  code: string,
  tokenUrl: string,
  setAccessToken: (token: string) => void
) => {
  // Exchange authorization code for access token
  try {
    if (!tokenUrl) {
      console.error('Token URL is not available');
      return;
    }

    const tokenResponse = await axios.post('/api/get-token', {
      code,
      tokenUrl,
      clientId: CLIENT_ID,
    });

    const tokenData = tokenResponse.data;
    console.log(JSON.stringify(tokenData, null, 2));

    setAccessToken(tokenData.access_token);
    const decodedToken = await decodeIdToken(tokenData.id_token);
    console.log('decodedToken', decodedToken);
    localStorage.setItem('accessToken', tokenData.access_token);
    localStorage.setItem('idToken', tokenData.id_token);
  } catch (error) {
    console.log('Error exchanging code for token:', error);
  }
};

export const fetchPatientData = async (patientId: string, iss: string) => {
  const accessToken = localStorage.getItem('accessToken');
  try {
    const { data: patientData } = await axios.get('/api/get-patient-data', {
      params: {
        patientId,
        accessToken,
        iss,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return patientData;
  } catch (error) {
    console.error('Error fetching FHIR data:', error);
  }
};
