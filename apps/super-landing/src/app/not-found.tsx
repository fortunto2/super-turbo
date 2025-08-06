import Link from "next/link";
import { Button } from "@turbo-super/ui";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Страница не найдена</h2>
        <p className="text-muted-foreground max-w-md">
          Извините, запрашиваемая страница не существует или была перемещена.
        </p>
        <div className="flex gap-4">
          <Link href="/">
            <Button>На главную</Button>
          </Link>
          <Link href="/tr/blog">
            <Button variant="outline">Блог</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 