export function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateToCheck = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (dateToCheck.getTime() === today.getTime()) {
    return 'Today';
  }

  if (dateToCheck.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // Return as "Month Day" (e.g., "Mar 15")
  const monthFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return monthFormatter.format(date);
}
