import { useCallback, useEffect, useRef, useState } from "react";

interface UseToolbarProps {
  controllerRef: React.RefObject<any>;
}

export function useToolbar({ controllerRef }: UseToolbarProps) {
  const [toolbarVisible, setToolbarVisible] = useState(false);

  const updateToolbarAnchorFromTarget = useCallback(
    (target?: any) => {
      const controller = controllerRef.current;
      if (!controller) return;
      const textbox = target ?? controller.getActiveText();
      if (!textbox) {
        setToolbarVisible(false);
        return;
      }
      setToolbarVisible(true);
    },
    [controllerRef]
  );

  // Scroll listener for toolbar positioning
  useEffect(() => {
    const onScroll = () => {
      if (!toolbarVisible) return;
      updateToolbarAnchorFromTarget();
    };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [toolbarVisible, updateToolbarAnchorFromTarget]);

  return {
    toolbarVisible,
    setToolbarVisible,
    updateToolbarAnchorFromTarget,
  };
}
