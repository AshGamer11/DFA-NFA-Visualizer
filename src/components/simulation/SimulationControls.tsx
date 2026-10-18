import { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Gauge,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export function SimulationControls() {
  const {
    simulationResult,
    currentStepIndex,
    isPlaying,
    playbackSpeed,
    stepForward,
    stepBackward,
    play,
    pause,
    reset,
    setPlaybackSpeed,
  } = useStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play handler
  useEffect(() => {
    if (isPlaying && simulationResult) {
      intervalRef.current = setInterval(() => {
        const state = useStore.getState();
        if (
          !state.simulationResult ||
          state.currentStepIndex >= state.simulationResult.steps.length - 1
        ) {
          pause();
          return;
        }
        stepForward();
      }, playbackSpeed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, simulationResult, stepForward, pause]);

  if (!simulationResult) return null;

  const totalSteps = simulationResult.steps.length - 1;
  const isAtEnd = currentStepIndex >= totalSteps;
  const isAtStart = currentStepIndex <= 0;

  return (
    <div className="flex items-center gap-3 animate-slide-up">
      {/* Playback buttons */}
      <div className="flex items-center gap-1 rounded-xl bg-[var(--bg-dark)] p-1">
        <button
          onClick={stepBackward}
          disabled={isAtStart}
          className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Step Back"
        >
          <SkipBack className="h-4 w-4" />
        </button>

        <button
          onClick={isPlaying ? pause : play}
          disabled={isAtEnd && !isPlaying}
          className="rounded-lg bg-[var(--primary)] p-2.5 text-white shadow-lg hover:bg-[var(--primary-dark)] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" fill="currentColor" />
          ) : (
            <Play className="h-4 w-4" fill="currentColor" />
          )}
        </button>

        <button
          onClick={stepForward}
          disabled={isAtEnd}
          className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Step Forward"
        >
          <SkipForward className="h-4 w-4" />
        </button>

        <button
          onClick={reset}
          className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--danger)] transition-all"
          title="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex flex-col items-center">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          Step {currentStepIndex} / {totalSteps}
        </span>
        {/* Progress bar */}
        <div className="mt-1 h-1 w-24 rounded-full bg-[var(--bg-dark)]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
            style={{
              width: `${totalSteps === 0 ? 100 : (currentStepIndex / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-2 ml-auto">
        <Gauge className="h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="range"
          min={100}
          max={2000}
          step={100}
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="w-20 accent-[var(--primary)]"
          title={`Speed: ${playbackSpeed}ms per step`}
        />
        <span className="text-xs text-[var(--text-muted)] w-12">
          {playbackSpeed}ms
        </span>
      </div>
    </div>
  );
}
