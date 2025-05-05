import { z } from 'zod';
import { agent } from './agent';

export async function generateCarePlan(data: any) {
  const carePlan = await agent({
    systemPrompt: symptomsPrompt,
    prompt: carePlanPrompt(data),
    schema: z.object({
      nursingDiagnoses: z.array(z.string()),
      goals: z.array(z.string()),
      interventions: z.array(z.string()),
      evaluationCriteria: z.array(z.string()),
      evaluations: z.array(z.string()),
    }),
  });

  return carePlan;
}

const carePlanPrompt = (data: any) => `
Generate a nursing care plan based on this resident data:
${JSON.stringify(data, null, 2)}

Include:
1. Nursing diagnoses (NANDA format)
2. Goals/Expected outcomes (specific and measurable)
3. Interventions (specific nursing actions)
4. Evaluation criteria (how to measure success)

`;

const symptomsPrompt = `
    You are a care plan generator. You are given a patient's medical history and you need to generate a care plan for the patient.
`;
