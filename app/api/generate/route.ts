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

export async function POST(request: Request) {
  const body = await request.json();

  const carePlan = await generateCarePlan(body);
  return NextResponse.json({
    carePlan,
  });
}
