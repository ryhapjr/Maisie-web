import { useEffect, useState } from 'react';

export const useLocalstorage = (
  key: string,
  initialValue: string
): [string | null, (value: string) => void] => {
  const [value, setValueState] = useState<string | null>(initialValue);

  useEffect(() => {
    const item = localStorage.getItem(key);
    if (item) {
      setValueState(item);
    }
  }, [key]);

  const setValue = (value: string) => {
    localStorage.setItem(key, value);
    setValueState(value);
  };

  return [value, setValue];
};
