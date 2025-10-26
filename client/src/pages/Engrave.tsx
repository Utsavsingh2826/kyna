import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, X, Download, Move } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface EngraveProps {
  onClose: () => void;
  selectedImage?: string;
  jewelryType?: string;
  userId?: string;
  onSave?: (engravingText: string, engravingImageUrl?: string) => void;
}

const EngravingPage: React.FC<EngraveProps> = ({
  onClose,
  selectedImage = "",
  jewelryType = "ring",
  userId = "",
  onSave,
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
  const [selectedFont, setSelectedFont] = useState("My Script One");
  const [fontSize, setFontSize] = useState(24);
  const [engravingText, setEngravingText] = useState("");
  const [activeTab, setActiveTab] = useState("FONT");
  const [textPosition, setTextPosition] = useState({ x: 50, y: 70 });
  const [isDragging, setIsDragging] = useState(false);
  const [textRotation, setTextRotation] = useState({
    horizontal: 0,
    vertical: 0,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fonts = [
    "My Script One",
    "Arial",
    "Times New Roman",
    "Helvetica",
    "Georgia",
    "Verdana",
    "Courier New",
    "Brush Script MT",
    "Lucida Handwriting",
    "Pacifico",
  ];

  const fontSizes = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 48];

  // Get data from navigation state or props
  useEffect(() => {
    if (location.state) {
      const {
        selectedImage: navImage,
        jewelryType: navJewelryType,
        userId: navUserId,
        returnTo,
        formData,
      } = location.state;
      console.log("🎨 Engraving page received navigation data:", {
        selectedImage: navImage,
        jewelryType: navJewelryType,
        userId: navUserId,
        returnTo,
      });

      setCurrentSelectedImage(navImage || selectedImage);
      setEngravingData({
        jewelryType: navJewelryType || jewelryType,
        userId: navUserId || userId,
        returnTo: returnTo || "",
        formData: formData,
      });
    } else {
      // Use props directly
      setCurrentSelectedImage(selectedImage);
      setEngravingData({
        jewelryType: jewelryType,
        userId: userId,
        returnTo: "",
        formData: null,
      });
    }
  }, [location.state, selectedImage, jewelryType, userId]);

  const handleClear = () => {
    setEngravingText("");
  };

  const handleMouseDown = () => {
    if (engravingText) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && engravingText) {
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

        // Draw the engraving text if present
        if (engravingText) {
          ctx.font = `${fontSize}px ${selectedFont}`;
          ctx.fillStyle = "#333";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;

          const textX = (textPosition.x / 100) * canvas.width;
          const textY = (textPosition.y / 100) * canvas.height;

          ctx.save();
          ctx.translate(textX, textY);
          ctx.rotate((textRotation.horizontal * Math.PI) / 180);

          if (textRotation.vertical !== 0) {
            const skewFactor =
              Math.tan((textRotation.vertical * Math.PI) / 180) * 0.5;
            ctx.transform(1, skewFactor, 0, 1, 0, 0);
          }
          ctx.fillText(engravingText, 0, 0);
          ctx.restore();
        }

        // Convert canvas to blob and create URL
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

      img.onerror = () => {
        console.error("Failed to load image for engraving");
        resolve(null);
      };

      // Use selected image or fallback to default
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
      onSave(text, engravingImageUrl || undefined);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                  <div className="flex items-center gap-2 text-sm text-gray-600">
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
              <h1 className="text-2xl font-light text-teal-500 tracking-wide">
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

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Selected Image Display */}
            <div className="lg:w-1/2">
              <div className="bg-gray-50 rounded-lg p-6">
                {currentSelectedImage ? (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                      Selected Image for Engraving
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> The engraving will be applied to
                        your {engravingData.jewelryType} based on the design
                        elements from this selected image.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                      Default Ring for Engraving
                    </h3>
                  </div>
                )}

                <div
                  className="relative cursor-move select-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Display selected image or fallback to default */}
                  {currentSelectedImage ? (
                    <img
                      src={currentSelectedImage}
                      alt="Selected jewelry for engraving"
                      className="w-full h-auto rounded-lg border-2 border-gray-200"
                      draggable={false}
                      onError={(e) => {
                        console.warn(
                          "Failed to load selected image, using fallback"
                        );
                        e.currentTarget.src = "/newring.jpg";
                      }}
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

                  {/* Text Overlay */}
                  {engravingText && (
                    <div
                      className="absolute pointer-events-none transition-all duration-200"
                      style={{
                        left: `${textPosition.x}%`,
                        top: `${textPosition.y}%`,
                        transform: `translate(-50%, -50%) rotateX(${textRotation.vertical}deg) rotateZ(${textRotation.horizontal}deg)`,
                        transformStyle: "preserve-3d",
                      }}
                    >
                      <span
                        className="text-gray-800 font-medium text-center px-2 py-1"
                        style={{
                          fontFamily: selectedFont,
                          fontSize: `${fontSize}px`,
                          textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
                          maxWidth: "200px",
                          wordWrap: "break-word",
                        }}
                      >
                        {engravingText}
                      </span>
                    </div>
                  )}

                  {/* Position Guide */}
                  {engravingText && (
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      <Move className="w-3 h-3 inline mr-1" />
                      Drag to position text
                    </div>
                  )}
                </div>

                {/* Position Controls */}
                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
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
                    <button
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
                </div>
              </div>
            </div>

            {/* Right Side - Controls */}
            <div className="lg:w-1/2">
              <div className="bg-gray-50 rounded-lg p-6">
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
                        >
                          {fontSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Text Input */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Add Your Message
                        </label>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          ADD MOTIF ▼
                        </button>
                      </div>
                      <textarea
                        value={engravingText}
                        onChange={(e) => setEngravingText(e.target.value)}
                        placeholder="Enter your text here..."
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none bg-white"
                        rows={4}
                        style={{
                          fontFamily: selectedFont,
                          fontSize: `${Math.min(fontSize, 16)}px`,
                        }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleClear}
                        className="flex-1 py-3 px-6 border-2 border-purple-400 text-purple-400 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                      >
                        CLEAR
                      </button>
                      <button
                        onClick={async () => {
                          if (!engravingText.trim()) {
                            alert("Please enter some text for engraving");
                            return;
                          }

                          console.log(
                            "💾 Processing engraving with selected image:",
                            {
                              text: engravingText,
                              selectedImage: currentSelectedImage,
                              jewelryType: engravingData.jewelryType,
                              userId: engravingData.userId,
                            }
                          );

                          // Save and process the engraving
                          await handleSaveEngraving(engravingText);
                        }}
                        disabled={!engravingText.trim()}
                        className={`flex-1 py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-colors ${
                          engravingText.trim()
                            ? "bg-teal-400 text-white hover:bg-teal-500"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {engravingText.trim()
                          ? "SAVE & APPLY"
                          : "ENTER TEXT FIRST"}
                      </button>
                    </div>

                    {/* Enhanced engraving preview */}
                    {engravingText && (
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
                    )}

                    {/* Instructions */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
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
                    </div>
                  </div>
                )}

                {activeTab === "MOTIF" && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Motif options coming soon...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Canvas for Image Generation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default EngravingPage;
