"use client";

interface WorkspaceReadyStepProps {
  onContinue: () => void;
}

export default function WorkspaceReadyStep({
  onContinue,
}: WorkspaceReadyStepProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Your workspace is ready!
        </h1>

        <p className="mt-4 text-gray-500">
          We've finished setting up your inventory workspace.
          You're just one step away from getting started.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-all hover:bg-blue-700"
      >
        Let's Get Started
      </button>
    </div>
  );
}