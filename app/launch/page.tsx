'use client';

import { Suspense, useEffect, useState } from 'react';
import queryString from 'query-string';
import { useSearchParams } from 'next/navigation';
import { useLocalstorage } from '@/hooks/useLocalstorage';
import axios from 'axios';
import { extractConditions } from '@/lib/extractor';

const LaunchPage = () => {
  const searchParams = useSearchParams();
  const issUrl = searchParams.get('iss');
  const launch = searchParams.get('launch');
  const code = searchParams.get('code');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [fhirData, setFhirData] = useState<any>(null);

  const clientId = 'W1e8YCDAKt1oj6UdPefXwSpNs9hT6eca'; // Replace with your client ID
  const redirectUri = 'https://maisieservices.com/launch'; //'http://localhost:3000/callback'; // Replace
  const scopes = [
    'openid',
    'fhirUser',
    'profile',
    'patient/Patient.read',
    'patient/Observation.read',
    'patient/Condition.read',
    'patient/AllergyIntolerance.read',
    'patient/CarePlan.read',
    // 'launch/patient',
    'launch',
  ]; // Define required scopes
  const [authUrl, setAuthUrl] = useLocalstorage('authUrl', ''); // Authorization URL
  const [tokenUrl, setTokenUrl] = useLocalstorage('tokenUrl', ''); // Token URL
  const [iss, setIss] = useLocalstorage('iss', ''); // ISS URL
  const [carePlan, setCarePlan] = useState<any>(null);

  console.log('tokenUrl', tokenUrl);

  useEffect(() => {
    // Initialize authUrl and tokenUrl based on iss
    if (issUrl) {
      // You might need to fetch the conformance statement to get
      // the correct authorization and token endpoints.  For PCC,
      // these are often (but not always) at {iss}/oauth2/authorize
      // and {iss}/oauth2/token

      // Example: Assume endpoints are at /oauth2/authorize and /oauth2/token
      setAuthUrl(`${issUrl}/oauth2/authorize`);
      setTokenUrl(`${issUrl}/oauth2/token`);
      setIss(issUrl);
    }
  }, [issUrl]);

  useEffect(() => {
    // Initiate the Smart on FHIR launch when iss and launch are available
    if (iss && launch && authUrl && tokenUrl) {
      initiateSmartLaunch(iss as string, launch as string);
    }
  }, [iss, launch, authUrl, tokenUrl]);

  useEffect(() => {
    // Check for authorization code in URL (after redirect)
    const params = new URLSearchParams(window.location.search);

    if (code && tokenUrl) {
      exchangeCodeForToken(code);
    }
  }, [code, tokenUrl]);

  const initiateSmartLaunch = async (
    fhirBaseUrl: string,
    launchContext: string
  ) => {
    // check metadata
    const metadataResponse = await fetch(`${iss}/metadata`);
    const metadata = await metadataResponse.json();
    console.log('metadata', metadata);

    const authUrl =
      metadata.rest[0].security.extension[0].extension[1].valueUri;

    setAuthUrl(authUrl);

    const tokenUrl =
      metadata.rest[0].security.extension[0].extension[0].valueUri;

    setTokenUrl(tokenUrl);

    // Construct the authorization URL
    const launchParams = {
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      // scope: 'launch',
      launch: launchContext,
      state: 'YOUR_STATE', // Optional state parameter for security
      aud: fhirBaseUrl,
    };

    const authRedirectUrl = `${authUrl}?${queryString.stringify(launchParams)}`;

    window.location.href = authRedirectUrl; // Redirect to PCC authorization
  };

  const decodeIdToken = async (token: string) => {
    const { data } = await axios.post('/api/decode-id-token', { token });
    return data;
  };

  const exchangeCodeForToken = async (code: string) => {
    // Exchange authorization code for access token
    try {
      if (!tokenUrl) {
        console.error('Token URL is not available');
        return;
      }

      const tokenResponse = await axios.post('/api/get-token', {
        code,
        tokenUrl,
      });

      const tokenData = tokenResponse.data;
      console.log(JSON.stringify(tokenData, null, 2));
      setPatientId(tokenData.patient); // Assuming patient ID is in the token response

      setAccessToken(tokenData.access_token);
      const decodedToken = await decodeIdToken(tokenData.id_token);
      console.log('decodedToken', decodedToken);
      setPatientId(decodedToken.patientId);
    } catch (error) {
      console.log('Error exchanging code for token:', error);
    }
  };

  const generateCarePlan = async (body: any) => {
    const { data } = await axios.post('/api/generate', body);
    console.log('generateCarePlan', data);
    return data;
  };

  const fetchFhirData = async () => {
    // Example: Fetch Patient data
    if (accessToken && patientId && iss) {
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

        setFhirData(patientData);
        const carePlan = await generateCarePlan({
          diagnoses: extractConditions(patientData?.conditions?.entry || []),
          allergies: patientData?.allergies?.entry || [],
          carePlan: patientData?.carePlan?.entry || [],
          resident_id: patientData?.resident_id,
        });
        console.log('carePlan', carePlan);
        setCarePlan(carePlan);
      } catch (error) {
        console.error('Error fetching FHIR data:', error);
      }
    }
  };

  useEffect(() => {
    fetchFhirData();
  }, [accessToken, patientId, iss]);

  // Handle cases where iss and launch are missing
  if (!issUrl && !launch && !code) {
    return <p>Cannot find iss, launch, or code</p>;
  }

  return (
    <div>
      <h1>PCC EHR Launch</h1>
      {accessToken ? (
        <div>
          <p>Access Token: {accessToken}</p>
          <p>Patient ID: {patientId}</p>
          {fhirData && (
            <div>
              <h2>Patient Data</h2>
              {/* <pre>{JSON.stringify(fhirData, null, 2)}</pre> */}

              <h3>Conditions</h3>
              <ul>
                {extractConditions(fhirData?.conditions?.entry || []).map(
                  (condition) => (
                    <li key={condition.code}>{condition.display}</li>
                  )
                )}
              </ul>

              <h3>Care Plan</h3>
              {carePlan && <pre>{JSON.stringify(carePlan, null, 2)}</pre>}
            </div>
          )}
        </div>
      ) : (
        <p>Launching PointClickCare...</p>
      )}
    </div>
  );
};

const LaunchPageMain = () => {
  return (
    <Suspense>
      <LaunchPage />
    </Suspense>
  );
};

export default LaunchPageMain;
