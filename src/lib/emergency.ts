export interface EmergencyState {
  active: boolean;
  message: string;
}

export const defaultState: EmergencyState = {
    active: false,
    message: 'ყურადღება! სასწავლო პროცესი შეწყვეტილია. გთხოვთ, შეინარჩუნოთ სიმშვიდე და მიჰყვეთ ინსტრუქციებს.',
}

export const getEmergencyKey = (schoolId: string) => `school-board-emergency-${schoolId}`;

const getStorage = () => {
    if (typeof window === 'undefined') return undefined;
    return window.localStorage;
}

export const getEmergencyState = (schoolId: string): EmergencyState => {
    const storage = getStorage();
    if (!storage) return defaultState;
    
    const key = getEmergencyKey(schoolId);
    const state = JSON.parse(storage.getItem(key) || 'null') as EmergencyState | null;

    if (!state) {
        storage.setItem(key, JSON.stringify(defaultState));
        return defaultState;
    }
    
    return state;
};

export const setEmergencyState = (schoolId: string, state: EmergencyState) => {
    const storage = getStorage();
    if (!storage) return;
    const key = getEmergencyKey(schoolId);
    storage.setItem(key, JSON.stringify(state));
    // Manually dispatch storage event to notify other tabs/windows
    window.dispatchEvent(new StorageEvent('storage', {
        key: key,
        newValue: JSON.stringify(state),
    }));
};
