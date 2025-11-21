// Cloudinary upload utility for engraving images
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

export const uploadToCloudinary = async (
  imageBlob: Blob,
  folder: string = "engravings",
  uploadPreset: string = "engraving_preset"
): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", imageBlob);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    // Add timestamp to filename for uniqueness
    const timestamp = Date.now();
    formData.append("public_id", `engraving_${timestamp}`);

    // Use environment variable or fallback
    const cloudName =
      process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "your-cloud-name";

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.status}`);
    }

    const data: CloudinaryUploadResult = await response.json();
    console.log("📸 Successfully uploaded to Cloudinary:", {
      url: data.secure_url,
      publicId: data.public_id,
      size: `${data.width}x${data.height}`,
      bytes: data.bytes,
    });

    return data.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    return null;
  }
};

// Helper function to convert canvas to blob
export const canvasToBlob = (
  canvas: HTMLCanvasElement
): Promise<Blob | null> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 0.9);
  });
};

// Helper function to create engraving image on canvas
export const createEngravingCanvas = async (
  baseImageUrl: string,
  engravingText: string,
  motifPath?: string,
  fontSize: number = 24
): Promise<HTMLCanvasElement | null> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve(null);
      return;
    }

    canvas.width = 600;
    canvas.height = 600;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (engravingText) {
        // Set text styling
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Draw text at bottom center
        const textX = canvas.width / 2;
        const textY = canvas.height * 0.8; // 80% down from top
        ctx.fillText(engravingText, textX, textY);
      }

      // TODO: Add motif rendering if needed
      if (motifPath) {
        const motifImg = new Image();
        motifImg.crossOrigin = "anonymous";
        motifImg.onload = () => {
          // Draw motif next to text or centered if no text
          const motifSize = fontSize * 1.2;
          const motifX = canvas.width / 2 + 50; // Offset from center
          const motifY = canvas.height * 0.8 - motifSize / 2;
          ctx.drawImage(motifImg, motifX, motifY, motifSize, motifSize);
          resolve(canvas);
        };
        motifImg.onerror = () => resolve(canvas); // Continue without motif if it fails
        motifImg.src = motifPath;
      } else {
        resolve(canvas);
      }
    };

    img.onerror = () => {
      console.error("Failed to load base image for engraving");
      resolve(null);
    };

    img.src = baseImageUrl;
  });
};
