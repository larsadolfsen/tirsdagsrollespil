import { useEffect } from "react";
import type { RefObject } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean,
  onDismiss?: () => void,
) {
  useEffect(() => {
    if (!isActive) return;

    const previouslyFocusedElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const getFocusableElements = () => {
      const container = containerRef.current;
      if (!container) return [];

      return Array.from(container.querySelectorAll(focusableSelector))
        .filter((element): element is HTMLElement => element instanceof HTMLElement)
        .filter((element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden"));
    };

    const focusFirstElement = window.setTimeout(() => {
      const [firstElement] = getFocusableElements();
      firstElement?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismiss?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusFirstElement);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [containerRef, isActive, onDismiss]);
}
