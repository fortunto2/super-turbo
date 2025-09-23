import { describe, it, expect, vi } from "vitest";

// Simple debounce function for testing
function debounce<T>(func: (...args: T[]) => void, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: T[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

describe("Hooks", () => {
  describe("debounce utility", () => {
    it("should debounce function calls", () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      // Call multiple times rapidly
      debouncedFn("call1");
      debouncedFn("call2");
      debouncedFn("call3");

      // Should not be called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Fast forward time
      vi.advanceTimersByTime(100);

      // Should be called once with the last arguments
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("call3");

      vi.useRealTimers();
    });

    it("should reset timer on rapid calls", () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("call1");
      vi.advanceTimersByTime(50); // Half the delay
      debouncedFn("call2");
      vi.advanceTimersByTime(50); // Another half
      debouncedFn("call3");
      vi.advanceTimersByTime(100); // Full delay

      // Should only be called once with the last arguments
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("call3");

      vi.useRealTimers();
    });

    it("should handle zero delay", () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 0);

      debouncedFn("call1");
      vi.advanceTimersByTime(0);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("call1");

      vi.useRealTimers();
    });
  });
});
