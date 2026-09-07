"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { inventoryWalkthroughSteps } from "@/lib/admin-help/inventory-walkthrough";
import { cn } from "@/lib/utils";

function ControlIcon({ name }: { name: "back" | "next" | "pause" | "play" | "restart" }) {
  const paths = {
    back: "M15 18l-6-6 6-6",
    next: "M9 18l6-6-6-6",
    pause: "M10 5v14M14 5v14",
    play: "M8 5v14l11-7z",
    restart: "M3 12a9 9 0 109-9M3 3v6h6",
  };

  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={name === "play" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}

export function HelpWalkthrough() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const activeStep = inventoryWalkthroughSteps[activeIndex];
  const progress = useMemo(
    () => ((activeIndex + 1) / inventoryWalkthroughSteps.length) * 100,
    [activeIndex]
  );

  useEffect(() => {
    if (!isPlaying) return;

    const timeout = window.setTimeout(() => {
      setActiveIndex((current) => {
        const next = current + 1;
        if (next >= inventoryWalkthroughSteps.length) {
          setIsPlaying(false);
          return current;
        }
        return next;
      });
    }, activeStep.durationMs);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, activeStep.durationMs, isPlaying]);

  const goToStep = (index: number) => {
    setIsPlaying(false);
    setActiveIndex(index);
  };

  const goBack = () => {
    setIsPlaying(false);
    setActiveIndex((current) => Math.max(0, current - 1));
  };

  const goNext = () => {
    setIsPlaying(false);
    setActiveIndex((current) => Math.min(inventoryWalkthroughSteps.length - 1, current + 1));
  };

  const restart = () => {
    setActiveIndex(0);
    setIsPlaying(true);
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="overflow-hidden rounded-lg border border-warm-white/10 bg-warm-white/5">
        <div className="relative aspect-[16/10] bg-velvet">
          <Image
            key={activeStep.image}
            src={activeStep.image}
            alt={activeStep.alt}
            fill
            preload={activeIndex === 0}
            sizes="(min-width: 1280px) calc(100vw - 37rem), calc(100vw - 5rem)"
            className="object-contain"
          />
        </div>

        <div className="space-y-4 border-t border-warm-white/10 p-4">
          <div
            aria-label="Walkthrough progress"
            aria-valuemax={inventoryWalkthroughSteps.length}
            aria-valuemin={1}
            aria-valuenow={activeIndex + 1}
            className="h-1 overflow-hidden rounded-full bg-warm-white/10"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-copper transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div aria-live="polite">
              <p className="text-xs uppercase text-copper">
                Step {activeIndex + 1} of {inventoryWalkthroughSteps.length}
              </p>
              <h2 className="mt-1 font-heading text-2xl text-warm-white">{activeStep.title}</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-warm-white/70">
                {activeStep.caption}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={goBack}
                disabled={activeIndex === 0}
                title="Previous step"
                aria-label="Previous step"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-warm-white/15 text-warm-white/70 transition-colors hover:border-copper hover:text-copper disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ControlIcon name="back" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((playing) => !playing)}
                title={isPlaying ? "Pause replay" : "Play replay"}
                aria-label={isPlaying ? "Pause replay" : "Play replay"}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-copper text-white transition-colors hover:bg-copper-dark"
              >
                <ControlIcon name={isPlaying ? "pause" : "play"} />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={activeIndex === inventoryWalkthroughSteps.length - 1}
                title="Next step"
                aria-label="Next step"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-warm-white/15 text-warm-white/70 transition-colors hover:border-copper hover:text-copper disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ControlIcon name="next" />
              </button>
              <button
                type="button"
                onClick={restart}
                title="Restart replay"
                aria-label="Restart replay"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-warm-white/15 text-warm-white/70 transition-colors hover:border-copper hover:text-copper"
              >
                <ControlIcon name="restart" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ol className="space-y-2">
        {inventoryWalkthroughSteps.map((step, index) => (
          <li key={step.title}>
            <button
              type="button"
              onClick={() => goToStep(index)}
              aria-current={index === activeIndex ? "step" : undefined}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors",
                index === activeIndex
                  ? "border-copper bg-copper/15"
                  : "border-warm-white/10 bg-warm-white/5 hover:border-warm-white/25"
              )}
            >
              <span className="text-xs text-copper">Step {index + 1}</span>
              <span className="mt-1 block text-sm font-medium text-warm-white">{step.title}</span>
              <span className="mt-1 block text-xs leading-5 text-warm-white/55">{step.caption}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
