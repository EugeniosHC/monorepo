import React, { useState, useEffect, useMemo } from "react";
import { iconManager, IconLibrary } from "@eugenios/icons/src/index";
import { Input } from "@eugenios/ui/components/input";

interface IconSelectorProps {
  onSelect: (iconName: string, iconLibrary: IconLibrary) => void;
  selectedIcon?: string;
  selectedLibrary?: IconLibrary;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ onSelect, selectedIcon, selectedLibrary = "tabler" }) => {
  const [activeTab, setActiveTab] = useState<IconLibrary>(selectedLibrary);
  const [searchTerm, setSearchTerm] = useState("");
  const [icons, setIcons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [page, setPage] = useState(1);
  const iconsPerPage = 50; // Initialize icon manager
  useEffect(() => {
    const init = async () => {
      await iconManager.initialize();
      setIsInitialized(true);
      setIsLoading(false);
    };
    init();
  }, []);

  // Load icons when tab or search term changes
  useEffect(() => {
    if (!isInitialized) return;

    setIsLoading(true);
    const loadedIcons = iconManager.getIcons(activeTab, searchTerm) || [];
    setIcons(loadedIcons);
    setPage(1); // Reset to first page when changing filters
    setIsLoading(false);
  }, [activeTab, searchTerm, isInitialized]);

  // Get current page of icons
  const currentIcons = useMemo(() => {
    const startIndex = (page - 1) * iconsPerPage;
    const endIndex = startIndex + iconsPerPage;
    return icons.slice(startIndex, endIndex);
  }, [icons, page]);

  // Total pages
  const totalPages = Math.ceil(icons.length / iconsPerPage);

  const handleIconClick = (iconName: string) => {
    onSelect(iconName, activeTab);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {" "}
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "tabler" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => {
            setActiveTab("tabler");
            setSearchTerm("");
          }}
        >
          Tabler Icons ({iconManager.getIcons("tabler")?.length || 0})
        </button>
        <button
          type="button"
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "lucide" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => {
            setActiveTab("lucide");
            setSearchTerm("");
          }}
        >
          Lucide Icons ({iconManager.getIcons("lucide")?.length || 0})
        </button>
      </div>
      {/* Search */}
      <div className="px-2">
        <Input
          type="text"
          placeholder={`Search ${activeTab} icons...`}
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {/* Icons Grid */}
      <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
          </div>
        ) : !currentIcons || currentIcons.length === 0 ? (
          <div className="flex justify-center items-center h-40 text-gray-500">No icons found</div>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-4 p-2">
              {currentIcons.map((icon, index) => {
                try {
                  if (!icon || !icon.component) {
                    console.warn(`Invalid icon at index ${index}:`, icon);
                    return null;
                  }

                  const IconComponent = icon.component;

                  // Create a simple wrapper to handle both function components and objects with render
                  const renderIcon = () => {
                    try {
                      return <IconComponent className="w-6 h-6" />;
                    } catch (err) {
                      console.error(`Error rendering ${icon.name}:`, err);
                      return <div className="w-6 h-6 bg-gray-200 rounded" />;
                    }
                  };

                  return (
                    <div
                      key={`${icon.library}-${icon.name}-${index}`}
                      className={`flex flex-col items-center p-3 rounded-lg cursor-pointer ${
                        selectedIcon === icon.name && selectedLibrary === icon.library
                          ? "bg-blue-100 border border-blue-200"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleIconClick(icon.name)}
                      title={icon.name}
                    >
                      {renderIcon()}
                      <span className="mt-2 text-xs text-center text-gray-700 truncate w-full">{icon.name}</span>
                    </div>
                  );
                } catch (error) {
                  console.error(`Error rendering icon ${index}:`, error);
                  return null;
                }
              })}
            </div>{" "}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 px-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded ${
                    page === 1 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                  <span className="ml-2 text-xs text-gray-500">({icons.length} icons)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded ${
                    page === totalPages ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
