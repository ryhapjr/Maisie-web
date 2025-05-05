import { generateCarePlan } from '@/lib/generator';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/generate:
 *   post:
 *     summary: Generate a care plan and uploads to PCC
 *     responses:
 *       '200':
 *         description: A care plan
 *         schema:
 *           type: object
 *           properties:
 *             carePlan:
 *               type: object
 *               properties:
 *                 nursingDiagnoses:
 *                   type: array
 *     parameters:
 *       - name: patientId
 *         in: query
 *         type: string
 *         description: The patient ID
 *       - name: carePlanId
 *         in: query
 *         type: string
 *         description: The care plan ID
 */

export async function POST(_request: Request) {
  const sampleData = {
    resident_id: '12345',
    code_status: 'DNR',
    allergies: 'Peanuts',
    diet: 'Low Sodium',
    fall_precautions: 'High Risk',
    aspiration_precautions: 'Thickened Liquids',
    diagnoses: ['Diabetes', 'Hypertension'],
  };
  const carePlan = await generateCarePlan(sampleData);
  return NextResponse.json({
    carePlan,
  });
}
