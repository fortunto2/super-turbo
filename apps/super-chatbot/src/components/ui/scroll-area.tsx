'use client';

import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@turbo-super/ui';

interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  scrollBehavior?: 'always' | 'hover' | 'scroll';
  hideDelay?: number;
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(
  (
    {
      className,
      children,
      scrollBehavior = 'hover',
      hideDelay = 600,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isScrolling, setIsScrolling] = React.useState(false);
    const hideTimeoutRef = React.useRef<NodeJS.Timeout>();

    const showScrollbars = React.useCallback(() => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      setIsScrolling(true);
    }, []);

    const hideScrollbars = React.useCallback(() => {
      if (scrollBehavior === 'hover' && !isHovered) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, hideDelay);
      }
    }, [scrollBehavior, isHovered, hideDelay]);

    const handleMouseEnter = React.useCallback(() => {
      setIsHovered(true);
      if (scrollBehavior === 'hover') {
        showScrollbars();
      }
    }, [scrollBehavior, showScrollbars]);

    const handleMouseLeave = React.useCallback(() => {
      setIsHovered(false);
      if (scrollBehavior === 'hover') {
        hideScrollbars();
      }
    }, [scrollBehavior, hideScrollbars]);

    const handleScroll = React.useCallback(() => {
      if (scrollBehavior === 'scroll') {
        showScrollbars();
        hideScrollbars();
      }
    }, [scrollBehavior, showScrollbars, hideScrollbars]);

    React.useEffect(() => {
      return () => {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      };
    }, []);

    const shouldShowScrollbars =
      scrollBehavior === 'always' ||
      (scrollBehavior === 'hover' && (isHovered || isScrolling)) ||
      (scrollBehavior === 'scroll' && isScrolling);

    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn('relative overflow-hidden', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          className="h-full w-full rounded-[inherit]"
          onScroll={handleScroll}
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar
          orientation="vertical"
          className={cn(
            'transition-opacity duration-300',
            shouldShowScrollbars ? 'opacity-100' : 'opacity-0',
          )}
        />
        <ScrollBar
          orientation="horizontal"
          className={cn(
            'transition-opacity duration-300',
            shouldShowScrollbars ? 'opacity-100' : 'opacity-0',
          )}
        />
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    );
  },
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
      orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-[1px]',
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
