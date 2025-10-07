"use client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  // useEffect(() => {
  //   Sentry.captureException(error);
  // }, [error]);

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
          <div className="container flex max-w-md flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold">Something went wrong!</h1>
            <p className="text-muted-foreground">
              An unexpected error has occurred. We&apos;ve been notified and are
              working to fix the issue.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
