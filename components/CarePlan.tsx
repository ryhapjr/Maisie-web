import { Copy } from './copy';

export const CarePlanView = ({ carePlan }: { carePlan: any }) => {
  const diagnoses = carePlan?.carePlan?.nursingDiagnoses || [];
  const interventions = carePlan?.carePlan?.interventions || [];
  const goals = carePlan?.carePlan?.goals || [];
  const evaluations = carePlan?.carePlan?.evaluations || [];

  return (
    <div className='mt-6'>
      <h3 className='text-md font-bold'>Care Plan</h3>
      <h4 className='text-sm font-bold my-4'>Diagnoses</h4>
      <div className='flex flex-col gap-1'>
        {diagnoses.map((diagnosis: string, index: number) => (
          <div key={index} className='flex gap-2 mb-2 items-start'>
            <div className='w-[8px] h-[8px] bg-black rounded-full mt-1.5' />
            <div key={index} className='text-sm flex-1'>
              {diagnosis}
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-between items-center'>
        <h4 className='text-sm font-bold my-4'>Interventions</h4>
        <Copy
          textToCopy={interventions?.join('\n')}
          tooltipMessage='Copy Interventions'
        />
      </div>
      <div className='flex flex-col gap-1'>
        {interventions.map((intervention: string, index: number) => (
          <div key={index} className='flex gap-2 mb-2 items-start'>
            <div className='w-[8px] h-[8px] bg-black rounded-full mt-1.5' />
            <div key={index} className='text-sm flex-1'>
              {intervention}
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-between items-center'>
        <h4 className='text-sm font-bold my-4'>Goals</h4>
        <Copy textToCopy={goals?.join('\n')} tooltipMessage='Copy Goals' />
      </div>
      <div className='flex flex-col gap-1'>
        {goals.map((goal: string, index: number) => (
          <div key={index} className='flex gap-2 mb-2 items-start'>
            <div className='w-[8px] h-[8px] bg-black rounded-full mt-1.5' />
            <div key={index} className='text-sm flex-1'>
              {goal}
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-between items-center'>
        <h4 className='text-sm font-bold my-4'>Evaluations</h4>
        <Copy
          textToCopy={evaluations?.join('\n')}
          tooltipMessage='Copy Evaluations'
        />
      </div>
      <div className='flex flex-col gap-1'>
        {evaluations.map((evaluation: string, index: number) => (
          <div key={index} className='flex gap-2 mb-2 items-start'>
            <div className='w-[8px] h-[8px] bg-black rounded-full mt-1.5' />
            <div key={index} className='text-sm flex-1'>
              {evaluation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
