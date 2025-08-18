// src/components/badge.tsx
import { cva } from "class-variance-authority";

// src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/components/badge.tsx
import { jsx } from "react/jsx-runtime";
var badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        accent: "border-transparent bg-accent text-accent-foreground hover:bg-accent/80"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}

// src/components/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva as cva2 } from "class-variance-authority";
import { jsx as jsx2 } from "react/jsx-runtime";
var buttonVariants = cva2(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-accent text-accent-foreground shadow hover:bg-accent/90 neon-glow"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx2(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";

// src/components/card.tsx
import * as React2 from "react";
import { jsx as jsx3 } from "react/jsx-runtime";
var Card = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx3(
  "div",
  {
    ref,
    className: cn(
      "rounded-xl border bg-card text-card-foreground shadow card-enhanced",
      className
    ),
    ...props
  }
));
Card.displayName = "Card";
var CardHeader = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx3("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props }));
CardHeader.displayName = "CardHeader";
var CardTitle = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx3(
  "div",
  {
    ref,
    className: cn("font-semibold leading-none tracking-tight", className),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
var CardDescription = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx3(
  "div",
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
var CardContent = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx3("div", { ref, className: cn("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
var CardFooter = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx3(
  "div",
  {
    ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";

// src/components/input.tsx
import * as React3 from "react";
import { jsx as jsx4 } from "react/jsx-runtime";
var Input = React3.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx4(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 input-enhanced",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";

// src/components/label.tsx
import * as React4 from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva as cva3 } from "class-variance-authority";
import { jsx as jsx5 } from "react/jsx-runtime";
var labelVariants = cva3(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
var Label = React4.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx5(
  LabelPrimitive.Root,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label.displayName = LabelPrimitive.Root.displayName;

// src/components/separator.tsx
import * as React5 from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { jsx as jsx6 } from "react/jsx-runtime";
var Separator = React5.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx6(
    SeparatorPrimitive.Root,
    {
      ref,
      decorative,
      orientation,
      className: cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      ),
      ...props
    }
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

// src/components/skeleton.tsx
import { jsx as jsx7 } from "react/jsx-runtime";
function Skeleton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx7(
    "div",
    {
      className: cn("animate-pulse rounded-md bg-muted", className),
      ...props
    }
  );
}

// src/components/tabs.tsx
import * as React6 from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva as cva4 } from "class-variance-authority";
import { jsx as jsx8 } from "react/jsx-runtime";
var Tabs = TabsPrimitive.Root;
var TabsList = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx8(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
var tabsTriggerVariants = cva4(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
        primary: "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow",
        accent: "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
var TabsTrigger = React6.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsx8(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(tabsTriggerVariants({ variant, className })),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
var TabsContent = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx8(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// src/components/textarea.tsx
import * as React7 from "react";
import { cva as cva5 } from "class-variance-authority";
import { jsx as jsx9 } from "react/jsx-runtime";
var textareaVariants = cva5(
  "flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        primary: "border-input bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        accent: "border-input bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
var Textarea = React7.forwardRef(
  ({ className, variant, ...props }, ref) => {
    return /* @__PURE__ */ jsx9(
      "textarea",
      {
        className: cn(textareaVariants({ variant, className })),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";

// src/components/dialog.tsx
import * as React8 from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { jsx as jsx10, jsxs } from "react/jsx-runtime";
var Dialog = DialogPrimitive.Root;
var DialogTrigger = DialogPrimitive.Trigger;
var DialogPortal = DialogPrimitive.Portal;
var DialogClose = DialogPrimitive.Close;
var DialogOverlay = React8.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx10(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
var DialogContent = React8.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx10(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx10(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx10("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
var DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx10(
  "div",
  {
    className: cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx10(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
var DialogTitle = React8.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx10(
  DialogPrimitive.Title,
  {
    ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
var DialogDescription = React8.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx10(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// src/payment/use-stripe-prices.ts
import { useState, useEffect } from "react";
function useStripePrices(apiEndpoint = "/api/stripe-prices") {
  const [prices, setPrices] = useState(null);
  const [mode, setMode] = useState("test");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        if (data.success) {
          setPrices(data.prices);
          setMode(data.mode);
        } else {
          setError("Failed to fetch prices");
        }
      } catch (err) {
        setError("Network error");
        console.error("Error fetching Stripe prices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, [apiEndpoint]);
  return { prices, mode, loading, error };
}
function useStripeConfig(apiEndpoint = "/api/stripe-prices") {
  const { prices, mode, loading, error } = useStripePrices(apiEndpoint);
  if (loading || error || !prices) {
    return null;
  }
  return { prices, mode };
}

// src/payment/stripe-payment-button.tsx
import { useState as useState2 } from "react";
import { ExternalLink, Zap, Video, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Fragment, jsx as jsx11, jsxs as jsxs2 } from "react/jsx-runtime";
function StripePaymentButton({
  prompt,
  onPaymentClick,
  toolSlug,
  toolTitle,
  variant = "video",
  creditAmount = 100,
  price = 1,
  apiEndpoint = "/api/stripe-prices",
  checkoutEndpoint = "/api/create-checkout",
  className,
  locale = "en",
  t,
  // Новые поля для поддержки image-to-video
  generationType = "text-to-video",
  imageFile = null,
  modelName
}) {
  const [isCreatingCheckout, setIsCreatingCheckout] = useState2(false);
  const { prices, mode, loading, error } = useStripePrices(apiEndpoint);
  const getTranslation = (key, params) => {
    if (!t) {
      const fallbackTranslations = {
        "stripe_payment.loading_payment_options": "Loading payment options...",
        "stripe_payment.failed_load_payment": "Failed to load payment options",
        "stripe_payment.top_up_balance": "Top Up Balance",
        "stripe_payment.generate_veo3_videos": "Generate VEO3 Videos",
        "stripe_payment.top_up_balance_desc": `Top up your balance with ${creditAmount} credits for using AI tools`,
        "stripe_payment.generate_video_desc": "Your prompt is ready! Choose a plan to generate professional AI videos with Google VEO3.",
        "stripe_payment.top_up_credits": `Top up ${creditAmount} credits`,
        "stripe_payment.generate_video": "Generate Video",
        "stripe_payment.get_credits_desc": `Get ${creditAmount} credits for generating images, videos and scripts`,
        "stripe_payment.generate_video_desc_short": "Generate 1 high-quality AI video with your custom prompt",
        "stripe_payment.creating_payment": "Creating Payment...",
        "stripe_payment.top_up_for": `Top up for $${price.toFixed(2)}`,
        "stripe_payment.generate_for": `Generate Video for $${price.toFixed(2)}`,
        "stripe_payment.instant_access": "\u2713 Instant access \u2022 \u2713 No subscription \u2022 \u2713 Secure Stripe payment",
        "stripe_payment.test_mode": "\u{1F9EA} Test mode - Use test card 4242 4242 4242 4242",
        "stripe_payment.generate_prompt_first": "Please generate a prompt first",
        "stripe_payment.prices_not_loaded": "Prices not loaded yet, please try again",
        "stripe_payment.failed_create_checkout": "Failed to create checkout session"
      };
      return fallbackTranslations[key] || key;
    }
    let translation = t(key);
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, String(value));
      });
    }
    return translation;
  };
  const handlePayment = async () => {
    if (variant === "video" && !(prompt == null ? void 0 : prompt.trim())) {
      toast.error(getTranslation("stripe_payment.generate_prompt_first"));
      return;
    }
    if (!prices) {
      toast.error(getTranslation("stripe_payment.prices_not_loaded"));
      return;
    }
    setIsCreatingCheckout(true);
    onPaymentClick == null ? void 0 : onPaymentClick();
    try {
      const currentUrl = typeof window !== "undefined" ? window.location.href : "";
      const requestBody = {
        priceId: prices.single,
        quantity: 1,
        prompt: prompt == null ? void 0 : prompt.trim(),
        toolSlug,
        toolTitle,
        cancelUrl: currentUrl,
        generationType,
        // Вместо самого файла передаем информацию о нем
        modelName
      };
      console.log("\u{1F4B3} Sending checkout request:", requestBody);
      const response = await fetch(checkoutEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }
      const { url } = await response.json();
      window.location.href = url;
    } catch (error2) {
      console.error("\u274C Checkout creation failed:", error2);
      toast.error(getTranslation("stripe_payment.failed_create_checkout"));
    } finally {
      setIsCreatingCheckout(false);
    }
  };
  if (variant === "video" && !(prompt == null ? void 0 : prompt.trim())) {
    return null;
  }
  if (loading) {
    return /* @__PURE__ */ jsx11(
      Card,
      {
        className: `border-2 border-purple-500/50 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30 dark:border-purple-400/30 ${className}`,
        children: /* @__PURE__ */ jsxs2(CardContent, { className: "flex items-center justify-center py-8", children: [
          /* @__PURE__ */ jsx11(Loader2, { className: "size-6 animate-spin mr-2" }),
          /* @__PURE__ */ jsx11("span", { children: getTranslation("stripe_payment.loading_payment_options") })
        ] })
      }
    );
  }
  if (error || !prices) {
    return /* @__PURE__ */ jsx11(
      Card,
      {
        className: `border-2 border-red-500/50 bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/30 dark:to-orange-950/30 dark:border-red-400/30 ${className}`,
        children: /* @__PURE__ */ jsx11(CardContent, { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx11("span", { className: "text-red-600 dark:text-red-400", children: error || getTranslation("stripe_payment.failed_load_payment") }) })
      }
    );
  }
  const isCreditsVariant = variant === "credits";
  return /* @__PURE__ */ jsxs2(
    Card,
    {
      className: `border-2 border-purple-500/50 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30 dark:border-purple-400/30 ${className}`,
      children: [
        /* @__PURE__ */ jsxs2(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxs2(CardTitle, { className: "flex items-center gap-2 text-lg", children: [
            /* @__PURE__ */ jsx11(Zap, { className: "size-5 text-yellow-500 dark:text-yellow-400" }),
            isCreditsVariant ? getTranslation("stripe_payment.top_up_balance") : getTranslation("stripe_payment.generate_veo3_videos")
          ] }),
          /* @__PURE__ */ jsx11("p", { className: "text-sm text-muted-foreground", children: isCreditsVariant ? getTranslation("stripe_payment.top_up_balance_desc", {
            amount: creditAmount
          }) : getTranslation("stripe_payment.generate_video_desc") })
        ] }),
        /* @__PURE__ */ jsxs2(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsx11("div", { className: "max-w-md mx-auto", children: /* @__PURE__ */ jsxs2("div", { className: "p-6 border-2 border-blue-200 dark:border-blue-700/50 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors text-center", children: [
            /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-center gap-2 mb-3", children: [
              isCreditsVariant ? /* @__PURE__ */ jsx11(CreditCard, { className: "size-5 text-blue-500 dark:text-blue-400" }) : /* @__PURE__ */ jsx11(Video, { className: "size-5 text-blue-500 dark:text-blue-400" }),
              /* @__PURE__ */ jsx11("span", { className: "font-semibold text-lg", children: isCreditsVariant ? getTranslation("stripe_payment.top_up_credits", {
                amount: creditAmount
              }) : getTranslation("stripe_payment.generate_video") })
            ] }),
            /* @__PURE__ */ jsx11("div", { className: "mb-4", children: /* @__PURE__ */ jsxs2(
              Badge,
              {
                variant: "outline",
                className: "bg-blue-600 dark:bg-blue-500 text-white text-lg px-4 py-1",
                children: [
                  "$",
                  price.toFixed(2)
                ]
              }
            ) }),
            /* @__PURE__ */ jsx11("p", { className: "text-sm text-muted-foreground mb-4", children: isCreditsVariant ? getTranslation("stripe_payment.get_credits_desc", {
              amount: creditAmount
            }) : getTranslation("stripe_payment.generate_video_desc_short") }),
            /* @__PURE__ */ jsx11(
              Button,
              {
                onClick: handlePayment,
                className: "w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white",
                size: "lg",
                disabled: isCreatingCheckout,
                children: isCreatingCheckout ? /* @__PURE__ */ jsxs2(Fragment, { children: [
                  /* @__PURE__ */ jsx11(Loader2, { className: "size-5 mr-2 animate-spin" }),
                  getTranslation("stripe_payment.creating_payment")
                ] }) : /* @__PURE__ */ jsxs2(Fragment, { children: [
                  /* @__PURE__ */ jsx11(ExternalLink, { className: "size-5 mr-2" }),
                  isCreditsVariant ? getTranslation("stripe_payment.top_up_for", {
                    price: price.toFixed(2)
                  }) : getTranslation("stripe_payment.generate_for", {
                    price: price.toFixed(2)
                  })
                ] })
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxs2("div", { className: "text-xs text-muted-foreground text-center pt-2 border-t", children: [
            /* @__PURE__ */ jsx11("p", { children: getTranslation("stripe_payment.instant_access") }),
            mode === "test" && /* @__PURE__ */ jsx11("p", { className: "text-yellow-600 dark:text-yellow-400 mt-1", children: getTranslation("stripe_payment.test_mode") })
          ] })
        ] })
      ]
    }
  );
}
export {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Separator,
  Skeleton,
  StripePaymentButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  badgeVariants,
  buttonVariants,
  cn,
  tabsTriggerVariants,
  textareaVariants,
  useStripeConfig,
  useStripePrices
};
//# sourceMappingURL=index.mjs.map