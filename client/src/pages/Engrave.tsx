import React, { useState, useRef } from "react";
import { ArrowLeft, X, Download, Move } from "lucide-react";

interface EngraveProps {
  onClose: () => void;
}

const EngravingPage: React.FC<EngraveProps> = ({ onClose }) => {
  const [selectedFont, setSelectedFont] = useState("My Script One");
  const [fontSize, setFontSize] = useState(24);
  const [engravingText, setEngravingText] = useState("");
  const [activeTab, setActiveTab] = useState("FONT");
  const [textPosition, setTextPosition] = useState({ x: 50, y: 70 }); // Percentage based positioning
  const [isDragging, setIsDragging] = useState(false);
  const [textRotation, setTextRotation] = useState({
    horizontal: 0,
    vertical: 0,
  }); // Rotation angles
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

      // Constrain to reasonable bounds
      const constrainedX = Math.max(10, Math.min(90, x));
      const constrainedY = Math.max(20, Math.min(90, y));

      setTextPosition({ x: constrainedX, y: constrainedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 600;

    // Create image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Draw the ring image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Add text overlay
      if (engravingText) {
        ctx.font = `${fontSize}px ${selectedFont}`;
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Add text shadow for better visibility
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Apply rotation transformations
        const textX = (textPosition.x / 100) * canvas.width;
        const textY = (textPosition.y / 100) * canvas.height;

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate((textRotation.horizontal * Math.PI) / 180);

        // Note: Canvas 2D doesn't support 3D transforms, so we simulate vertical tilt with skew
        if (textRotation.vertical !== 0) {
          const skewFactor =
            Math.tan((textRotation.vertical * Math.PI) / 180) * 0.5;
          ctx.transform(1, skewFactor, 0, 1, 0, 0);
        }
        // Draw text at the specified position
        ctx.fillText(engravingText, 0, 0);
        ctx.restore();
      }

      // Download the image
      const link = document.createElement("a");
      link.download = "engraved-jewelry.png";
      link.href = canvas.toDataURL();
      link.click();
    };

    img.src = "/newring.jpg";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
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

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left Side - Ring Image */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-lg p-8 sticky top-8">
              <div
                className="relative cursor-move select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src="/newring.jpg"
                  alt="Diamond Ring"
                  className="w-full h-auto rounded-lg"
                  draggable={false}
                />
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
                      className="text-gray-800 font-medium text-center px-2 py-1 "
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
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
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

                {/* Rotation Controls */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Horizontal Tilt (°)
                    </label>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      value={textRotation.horizontal}
                      onChange={(e) =>
                        setTextRotation((prev) => ({
                          ...prev,
                          horizontal: Number(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-500">
                      {textRotation.horizontal}°
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Vertical Tilt (°)
                    </label>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      value={textRotation.vertical}
                      onChange={(e) =>
                        setTextRotation((prev) => ({
                          ...prev,
                          vertical: Number(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-500">
                      {textRotation.vertical}°
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
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
                    Reset Rotation
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Controls */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Tabs */}
              <div className="flex mb-6">
                <button
                  className={`flex-1 py-3 px-6 text-center font-medium rounded-l-lg transition-colors ${
                    activeTab === "FONT"
                      ? "bg-teal-400 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab("FONT")}
                >
                  FONT
                </button>
                <button
                  className={`flex-1 py-3 px-6 text-center font-medium rounded-r-lg transition-colors ${
                    activeTab === "MOTIF"
                      ? "bg-teal-400 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent"
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent"
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
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
                      rows={6}
                      style={{
                        fontFamily: selectedFont,
                        fontSize: `${fontSize}px`,
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
                      onClick={() => {
                        handleSaveImage();
                        onClose(); // Close modal after saving
                      }}
                      className="flex-1 py-3 px-6 bg-teal-400 text-white rounded-lg hover:bg-teal-500 transition-colors font-medium flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      SAVE & APPLY
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "MOTIF" && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Motif options coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas for Image Generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default EngravingPage;
