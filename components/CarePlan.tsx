export const CarePlanView = ({ carePlan }: { carePlan: any }) => {
  return (
    <div>
      <h3>Care Plan</h3>
      {carePlan && <pre>{JSON.stringify(carePlan, null, 2)}</pre>}
    </div>
  );
};
