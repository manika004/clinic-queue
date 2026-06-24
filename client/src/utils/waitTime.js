export function estimateWait({ pos, avgConsultMin, calledAt }) {
  const elapsed = calledAt
    ? Math.min((Date.now() - calledAt) / 60000, avgConsultMin)
    : 0;
  const firstSlot = Math.max(avgConsultMin - elapsed, 0);
  return Math.round(firstSlot + (pos - 1) * avgConsultMin);
}