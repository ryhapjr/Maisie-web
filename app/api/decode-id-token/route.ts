import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const { token } = await request.json();
  try {
    // Verify the ID token (optional but HIGHLY recommended)
    // This requires knowing the issuer and the public key of the issuer
    // In a real application, you would fetch the public key from a trusted source
    // e.g., from the issuer's JWKS endpoint (JSON Web Key Set)
    // jwt.verify(idToken, publicKey, { algorithms: ['RS256'], issuer: 'YOUR_PCC_ISSUER' });

    // If verification is not possible, you can decode it without verification
    const decodedToken = jwt.decode(token) as any;

    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid ID token' }, { status: 400 });
    }

    console.log('decodedToken', decodedToken);
    const patientId = decodedToken?.fhirUser?.split('/')?.pop(); // Get the last segment of the fhirUser URL

    if (patientId) {
      return NextResponse.json(
        { patientId: patientId, decodedToken },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Patient ID not found in ID token' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error decoding ID token:', error);
    return NextResponse.json(
      { error: 'Error decoding ID token' },
      { status: 500 }
    );
  }
}
