import { Button } from "@eugenios/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@eugenios/ui/components/dialog";
import { ScrollArea } from "@eugenios/ui/components/scroll-area";
import { Separator } from "@eugenios/ui/components/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@eugenios/ui/components/tabs";
import { Image as ImageInterface } from "@eugenios/types";
import { Trash2 } from "lucide-react";
import Image from "next/image";

import { useDeleteImages } from "@eugenios/react-query/mutations/useGallery";

export default function ImageDetailsModal({
  isDetailsOpen,
  setIsDetailsOpen,
  currentImage,
}: {
  isDetailsOpen: boolean;
  setIsDetailsOpen: (open: boolean) => void;
  currentImage: ImageInterface;
}) {
  const deleteImages = useDeleteImages();

  const handleDeleteImage = (image: ImageInterface) => {
    if (!image) return;

    deleteImages.mutate([image.key]);
    setIsDetailsOpen(false);
  };

  if (!currentImage) return null;

  return (
    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{currentImage.key}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="preview">Visualização</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                <div>
                  <h6 className="font-medium">Título</h6>
                  <p>{currentImage.key}</p>
                </div>
                <Separator />
                <div>
                  <h6 className="font-medium">Tamanho</h6>
                  <p>{currentImage.size}</p>
                </div>
                <Separator />
                <div>
                  <h6 className="font-medium">Modificado em</h6>
                  <p>{currentImage.LastModified}</p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={currentImage.url || "/placeholder.svg"}
                alt={currentImage.key}
                fill
                className="object-contain"
              />
            </div>
          </TabsContent>
        </Tabs>{" "}
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {" "}
          <Button variant="destructive" onClick={() => handleDeleteImage(currentImage)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
          <Button onClick={() => setIsDetailsOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
