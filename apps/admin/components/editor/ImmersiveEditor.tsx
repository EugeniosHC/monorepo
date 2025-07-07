"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { Button } from "@eugenios/ui/components/button";
import {
  ChevronLeft,
  Save,
  X,
  LayoutDashboard,
  FileText,
  Plus,
  Trash2,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@eugenios/ui/components/tooltip";

interface EditorItem {
  id: number;
  [key: string]: any;
}

type ViewportDevice = "desktop" | "tablet" | "mobile";

interface EditorTopBarProps {
  title: string;
  currentItem: number;
  totalItems: number;
  onBack: () => void;
  onSave: () => void;
  onToggleSidebar: () => void;
  showSidebar: boolean;
  currentDevice: ViewportDevice;
  onDeviceChange: (device: ViewportDevice) => void;
}

const EditorTopBar = ({
  title,
  currentItem,
  totalItems,
  onBack,
  onSave,
  onToggleSidebar,
  showSidebar,
  currentDevice,
  onDeviceChange,
}: EditorTopBarProps) => {
  const [showBar, setShowBar] = useState(true);

  return (
    <>
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 h-12 bg-black/60 backdrop-blur-md z-50 flex items-center justify-between px-4"
          >
            <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:text-white/80">
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>

            <div className="flex items-center gap-3">
              <div className="text-white text-sm font-medium mr-2">
                <span className="hidden sm:inline">{title} - </span>
                {currentItem + 1} de {totalItems}
              </div>

              <TooltipProvider>
                <div className="flex bg-black/40 p-1 rounded-md">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeviceChange("desktop")}
                        className={`h-7 w-7 rounded-md p-0 ${
                          currentDevice === "desktop"
                            ? "bg-white/20 text-white"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Monitor className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Desktop</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeviceChange("tablet")}
                        className={`h-7 w-7 rounded-md p-0 ${
                          currentDevice === "tablet"
                            ? "bg-white/20 text-white"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Tablet className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tablet</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeviceChange("mobile")}
                        className={`h-7 w-7 rounded-md p-0 ${
                          currentDevice === "mobile"
                            ? "bg-white/20 text-white"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Smartphone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mobile</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="text-white hover:text-white/80">
                <FileText className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{showSidebar ? "Fechar" : "Itens"}</span>
              </Button>

              <Button variant="default" size="sm" onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Guardar</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowBar(!showBar)}
        className="fixed top-3 right-3 z-50 h-8 w-8 p-0 rounded-full bg-black/50 border-white/20 text-white hover:bg-black/70"
      >
        {showBar ? <X className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
      </Button>
    </>
  );
};

interface SidebarPanelProps<T extends EditorItem> {
  items: T[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
  show: boolean;
  renderItemPreview: (item: T) => {
    title: string;
    subtitle?: string;
    image?: string;
  };
}

function SidebarPanel<T extends EditorItem>({
  items,
  currentIndex,
  onSelect,
  onAdd,
  onDelete,
  show,
  renderItemPreview,
}: SidebarPanelProps<T>) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-12 right-0 bottom-0 w-72 bg-black/70 backdrop-blur-md z-40 text-white overflow-y-auto"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Gerenciar Itens</h3>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const preview = renderItemPreview(item);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 p-2 rounded-md ${
                      idx === currentIndex ? "bg-blue-500/20 border border-blue-500/40" : "hover:bg-white/10"
                    } cursor-pointer transition-colors`}
                    onClick={() => onSelect(idx)}
                  >
                    {preview.image && (
                      <div
                        key={preview.image} // Add key to force re-render
                        className="h-12 w-16 rounded-md overflow-hidden relative flex-shrink-0"
                      >
                        <img
                          src={preview.image}
                          alt={preview.title || "Preview"}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                      </div>
                    )}
                    <div className="flex-grow truncate">
                      <div className="font-medium truncate">{preview.title}</div>
                      {preview.subtitle && <div className="text-xs text-white/70 truncate">{preview.subtitle}</div>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-red-500/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Tem certeza que deseja excluir o item ${idx + 1}?`)) {
                          onDelete(idx);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={onAdd}
                className="w-full mt-4 border-dashed border-white/30 hover:text-bg-white/10 bg-white/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Novo Item
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ItemPaginationProps {
  currentIndex: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

const ItemPagination = ({ currentIndex, totalItems, onPrevious, onNext, onSelect }: ItemPaginationProps) => {
  return (
    <div className="flex justify-center items-center gap-2">
      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-white hover:bg-white/20 p-0"
          onClick={onPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalItems }).map((_, idx) => (
          <Button
            key={idx}
            variant="ghost"
            size="icon"
            className={`h-2 w-2 rounded-full p-0 ${
              idx === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"
            }`}
            onClick={() => onSelect(idx)}
          />
        ))}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-white hover:bg-white/20 p-0 rotate-180"
          onClick={onNext}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export interface ImmersiveEditorProps<T extends EditorItem> {
  items: T[];
  onSave: (items: T[]) => void;
  onBack: () => void;
  editorTitle: string;
  renderPreview: (item: T) => ReactNode;
  renderEditor: (item: T, onUpdate: (field: keyof T, value: any) => void) => ReactNode;
  createNewItem: () => T;
  renderItemPreview: (item: T) => {
    title: string;
    subtitle?: string;
    image?: string;
  };
}

export default function ImmersiveEditor<T extends EditorItem>({
  items: initialItems,
  onSave,
  onBack,
  editorTitle,
  renderPreview,
  renderEditor,
  createNewItem,
  renderItemPreview,
}: ImmersiveEditorProps<T>) {
  const router = useRouter();
  const [items, setItems] = useState<T[]>(initialItems.length > 0 ? initialItems : [createNewItem()]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<ViewportDevice>("desktop");

  // Make sure we always have a valid current item
  const safeCurrentIndex = items.length === 0 ? 0 : Math.min(Math.max(0, currentIndex), items.length - 1);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel edit mode or close sidebar
      if (e.key === "Escape") {
        if (editMode) {
          setEditMode(false);
        } else if (showSidebar) {
          setShowSidebar(false);
        }
      }

      // Ctrl+S to save
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }

      // Left and right arrows to navigate items only when not in edit mode
      // and not when focused on an input element
      if (
        !editMode &&
        !showSidebar &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        if (e.key === "ArrowLeft") {
          handlePrevious();
        } else if (e.key === "ArrowRight") {
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editMode, showSidebar]);

  const handleUpdate = (field: keyof T, value: any) => {
    if (items.length === 0) return;

    console.log(`ImmersiveEditor: Updating ${String(field)} to:`, value);

    const newItems = [...items];
    newItems[safeCurrentIndex] = {
      ...newItems[safeCurrentIndex],
      [field]: value,
    } as T;
    setItems(newItems);

    console.log("Items after update:", newItems);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    setEditMode(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    setEditMode(false);
  };

  const handleSave = () => {
    onSave(items);
  };

  const handleBackToDashboard = () => {
    onBack();
  };

  const handleAddItem = () => {
    const newItem = createNewItem();
    setItems([...items, newItem]);
    setCurrentIndex(items.length);
    setShowSidebar(false);
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) {
      alert("Não é possível excluir o único item existente.");
      return;
    }

    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);

    if (currentIndex >= newItems.length) {
      setCurrentIndex(newItems.length - 1);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Main Preview with Device Viewport */}
      <div className="w-full h-full flex items-center justify-center">
        <div
          className={`relative transition-all duration-300 ease-in-out overflow-hidden ${
            currentDevice === "desktop"
              ? "w-full h-full"
              : currentDevice === "tablet"
                ? "w-[768px] h-[1024px] rounded-[20px] border-[12px] border-gray-800 shadow-xl"
                : "w-[375px] h-[667px] rounded-[36px] border-[12px] border-gray-800 shadow-xl"
          }`}
        >
          {/* Device elements for mobile */}
          {currentDevice === "mobile" && (
            <>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-10"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-black rounded-full z-10"></div>
            </>
          )}

          {/* Content wrapper */}
          <div className="w-full h-full overflow-hidden">
            {items.length > 0 && renderPreview(items[safeCurrentIndex] as T)}
          </div>
        </div>
      </div>

      {/* Device indicator */}
      {currentDevice !== "desktop" && (
        <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-sm py-1 px-3 rounded-full">
          {currentDevice === "tablet" ? "Tablet" : "Mobile"}
          {currentDevice === "tablet" ? " - 768×1024" : " - 375×667"}
        </div>
      )}

      {/* Top Bar */}
      <EditorTopBar
        title={editorTitle}
        currentItem={safeCurrentIndex}
        totalItems={items.length}
        onBack={handleBackToDashboard}
        onSave={handleSave}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        showSidebar={showSidebar}
        currentDevice={currentDevice}
        onDeviceChange={setCurrentDevice}
      />

      {/* Sidebar Panel */}
      <SidebarPanel
        items={items}
        currentIndex={safeCurrentIndex}
        onSelect={setCurrentIndex}
        onAdd={handleAddItem}
        onDelete={handleDeleteItem}
        show={showSidebar}
        renderItemPreview={renderItemPreview}
      />

      {/* Pagination */}
      <div className={`fixed ${currentDevice !== "desktop" ? "bottom-20" : "bottom-4"} left-0 right-0 z-30`}>
        <ItemPagination
          currentIndex={safeCurrentIndex}
          totalItems={items.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSelect={setCurrentIndex}
        />
      </div>

      {/* Editor Area */}
      <div className="absolute inset-0 pointer-events-none">
        {items.length > 0 && renderEditor(items[safeCurrentIndex] as T, handleUpdate)}
      </div>
    </div>
  );
}
