import { useState, type FormEvent } from "react";
import { Button, Input } from "./ui";

export function GainExperiencePage({
  onAwardXp,
  onCancel,
  xpCurrent,
  xpTotal,
}: {
  onAwardXp: (amount: number) => void;
  onCancel: () => void;
  xpCurrent: number;
  xpTotal: number;
}) {
  const [xpGainDraft, setXpGainDraft] = useState("");
  const xpGainAmount = Math.max(0, Math.floor(Number(xpGainDraft) || 0));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (xpGainAmount <= 0) return;

    onAwardXp(xpGainAmount);
  };

  return (
    <section className="mx-auto w-full max-w-md overflow-hidden rounded-lg border border-wfrp-border bg-card shadow-lg">
      <form onSubmit={handleSubmit} className="grid gap-6 p-5">
        <div className="grid gap-2">
          <p className="text-sm text-wfrp-muted-text">How much experience did you gain?</p>
          <label htmlFor="mobile-xp-gain-amount" className="text-[10px] font-black uppercase tracking-widest text-wfrp-muted-text">
            Experience gained
          </label>
          <Input
            id="mobile-xp-gain-amount"
            autoFocus
            inputMode="numeric"
            min={1}
            step={1}
            type="number"
            value={xpGainDraft}
            onChange={(event) => setXpGainDraft(event.target.value)}
            aria-label="Experience gained"
          />
          <div className="text-xs font-semibold text-wfrp-muted-text">
            Current: {xpCurrent}/{xpTotal} XP
          </div>
        </div>

        <div className="flex justify-start gap-2">
          <Button
            type="button"
            name="Cancel"
            onClick={onCancel}
          />
          <Button
            type="submit"
            name="Gain Experience"
            isDeactivated={xpGainAmount <= 0}
            isGolden={xpGainAmount > 0}
          />
        </div>
      </form>
    </section>
  );
}
