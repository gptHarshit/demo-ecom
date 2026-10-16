"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

interface OnboardingFormData {
  businessType: string;
  businessName: string;
  sellingChannel: string;
  solution: string;
  productCount: string;
  workspaceName: string;
}

interface OnboardingContextType {
  formData: OnboardingFormData;

  setFormData: React.Dispatch<
    React.SetStateAction<OnboardingFormData>
  >;
}

const OnboardingContext = createContext<
  OnboardingContextType | undefined
>(undefined);

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({
  children,
}: OnboardingProviderProps) {
  const [formData, setFormData] =
    useState<OnboardingFormData>({
      businessType: "",
      businessName: "",
      sellingChannel: "",
      solution: "",
      productCount: "",
      workspaceName: "",
    });

  return (
    <OnboardingContext.Provider
      value={{
        formData,
        setFormData,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      "useOnboarding must be used within an OnboardingProvider",
    );
  }

  return context;
}