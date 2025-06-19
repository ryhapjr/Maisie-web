import { extractConditions } from '@/lib/extractor';

export const PatientData = ({ patientData }: { patientData: any }) => {
  return (
    <div>
      <h2>Patient Data</h2>
      <pre>{JSON.stringify(patientData, null, 2)}</pre>

      <h3>Conditions</h3>
      <ul>
        {extractConditions(patientData?.conditions?.entry || []).map(
          (condition) => (
            <li key={condition.code}>{condition.display}</li>
          )
        )}
      </ul>
    </div>
  );
};
