import { Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PatentImageGalleryProps {
  images?: string[];
}

export const PatentImageGallery = ({ images }: PatentImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma imagem disponível
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <ImageIcon className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-semibold">Figuras Técnicas</h3>
            <p className="text-sm text-muted-foreground">
              {images.length} {images.length === 1 ? 'imagem disponível' : 'imagens disponíveis'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(image)}
              className="group relative aspect-square rounded-lg border bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <img
                src={image}
                alt={`Figura ${idx + 1}`}
                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                Fig. {idx + 1}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Visualização ampliada"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};