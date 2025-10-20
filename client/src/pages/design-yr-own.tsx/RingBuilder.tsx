import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Progress } from "@/components/ui/progress";
import { X, Edit, Upload } from "lucide-react";
import { StickyTwoColumnLayout } from "@/components/StickyTwoColumnLayout";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import EngravingPage from "../Engrave";
import PaymentForm from "../../components/PaymentForm";

const steps = [
  { number: 1, title: "Inspiration Upload", active: true },
  { number: 2, title: "Customize Properties", active: false },
  { number: 3, title: "Secure Payment", active: false },
];

const diamondShapes = [
  { name: "Round", icon: <img src="/DIAMOND_SHAPES_WEBP/round.webp" alt="" /> },
  {
    name: "Princess",
    icon: <img src="/DIAMOND_SHAPES_WEBP/princess.webp" alt="" />,
  },
  {
    name: "Cushion",
    icon: <img src="/DIAMOND_SHAPES_WEBP/cushion.webp" alt="" />,
  },
  { name: "Oval", icon: <img src="/DIAMOND_SHAPES_WEBP/oval.webp" alt="" /> },
  {
    name: "Emerald",
    icon: <img src="/DIAMOND_SHAPES_WEBP/emerald.webp" alt="" />,
  },
  {
    name: "Asscher",
    icon: <img src="/DIAMOND_SHAPES_WEBP/asscher.jpg" alt="" />,
  },
  {
    name: "Radiant",
    icon: <img src="/DIAMOND_SHAPES_WEBP/radient.jpg" alt="" />,
  },
  { name: "Pear", icon: <img src="/DIAMOND_SHAPES_WEBP/pear.webp" alt="" /> },
  {
    name: "Marquise",
    icon: <img src="/DIAMOND_SHAPES_WEBP/marquise.webp" alt="" />,
  },
  { name: "Heart", icon: <img src="/DIAMOND_SHAPES_WEBP/heart.jpg" alt="" /> },
];

const goldKarat = ["22KT", "18KT", "14KT", "10KT"];

export default function RingBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const navigate = useNavigate();
  const [selectedEngravingImage, setSelectedEngravingImage] =
    useState<string>("");
  const [showEngravingPopup, setShowEngravingPopup] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Store engraved images as blobs for batch upload
  const [engravingBlobs, setEngravingBlobs] = useState<{ blob: Blob; url: string }[]>([]);
  // Define a minimal type for payment order data to avoid 'any'
  type PaymentOrderType = {
    orderId: string;
    orderNumber?: string;
    orderCategory?: 'design-your-own' | 'build-your-own' | 'products';
    orderType?: 'customized' | 'normal';
    amount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    jewelryId?: string;
    userId?: string;
    images?: Array<{ url: string; publicId?: string; source?: string }>;
    customData?: Record<string, unknown>;
    orderDetails?: Record<string, unknown>;
  } | null;

  const [orderData, setOrderData] = useState<PaymentOrderType>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string>("");
  const [Loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    // API matching fields - Use getUserId for consistent userId
    userId: "",
    jewelryType: "ring",

    // Image data
    url: "",
    images: [] as string[],
    imageUrls: [] as string[],

    // Customization data
    sameAsImage: false,
    modificationRequest: "",
    description: "",
    diamondShape: "Round",
    diamondSize: "Center Stone",
    diamondColor: "Center Stone",
    diamondClarity: "Center Stone",
    metal: "Gold",
    metalColor: "Same as Image",
    goldKarat: "22KT",
    ringSize: "",
    engraving: "",

    // Additional options
    priority: "normal",
    specialInstructions: "",

    // Contact information
    firstName: authUser?.firstName || "",
    lastName: authUser?.lastName || "",
    address: "",
    country: authUser?.country || "",
    region: authUser?.state || "",
    city: "",
    zipCode: authUser?.zipCode || "",
    email: authUser?.email || "",
    phoneNumber: authUser?.phoneNumber || authUser?.phone || "",
  });

  // Get userId reliably from multiple sources
  const getUserId = useCallback(() => {
    // 1. Try Redux store first
    if (authUser?.id) {
      return String(authUser.id);
    }

    // 2. Try localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return String(
          parsedUser.id || parsedUser._id || parsedUser.userId || ""
        );
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }

    // 3. Try direct userId
    const directUserId = localStorage.getItem("userId");
    if (directUserId) {
      return String(directUserId);
    }

    return "";
  }, [authUser]);

  // Update userId when authUser changes
  useEffect(() => {
    const currentUserId = getUserId();
    if (currentUserId && currentUserId !== formData.userId) {
      setFormData((prev) => ({ ...prev, userId: currentUserId }));
      console.log("🔄 Updated userId in formData:", currentUserId);
    }
  }, [authUser, getUserId, formData.userId]);

  // Cleanup blob URLs when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      engravingBlobs.forEach(({ url }) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [engravingBlobs]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const imageUrls = newFiles.map((file) => URL.createObjectURL(file));

      setUploadedImages([...uploadedImages, ...imageUrls]);
      setUploadedFiles([...uploadedFiles, ...newFiles]);

      // Update formData with new image data
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...imageUrls],
      }));

      console.log("📸 Images uploaded:", {
        totalImages: uploadedImages.length + imageUrls.length,
        newImages: imageUrls.length,
        filesInfo: newFiles.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const updateSteps = (step: number) => {
    setCurrentStep(step);

    // Log step-specific data matching API structure
    if (step === 1) {
      console.log("🎯 Step 1 - Image Upload Data:", {
        userId: formData.userId,
        jewelryType: formData.jewelryType,
        totalImages: uploadedImages.length,
        imageUrls: formData.url ? [formData.url] : [],
        uploadedFiles: uploadedFiles.length,
        modificationRequest: formData.modificationRequest,
        description: formData.description,
        sameAsImage: formData.sameAsImage,
      });
    } else if (step === 2) {
      console.log("⚙️ Step 2 - Customization Data:", {
        userId: formData.userId,
        jewelryType: formData.jewelryType,
        customization: {
          sameAsImage: formData.sameAsImage,
          diamondShape: formData.diamondShape,
          diamondSize: formData.diamondSize,
          diamondColor: formData.diamondColor,
          diamondClarity: formData.diamondClarity,
          metal: formData.metal,
          metalColor: formData.metalColor,
          goldKarat: formData.goldKarat,
          ringSize: formData.ringSize,
          engraving: formData.engraving,
          modificationRequest: formData.modificationRequest,
          description: formData.description,
          priority: formData.priority,
          specialInstructions: formData.specialInstructions,
        },
        images: {
          uploadedCount: uploadedFiles.length,
          urlProvided: !!formData.url,
          totalImageSources: uploadedImages.length,
        },
      });
    } else if (step === 3) {
      // Complete API payload structure
      const completePayload = {
        userId: formData.userId,
        jewelryType: formData.jewelryType,

        // Image data - will be handled by FormData in actual API call
        images:
          uploadedFiles.length > 0
            ? uploadedFiles
            : formData.url
            ? [formData.url]
            : [],
        imageUrls: formData.url ? [formData.url] : [],

        // Customization data
        sameAsImage: formData.sameAsImage,
        metal: formData.metal,
        metalColor: formData.metalColor,
        goldKarat: formData.goldKarat,
        diamondShape: formData.diamondShape,
        diamondSize: formData.diamondSize,
        diamondColor: formData.diamondColor,
        diamondClarity: formData.diamondClarity,
        ringSize: formData.ringSize,
        engraving: formData.engraving,
        modificationRequest: formData.modificationRequest,
        description: formData.description,

        // Additional options
        priority: formData.priority,
        specialInstructions: formData.specialInstructions,

        // Contact information (for payment step)
        contactInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          country: formData.country,
          region: formData.region,
          city: formData.city,
          zipCode: formData.zipCode,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        },
      };

      console.log("💳 Step 3 - Complete API Payload:", completePayload);
      console.log(
        "📋 Ready for API call to: POST /api/upload-you-own/complete"
      );
    }
  };

  // removed unused same_as_image state
  const renderStep1 = () => (
    <div className="max-w-6xl mx-auto">
      <StickyTwoColumnLayout
        leftColumn={
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl text-[#1A141F] font-bold mb-4">
                Upload Image Or Share Link
              </h1>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• At least 2 images should be added.</p>
                <p>
                  • The image should only in jpg, jpeg, png or webp formats.
                </p>
                <p>• The image should be less than 5 MB in size.</p>
              </div>
            </div>
            {/* Uploaded Images */}
            <div className="flex gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`View ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-center mt-1">View {index + 1}</p>
                </div>
              ))}
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-[#ABA7AF] rounded-lg p-8 text-center">
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto bg-[#328F94]/10 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-[#328F94]" />
                </div>
                <div>
                  <p className="font-medium">Drag&Drop file here</p>
                  <p className="text-sm text-muted-foreground">or</p>
                  <label htmlFor="file-upload">
                    <Button
                      className="mt-2 bg-[#328F94] text-white hover:bg-white hover:border-2 hover:border-[#328F94] hover:text-[#328F94]"
                      asChild
                    >
                      <div className="">
                        <img
                          src="/svg/vec.svg"
                          alt=""
                          style={{ filter: "invert(1)" }}
                          className=""
                        />
                        <span className="">Choose file</span>
                      </div>
                    </Button>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Maximum upload size 5 MB
                  </p>
                </div>
              </div>
            </div>

            {/* URL Input */}
            {/* <div>
              <p className="text-center text-sm text-muted-foreground mb-4">
                OR
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL</label>
                <Input
                  placeholder="Add URL"
                  value={formData.url}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    setFormData({
                      ...formData,
                      url: newUrl,
                      imageUrls: newUrl ? [newUrl] : [],
                    });

                    console.log("🔗 URL Updated:", {
                      url: newUrl,
                      imageUrls: newUrl ? [newUrl] : [],
                      userId: formData.userId,
                      jewelryType: formData.jewelryType,
                    });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Please upload a URL link to your chosen design or sketch, and
                  we'll review it to help enhance your jewelry creation even
                  further!
                </p>
              </div>
            </div> */}
          </div>
        }
        rightColumn={
          <div className="space-y-6">
            {/* Ring Image Display */}
            <div className="rounded-lg p-8 flex items-center justify-center min-h-64">
              <img
                src="/navigation/upload-your-design/ringdisplay.jpg"
                alt="Ring preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Modification Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tell us what to modify * (Min. 15 characters)
              </label>
              <Input
                placeholder="Enter Input"
                value={formData.modificationRequest}
                onChange={(e) => {
                  const newModification = e.target.value;
                  setFormData({
                    ...formData,
                    modificationRequest: newModification,
                  });

                  console.log("✏️ Modification Request Updated:", {
                    modificationRequest: newModification,
                    length: newModification.length,
                    meetRequirement: newModification.length >= 15,
                  });
                }}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Add Description * (Max. 100 Words)
              </label>
              <Textarea
                placeholder="Enter Description..."
                value={formData.description}
                onChange={(e) => {
                  const newDescription = e.target.value;
                  const wordCount = newDescription.trim().split(/\s+/).length;
                  setFormData({ ...formData, description: newDescription });

                  console.log("📝 Description Updated:", {
                    description: newDescription,
                    characterCount: newDescription.length,
                    wordCount: wordCount,
                    withinLimit: wordCount <= 100,
                  });
                }}
                className="min-h-24"
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length} characters.
              </p>
              <p className="text-xs text-muted-foreground">
                "We want to make sure your ring is exactly how you envision it.
                Please share your thoughts on."
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="same-image"
                  className="rounded border-border"
                  checked={formData.sameAsImage}
                  onChange={(e) => {
                    const sameAsImage = e.target.checked;
                    setFormData({ ...formData, sameAsImage });

                    console.log("🎯 Same as Image Updated:", {
                      sameAsImage,
                      willDisableCustomization: sameAsImage,
                      userId: formData.userId,
                    });
                  }}
                />
                <label htmlFor="same-image" className="text-sm">
                  Same as Image
                </label>
              </div>
            </div>
          </div>
        }
      />

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => updateSteps(2)}
          className="px-8 bg-[#328F94] hover:bg-[#328F94]/90 text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );

  // Update renderStep2 with proper logging
  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Select Diamond & Metal Details
        </h1>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Refine Your Design: Discover Your Perfect Diamond</p>
          <p>
            • Select Shape, Size, Color, Clarity, Quality, Metal Type, Karat,
            Metal Color, Ring Size
          </p>
        </div>
      </div>

      <StickyTwoColumnLayout
        leftColumn={
          <div
            className={`space-y-6 ${
              formData.sameAsImage ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {/* Selected Images */}
            <div>
              <div
                className={`flex items-center justify-between mb-4 ${
                  formData.sameAsImage ? "text-gray-400" : ""
                }`}
              >
                <h3 className="font-medium">Selected Images</h3>
                <Button
                  variant="link"
                  size="sm"
                  className={`text-[#328F94] ${
                    formData.sameAsImage
                      ? "text-gray-400 pointer-events-none"
                      : ""
                  }`}
                >
                  Change Image
                </Button>
              </div>
              <div className="flex gap-4">
                {uploadedImages.slice(0, 2).map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Selected ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <button
                      className={`absolute top-1 right-1 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center ${
                        formData.sameAsImage ? "pointer-events-none" : ""
                      }`}
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Diamond Shape Selection */}
            <div>
              <h3
                className={`font-medium mb-4 ${
                  formData.sameAsImage ? "text-gray-400" : ""
                }`}
              >
                Select Diamond Shape * : {formData.diamondShape}
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {diamondShapes.map((shape) => (
                  <button
                    key={shape.name}
                    onClick={() => {
                      setFormData({ ...formData, diamondShape: shape.name });

                      console.log("💎 Diamond Shape Selected:", {
                        diamondShape: shape.name,
                        userId: formData.userId,
                        sameAsImage: formData.sameAsImage,
                        customizationDisabled: formData.sameAsImage,
                      });
                    }}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-xs ${
                      formData.diamondShape === shape.name
                        ? "bg-[#328F94]/20"
                        : ""
                    } ${
                      formData.sameAsImage
                        ? "text-gray-400 pointer-events-none"
                        : ""
                    }`}
                  >
                    <span className="text-2xl mb-1">{shape.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Diamond Specification */}
            <div>
              <h3
                className={`font-medium mb-4 ${
                  formData.sameAsImage ? "text-gray-400" : ""
                }`}
              >
                Select Diamond Specification
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-lg ">
                  <label
                    className={`text-sm text-muted-foreground ${
                      formData.sameAsImage ? "text-gray-400" : ""
                    }`}
                  >
                    Diamond Size *
                  </label>
                  <Select
                    value={formData.diamondSize}
                    onValueChange={(value) =>
                      setFormData({ ...formData, diamondSize: value })
                    }
                    disabled={formData.sameAsImage}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Center Stone">Center Stone</SelectItem>
                      <SelectItem value="0.5 Carat">0.5 Carat</SelectItem>
                      <SelectItem value="1 Carat">1 Carat</SelectItem>
                      <SelectItem value="1.5 Carat">1.5 Carat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    className={`text-sm text-muted-foreground ${
                      formData.sameAsImage ? "text-gray-400" : ""
                    }`}
                  >
                    Diamond Color & Clarity *
                  </label>
                  <Select
                    value={formData.diamondColor}
                    onValueChange={(value) =>
                      setFormData({ ...formData, diamondColor: value })
                    }
                    disabled={formData.sameAsImage}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Center Stone">Center Stone</SelectItem>
                      <SelectItem value="D-FL">D-FL</SelectItem>
                      <SelectItem value="E-VVS1">E-VVS1</SelectItem>
                      <SelectItem value="F-VVS2">F-VVS2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Metal Type */}
            <div>
              <label
                className={`text-sm text-muted-foreground ${
                  formData.sameAsImage ? "text-gray-400" : ""
                }`}
              >
                Metal Type *
              </label>
              <Select
                value={formData.metal}
                onValueChange={(value) =>
                  setFormData({ ...formData, metal: value })
                }
                disabled={formData.sameAsImage}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gold Karat with logging */}
            <div>
              <label
                className={`text-sm font-medium mb-2 block ${
                  formData.sameAsImage ? "text-gray-400" : ""
                }`}
              >
                Select Gold Karat
              </label>
              <div className="flex gap-2">
                {goldKarat.map((karat) => (
                  <button
                    key={karat}
                    onClick={() => {
                      setFormData({ ...formData, goldKarat: karat });

                      console.log("🥇 Gold Karat Selected:", {
                        goldKarat: karat,
                        metal: formData.metal,
                        metalColor: formData.metalColor,
                        sameAsImage: formData.sameAsImage,
                      });
                    }}
                    className={`px-4 py-2 rounded-md text-sm ${
                      formData.goldKarat === karat
                        ? "bg-[#328F94] text-white"
                        : "bg-muted hover:bg-muted/80"
                    } ${
                      formData.sameAsImage
                        ? "text-gray-400 pointer-events-none"
                        : ""
                    }`}
                  >
                    {karat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        rightColumn={
          <div
            className={`space-y-6 ${
              formData.sameAsImage ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {/* Metal Color */}
            <div>
              <label className="text-sm text-muted-foreground">
                Metal Color: Same as Image
              </label>
              <Select
                value={formData.metalColor}
                onValueChange={(value) =>
                  setFormData({ ...formData, metalColor: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Same as Image">Same as Image</SelectItem>
                  <SelectItem value="Yellow Gold">Yellow Gold</SelectItem>
                  <SelectItem value="White Gold">White Gold</SelectItem>
                  <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ring Size */}
            <div>
              <label className="text-sm text-muted-foreground">
                Ring Size (Indian)
              </label>
              <Input
                placeholder="Write Your Size"
                value={formData.ringSize}
                onChange={(e) =>
                  setFormData({ ...formData, ringSize: e.target.value })
                }
              />
              <Button
                variant="link"
                size="sm"
                className="text-[#328F94] p-0 mt-1"
              >
                Ring Size Guide
              </Button>
            </div>

            {/* Add Engraving - Updated with Popup */}
            <div className="bg-[#328F94]/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-[#328F94] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  +
                </div>
                <span className="font-medium">Add Engraving</span>
              </div>
              <p className="text-sm text-[#8D8A91] mb-3">
                Max 15 characters. We suggest 12 characters or less. More
                characters will make the font size smaller. Engraving will
                appear on the side of the ring on the inside.
              </p>

              {/* Image Selection for Engraving */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-700">
                  Select an image for engraving:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((image, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                        selectedEngravingImage === image
                          ? "border-[#328F94] bg-[#328F94]/10"
                          : "border-gray-200 hover:border-[#328F94]/50"
                      }`}
                      onClick={() => {
                        setSelectedEngravingImage(image);
                        console.log("🖼️ Engraving image selected:", {
                          imageIndex: index,
                          imageUrl: image,
                          userId: formData.userId,
                        });
                      }}
                    >
                      <img
                        src={image}
                        alt={`Engraving option ${index + 1}`}
                        className="w-full h-16 object-cover"
                      />
                      {selectedEngravingImage === image && (
                        <div className="absolute inset-0 bg-[#328F94]/20 flex items-center justify-center">
                          <div className="w-4 h-4 bg-[#328F94] text-white rounded-full flex items-center justify-center text-xs">
                            ✓
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5">
                        View {index + 1}
                      </div>
                    </div>
                  ))}

                  {/* URL Image option if provided */}
                  {formData.url && (
                    <div
                      className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                        selectedEngravingImage === formData.url
                          ? "border-[#328F94] bg-[#328F94]/10"
                          : "border-gray-200 hover:border-[#328F94]/50"
                      }`}
                      onClick={() => {
                        setSelectedEngravingImage(formData.url);
                        console.log("🖼️ URL engraving image selected:", {
                          imageUrl: formData.url,
                          userId: formData.userId,
                        });
                      }}
                    >
                      <img
                        src={formData.url}
                        alt="URL engraving option"
                        className="w-full h-16 object-cover"
                      />
                      {selectedEngravingImage === formData.url && (
                        <div className="absolute inset-0 bg-[#328F94]/20 flex items-center justify-center">
                          <div className="w-4 h-4 bg-[#328F94] text-white rounded-full flex items-center justify-center text-xs">
                            ✓
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5">
                        URL Image
                      </div>
                    </div>
                  )}
                </div>

                {/* Proceed to Engraving Button */}
                <Button
                  onClick={() => {
                    if (!selectedEngravingImage) {
                      alert("Please select an image for engraving first.");
                      return;
                    }

                    console.log("🎨 Opening engraving popup with image:", {
                      selectedImage: selectedEngravingImage,
                      jewelryType: formData.jewelryType,
                      userId: formData.userId,
                    });

                    setShowEngravingPopup(true);
                  }}
                  className={`w-full text-sm py-2 transition-all ${
                    selectedEngravingImage
                      ? "bg-[#328F94] text-white hover:bg-[#328F94]/90"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!selectedEngravingImage}
                >
                  {selectedEngravingImage
                    ? "Proceed to Engraving"
                    : "Select Image First"}
                </Button>

                {/* Current Engraving Display */}
                {formData.engraving && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-700">
                      <strong>Current Engraving:</strong> "{formData.engraving}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        }
      />

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => updateSteps(1)}
          className="border-[#328F94] text-[#328F94] hover:bg-[#328F94] hover:text-white"
        >
          Back
        </Button>
        <Button
          onClick={() => updateSteps(3)}
          className="bg-[#328F94] hover:bg-[#328F94]/90 text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );

  // Update renderStep3 with API call simulation
  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
      {!authUser && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-700">
            Please log in to proceed with payment.
          </p>
        </div>
      )}
      {showPaymentForm && orderData && authUser ? (
        <PaymentForm
          orderData={orderData}
          userInfo={{
            userId: authUser.id || "",
            firstName: authUser.firstName || formData.firstName,
            lastName: authUser.lastName || formData.lastName,
            email: authUser.email || formData.email,
            phone: authUser.phoneNumber || formData.phoneNumber,
            address: formData.address,
            city: formData.city,
            state: formData.region,
            zipCode: formData.zipCode,
            country: formData.country,
          }}
          onPaymentInitiated={handlePaymentInitiated}
          onError={handlePaymentError}
        />
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Secure Payment</h1>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Complete your purchase with 100% secure transactions.</p>
              <p>• Pay via Card/Debit Card, UPI, Net Banking, or Wallets.</p>
              <p>
                • View a detailed product summary, including design choices and
                pricing, with the option to make final edits.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Selected Images Summary */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Selected Images</h3>
                  <Button variant="link" size="sm" className="text-[#328F94]">
                    Change Image
                  </Button>
                </div>
                <div className="flex gap-4">
                  {uploadedImages.slice(0, 3).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Final ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center">
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Properties */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Selected Properties</h3>
                  <Button variant="link" size="sm" className="text-[#328F94]">
                    Change Properties
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Diamond Shape:
                    </span>
                    <span className="text-sm">{formData.diamondShape}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Diamond Size:
                      </span>
                      <div>{formData.diamondSize}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Diamond Color & Clarity:
                      </span>
                      <div>{formData.diamondColor}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Metal Type:</span>
                      <div>{formData.metal}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gold Karat:</span>
                      <div>{formData.goldKarat}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Metal Color:
                      </span>
                      <div>{formData.metalColor}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ring Size:</span>
                      <div>{formData.ringSize}</div>
                    </div>
                  </div>
                  {formData.engraving && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Engraving Added:
                      </span>
                      <span className="text-sm">{formData.engraving}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="font-medium mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm">Enter Your Name *</label>
                      <Input
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="mt-6"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm">Address *</label>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm">Country *</label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) =>
                          setFormData({ ...formData, country: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="india">India</SelectItem>
                          <SelectItem value="usa">USA</SelectItem>
                          <SelectItem value="uk">UK</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm">Region/State *</label>
                      <Select
                        value={formData.region}
                        onValueChange={(value) =>
                          setFormData({ ...formData, region: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maharashtra">
                            Maharashtra
                          </SelectItem>
                          <SelectItem value="delhi">Delhi</SelectItem>
                          <SelectItem value="bengaluru">Bengaluru</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm">City *</label>
                      <Select
                        value={formData.city}
                        onValueChange={(value) =>
                          setFormData({ ...formData, city: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mumbai">Mumbai</SelectItem>
                          <SelectItem value="pune">Pune</SelectItem>
                          <SelectItem value="delhi">Delhi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm">Zip Code *</label>
                      <Input
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm">Phone Number *</label>
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="save-info"
                      className="rounded border-border"
                    />
                    <label htmlFor="save-info" className="text-sm">
                      Save This For Future Use
                    </label>
                  </div>
                </div>
              </div>

              {/* Service Cost */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium mb-4">
                  Service Cost For Customisations
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Value</span>
                    <span>₹6500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST</span>
                    <span>18%</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>₹7,670</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={createOrder}
                className="w-full bg-[#328F94] hover:bg-[#328F94]/90 text-white"
              >
                {!Loading ? "Create Order →" : "Creating Order..."}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Need assistance? Call us at 080-61919123</p>
                <p className="font-medium text-red-500">
                  * Your custom jewelry is in progress till proper and organised
                  within 7 business days
                </p>
                <p className="font-medium text-red-500">
                  * Upon order confirmation, this amount will be adjusted in
                  your total value.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => updateSteps(2)}
              className="border-[#328F94] text-[#328F94] hover:bg-[#328F94] hover:text-white"
            >
              Back
            </Button>
            {/* <Button
              onClick={createOrder}
              className="bg-[#328F94] hover:bg-[#328F94]/90 text-white"
            >
              Create Order →
            </Button> */}
          </div>

          {/* Order Status Display */}
          {createdOrderId && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Order Created Successfully!
              </h3>
              <p className="text-sm text-green-700">
                <strong>Order ID:</strong> {createdOrderId}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Your custom jewelry order has been submitted and is ready for
                payment.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.number <= currentStep
                  ? "bg-[#328F94] text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.number}
            </div>
            <span
              className={`text-xs mt-2 text-center max-w-20 ${
                step.number <= currentStep
                  ? "text-[#328F94] font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-1 mb-6 mx-4 ${
                step.number < currentStep ? "bg-[#328F94]" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const handleCloseEngraving = () => {
    setShowEngravingPopup(false);
  };

  const handleEngravingSaved = async (
    engravingText: string,
    engravingImageUrl?: string
  ) => {
    console.log("💾 Engraving saved:", { engravingText, engravingImageUrl });

    // Update form data with engraving text
    setFormData((prev) => ({ ...prev, engraving: engravingText }));

    // If we received an engraved image URL (blob URL), convert it to blob and store
    if (engravingImageUrl) {
      try {
        // Fetch the blob from the blob URL
        const response = await fetch(engravingImageUrl);
        const blob = await response.blob();
        
        // Store both blob and display URL
        setEngravingBlobs((prev) => [...prev, { blob, url: engravingImageUrl }]);
        setUploadedImages((prev) => [...prev, engravingImageUrl]);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, engravingImageUrl],
        }));

        console.log("🖼️ Added engraved image blob to collection:", {
          blobSize: blob.size,
          blobType: blob.type,
          displayUrl: engravingImageUrl
        });
      } catch (error) {
        console.error("❌ Error converting engraved image to blob:", error);
      }
    }

    setShowEngravingPopup(false);
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      console.log("🚀 Starting order creation process...");

      // Ensure we have the latest userId
      const currentUserId = getUserId();
      if (!currentUserId) {
        alert("Please login to proceed with order creation.");
        navigate("/login");
        return;
      }

      // Update formData with current userId
      const updatedFormData = { ...formData, userId: currentUserId };

      // Prepare the complete payload for upload-you-own API
      const formDataPayload = new FormData();

      // Add basic information with ensured userId
      formDataPayload.append("userId", currentUserId);
      formDataPayload.append("jewelryType", updatedFormData.jewelryType);

      // Add uploaded files (original images)
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach((file, index) => {
          formDataPayload.append("images", file);
          console.log(`📎 Adding original file ${index + 1}:`, {
            name: file.name,
            size: file.size,
            type: file.type,
          });
        });
      }

      // Add engraved images as files for batch upload
      if (engravingBlobs.length > 0) {
        engravingBlobs.forEach((engravingData, index) => {
          // Convert blob to File object with proper name
          const engravingFile = new File(
            [engravingData.blob], 
            `engraved-image-${index + 1}.png`, 
            { type: 'image/png' }
          );
          formDataPayload.append("images", engravingFile);
          console.log(`🎨 Adding engraved file ${index + 1}:`, {
            name: engravingFile.name,
            size: engravingFile.size,
            type: engravingFile.type,
          });
        });
      }

      // Add image URLs if provided
      if (formData.url) {
        formDataPayload.append("imageUrls", formData.url);
        console.log("🔗 Adding URL:", formData.url);
      }

      // Add customization data
      formDataPayload.append("sameAsImage", formData.sameAsImage.toString());
      formDataPayload.append(
        "modificationRequest",
        formData.modificationRequest
      );
      formDataPayload.append("description", formData.description);
      formDataPayload.append("diamondShape", formData.diamondShape);
      formDataPayload.append("diamondSize", formData.diamondSize);
      formDataPayload.append("diamondColor", formData.diamondColor);
      formDataPayload.append("diamondClarity", formData.diamondClarity);
      formDataPayload.append("metal", formData.metal);
      formDataPayload.append("metalColor", formData.metalColor);
      formDataPayload.append("goldKarat", formData.goldKarat);
      formDataPayload.append("ringSize", formData.ringSize);
      formDataPayload.append("engraving", formData.engraving);
      formDataPayload.append("priority", formData.priority);
      formDataPayload.append(
        "specialInstructions",
        formData.specialInstructions
      );

      console.log("📦 Complete order payload prepared:", {
        userId: currentUserId,
        jewelryType: updatedFormData.jewelryType,
        originalFilesCount: uploadedFiles.length,
        engravingBlobsCount: engravingBlobs.length,
        totalImagesCount: uploadedFiles.length + engravingBlobs.length,
        hasUrl: !!formData.url,
        sameAsImage: formData.sameAsImage,
        customization: {
          diamondShape: formData.diamondShape,
          metal: formData.metal,
          goldKarat: formData.goldKarat,
          engraving: formData.engraving,
        },
        contactInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        },
      });

      // Debug: output uploadedFiles and engravingBlobs before sending
      console.log("🔍 Debug pre-upload:", {
        originalFilesCount: uploadedFiles.length,
        originalFilesPreview: uploadedFiles.map((f) => ({
          name: f.name,
          size: f.size,
        })),
        engravingBlobsCount: engravingBlobs.length,
        engravingBlobsPreview: engravingBlobs.map((e, index) => ({
          index: index + 1,
          size: e.blob.size,
          type: e.blob.type,
          displayUrl: e.url.substring(0, 50) + '...'
        })),
        totalImagesForUpload: uploadedFiles.length + engravingBlobs.length,
        formDataImages: formData.images,
        formDataUrl: formData.url,
      });

      //check if user is authenticated
      if (!authUser) {
        alert("Please login to proceed with order creation.");
        navigate("/login");
        return;
      }

      // Make API call to create jewelry order
      const response = await fetch("http://localhost:5000/api/rings/upload", {
        method: "POST",
        body: formDataPayload,
      });

      const result = await response.json();

      console.log("🎯 API Response received:", {
        status: response.status,
        success: result.success,
        message: result.message,
        data: result.data,
      });

      // Debug: explicitly log returned image list from backend
      console.log("🔍 Backend returned images:", result.data?.images);

      if (result.success) {
        alert("✅ Order created successfully!");
        console.log("📋 Complete order details:", result.data);
        alert(result.data.images);

        // Ensure returned image URLs are stored in state for use in payment
        if (result.data?.images && Array.isArray(result.data.images)) {
          console.log(
            "✅ Setting uploadedImages and formData.images from backend response:",
            result.data.images
          );
          setUploadedImages(result.data.images);
          setFormData((prev) => ({ ...prev, images: result.data.images }));
        } else {
          console.warn(
            "⚠️ No images returned from backend after upload",
            result.data?.images
          );
        }

        // Extract jewelry ID from multiple possible response structures
        const jewelryId =
          result.data?.ringId ||
          result.data?.jewelryId ||
          result.data?._id ||
          result.data?.id ||
          "";

        console.log("🆔 Extracted jewelry ID:", jewelryId);

        setCreatedOrderId(jewelryId);

        // Generate payment order data with proper IDs
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substr(2, 9);
        const orderId = `KYNA${timestamp}${randomSuffix}`;

        const basePrice = 6500;
        const gst = Math.round(basePrice * 0.18);
        const totalAmount = basePrice + gst;

        const paymentOrderData = {
          orderId,
          orderNumber: orderId,
          orderCategory: 'design-your-own',
          orderType: 'customized',
          amount: totalAmount,
          items: [
            {
              name: `Custom ${updatedFormData.jewelryType} Design${
                jewelryId ? ` - ${jewelryId}` : ""
              }`,
              quantity: 1,
              price: totalAmount,
            },
          ],
          jewelryId: jewelryId || `custom_${timestamp}`,
          userId: currentUserId, // Use the reliably obtained userId
          customData: {
            jewelryType: updatedFormData.jewelryType,
            customizationComplete: true,
            backendJewelryId: jewelryId,
          },
          // Comprehensive order details with all customization data
          orderDetails: {
            jewelryType: updatedFormData.jewelryType,
            description: formData.description || `Custom ${updatedFormData.jewelryType} Design`,
            
            // Images from all steps
            images: result.data?.images?.map((url: string, index: number) => ({
              url,
              source: "cloudinary",
              step: "design",
              alt: `Custom ${updatedFormData.jewelryType} design image ${index + 1}`,
              uploadedAt: new Date().toISOString(),
            })) || [],
            
            // Diamond selection details from form
            diamond: {
              shape: formData.diamondShape,
              size: formData.diamondSize,
              color: formData.diamondColor,
              clarity: formData.diamondClarity,
            },
            
            // Metal and setting details
            metal: {
              type: formData.metal || "Gold",
              color: formData.metalColor || "Same as Image",
              karat: formData.goldKarat || "22KT",
            },
            
            // Ring specific details
            ringDetails: {
              size: formData.ringSize,
              jewelryType: updatedFormData.jewelryType,
            },
            
            // All step data for complete history
            stepData: {
              step1: {
                jewelryType: updatedFormData.jewelryType,
                sameAsImage: formData.sameAsImage,
                modificationRequest: formData.modificationRequest
              },
              step2: {
                diamondShape: formData.diamondShape,
                diamondSize: formData.diamondSize,
                diamondColor: formData.diamondColor,
                diamondClarity: formData.diamondClarity
              },
              step3: {
                metal: formData.metal,
                metalColor: formData.metalColor,
                goldKarat: formData.goldKarat,
                ringSize: formData.ringSize
              },
              step4: {
                engraving: formData.engraving,
                priority: formData.priority,
                specialInstructions: formData.specialInstructions
              },
              step5: {
                imagesUploaded: result.data?.images?.length || 0,
                reviewCompleted: true,
                timestamp: new Date().toISOString()
              }
            },
            
            // Additional customization
            engraving: {
              text: formData.engraving,
            },
            
            // Special requests and notes
            specialRequests: formData.specialInstructions || "",
            notes: `Custom ${updatedFormData.jewelryType} designed through ring builder. Priority: ${formData.priority}`,
            
            // Contact information included
            contactInfo: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              address: formData.address,
              country: formData.country,
              region: formData.region,
              phoneNumber: formData.phoneNumber
            },
            
            // Completion status
            customizationComplete: true,
            completedSteps: ["step1", "step2", "step3", "step4", "step5"],
            
            // Reference IDs
            backendJewelryId: jewelryId,
            designId: `design_${timestamp}`,
            
            // Pricing breakdown
            priceBreakdown: {
              basePrice: basePrice,
              gst: gst,
              total: totalAmount
            }
          },
          // Include uploaded image URLs returned from backend (Cloudinary)
          images:
            result.data?.images?.map((url: string) => ({
              url,
              source: "cloudinary",
              uploadedAt: new Date().toISOString(),
            })) || [],
        };

        console.log(
          "💳 PAYMENT ORDER DATA IMAGES:",
          JSON.stringify(paymentOrderData.images)
        );
        console.log(
          "💳 PAYMENT ORDER DATA IMAGES COUNT:",
          paymentOrderData.images?.length || 0
        );

        if (!paymentOrderData.images || paymentOrderData.images.length === 0) {
          console.error("❌ CRITICAL: paymentOrderData.images is empty!");
          console.log(
            "� result.data.images was:",
            JSON.stringify(result.data?.images)
          );
        }

        // ALERT TO CONFIRM IMAGES ARE SET
        alert(
          `RINGBUILDER: Setting orderData with ${
            paymentOrderData.images?.length || 0
          } images`
        );

        setOrderData(paymentOrderData as PaymentOrderType);
        setShowPaymentForm(true);

        // Automatically navigate to step 3 to show the PaymentForm
        setCurrentStep(3);

        alert(
          `Order created successfully! ${
            jewelryId ? `Jewelry ID: ${jewelryId}` : "Ready for payment"
          }`
        );
        setLoading(false);
      } else {
        console.error("❌ Order creation failed:", result.message);
        alert(`Failed to create order: ${result.message}`);
      }
    } catch (error) {
      console.error("💥 Order creation error:", error);
      alert(
        `Error creating order: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Add the missing payment handler functions
  const handlePaymentInitiated = (orderId: string, ...rest: unknown[]) => {
    // PaymentForm may call with an optional second argument (orderNumber); capture it via rest params
    const orderNumber = rest[0] as string | undefined;
    console.log("✅ Payment initiated for order:", orderId, orderNumber);
    // Could save order info locally or send to backend
  };

  const handlePaymentError = (error: string) => {
    console.error("❌ Payment error:", error);
    alert(`Payment Error: ${error}`);
    setShowPaymentForm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="text-sm text-gray-600">
          <Link to="/" className="hover:text-teal-600">
            Home
          </Link>
          <span className="mx-2">-</span>
          <span className="text-gray-800">Upload Your Design</span>
          <span className="mx-2">-</span>
          <span className="text-gray-800">Rings</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderStepIndicator()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Engraving Popup */}
      {showEngravingPopup && (
        <EngravingPage
          onClose={handleCloseEngraving}
          selectedImage={selectedEngravingImage}
          jewelryType={formData.jewelryType}
          userId={formData.userId}
          onSave={handleEngravingSaved}
        />
      )}
    </div>
  );
}
