export const getAttemptDeadline = (attempt, test) => {
  const durationDeadline = new Date(
    new Date(attempt.startedAt).getTime() + test.duration * 60 * 1000,
  );

  const testEnd = new Date(test.endTime);

  return durationDeadline < testEnd ? durationDeadline : testEnd;
};
