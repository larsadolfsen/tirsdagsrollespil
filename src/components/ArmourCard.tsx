import { Heading } from "./ui";

type ArmourTotals = {
  body: number;
  head: number;
  leftArm: number;
  leftLeg: number;
  rightArm: number;
  rightLeg: number;
};

type ArmourCardProps = {
  armourTotals: ArmourTotals;
  equippedArmourNames: string[];
};

export function ArmourCard({
  armourTotals,
  equippedArmourNames,
}: ArmourCardProps) {
  const armourLocations = [
    { label: "Head", value: armourTotals.head, className: "col-start-4 row-start-1 col-span-4 aspect-square rounded-full" },
    { label: "Left arm", value: armourTotals.leftArm, className: "col-start-2 row-start-2 col-span-2 row-span-2 aspect-[1/2] rounded-full rounded-tr-none" },
    { label: "Body", value: armourTotals.body, className: "col-start-4 row-start-2 col-span-4 row-span-2 aspect-square rounded-lg" },
    { label: "Right arm", value: armourTotals.rightArm, className: "col-start-8 row-start-2 col-span-2 row-span-2 aspect-[1/2] rounded-full rounded-tl-none" },
    { label: "Left leg", value: armourTotals.leftLeg, className: "col-start-4 row-start-4 col-span-2 row-span-2 aspect-[1/2] rounded-b-full rounded-t-lg" },
    { label: "Right leg", value: armourTotals.rightLeg, className: "col-start-6 row-start-4 col-span-2 row-span-2 aspect-[1/2] rounded-b-full rounded-t-lg" },
  ];

  return (
    <section className="wfrp-card overflow-hidden p-0!">
      <div className="wfrp-card-tab-header">
        <Heading level={3} variant="panel">ARMOUR</Heading>
      </div>
      <div className="wfrp-card-tab-body space-y-3 px-4 py-4">
        <div className="mx-auto grid w-[86%] grid-cols-10 gap-1">
          {armourLocations.map(({ label, value, className }) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center border border-wfrp-border bg-wfrp-stone px-3 py-2.5 text-center ${className}`}
            >
              <div className="wfrp-label leading-tight text-wfrp-muted-text">
                {label}
              </div>
              <div className="mt-0.5 text-lg font-semibold text-gray-100">{value}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="wfrp-label text-wfrp-muted-text">
            Equipped
          </span>
          <span className="wfrp-text-strong leading-relaxed text-gray-300">
            {equippedArmourNames.length > 0 ? equippedArmourNames.join(", ") : "None"}
          </span>
        </div>
      </div>
    </section>
  );
}
