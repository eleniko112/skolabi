export const getEmergencyKey = (schoolId: string) => `emergencyState-${schoolId}`;

export interface EmergencyState {
  active: boolean;
  message: string;
}
