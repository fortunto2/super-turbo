import { ModelVideoGenerator } from "@/components/content/model-video-generator";
import { ModelImageGenerator } from "@/components/content/model-image-generator";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function TestAllGeneratorsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto py-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Тест всех генераторов</h1>
            <p className="text-xl text-muted-foreground">
              Демонстрация генерации видео и изображений с различными AI
              моделями
            </p>
          </div>

          {/* Видео модели */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Видео модели
            </h2>
            <div className="space-y-12">
              {/* Sora */}
              <div className="border rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4">Sora</h3>
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
                  locale="tr"
                />
              </div>

              {/* Veo2 */}
              <div className="border rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4">Veo2</h3>
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
                  locale="tr"
                />
              </div>

              {/* Veo3 */}
              <div className="border rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4">Veo3</h3>
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
                  locale="tr"
                />
              </div>
            </div>
          </div>

          {/* Изображения модели */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Модели изображений
            </h2>
            <div className="space-y-12">
              {/* Google Imagen 4 */}
              <div className="border rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4">Google Imagen 4</h3>
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
                  locale="tr"
                />
              </div>

              {/* GPT-Image-1 */}
              <div className="border rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4">GPT-Image-1</h3>
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
                  locale="tr"
                />
              </div>

              {/* Flux Kontext */}
              <div className="border rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4">Flux Kontext</h3>
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
                  locale="tr"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer locale="tr" />
    </div>
  );
}
