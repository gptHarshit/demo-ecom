import { OnboardingProvider } from "@/context/OnboardingContext";

const SignUpLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  );
};

export default SignUpLayout;