import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import EngravingPage from "../Engrave";

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

export default function PendantBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedEngravingImage, setSelectedEngravingImage] = useState<string>("");
  const [showEngravingPopup, setShowEngravingPopup] = useState(false);
  const [engravingBlobs, setEngravingBlobs] = useState<{ blob: Blob; url: string }[]>([]);
  const [Loading, setLoading] = useState<boolean>(false);
  const [serviceabilityStatus, setServiceabilityStatus] = useState<'idle' | 'checking' | 'serviceable' | 'not-serviceable'>('idle');
  const [serviceabilityMessage, setServiceabilityMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    sameAsImage: false,
    url: "",
    modification: "",
    description: "",
    diamondShape: "Round",
    diamondSize: "Center Stone",
    diamondColor: "Center Stone",
    metalType: "Gold",
    metalColor: "Same as Image",
    pendantSize: "",
    goldKarat: "22KT",
    engraving: "",
    userId: "",
    firstName: "",
    lastName: "",
    address: "",
    country: "",
    region: "",
    city: "",
    zipCode: "",
    email: "",
    phoneNumber: "",
  });

  // Cleanup blob URLs on component unmount
  useEffect(() => {
    return () => {
      engravingBlobs.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [engravingBlobs]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const incoming = Array.from(files);

      // Filter valid type/size
      const validFiles = incoming.filter((file) => {
        const isValidType = allowed.includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        if (!isValidType) {
          alert(`File ${file.name} is not a supported image type.`);
        }
        if (!isValidSize) {
          alert(`File ${file.name} exceeds 5MB.`);
        }
        return isValidType && isValidSize;
      });

      // Limit total images to max 5
      const maxAllowed = 5;
      const availableSlots = Math.max(0, maxAllowed - uploadedImages.length);
      if (availableSlots === 0) {
        alert(`You can upload a maximum of ${maxAllowed} images.`);
        return;
      }

      const filesToAdd = validFiles.slice(0, availableSlots);
      if (validFiles.length > filesToAdd.length) {
        alert(`Only ${availableSlots} more image(s) can be added. Extra files were skipped.`);
      }

      const imageUrls = filesToAdd.map((file) => URL.createObjectURL(file));

      // Use functional update to avoid stale state and ensure the total never exceeds maxAllowed
      setUploadedImages((prev) => {
        if (prev.length >= maxAllowed) return prev.slice(0, maxAllowed);
        const merged = [...prev, ...imageUrls];
        return merged.slice(0, maxAllowed);
      });

      // Clear the file input value so the same files can be selected again if needed
      const input = document.getElementById("file-upload") as HTMLInputElement | null;
      if (input) input.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const updateSteps = (step: number) => {
    setCurrentStep(step);
  };

  // Step-aware validation to avoid requiring fields from later steps
  const validateForStep = (targetStep: number): boolean => {
    // Step 1 -> 2: ensure uploads + modification + description
    if (targetStep === 2) {
      if (uploadedImages.length < 2) {
        alert("Please upload at least 2 images before proceeding.");
        return false;
      }

      if (!formData.modification || formData.modification.trim().length < 15) {
        alert("Please provide a modification description (min 15 characters).");
        return false;
      }

      if (!formData.description || formData.description.trim() === "") {
        alert("Please provide a description (max 100 words).");
        return false;
      }

      const descWords = formData.description.trim().split(/\s+/).filter(Boolean).length;
      if (descWords > 100) {
        alert("The description field must not exceed 100 words.");
        return false;
      }

      return true;
    }

    // Step 2 -> 3: ensure customization fields only (contact validated at payment)
    if (targetStep === 3) {
      // ensure step1 checks are satisfied first
      if (!validateForStep(2)) return false;

      const customizationFields: Array<keyof typeof formData> = [
        "diamondShape",
        "diamondSize",
        "diamondColor",
        "metalType",
        "metalColor",
        "goldKarat",
        "pendantSize",
      ];

      for (const field of customizationFields) {
        const value = formData[field];
        if (typeof value === "string") {
          if (!value || value.trim() === "") {
            alert(`Please fill out the ${field} field.`);
            return false;
          }
        }
      }

      return true;
    }

    return true;
  };

  const handleNextStep = (step: number) => {
    if (validateForStep(step)) setCurrentStep(step);
  };

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
        
        // Store only ONE engraved blob (replace previous if exists)
        setEngravingBlobs([{ blob, url: engravingImageUrl }]);
        
        // Add to uploaded images for preview (blob URL - will be converted to File later during upload)
        setUploadedImages((prev) => {
          // Remove any previous engraved images
          const filtered = prev.filter(img => !engravingBlobs.some(eb => eb.url === img));
          return [...filtered, engravingImageUrl];
        });

        console.log("🖼️ Added single engraved image (replaces any previous):", {
          blobSize: blob.size,
          blobType: blob.type,
          displayUrl: engravingImageUrl,
          willUploadWith: "other images on Request Customization"
        });

        alert("✅ Engraving created! Will be uploaded with your customization request.");
      } catch (error) {
        console.error("❌ Error converting engraved image to blob:", error);
      }
    }

    // Close the modal
    setShowEngravingPopup(false);
  };

  // Function to check serviceability using Sequel247 API
  const checkServiceability = async (pinCode: string): Promise<boolean> => {
    if (!pinCode || pinCode.length !== 6 || !/^\d{6}$/.test(pinCode)) {
      setServiceabilityStatus('idle');
      setServiceabilityMessage('');
      return false;
    }

    try {
      setServiceabilityStatus('checking');
      setServiceabilityMessage('Checking serviceability...');
      console.log("🚀 Checking serviceability for pincode:", pinCode);
      
      const response = await fetch("https://test.sequel247.com/api/checkServiceability", {
        method: "POST",
        body: JSON.stringify({
          token: "b228a27399f07927985d57c0f7d94ce8",
          pin_code: pinCode,
        }),
      });

      const result = await response.json();
      console.log("📍 Serviceability check result:", result);

      // Handle API returning boolean true or string variants like 'true', 'True', '1'
      const statusRaw = result?.status;
      console.debug('🔎 Raw serviceability status from API:', statusRaw, typeof statusRaw);
      const statusStr = statusRaw == null ? '' : String(statusRaw).trim().toLowerCase();
      const isServiceableApi =
        statusRaw === true || ['true', '1', 'yes'].includes(statusStr);

      if (isServiceableApi) {
        setServiceabilityStatus('serviceable');
        setServiceabilityMessage('✅ Great! This area is serviceable for delivery.');
        return true;
      } else {
        setServiceabilityStatus('not-serviceable');
        setServiceabilityMessage('❌ Sorry, this area is not serviceable for delivery.');
        return false;
      }
    } catch (error) {
      console.error("❌ Error checking serviceability:", error);
      setServiceabilityStatus('idle');
      setServiceabilityMessage('⚠️ Unable to check serviceability. Please try again.');
      return false;
    }
  };

  const requestCustomization = async () => {
    try {
      setLoading(true);
      console.log("🎨 Starting customization request process...");

      // Check if zip code is provided and valid
      if (!formData.zipCode) {
        alert("Please enter your zip code before creating the customization request.");
        setLoading(false);
        return;
      }

      if (formData.zipCode.length !== 6 || !/^\d{6}$/.test(formData.zipCode)) {
        alert("Please enter a valid 6-digit pincode.");
        setLoading(false);
        return;
      }

      // Check if serviceability has been verified
      if (serviceabilityStatus !== 'serviceable') {
        if (serviceabilityStatus === 'not-serviceable') {
          alert("❌ Sorry, we cannot process customization requests to your area as it is not serviceable. Please contact customer support for more information.");
          setLoading(false);
          return;
        } else if (serviceabilityStatus === 'checking') {
          alert("Please wait while we check if your area is serviceable.");
          setLoading(false);
          return;
        } else {
          // Status is 'idle' - need to check serviceability
          console.log("📍 Checking serviceability for pincode:", formData.zipCode);
          const isServiceable = await checkServiceability(formData.zipCode);
          
          if (!isServiceable) {
            alert("❌ Sorry, we cannot process customization requests to your area as it is not serviceable. Please contact customer support for more information.");
            setLoading(false);
            return;
          }
        }
      }

      console.log("✅ Area is serviceable, proceeding with customization request...");

      // TODO: Add backend integration to create customization request
      // This would submit the formData and engravingBlobs to your backend
      alert("Customization request will be processed!");
      setLoading(false);
    } catch (error) {
      console.error("❌ Error creating customization request:", error);
      alert("Failed to create customization request. Please try again.");
      setLoading(false);
    }
  };

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
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
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
            {/* Pendant Image Display */}
            <div className="rounded-lg p-8 flex items-center justify-center min-h-64">
              <img
                src="/navigation/upload-your-design/pendantdisplay.jpg"
                alt="Pendant preview"
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
                value={formData.modification}
                onChange={(e) =>
                  setFormData({ ...formData, modification: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="min-h-24"
              />
              <p className="text-xs text-muted-foreground">0 characters.</p>
              <p className="text-xs text-muted-foreground">
                "We want to make sure your pendant is exactly how you envision
                it. Please share your thoughts on."
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="same-image"
                  className="rounded border-border"
                  checked={formData.sameAsImage}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      sameAsImage: checked,
                      diamondShape: checked ? "Same as Image" : prev.diamondShape || "Round",
                      metalColor: checked ? "Same as Image" : prev.metalColor || "White Gold",
                    }));
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
          onClick={() => handleNextStep(2)}
          className="px-8 bg-[#328F94] hover:bg-[#328F94]/90 text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );

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
            Metal Color, Pendant Size
          </p>
        </div>
      </div>

      <StickyTwoColumnLayout
        leftColumn={
          <div className="space-y-6">
            {/* Selected Images */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Selected Images</h3>
                <Button variant="link" size="sm" className="text-[#328F94]">
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
                    <button className="absolute top-1 right-1 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                      <Edit className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Diamond Shape Selection */}
            <div>
              <h3 className="font-medium mb-4">
                Select Diamond Shape * : {formData.diamondShape}
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {formData.sameAsImage ? (
                  <div className="col-span-5 p-4 rounded-lg bg-gray-50 border border-neutral-200 text-sm text-gray-600">
                    Same as Image
                  </div>
                ) : (
                  diamondShapes.map((shape) => (
                    <button
                      key={shape.name}
                      onClick={() =>
                        setFormData({ ...formData, diamondShape: shape.name })
                      }
                      className={`aspect-square  rounded-2xl flex flex-col items-center justify-center p-2 text-xs ${
                        formData.diamondShape === shape.name
                          ? "bg-[#328F94]/20"
                          : ""
                      }`}
                    >
                      <span className="text-2xl mb-1">{shape.icon}</span>
                      {/* <span>{shape.name}</span> */}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Diamond Specification */}
            <div>
              <h3 className="font-medium mb-4">Select Diamond Specification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Diamond Size *
                  </label>
                  <Select
                    value={formData.diamondSize}
                    onValueChange={(value) =>
                      setFormData({ ...formData, diamondSize: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Center Stone">Center Stone</SelectItem>
                      <SelectItem value="0.5 Carat">0.5 Carat</SelectItem>
                      <SelectItem value="1 Carat">1 Carat</SelectItem>
                      <SelectItem value="1.5 Carat">1.5 Carat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Diamond Color & Clarity *
                  </label>
                  <Select
                    value={formData.diamondColor}
                    onValueChange={(value) =>
                      setFormData({ ...formData, diamondColor: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
              <label className="text-sm text-muted-foreground">
                Metal Type *
              </label>
              <Select
                value={formData.metalType}
                onValueChange={(value) =>
                  setFormData({ ...formData, metalType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gold Karat */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Gold Karat
              </label>
              <div className="flex gap-2">
                {goldKarat.map((karat) => (
                  <button
                    key={karat}
                    onClick={() =>
                      setFormData({ ...formData, goldKarat: karat })
                    }
                    className={`px-4 py-2 rounded-md text-sm ${
                      formData.goldKarat === karat
                        ? "bg-[#328F94] text-white"
                        : "bg-muted hover:bg-muted/80"
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
          <div className="space-y-6">
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
                disabled={formData.sameAsImage}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Same as Image">Same as Image</SelectItem>
                  <SelectItem value="Yellow Gold">Yellow Gold</SelectItem>
                  <SelectItem value="White Gold">White Gold</SelectItem>
                  <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pendant Size */}
            <div>
              <label className="text-sm text-muted-foreground">
                Chain Length(inches)
              </label>
              <Input
                placeholder="Write Your Size"
                value={formData.pendantSize}
                onChange={(e) =>
                  setFormData({ ...formData, pendantSize: e.target.value })
                }
              />
              <Button
                variant="link"
                size="sm"
                className="text-[#328F94] p-0 mt-1"
              >
                Pendant Size Guide
              </Button>
            </div>

            {/* Add Engraving */}
            <div className="space-y-3">
              <div className="bg-[#328F94]/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#328F94] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    +
                  </div>
                  <span className="font-medium">Add Engraving</span>
                </div>
                <p className="text-xs font-medium text-gray-700 mb-3">
                  Select an image for engraving:
                </p>
                <div className="grid grid-cols-3 gap-2 mb-3">
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
                </div>

                <Button
                  onClick={() => {
                    if (!selectedEngravingImage) {
                      alert("Please select an image for engraving first.");
                      return;
                    }

                    console.log("🎨 Opening engraving popup with image:", {
                      selectedImage: selectedEngravingImage,
                      jewelryType: "pendant",
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
                      ✓ Engraving: <span className="font-semibold">{formData.engraving}</span>
                    </p>
                  </div>
                )}

                <p className="text-sm text-[#8D8A91] mt-3">
                  Max 15 characters. We suggest 12 characters or less. More
                  characters will make the font size smaller. Engraving will
                  appear on the back of the pendant.
                </p>
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
          onClick={() => handleNextStep(3)}
          className="bg-[#328F94] hover:bg-[#328F94]/90 text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
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
                  <span className="text-muted-foreground">Diamond Size:</span>
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
                  <div>{formData.metalType}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Gold Karat:</span>
                  <div>{formData.goldKarat}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Metal Color:</span>
                  <div>{formData.metalColor}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Pendant Size:</span>
                  <div>{formData.pendantSize}</div>
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
            {/* Engraving input (uses existing engraving field) */}
            <div className="mb-4">
              <label className="text-sm">Engraving (optional)</label>
              <Input
                placeholder="Text to engrave"
                value={formData.engraving}
                onChange={(e) =>
                  setFormData({ ...formData, engraving: e.target.value })
                }
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">Max 30 characters</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Enter Your Name *</label>
                  <Input
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
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
                    <SelectContent>
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
                      <SelectItem value="maharashtra">Maharashtra</SelectItem>
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value.replace(/\D/g, "") })
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
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, "") })
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
            onClick={requestCustomization}
            className="w-full mt-3 bg-[#328F94] hover:bg-[#328F94]/90 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={Loading || !formData.zipCode || serviceabilityStatus !== 'serviceable'}
          >
            {Loading ? "Creating Request..." : 
             !formData.zipCode ? "Enter Pincode First" :
             serviceabilityStatus === 'checking' ? "Checking Area..." :
             serviceabilityStatus === 'not-serviceable' ? "Area Not Serviceable" :
             serviceabilityStatus !== 'serviceable' ? "Check Pincode Serviceability" :
             "Request Customization →"}
          </Button>

          {serviceabilityMessage && (
            <p className={`text-sm mt-2 text-center ${
              serviceabilityStatus === 'serviceable' ? 'text-green-600' :
              serviceabilityStatus === 'not-serviceable' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {serviceabilityMessage}
            </p>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Need assistance? Call us at 080-61919123</p>
            <p className="font-medium text-red-500">
              * Your custom jewelry is in progress till proper and organised
              within 7 business days
            </p>
            <p className="font-medium text-red-500">
              * Upon order confirmation, this amount will be adjusted in your
              total value.
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
      </div>
    </div>
  );

  return (
    <>
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
            <span className="text-gray-800">Pendants</span>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {renderStepIndicator()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>

      {/* Engraving Modal - Outside main container for proper z-index */}
      {showEngravingPopup && (
        <EngravingPage
          onClose={handleCloseEngraving}
          selectedImage={selectedEngravingImage}
          jewelryType="pendant"
          userId={formData.userId}
          onSave={handleEngravingSaved}
        />
      )}
    </>
  );
}
