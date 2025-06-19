import axios from 'axios';
import { NextResponse } from 'next/server';
import https from 'https';
import path from 'path';
import fs from 'fs';

const CERT_PATH = path.join(process.cwd(), 'cert.pem');

const KEY_PATH = path.join(process.cwd(), 'private.key');

/**
 * @swagger
 * /api/get-patients:
 *   get:
 *     summary: Get patients from PCC
 *     responses:
 *       '200':
 *         description: Patients data
 *         schema:
 *           type: object
 *           properties:
 *             patients:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *     parameters:
 *       - name: accessToken
 *         in: query
 *         type: string
 *         required: false
 *         description: The access token to fetch data for
 *       - name: iss
 *         in: query
 *         type: string
 *         required: false
 *         description: The ISS to fetch data for
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('accessToken');
  let iss = searchParams.get('iss');

  iss = iss?.replace('connect', 'connect2') || '';

  console.log({ accessToken, iss });

  // const CERT = process.env.PCC_CERT;
  // const cert = CERT ? Buffer.from(CERT, 'base64').toString('utf-8') : undefined;
  // const KEY = process.env.PCC_KEY;
  // const key = KEY ? Buffer.from(KEY, 'base64').toString('utf-8') : undefined;

  const cert = fs.readFileSync(CERT_PATH);
  const key = fs.readFileSync(KEY_PATH);

  console.log('cert', cert);
  console.log('key', key);
  // console.log('iss', iss);
  // console.log('accessToken', accessToken);
  // console.log('patientId', patientId);

  const httpsAgent = new https.Agent({
    cert,
    key, // Use the correct key
    rejectUnauthorized: true, // Enforce certificate validation in production
    requestCert: true,
  });
  // axios.defaults.httpAgent = httpsAgent;

  const requestOptions = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // Accept: 'application/json',
    },
    httpsAgent,
  };

  try {
    // Get patient basic info
    const { data: patients } = await axios.get(
      `${iss}/Patient`,
      requestOptions
    );

    return NextResponse.json(patients);
  } catch (error: any) {
    console.error('Error fetching from PCC:', error);
    console.log('error response', error?.response?.data);
    return NextResponse.json(
      { error: 'Failed to fetch patient data' },
      { status: 500 }
    );
  }
}
