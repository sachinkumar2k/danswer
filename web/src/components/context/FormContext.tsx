import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface FormContextType {
  formStep: number;
  formValues: Record<string, any>;
  setFormValues: (values: Record<string, any>) => void;
  nextFormStep: (contract?: string) => void;
  prevFormStep: () => void;
  formStepToLast: () => void;
  setFormStep: React.Dispatch<React.SetStateAction<number>>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize formStep based on the URL parameter
  const initialStep = parseInt(searchParams.get("step") || "1", 10);
  const [formStep, setFormStep] = useState(initialStep);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const nextFormStep = (values = "") => {
    setFormStep((prevStep) => prevStep + 1);
    setFormValues((prevValues) => ({ ...prevValues, values }));
  };

  const prevFormStep = () => {
    setFormStep((currentStep) => Math.max(currentStep - 1, 0));
  };

  const formStepToLast = () => {
    setFormStep(2);
  };

  useEffect(() => {
    // Update URL when formStep changes
    const updatedSearchParams = new URLSearchParams(searchParams.toString());
    updatedSearchParams.set("step", formStep.toString());
    const newUrl = `${pathname}?${updatedSearchParams.toString()}`;
    router.push(newUrl);
  }, [formStep, router, pathname, searchParams]);

  // Update formStep when URL changes
  useEffect(() => {
    const stepFromUrl = parseInt(searchParams.get("step") || "1", 10);
    if (stepFromUrl !== formStep) {
      setFormStep(stepFromUrl);
    }
  }, [searchParams]);

  const contextValue: FormContextType = {
    formStep,
    formValues,
    setFormValues: (values) =>
      setFormValues((prevValues) => ({ ...prevValues, ...values })),
    nextFormStep,
    prevFormStep,
    formStepToLast,
    setFormStep,
  };

  return (
    <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
