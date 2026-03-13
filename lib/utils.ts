import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { intervalToDuration } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDurationTime(secs: number): string {
  const duration = intervalToDuration({ start: 0, end: secs * 1000 });

  return `${duration?.hours ? duration.hours + 'h' : ''} ${duration?.minutes ? duration.minutes + 'm' : ''} ${duration?.seconds ? duration.seconds + 's' : '0s'}`;
}
