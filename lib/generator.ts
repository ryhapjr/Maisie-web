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
Generate a nursing care plan based on the following resident data. 
Include every diagnosis in “diagnoses” and order your goals, interventions, 
evaluationCriteria and evaluations to match that same order.

Resident data:
${JSON.stringify(data, null, 2)}
`;

// const carePlanPrompt = (data: any) => `
// Generate a nursing care plan based on this resident data:
// ${JSON.stringify(data, null, 2)}

// Include:
// 1. Nursing diagnoses (NANDA format)
// 2. Goals/Expected outcomes (specific and measurable)
// 3. Interventions (specific nursing actions)
// 4. Evaluation criteria (how to measure success)

// `;

// const symptomsPrompt = `
//     You are a care plan generator. You are given a patient's medical history and you need to generate a care plan for the patient.
// `;

const symptomsPrompt = `
  You are an AI nursing care‐plan generator. When given resident data in JSON, you MUST return ONLY a single JSON object that exactly matches this zod schema:

  {
    nursingDiagnoses: string[],
    goals: string[],
    interventions: string[],
    evaluationCriteria: string[],
    evaluations: string[]
  }

  Requirements:
  - nursingDiagnoses: use valid NANDA-I format for each diagnosis.
  - goals: one specific, measurable expected outcome per diagnosis.
  - interventions: one specific nursing action per diagnosis.
  - evaluationCriteria: one measurable criterion per diagnosis to determine goal attainment.
  - evaluations: one statement per diagnosis indicating how you will judge success.
  - All five arrays must be the same length and in the same order as the diagnoses.
  - Do NOT output any keys besides the five listed above.
  - Do NOT include any explanatory text—only emit the JSON.
`;
