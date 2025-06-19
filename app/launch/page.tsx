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
import RenderError from '@/components/RenderError';
import { Button } from '@/components/ui/button';
import { PatientData } from '@/components/PatientData';
import { CarePlanView } from '@/components/CarePlan';
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;

const LaunchPage = () => {
  const searchParams = useSearchParams();
  const issUrl = searchParams.get('iss');
  const launch = searchParams.get('launch');
  const code = searchParams.get('code');
  const [patient, setPatient] = useState<any | null>(null);
  const [fhirData, setFhirData] = useState<any>(null);
  const redirectUri = 'https://maisieservices.com/launch'; //'http://localhost:3000/callback'; //
  const [authUrl, setAuthUrl] = useLocalstorage('authUrl', ''); // Authorization URL
  const [tokenUrl, setTokenUrl] = useLocalstorage('tokenUrl', ''); // Token URL
  const [accessToken, setAccessToken] = useLocalstorage('accessToken', '');
  const [iss, setIss] = useLocalstorage('iss', ''); // ISS URL
  const [carePlan, setCarePlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const patientData = await fetchPatientData(
        patient.value as string,
        iss as string
      );
      setFhirData(patientData);
      const carePlan = await generateCarePlan({
        diagnoses: extractConditions(patientData?.conditions?.entry || []),
        allergies: patientData?.allergies?.entry || [],
        // carePlan: patientData?.carePlan?.entry || [],
        resident_id: patientData?.resident_id,
      });
      console.log('carePlan', carePlan);
      setCarePlan(carePlan);
    } catch (error) {
      console.error('Error fetching FHIR data:', error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (accessToken && patient && iss) {
  //     fetchFhirData();
  //   }
  // }, [accessToken, patient, iss]);

  // Handle cases where iss and launch are missing
  if (!issUrl && !launch && !code) {
    return (
      <RenderError
        title='Cannot find iss, launch, or code'
        description='Please check your URL parameters'
      />
    );
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <h1 className='text-2xl font-bold'>PCC EHR Launch</h1>
      <div className='min-h-[500px] p-4 m-4'>
        {accessToken ? (
          <>
            <Card>
              <div className='w-[100%] h-[300px] justify-self-start flex-1'>
                <ApiComboBox
                  className='w-[100%]'
                  selectedItem={
                    patient || { value: '', label: 'Select a patient' }
                  }
                  url={`/api/get-patients?accessToken=${accessToken}&iss=${iss}`}
                  onSelect={(item) => {
                    setPatient(item);
                    setFhirData(null);
                    setCarePlan(null);
                  }}
                />
              </div>
              <Button
                onClick={() => fetchFhirData()}
                disabled={!patient || loading}
              >
                {loading ? 'Generating...' : 'Generate Care Plan'}
              </Button>
            </Card>

            {fhirData && (
              <>
                <Card className='my-4'>
                  <PatientData patientData={fhirData} />
                  {carePlan && <CarePlanView carePlan={carePlan} />}
                </Card>
                {carePlan && (
                  <div className='flex justify-end'>
                    <Button onClick={() => {}} disabled={loading}>
                      Send to PCC
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <Card>
            <div className='flex flex-col items-center text-center justify-center'>
              <ClipLoader color='#000' size={50} />
              <p className='mt-4'>
                {code ? 'Finalizing permissions' : 'Launching PointClickCare'}
              </p>
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

// eyJraWQiOiJzbWlsZWNkci1kZW1vIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJodHRwcyUzQSUyRiUyRmFjY291bnRzLnBvaW50Y2xpY2tjYXJlLmNvbXxlZmE5NzY2YS0yYzlmLTQzODYtOWZmZS00NzQ4ZTM5NDM0MzYiLCJpc3MiOiJodHRwczovL2Nvbm5lY3QucG9pbnRjbGlja2NhcmUuY29tL2ZoaXIiLCJzbWlsZV9jZHJfbW9kdWxlX2lkIjoic21hcnRfYXV0aCIsInRva2VuX3R5cGUiOiJCZWFyZXIiLCJhdWQiOiJodHRwczovL2Nvbm5lY3QucG9pbnRjbGlja2NhcmUuY29tL2ZoaXIvUjQvNmY5MzE1NDYtOTJjOC00MWQ2LTlkYTQtZTU5Y2M1OTI2NzI2IiwibmJmIjoxNzUwMzMxOTcyLCJhenAiOiJXMWU4WUNEQUt0MW9qNlVkUGVmWHdTcE5zOWhUNmVjYSIsInNjb3BlIjoiZmhpclVzZXIgbGF1bmNoIGxhdW5jaC9wYXRpZW50IG9wZW5pZCBwYXRpZW50L0FsbGVyZ3lJbnRvbGVyYW5jZS5yZWFkIHBhdGllbnQvQ2FyZVBsYW4ucmVhZCBwYXRpZW50L0NvbmRpdGlvbi5yZWFkIHBhdGllbnQvT2JzZXJ2YXRpb24ucmVhZCBwYXRpZW50L1BhdGllbnQucmVhZCBwY2Mtcm5jYXJlcGxhbi1maGlyLTZmOTMxNTQ2LTkyYzgtNDFkNi05ZGE0LWU1OWNjNTkyNjcyNiBwcm9maWxlIiwiZmhpckNvbnRleHQiOltdLCJzbWlsZV9jZHJfbm9kZV9pZCI6Ik1hc3RlciIsImV4cCI6MTc1MDMzNTU3MiwiaWF0IjoxNzUwMzMxOTcyLCJqdGkiOiJiY2M1MWQwYy0xZmQxLTRjZWItYTIyNy1jM2ZmMDU1OTdiOGUifQ.PGNsbNNvjC4VUhNajFrNkRmKPIk_a4zBawkgQWwnGSq_0UOzihEy8fyEpBdWMOIrrjVbRPtgiiOFrEH0n7fjp2RECxZybwYPtFPIqIE6JjJ7Zn7p7gdzRtyl5PcGKtXhDTmg-f_zgNWxp7BRE5KBB0Hm7a6XR2gDGEgOcw0Xe3Nwk4v_edgD2mZivqwmqMR3Vvnw3f5jTrmc8RXQ7Owgqck-0vfmTFvcN9DFgS_NuQgIgLmuOFSPBKeoCun9U9MkQXAimn70FTQy8abbMo_LOd-qasMTYwG3sPMX10I9AHJV_vZ_tpvAJeoqeqLeCnNseewv5-2Ub-LZtg2SY4vpCg

// curl -v --cert cert.pem --key private.key \
// -H "Authorization: Bearer eyJraWQiOiJzbWlsZWNkci1kZW1vIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJodHRwcyUzQSUyRiUyRmFjY291bnRzLnBvaW50Y2xpY2tjYXJlLmNvbXxlZmE5NzY2YS0yYzlmLTQzODYtOWZmZS00NzQ4ZTM5NDM0MzYiLCJpc3MiOiJodHRwczovL2Nvbm5lY3QucG9pbnRjbGlja2NhcmUuY29tL2ZoaXIiLCJzbWlsZV9jZHJfbW9kdWxlX2lkIjoic21hcnRfYXV0aCIsInRva2VuX3R5cGUiOiJCZWFyZXIiLCJhdWQiOiJodHRwczovL2Nvbm5lY3QucG9pbnRjbGlja2NhcmUuY29tL2ZoaXIvUjQvNmY5MzE1NDYtOTJjOC00MWQ2LTlkYTQtZTU5Y2M1OTI2NzI2IiwibmJmIjoxNzUwMzMxOTcyLCJhenAiOiJXMWU4WUNEQUt0MW9qNlVkUGVmWHdTcE5zOWhUNmVjYSIsInNjb3BlIjoiZmhpclVzZXIgbGF1bmNoIGxhdW5jaC9wYXRpZW50IG9wZW5pZCBwYXRpZW50L0FsbGVyZ3lJbnRvbGVyYW5jZS5yZWFkIHBhdGllbnQvQ2FyZVBsYW4ucmVhZCBwYXRpZW50L0NvbmRpdGlvbi5yZWFkIHBhdGllbnQvT2JzZXJ2YXRpb24ucmVhZCBwYXRpZW50L1BhdGllbnQucmVhZCBwY2Mtcm5jYXJlcGxhbi1maGlyLTZmOTMxNTQ2LTkyYzgtNDFkNi05ZGE0LWU1OWNjNTkyNjcyNiBwcm9maWxlIiwiZmhpckNvbnRleHQiOltdLCJzbWlsZV9jZHJfbm9kZV9pZCI6Ik1hc3RlciIsImV4cCI6MTc1MDMzNTU3MiwiaWF0IjoxNzUwMzMxOTcyLCJqdGkiOiJiY2M1MWQwYy0xZmQxLTRjZWItYTIyNy1jM2ZmMDU1OTdiOGUifQ.PGNsbNNvjC4VUhNajFrNkRmKPIk_a4zBawkgQWwnGSq_0UOzihEy8fyEpBdWMOIrrjVbRPtgiiOFrEH0n7fjp2RECxZybwYPtFPIqIE6JjJ7Zn7p7gdzRtyl5PcGKtXhDTmg-f_zgNWxp7BRE5KBB0Hm7a6XR2gDGEgOcw0Xe3Nwk4v_edgD2mZivqwmqMR3Vvnw3f5jTrmc8RXQ7Owgqck-0vfmTFvcN9DFgS_NuQgIgLmuOFSPBKeoCun9U9MkQXAimn70FTQy8abbMo_LOd-qasMTYwG3sPMX10I9AHJV_vZ_tpvAJeoqeqLeCnNseewv5-2Ub-LZtg2SY4vpCg" \
// "https://connect2.pointclickcare.com/fhir/R4/6f931546-92c8-41d6-9da4-e59cc5926726/Patient"
