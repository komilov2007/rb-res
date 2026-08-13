import { useState } from "react";
interface UseBooleanProps {
  defaultValue?: boolean;
}
export const useBoolean = (props?: UseBooleanProps) => {
  const [value, setValue] = useState(props?.defaultValue ?? false);

  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);
  const toggle = () => setValue((prev) => !prev);

  return {
    value,
    setValue,
    setTrue,
    setFalse,
    toggle,
  };
};

