import type { ReactNode } from "react";

interface PremiumLockedProps {
  children: ReactNode;
  locked: boolean;
  onUpgradeClick?: () => void;
}

export function PremiumLocked({ children, locked, onUpgradeClick }: PremiumLockedProps): ReactNode {
  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div className="premium-lock">
      <p>This action is available in Aura Premium.</p>
      {onUpgradeClick ? (
        <button type="button" className="primary-button" onClick={onUpgradeClick}>
          Upgrade to Premium
        </button>
      ) : null}
    </div>
  );
}

