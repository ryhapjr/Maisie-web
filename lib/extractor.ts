interface Condition {
  code: string;
  display: string;
  status: 'active' | 'resolved';
  onsetDate: string;
  recordedDate: string;
  abatementDate?: string;
}

export function extractConditions(conditionsArray: any[]): Condition[] {
  return conditionsArray.map((entry) => {
    const resource = entry.resource;

    return {
      code: resource.code.coding[0].code,
      display: resource.code.coding[0].display,
      status: resource.clinicalStatus.coding[0].code,
      onsetDate: resource.onsetDateTime,
      recordedDate: resource.recordedDate,
      abatementDate: resource.abatementDateTime,
    };
  });
}
