import { extractConditions, extractPatientNames } from '@/lib/extractor';

export const PatientData = ({ patientData }: { patientData: any }) => {
  const patient = extractPatientNames(
    patientData?.patient ? [{ resource: patientData?.patient }] : []
  )?.[0];
  return (
    <div>
      <h2 className='text-lg font-bold'>Patient Data</h2>
      <p className='text-sm text-gray-500'>{patient?.label}</p>

      <h3 className='text-md font-bold mt-4'>Conditions</h3>
      <div className='flex gap-1 flex-wrap'>
        {extractConditions(patientData?.conditions?.entry || []).map(
          (condition) => (
            <div
              key={condition.code}
              className='bg-gray-300 p-1.5 rounded-md text-xs'
            >
              {condition.display}
            </div>
          )
        )}
      </div>
    </div>
  );
};
