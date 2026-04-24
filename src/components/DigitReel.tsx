import { motion } from "motion/react";

export function DigitReel({
  targetDigit,
  reel,
  duration,
  delay,
  isStatic,
}: {
  targetDigit: number;
  reel: number[];
  duration: number;
  delay: number;
  isStatic?: boolean;
}) {
  const digitHeight = 64;
  const spins = isStatic ? 0 : 4;
  const targetIndex = reel.indexOf(targetDigit);
  const totalItems = isStatic ? targetIndex : (spins * reel.length) + targetIndex;

  const repeatedReel = [];
  const repetitions = isStatic ? 1 : spins + 1;
  for (let i = 0; i < repetitions; i++) {
    repeatedReel.push(...reel);
  }

  return (
    <div className="wfrp-digit-window">
      <motion.div
        initial={isStatic ? { y: -(digitHeight * targetIndex) } : { y: 0 }}
        animate={{ y: -(digitHeight * totalItems) }}
        transition={
          isStatic
            ? { duration: 0 }
            : {
                duration,
                delay,
                ease: [0.16, 1, 0.3, 1],
              }
        }
        className="flex flex-col items-center"
      >
        {repeatedReel.map((num, i) => (
          <div
            key={i}
            className="h-16 flex items-center justify-center text-4xl font-mono font-black text-wfrp-gold/80"
          >
            {num}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
