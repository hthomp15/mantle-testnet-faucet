import { useState, useEffect, memo } from 'react';

interface TimerProps {
  timeRemaining: number;
}

const TimerComponent = ({ timeRemaining }: TimerProps) => {
  // Convert milliseconds to seconds when initializing
  const [remainingTime, setRemainingTime] = useState(Math.floor(timeRemaining / 1000));

  useEffect(() => {
    const updateTimer = () => {
      setRemainingTime(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    };

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, []);

  // Reset timer when timeRemaining prop changes
  useEffect(() => {
    setRemainingTime(Math.floor(timeRemaining / 1000));
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return 'Claim 100 TEST';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `Next claim in ${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="text-lg font-semibold text-blue-400">
      {formatTime(remainingTime)}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const Timer = memo(TimerComponent); 