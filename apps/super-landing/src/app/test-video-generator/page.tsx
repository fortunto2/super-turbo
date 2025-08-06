import { ModelVideoGenerator } from "@/components/content/model-video-generator";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function TestVideoGeneratorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto py-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Тест генератора видео</h1>
            <p className="text-xl text-muted-foreground">
              Демонстрация генерации видео с различными AI моделями
            </p>
          </div>

          <div className="space-y-12">
            {/* Sora */}
            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Sora</h2>
              <ModelVideoGenerator
                modelName="Sora"
                modelConfig={{
                  maxDuration: 10,
                  aspectRatio: "16:9",
                  width: 1920,
                  height: 1080,
                  frameRate: 30,
                  description:
                    "Sora - экспериментальная модель OpenAI для генерации коротких горизонтальных видео",
                }}
              />
            </div>

            {/* Veo2 */}
            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Veo2</h2>
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
              />
            </div>

            {/* Veo3 */}
            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Veo3</h2>
              <ModelVideoGenerator
                modelName="Veo3"
                modelConfig={{
                  maxDuration: 8,
                  aspectRatio: "16:9",
                  width: 1280,
                  height: 720,
                  frameRate: 30,
                  description:
                    "Veo3 - новейшая модель Google для генерации видео из текста",
                }}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer locale="tr" />
    </div>
  );
}
