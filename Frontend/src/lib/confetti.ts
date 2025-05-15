
import confetti from "canvas-confetti";

export function launchConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    scalar: 1.1,
    zIndex: 9999,
  });
}
