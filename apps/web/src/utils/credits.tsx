export function optimisticCreditUpdate<TWorkspace>({
  workspace,
  setWorkspace,
  cost,
}: {
  workspace: TWorkspace & { credits?: number };
  setWorkspace: (updater: (prev: TWorkspace) => TWorkspace) => void;
  cost: number;
}) {
  if (!workspace) throw new Error('No active workspace');

  const previousCredits = workspace.credits ?? 0;

  if (previousCredits < cost) {
    throw new Error('Not enough credits');
  }

  // ⚡ apply optimistic update
  setWorkspace((prev) => ({
    ...prev,
    credits: Math.max(0, (prev.credits ?? 0) - cost),
  }));

  // 🔁 return rollback function
  return () => {
    setWorkspace((prev) => ({
      ...prev,
      credits: previousCredits,
    }));
  };
}
