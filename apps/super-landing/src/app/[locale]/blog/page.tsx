import { allBlogs, type Blog } from ".contentlayer/generated";
import Link from "@/components/ui/optimized-link";
import { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { generatePageMetadata, GRADIENTS } from "@/lib/metadata";
import { getDictionary } from "@/lib/get-dictionary"; // New import
import { Locale } from "@/config/i18n-config"; // New import
import { ModelVideoGenerator } from "@/components/content/model-video-generator";
import { ModelImageGenerator } from "@/components/content/model-image-generator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  const pageTitle = dictionary.blog?.page_title || "Blog";
  const siteName = dictionary.site?.name || "SuperDuperAI";
  // Default description for blog page
  const pageDescription = "Learn about the latest AI models and updates";

  return generatePageMetadata({
    title: `${pageTitle} | ${siteName}`,
    description: pageDescription,
    url: "/blog",
    meta: {
      pageType: "blog",
      category: "Blog", // This could also be from dictionary
      gradient: GRADIENTS.tool,
    },
  });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const sortedBlogs = allBlogs
    .filter((p) => p.locale === locale)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-6">
            {dictionary.blog?.page_title || "Blog"}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBlogs.map((post: Blog) => (
              <Link
                href={post.url}
                key={`${post.locale}-${post.slug}`}
                className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>

          {/* Секция генератора видео для моделей */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Генерация видео с AI моделями
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Попробуйте создать видео с помощью самых современных AI моделей.
              Просто опишите, что вы хотите увидеть, и получите результат за
              считанные минуты.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Veo2 */}
              <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                  Veo2
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Преобразование статичных изображений в динамичные HD видео. До
                  8 секунд, соотношение 16:9.
                </p>
                <ModelVideoGenerator
                  modelName="Veo2"
                  modelConfig={{
                    maxDuration: 8,
                    aspectRatio: "16:9",
                    width: 1280,
                    height: 720,
                    frameRate: 30,
                    description:
                      "Veo2 - statik görüntüleri dinamik HD videolara dönüştürme, orijinal stili koruyarak",
                  }}
                  locale={locale}
                />
              </div>

              {/* Sora */}
              <div className="border rounded-lg p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
                <h3 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">
                  Sora
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Экспериментальная модель OpenAI для генерации коротких
                  вертикальных видео. До 10 секунд, соотношение 9:16.
                </p>
                <ModelVideoGenerator
                  modelName="Sora"
                  modelConfig={{
                    maxDuration: 10,
                    aspectRatio: "16:9",
                    width: 1920,
                    height: 1080,
                    frameRate: 30,
                    description:
                      "Sora - OpenAI'nin kısa yatay videolar oluşturmak için deneysel modeli",
                  }}
                  locale={locale}
                />
              </div>

              {/* Veo3 */}
              <div className="border rounded-lg p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
                <h3 className="text-xl font-bold mb-4 text-orange-600 dark:text-orange-400">
                  Veo3
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Новейшая модель Google для генерации видео из текста. До 8
                  секунд, соотношение 16:9.
                </p>
                <ModelVideoGenerator
                  modelName="Veo3"
                  modelConfig={{
                    maxDuration: 8,
                    aspectRatio: "16:9",
                    width: 1280,
                    height: 720,
                    frameRate: 30,
                    description:
                      "Veo3 - Google'ın metinden video oluşturma için en yeni modeli",
                  }}
                  locale={locale}
                />
              </div>
            </div>
          </div>

          {/* Секция генератора изображений для моделей */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Генерация изображений с AI моделями
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Создавайте потрясающие изображения с помощью самых современных AI
              моделей. Просто опишите, что вы хотите увидеть, и получите
              результат за считанные секунды.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Google Imagen 4 */}
              <div className="border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <h3 className="text-xl font-bold mb-4 text-purple-600 dark:text-purple-400">
                  Google Imagen 4
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Генерация высококачественных изображений с отличной текстурой
                  и типографикой. До 2K разрешения, соотношение 1:1.
                </p>
                <ModelImageGenerator
                  modelName="Google Imagen 4"
                  modelConfig={{
                    width: 1080,
                    height: 1080,
                    aspectRatio: "1:1",
                    style: "flux_watercolor",
                    shotSize: "Medium Shot",
                    description:
                      "Google Imagen 4 - yüksek kaliteli görüntüler oluşturmak için gelişmiş AI modeli",
                  }}
                  locale={locale}
                />
              </div>

              {/* GPT-Image-1 */}
              <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30">
                <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                  GPT-Image-1
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  OpenAI модель для генерации изображений с поддержкой
                  диалогового подхода. До 4K разрешения, соотношение 1:1.
                </p>
                <ModelImageGenerator
                  modelName="GPT-Image-1"
                  modelConfig={{
                    width: 1024,
                    height: 1024,
                    aspectRatio: "1:1",
                    style: "flux_realistic",
                    shotSize: "Medium Shot",
                    description:
                      "GPT-Image-1 - OpenAI'nin görüntü oluşturma modeli",
                  }}
                  locale={locale}
                />
              </div>

              {/* Flux Kontext */}
              <div className="border rounded-lg p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30">
                <h3 className="text-xl font-bold mb-4 text-orange-600 dark:text-orange-400">
                  Flux Kontext
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Контекстный редактор изображений для неразрушающего
                  редактирования. Идеально для ретуши и создания вариаций.
                </p>
                <ModelImageGenerator
                  modelName="Flux Kontext"
                  modelConfig={{
                    width: 1024,
                    height: 1024,
                    aspectRatio: "1:1",
                    style: "flux_steampunk",
                    shotSize: "Medium Shot",
                    description:
                      "Flux Kontext - yaratıcı görüntü oluşturma için gelişmiş model",
                  }}
                  locale={locale}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
