import type { UpsertTrafficResponse } from "@traffic-dashboard/shared";

type RecordTrafficFeedbackProps = {
  catalogueError: Error | null;
  mutationError: Error | null;
  result: UpsertTrafficResponse | undefined;
};

export function RecordTrafficFeedback({
  catalogueError,
  mutationError,
  result,
}: RecordTrafficFeedbackProps) {
  return (
    <>
      {catalogueError === null ? null : (
        <p role="alert">
          Could not load form options: {catalogueError.message}
        </p>
      )}
      {mutationError === null ? null : (
        <p role="alert">Could not save traffic: {mutationError.message}</p>
      )}
      {result === undefined ? null : (
        <p role="status">
          Traffic record {result.data.operation}. Country total is now{" "}
          {result.data.countryTotal.toLocaleString()} vehicles.
        </p>
      )}
    </>
  );
}
