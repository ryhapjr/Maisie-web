'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocalstorage } from '@/hooks/useLocalstorage';
import axios from 'axios';
import { extractConditions } from '@/lib/extractor';
import {
  initiateSmartLaunch,
  exchangeCodeForToken,
  fetchPatientData,
} from '@/lib/helpers';
import { ClipLoader } from 'react-spinners';
import { Card } from '@/components/ui/Card';
import { ApiComboBox } from '@/components/ui/api-combobox';
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;

const LaunchPage = () => {
  const searchParams = useSearchParams();
  const issUrl = searchParams.get('iss');
  const launch = searchParams.get('launch');
  const code = searchParams.get('code');
  const [patientId, setPatientId] = useState<string | null>(null);
  const [fhirData, setFhirData] = useState<any>(null);
  const redirectUri = 'https://maisieservices.com/launch'; //'http://localhost:3000/callback'; //
  const [authUrl, setAuthUrl] = useLocalstorage('authUrl', ''); // Authorization URL
  const [tokenUrl, setTokenUrl] = useLocalstorage('tokenUrl', ''); // Token URL
  const [accessToken, setAccessToken] = useLocalstorage('accessToken', '');
  const [iss, setIss] = useLocalstorage('iss', ''); // ISS URL
  const [carePlan, setCarePlan] = useState<any>(null);

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
      initiateSmartLaunch(
        iss as string,
        launch as string,
        redirectUri,
        iss as string,
        setAuthUrl,
        setTokenUrl
      );
    }
  }, [iss, launch, authUrl, tokenUrl]);

  useEffect(() => {
    if (code && tokenUrl) {
      exchangeCodeForToken(code, tokenUrl, setAccessToken);
    }
  }, [code, tokenUrl]);

  const generateCarePlan = async (body: any) => {
    const { data } = await axios.post('/api/generate', body);
    console.log('generateCarePlan', data);
    return data;
  };

  const fetchFhirData = async () => {
    try {
      const patientData = await fetchPatientData(
        patientId as string,
        iss as string
      );
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
  };

  useEffect(() => {
    if (accessToken && patientId && iss) {
      fetchFhirData();
    }
  }, [accessToken, patientId, iss]);

  // Handle cases where iss and launch are missing
  // if (!issUrl && !launch && !code) {
  //   return (
  //     <RenderError
  //       title='Cannot find iss, launch, or code'
  //       description='Please check your URL parameters'
  //     />
  //   );
  // }

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-2xl font-bold'>PCC EHR Launch</h1>
      <div className='min-h-[500px] p-4 m-4'>
        {!accessToken ? (
          <Card>
            <div className='w-[100%] h-[300px] justify-self-start '>
              <ApiComboBox
                className='w-[100%]'
                selectedItem={{ value: '', label: 'Select a patient' }}
                url={`/api/get-patients?accessToken=${accessToken}&iss=${iss}`}
                onSelect={() => {}}
              />
            </div>
          </Card>
        ) : (
          <Card>
            <div className='flex flex-col items-center text-center justify-center'>
              <ClipLoader color='#000' size={50} />
              <p className='mt-4'>Launching PointClickCare</p>
            </div>
          </Card>
        )}
      </div>
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
