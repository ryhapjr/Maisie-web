import axios from 'axios';
import { NextResponse } from 'next/server';
import https from 'https';
import path from 'path';
import fs from 'fs';

const CERT_PATH = path.join(process.cwd(), 'cert.pem');

const KEY_PATH = path.join(process.cwd(), 'private.pem');

/**
 * @swagger
 * /api/get-patient-data:
 *   get:
 *     summary: Get patient data from PCC
 *     responses:
 *       '200':
 *         description: Patient data
 *         schema:
 *           type: object
 *           properties:
 *             resident_id:
 *               type: string
 *             code_status:
 *               type: string
 *             allergies:
 *               type: string
 *             diet:
 *               type: string
 *             fall_precautions:
 *               type: string
 *             aspiration_precautions:
 *               type: string
 *             diagnoses:
 *               type: array
 *     parameters:
 *       - name: patientId
 *         in: query
 *         type: string
 *         required: true
 *         description: The patient ID to fetch data for
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');
  const accessToken = searchParams.get('accessToken');
  const iss = searchParams.get('iss');

  console.log({ patientId, accessToken, iss });

  if (!patientId) {
    return NextResponse.json(
      { error: 'Patient ID is required' },
      { status: 400 }
    );
  }

  // const CERT = process.env.PCC_CERT;
  // const cert = CERT ? Buffer.from(CERT, 'base64').toString('utf-8') : undefined;
  // const KEY = process.env.PCC_KEY;
  // const key = KEY ? Buffer.from(KEY, 'base64').toString('utf-8') : undefined;

  const cert = fs.readFileSync(CERT_PATH);
  const key = fs.readFileSync(KEY_PATH);

  console.log('cert', cert);
  // console.log('key', key);
  // console.log('iss', iss);
  // console.log('accessToken', accessToken);
  // console.log('patientId', patientId);

  const httpsAgent = new https.Agent({
    cert,
    key, // Use the correct key
    rejectUnauthorized: false, // Enforce certificate validation in production
    requestCert: true,
  });
  axios.defaults.httpAgent = httpsAgent;

  const requestOptions = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    httpsAgent,
  };

  try {
    // Get patient basic info
    const { data: patient } = await axios.get(
      `${iss}/Patient/${patientId}`,
      requestOptions
    );

    // Get conditions/diagnoses
    const { data: conditions } = await axios.get(
      `${iss}/Condition?patient=${patientId}`,
      requestOptions
    );

    // Get allergies
    const { data: allergies } = await axios.get(
      `${iss}/AllergyIntolerance?patient=${patientId}`,
      requestOptions
    );

    // Get care plan info including precautions
    const { data: carePlan } = await axios.get(
      `${iss}/CarePlan?patient=${patientId}`,
      requestOptions
    );

    // Transform FHIR resources into our expected format
    // const patientData = {
    //   resident_id: patient.id,
    //   code_status:
    //     patient.extension?.find(
    //       (e) => e.url === 'http://pointclickcare.com/extension/code-status'
    //     )?.valueString || 'Unknown',
    //   allergies:
    //     allergies.entry?.map((e) => e.resource.code.text).join(', ') || 'None',
    //   diet:
    //     carePlan.entry?.find((e) =>
    //       e.resource.category?.some((c) => c.text === 'Diet')
    //     )?.resource.description || 'Regular',
    //   fall_precautions:
    //     carePlan.entry?.find((e) =>
    //       e.resource.category?.some((c) => c.text === 'Fall Risk')
    //     )?.resource.description || 'Standard',
    //   aspiration_precautions:
    //     carePlan.entry?.find((e) =>`
    //       e.resource.category?.some((c) => c.text === 'Aspiration')
    //     )?.resource.description || 'None',
    //   diagnoses: conditions.entry?.map((e) => e.resource.code.text) || [],
    // };

    const patientData = {
      patient,
      conditions,
      allergies,
      carePlan,
      resident_id: patientId,
    };

    return NextResponse.json(patientData);
  } catch (error: any) {
    console.error('Error fetching from PCC:', error);
    console.log('error response', error?.response?.data);
    return NextResponse.json(
      { error: 'Failed to fetch patient data' },
      { status: 500 }
    );
  }
}
