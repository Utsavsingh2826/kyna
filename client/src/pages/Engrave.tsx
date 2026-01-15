import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, X, Download, Move } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { StickyTwoColumnLayout } from "@/components/StickyTwoColumnLayout";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  AccordionItem,
} from "@/components/ui/accordion";

interface EngraveProps {
  onClose: () => void;
  selectedImage?: string;
  jewelryType?: string;
  userId?: string;
  onSave?: (
    engravingText: string,
    engravingImageUrl?: string,
    motifPath?: string
  ) => void;
  initialText?: string;
  initialMotif?: string;
  fontSize?: number;
}

const EngravingPage: React.FC<EngraveProps> = ({
  onClose,
  selectedImage = "",
  jewelryType = "ring",
  userId = "",
  onSave,
  initialText = "",
  initialMotif = "",
  fontSize: propFontSize,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentSelectedImage, setCurrentSelectedImage] =
    useState<string>(selectedImage);
  const [engravingData, setEngravingData] = useState({
    jewelryType: jewelryType,
    userId: userId,
    returnTo: "",
    formData: null,
  });
  const [selectedFont, setSelectedFont] = useState("");
  const [fonts, setFonts] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState(propFontSize ? propFontSize : 24);
  const [engravingText, setEngravingText] = useState(initialText);
  const [activeTab, setActiveTab] = useState("FONT");
  const [textPosition, setTextPosition] = useState({ x: 52, y: 64 });
  const [isDragging, setIsDragging] = useState(false);
  const [textRotation, setTextRotation] = useState({
    horizontal: 0,
    vertical: 0,
  });
  const [motifs, setMotifs] = useState<string[]>([]);
  const [selectedMotif, setSelectedMotif] = useState<string | null>(
    initialMotif || null
  );
  const [motifPosition, setMotifPosition] = useState<number>(-1); // position in text where motif is inserted (-1 = not inserted)
  const [motifScale, setMotifScale] = useState<number>(1); // multiplier of fontSize (1 = same height as text)
  const maxCount = 12; // maximum total units (characters + motif cost)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Load fonts from fonts folder
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const fontFiles = [
          "Arsenal-Regular.ttf",
          "Arsenal-Bold.ttf",
          "Arsenal-Italic.ttf",
          "Arsenal-BoldItalic.ttf",
          "PinyonScript-Regular.ttf",
          "OpenSans.ttf",
        ];

        const fontNames: string[] = [];

        for (const fontFile of fontFiles) {
          const fontName = fontFile
            .replace(".ttf", "")
            .replace(/-Regular|-Bold|-Italic|-BoldItalic/g, "")
            .replace(/([A-Z])/g, " $1")
            .trim();

          // Create @font-face rule
          const fontFace = new FontFace(fontName, `url(/fonts/${fontFile})`);

          try {
            await fontFace.load();
            document.fonts.add(fontFace);

            if (!fontNames.includes(fontName)) {
              fontNames.push(fontName);
            }
          } catch (err) {
            console.debug(`Failed to load font ${fontFile}:`, err);
          }
        }

        setFonts(fontNames);
        if (fontNames.length > 0 && !selectedFont) {
          setSelectedFont(fontNames[0]);
        }
      } catch (err) {
        console.error("Failed to load fonts:", err);
      }
    };

    loadFonts();
  }, []);

  // Load motif index from public/motif/index.json (if available)
  useEffect(() => {
    const loadMotifs = async () => {
      try {
        const res = await fetch(`/motif/index.json`);
        if (!res.ok) return;

        const data = await res.json();
        setMotifs(data); // <-- data is object { category: [files] }

        // No auto-selection - user must manually choose a motif
      } catch (err) {
        console.debug("Motif load failed:", err);
      }
    };

    loadMotifs();
  }, []);

  // When motif selection changes, ensure current text fits into new allowed limit
  useEffect(() => {
    const motifCost = selectedMotif ? 2 : 0;
    const allowed = Math.max(0, maxCount - motifCost);
    if (engravingText.length > allowed) {
      setEngravingText((prev) => prev.slice(0, allowed));
    }
  }, [selectedMotif, engravingText]);

  // Get data from navigation state or props
  useEffect(() => {
    // Simplified logic to handle image source
    let imageSource = selectedImage;
    if (selectedImage.startsWith("blob:")) {
      // Use blob directly
      imageSource = selectedImage;
    } else {
      // Apply proxy for other URLs
      imageSource = `/api/image-proxy?url=${encodeURIComponent(selectedImage)}`;
    }

    console.log("🔍 Determined image source:", imageSource);

    setCurrentSelectedImage(imageSource);
    setEngravingData({
      jewelryType: jewelryType,
      userId: userId,
      returnTo: "",
      formData: null,
    });
  }, [selectedImage, jewelryType, userId]);

  const handleClear = () => {
    setEngravingText("");
    setSelectedMotif(null);
    setMotifPosition(-1);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (engravingText) {
      e.preventDefault();
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && engravingText) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const constrainedX = Math.max(10, Math.min(90, x));
      const constrainedY = Math.max(20, Math.min(90, y));

      setTextPosition({ x: constrainedX, y: constrainedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (engravingText) {
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && engravingText && e.touches.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;

      const constrainedX = Math.max(10, Math.min(90, x));
      const constrainedY = Math.max(20, Math.min(90, y));

      setTextPosition({ x: constrainedX, y: constrainedY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSaveEngravingImage = async (): Promise<string | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    return new Promise((resolve) => {
      canvas.width = 600;
      canvas.height = 600;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Draw the base image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compute text coordinates
        const textX = (textPosition.x / 100) * canvas.width;
        const textY = (textPosition.y / 100) * canvas.height;

        // Split text by motif position
        let textBefore = engravingText;
        let textAfter = "";

        if (
          selectedMotif &&
          motifPosition >= 0 &&
          motifPosition <= engravingText.length
        ) {
          textBefore = engravingText.slice(0, motifPosition);
          textAfter = engravingText.slice(motifPosition);
        }

        // Setup text rendering properties
        ctx.font = `${fontSize}px ${selectedFont}`;
        ctx.fillStyle = "#333";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Measure text parts
        const textBeforeWidth = textBefore
          ? ctx.measureText(textBefore).width
          : 0;
        const textAfterWidth = textAfter ? ctx.measureText(textAfter).width : 0;

        // Calculate motif dimensions
        const motifHeight = fontSize * (motifScale || 1);
        const motifWidth =
          selectedMotif && motifPosition >= 0 ? motifHeight : 0; // will be adjusted when image loads

        // Calculate total width for centering
        const totalWidth =
          textBeforeWidth +
          (selectedMotif && motifPosition >= 0 ? motifHeight + 4 : 0) +
          textAfterWidth;

        // Starting X position (centered)
        let currentX = textX - totalWidth / 2;

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate((textRotation.horizontal * Math.PI) / 180);
        if (textRotation.vertical !== 0) {
          const skewFactor =
            Math.tan((textRotation.vertical * Math.PI) / 180) * 0.5;
          ctx.transform(1, skewFactor, 0, 1, 0, 0);
        }

        // Reset to local coords
        let localX = -totalWidth / 2;

        // Draw text before motif
        if (textBefore) {
          ctx.fillText(textBefore, localX, 0);
          localX += textBeforeWidth + 2;
        }

        ctx.restore();

        // Draw motif if selected (inline with text)
        const drawMotifThenFinalize = () => {
          if (!selectedMotif || motifPosition < 0) {
            // Draw text after motif if no motif
            if (textAfter) {
              ctx.save();
              ctx.translate(textX, textY);
              ctx.rotate((textRotation.horizontal * Math.PI) / 180);
              if (textRotation.vertical !== 0) {
                const skewFactor =
                  Math.tan((textRotation.vertical * Math.PI) / 180) * 0.5;
                ctx.transform(1, skewFactor, 0, 1, 0, 0);
              }
              const afterX = -totalWidth / 2 + textBeforeWidth + 2;
              ctx.fillText(textAfter, afterX, 0);
              ctx.restore();
            }
            finalizeCanvasToBlob();
            return;
          }

          const motifImg = new Image();
          motifImg.crossOrigin = "anonymous";
          motifImg.onload = () => {
            const motifHeight = fontSize * (motifScale || 1);
            const motifWidth = (motifImg.width / motifImg.height) * motifHeight;

            // Recalculate total width with actual motif width
            const actualTotalWidth =
              textBeforeWidth + motifWidth + 4 + textAfterWidth;

            ctx.save();
            ctx.translate(textX, textY);
            ctx.rotate((textRotation.horizontal * Math.PI) / 180);
            if (textRotation.vertical !== 0) {
              const skewFactor =
                Math.tan((textRotation.vertical * Math.PI) / 180) * 0.5;
              ctx.transform(1, skewFactor, 0, 1, 0, 0);
            }

            const motifX = -actualTotalWidth / 2 + textBeforeWidth + 2;
            const motifY = -motifHeight / 2;

            ctx.drawImage(motifImg, motifX, motifY, motifWidth, motifHeight);

            // Draw text after motif
            if (textAfter) {
              const afterX = motifX + motifWidth + 2;
              ctx.fillText(textAfter, afterX, 0);
            }

            ctx.restore();
            finalizeCanvasToBlob();
          };
          motifImg.onerror = () => {
            console.warn("Failed to load motif image", selectedMotif);
            finalizeCanvasToBlob();
          };
          motifImg.src = `/motif/${selectedMotif}`;
        };

        const finalizeCanvasToBlob = () => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const engravingImageUrl = URL.createObjectURL(blob);
                console.log(
                  "🎨 Generated engraved image URL:",
                  engravingImageUrl
                );
                resolve(engravingImageUrl);
              } else {
                resolve(null);
              }
            },
            "image/png",
            0.9
          );
        };
        // If motif selected, draw it then finalize; otherwise finalize immediately
        drawMotifThenFinalize();
      };

      img.onerror = () => {
        console.error("Failed to load image for engraving");
        resolve(null);
      };

      // Use selected image or fallback to default
      img.crossOrigin = "anonymous";

      // currentSelectedImage is already processed in useEffect (either blob or proxy URL)
      img.src = currentSelectedImage || "/newring.jpg";
    });
  };

  const handleSaveEngraving = async (text: string) => {
    console.log("💾 Saving engraving:", {
      text: text,
      image: currentSelectedImage,
      jewelryType: engravingData.jewelryType,
      userId: engravingData.userId,
    });

    // Generate the engraved image
    const engravingImageUrl = await handleSaveEngravingImage();

    // If we have an onSave callback (from popup), use it
    if (onSave) {
      onSave(text, engravingImageUrl || undefined, selectedMotif || undefined);
      return;
    }

    // If we came from navigation with return path, navigate back
    if (engravingData.returnTo && engravingData.formData) {
      navigate(engravingData.returnTo, {
        state: {
          ...engravingData.formData,
          engraving: text,
          engravingImage: engravingImageUrl || currentSelectedImage,
        },
      });
    } else {
      onClose();
    }
  };

  return (
    <div
      style={{ fontFamily: "'Poppins', cursive, sans-serif" }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with selected image info */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onClose}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                {currentSelectedImage && (
                  <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                    <span>•</span>
                    <span>Working with selected image</span>
                    <div className="w-6 h-6 rounded border overflow-hidden">
                      <img
                        src={currentSelectedImage}
                        alt="Selected"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              <h1 className="text-lg sm:text-2xl font-light text-teal-500 tracking-wide">
                ADD ENGRAVING
              </h1>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="sm:p-6">
          <StickyTwoColumnLayout
            leftColumn={
              <div className="bg-gray-50 rounded-lg p-6">
                {currentSelectedImage ? (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                      Selected Image for Engraving
                    </h3>
                    {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> The engraving will be applied to
                        your {engravingData.jewelryType} based on the design
                        elements from this selected image.
                      </p>
                    </div> */}
                  </div>
                ) : (
                  <p className="text-gray-500">No image selected.</p>
                )}

                <div
                  className="relative cursor-move select-none touch-none overflow-hidden"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Display selected image or fallback to default */}
                  {currentSelectedImage ? (
                    <img
                      src={currentSelectedImage || "/newring.jpg"}
                      alt="Selected jewelry for engraving"
                      draggable={false}
                      className="pointer-events-none select-none rounded-xl"
                    />
                  ) : (
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <img
                        src="/newring.jpg"
                        alt="Default ring for engraving"
                        className="w-full h-auto rounded-lg"
                        draggable={false}
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        No image selected - using default ring
                      </p>
                    </div>
                  )}

                  {/* Text and Motif Overlay (inline rendering) */}
                  {(engravingText || selectedMotif) &&
                    (() => {
                      const displayFontSize = fontSize;

                      // Split text by motif position
                      let textBefore = engravingText;
                      let textAfter = "";

                      if (
                        selectedMotif &&
                        motifPosition >= 0 &&
                        motifPosition <= engravingText.length
                      ) {
                        textBefore = engravingText.slice(0, motifPosition);
                        textAfter = engravingText.slice(motifPosition);
                      }

                      return (
                        <div
                          className="absolute pointer-events-none transition-all duration-200 flex items-center justify-center gap-1"
                          style={{
                            left: `${textPosition.x}%`,
                            top: `${textPosition.y}%`,
                            transform: `translate(-50%, -50%) rotateX(${textRotation.vertical}deg) rotateZ(${textRotation.horizontal}deg)`,
                            transformStyle: "preserve-3d",
                          }}
                        >
                          {/* Text before motif */}
                          {textBefore && (
                            <span
                              className="text-gray-800 font-medium"
                              style={{
                                fontFamily: selectedFont,
                                fontSize: `${displayFontSize}px`,
                                textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {textBefore}
                            </span>
                          )}

                          {/* Motif inline */}
                          {selectedMotif && motifPosition >= 0 && (
                            <img
                              src={`/motif/${selectedMotif}`}
                              alt="motif"
                              style={{
                                height: `${
                                  displayFontSize * (motifScale || 1)
                                }px`,
                                opacity: 0.95,
                                verticalAlign: "middle",
                              }}
                            />
                          )}

                          {/* Text after motif */}
                          {textAfter && (
                            <span
                              className="text-gray-800 font-medium"
                              style={{
                                fontFamily: selectedFont,
                                fontSize: `${displayFontSize}px`,
                                textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {textAfter}
                            </span>
                          )}
                        </div>
                      );
                    })()}

                  {/* Position Guide */}
                  {engravingText && (
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      <Move className="w-3 h-3 inline mr-1" />
                      Drag to position text
                    </div>
                  )}
                </div>

                {/* disclamer */}
                <ul className="list-disc pl-5 text-[10px] mt-1 text-gray-500">
                  <li>
                    Approximate Position: Any positioning shown in digital
                    mock-ups or requested by the customer is considered
                    approximate.
                  </li>
                  <li>
                    Manufacturing Variance: The final engraved position may
                    slightly shift due to technical requirements or constraints
                    during manufacturing, setting, or polishing.
                  </li>
                </ul>

                {/* Position Controls */}
                {/* <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Text Position & Rotation
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Horizontal (%)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={textPosition.x}
                        onChange={(e) =>
                          setTextPosition((prev) => ({
                            ...prev,
                            x: Number(e.target.value),
                          }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span className="text-xs text-gray-500">
                        {Math.round(textPosition.x)}%
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Vertical (%)
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="90"
                        value={textPosition.y}
                        onChange={(e) =>
                          setTextPosition((prev) => ({
                            ...prev,
                            y: Number(e.target.value),
                          }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span className="text-xs text-gray-500">
                        {Math.round(textPosition.y)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {/* <button
                      onClick={() => {
                        setTextPosition({ x: 50, y: 70 });
                        setTextRotation({ horizontal: 0, vertical: 0 });
                      }}
                      className="px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition-colors"
                    >
                      Ring Band
                    </button>
                    <button
                      onClick={() => {
                        setTextPosition({ x: 50, y: 40 });
                        setTextRotation({ horizontal: 0, vertical: 0 });
                      }}
                      className="px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition-colors"
                    >
                      Center
                    </button>
                    <button
                      onClick={() => {
                        setTextPosition({ x: 30, y: 80 });
                        setTextRotation({ horizontal: -15, vertical: 5 });
                      }}
                      className="px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition-colors"
                    >
                      Side
                    </button>
                 <button
                      onClick={() =>
                        setTextRotation({ horizontal: 0, vertical: 0 })
                      }
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>  */}
              </div>
            }
            rightColumn={
              <div className="bg-gray-50 rounded-lg py-0 sm:py-6 p-6">
                {/* Tabs */}
                <div className="flex mb-6">
                  <button
                    className={`flex-1 py-3 px-6 text-center font-medium rounded-l-lg transition-colors ${
                      activeTab === "FONT"
                        ? "bg-teal-400 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("FONT")}
                  >
                    FONT
                  </button>
                  <button
                    className={`flex-1 py-3 px-6 text-center font-medium rounded-r-lg transition-colors ${
                      activeTab === "MOTIF"
                        ? "bg-teal-400 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("MOTIF")}
                  >
                    MOTIF
                  </button>
                </div>

                {activeTab === "FONT" && (
                  <div className="space-y-6">
                    {/* Font Style and Size */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Font Style
                        </label>
                        <select
                          value={selectedFont}
                          onChange={(e) => setSelectedFont(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
                          style={{ fontFamily: selectedFont }}
                        >
                          {fonts.map((font) => (
                            <option
                              key={font}
                              value={font}
                              style={{ fontFamily: font }}
                            >
                              {font}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Font Size
                        </label>
                        <select
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          disabled={!!propFontSize}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          {propFontSize ? (
                            <option value={propFontSize}>{propFontSize}</option>
                          ) : (
                            <>
                              <option value={16}>Small (16px)</option>
                              <option value={20}>Medium (20px)</option>
                              <option value={24}>Large (24px)</option>
                              <option value={28}>Extra Large (28px)</option>
                              <option value={32}>Huge (32px)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Text Input */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Add Your Message
                        </label>
                        {selectedMotif && (
                          <button
                            onClick={() => {
                              setSelectedMotif(null);
                              setMotifPosition(-1);
                            }}
                            className="text-sm text-red-500 hover:text-red-700 font-medium"
                          >
                            REMOVE MOTIF ✕
                          </button>
                        )}
                      </div>
                      <textarea
                        ref={textInputRef}
                        value={engravingText}
                        onChange={(e) => {
                          // enforce maxCount with motif cost (motif consumes 2)
                          const motifCost =
                            selectedMotif && motifPosition >= 0 ? 2 : 0;
                          const allowed = Math.max(0, maxCount - motifCost);
                          let v = e.target.value || "";
                          if (v.length > allowed) v = v.slice(0, allowed);
                          setEngravingText(v);

                          // Update motif position if text changes
                          if (motifPosition > v.length) {
                            setMotifPosition(v.length);
                          }
                        }}
                        placeholder="Enter your text here..."
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none bg-white"
                        rows={4}
                        style={{
                          fontFamily: selectedFont,
                          fontSize: `${16}px`,
                        }}
                      />

                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <div>
                          Characters: {engravingText.length} /{" "}
                          {maxCount -
                            (selectedMotif && motifPosition >= 0 ? 2 : 0)}
                          {selectedMotif && motifPosition >= 0 && (
                            <span className="ml-2">
                              (Motif uses 2 character space)
                            </span>
                          )}
                        </div>
                        <div>
                          Remaining:{" "}
                          {Math.max(
                            0,
                            maxCount -
                              engravingText.length -
                              (selectedMotif && motifPosition >= 0 ? 2 : 0)
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleClear}
                        className="flex-1 py-1 px-2 sm:py-3 sm:px-6 border-2 border-teal-400 text-teal-400 rounded-lg hover:bg-teal-50 transition-colors font-medium"
                      >
                        CLEAR
                      </button>
                      <button
                        onClick={async () => {
                          // Allow save if there is text or a selected motif
                          if (!engravingText.trim() && !selectedMotif) {
                            alert(
                              "Please enter some text or select a motif for engraving"
                            );
                            return;
                          }

                          console.log(
                            "💾 Processing engraving with selected image:",
                            {
                              text: engravingText,
                              selectedImage: currentSelectedImage,
                              jewelryType: engravingData.jewelryType,
                              userId: engravingData.userId,
                              motif: selectedMotif,
                            }
                          );

                          // Save and process the engraving
                          await handleSaveEngraving(engravingText);
                        }}
                        disabled={!engravingText.trim() && !selectedMotif}
                        className={`flex-1 py-1 px-2 sm:py-3 sm:px-6 rounded-lg font-medium flex items-center justify-center transition-colors ${
                          engravingText.trim() || selectedMotif
                            ? "bg-teal-400 text-white hover:bg-teal-500"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {engravingText.trim() || selectedMotif
                          ? "SAVE & APPLY"
                          : "ENTER TEXT OR SELECT MOTIF"}
                      </button>
                    </div>

                    {/* Enhanced engraving preview */}
                    {/* {engravingText && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs text-green-700">
                          <strong>Preview:</strong> "{engravingText}" will be
                          engraved on your {engravingData.jewelryType}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          ✓ This will create a new image with your engraving and
                          add it to your design collection
                        </p>
                      </div>
                    )} */}
                    <img src="/sample.png" alt="" />

                    {/* Instructions */}
                    {/* <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-700">
                        <strong>How it works:</strong>
                      </p>
                      <ul className="text-xs text-blue-600 mt-1 space-y-1">
                        <li>
                          • Position your text using the controls or drag it
                          directly
                        </li>
                        <li>
                          • Click "SAVE & APPLY" to create an engraved version
                        </li>
                        <li>
                          • The new image will be added to your design
                          collection
                        </li>
                        <li>
                          • You can continue customizing with the new engraved
                          image
                        </li>
                      </ul>
                    </div> */}
                  </div>
                )}

                {activeTab === "MOTIF" && (
                  <div className="space-y-4">
                    {!motifs || Object.keys(motifs).length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500">
                          No motifs available. Add SVG files to{" "}
                          <code>/public/motif</code> and include an{" "}
                          <code>index.json</code>.
                        </p>
                      </div>
                    ) : (
                      <Accordion
                        type="single"
                        collapsible
                        className="w-full space-y-2"
                      >
                        {Object.entries(motifs).map(([category, files]) => (
                          <AccordionItem key={category} value={category}>
                            <AccordionTrigger className="text-base font-medium">
                              {category}
                            </AccordionTrigger>

                            <AccordionContent>
                              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-2">
                                {Array.isArray(files) &&
                                  files.map((file: string) => (
                                    <button
                                      key={file}
                                      onClick={() => {
                                        // Toggle motif selection
                                        if (selectedMotif === file) {
                                          setSelectedMotif(null);
                                          setMotifPosition(-1);
                                        } else {
                                          setSelectedMotif(file);
                                          // Insert motif at current cursor position
                                          const cursorPos =
                                            textInputRef.current
                                              ?.selectionStart ??
                                            engravingText.length;
                                          setMotifPosition(cursorPos);
                                        }
                                      }}
                                      className={`p-1 rounded-lg border overflow-hidden bg-white transition-shadow ${
                                        selectedMotif === file
                                          ? "ring-2 ring-teal-400 border-transparent"
                                          : "border-neutral-200 hover:shadow"
                                      }`}
                                    >
                                      <img
                                        src={`/motif/${file}`}
                                        alt={file}
                                        className="w-full h-16 object-contain"
                                      />
                                    </button>
                                  ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </div>
                )}
              </div>
            }
          />
        </div>

        {/* Hidden Canvas for Image Generation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default EngravingPage;
