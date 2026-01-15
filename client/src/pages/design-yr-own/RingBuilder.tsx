import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Progress } from "@/components/ui/progress";
import { X, Edit, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { StickyTwoColumnLayout } from "@/components/StickyTwoColumnLayout";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import EngravingPage from "../Engrave";
import CustomizationPaymentForm from "@/components/CustomizationPaymentForm";
import RingSizeGuidePopup from "@/components/RingSizeGuidePopup";

const steps = [
  { number: 1, title: "Inspiration Upload", active: true },
  { number: 2, title: "Customize Properties", active: false },
  { number: 3, title: "Secure Payment", active: false },
];

const diamondShapes = [
  {
    name: "Round",
    icon: (
      <img
        src="/DIAMOND_SHAPES_WEBP/round.png"
        alt="Round"
        className="h-8 w-8 object-contain"
      />
    ),
  },
  {
    name: "Princess",
    icon: (
      <img
        src="/DIAMOND_SHAPES_WEBP/princess.png"
        alt="Princess"
        className="h-8 w-8 object-contain"
      />
    ),
  },
  {
    name: "Cushion",
    icon: (
      <img
        src="/DIAMOND_SHAPES_WEBP/cushion.png"
        alt="Cushion"
        className="h-8 w-8 object-contain"
      />
    ),
  },
  {
    name: "Oval",
    icon: (
      <img
        src="/DIAMOND_SHAPES_WEBP/oval.png"
        alt="Oval"
        className="h-7 w-8 object-contain"
      />
    ),
  },
  {
    name: "Emerald",
    icon: (
      <img
        src="/DIAMOND_SHAPES_WEBP/emerald.png"
        alt="Emerald"
        className="h-9 w-7 object-contain"
      />
    ),
  },
  {
    name: "Asscher",
    icon: (
      <img
        src="/DIAMOND_SHAPES_WEBP/asscher.png"
        alt="Asscher"
        className="h-8 w-8 object-contain"
      />
    ),
  },
  {
    name: "Radiant",
    icon: (
      <img
        src="/DIAMOND_SHAPES_WEBP/radient.jpg"
        alt="Radiant"
        className="h-10 w-10 object-contain"
      />
    ),
  },
  {
    name: "Pear",
    icon: (
      <img
        src="/DIAMOND_SHAPES_WEBP/pear.png"
        alt="Pear"
        className="h-9 w-7 object-contain"
      />
    ),
  },
  {
    name: "Marquise",
    icon: (
      <img
        src="/DIAMOND_SHAPES_WEBP/marquise.png"
        alt="Marquise"
        className="h-9 w-6 object-contain"
      />
    ),
  },
  {
    name: "Heart",
    icon: (
      <img
        src="/DIAMOND_SHAPES_WEBP/heart.png"
        alt="Heart"
        className="h-8 w-8 object-contain"
      />
    ),
  },
];

const ringSizes = [
  "11 (16.3MM)",
  "12 (16.5MM)",
  "13 (16.9MM)",
  "14 (17.3MM)",
  "15 (17.5MM)",
  "16 (17.9MM)",
  "17 (18.1MM)",
  "18 (18.5MM)",
  "19 (18.7MM)",
  "20 (19.2MM)",
  "21 (19.4MM)",
  "22 (19.8MM)",
  "23 (20MM)",
  "24 (20.4MM)",
  "25 (20.6MM)",
];

export default function RingBuilder() {
  type CustomizationDataType = {
    title: string;
    description: string;
    category: string;
    subCategory: string;
    jewelryType: string;
    stylingName: string;
    referenceImages: string[];
    inspirationImages: string[];
    diamondShape: string;
    diamondSize: string;
    diamondColor: string;
    metalType: string;
    metalKarat: string;
    metalColor: string;
    contactInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    customData: {
      sameAsImage: boolean;
      modificationRequest: string;
      priority: string;
    };
    tags: string[];
    estimatedDelivery: string;
    estimatedDeliveryDay: string;
  } | null;
  const [currentStep, setCurrentStep] = useState(1);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const navigate = useNavigate();
  const [selectedEngravingImage, setSelectedEngravingImage] =
    useState<string>("/newring.jpg");
  const [showEngravingPopup, setShowEngravingPopup] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isRingSizePopupOpen, setIsRingSizePopupOpen] = useState(false);
  const [engravingDone, setEngravingDone] = useState(false);

  // Store engraved images as blobs for batch upload
  const [engravingBlobs, setEngravingBlobs] = useState<
    { blob: Blob; url: string }[]
  >([]);

  // Add customization data state for payment
  const [customizationData, setCustomizationData] =
    useState<CustomizationDataType>(null);
  // const [createdOrderId, setCreatedOrderId] = useState<string>("");
  const [Loading, setLoading] = useState<boolean>(false);
  const [serviceabilityStatus, setServiceabilityStatus] = useState<
    "idle" | "checking" | "serviceable" | "not-serviceable"
  >("idle");
  const [serviceabilityMessage, setServiceabilityMessage] =
    useState<string>("");
  const metalTypesRef = useRef<HTMLDivElement>(null);

  // Country/State/City management
  const countries = Country.getAllCountries();
  const defaultCountry =
    countries.find((c) => c.name === "India") || countries[0];
  const [selectedCountry, setSelectedCountry] = useState(
    defaultCountry.isoCode
  );
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Get states for selected country (excluding Kerala)
  const states = State.getStatesOfCountry(selectedCountry).filter(
    (state) => state.name.toLowerCase() !== "kerala"
  );

  // Get cities for selected state (excluding Borivli)
  const cities = selectedState
    ? City.getCitiesOfState(selectedCountry, selectedState).filter(
        (city) => city.name.toLowerCase() !== "borivli"
      )
    : [];
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
    diamondOrigin: "Natural Diamond",
    diamondShape: "Round",
    diamondSize: "0.5 Carat",
    diamondColor: "D-FL",
    diamondClarity: "Center Stone",
    metal: "Gold",
    metalColor: "Yellow Gold",
    goldKarat: "18KT",
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

  // Debug: Log formData changes
  useEffect(() => {
    console.log("📋 FormData updated:", {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      city: formData.city,
      zipCode: formData.zipCode,
    });
  }, [
    formData.firstName,
    formData.lastName,
    formData.email,
    formData.phoneNumber,
    formData.address,
    formData.city,
    formData.zipCode,
  ]);

  // Debug: Log authUser data
  useEffect(() => {
    console.log("👤 AuthUser data:", {
      firstName: authUser?.firstName,
      lastName: authUser?.lastName,
      email: authUser?.email,
      phoneNumber: authUser?.phoneNumber,
      phone: authUser?.phone,
      country: authUser?.country,
      state: authUser?.state,
      zipCode: authUser?.zipCode,
    });
  }, [authUser]);

  // Update formData when country/state/city selections change
  useEffect(() => {
    const country = countries.find((c) => c.isoCode === selectedCountry);
    if (country) {
      setFormData((prev) => ({ ...prev, country: country.name }));
    }
  }, [selectedCountry, countries]);

  useEffect(() => {
    const state = states.find((s) => s.isoCode === selectedState);
    if (state) {
      setFormData((prev) => ({ ...prev, region: state.name }));
    }
  }, [selectedState, states]);

  useEffect(() => {
    if (selectedCity) {
      setFormData((prev) => ({ ...prev, city: selectedCity }));
    }
  }, [selectedCity]);

  // Auto-set metal color to White Gold for Platinum and Silver
  useEffect(() => {
    if (formData.metal === "Platinum" || formData.metal === "Silver") {
      setFormData((prev) => ({ ...prev, metalColor: "White Gold" }));
    }
  }, [formData.metal]);

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

  // Validation per-step: ensure required fields before advancing
  const validateForStep = (targetStep: number): boolean => {
    // Moving from step 1 -> 2: require at least one image and basic text
    if (targetStep === 2) {
      const totalImages =
        uploadedFiles.length + uploadedImages.length + (formData.url ? 1 : 0);

      if (totalImages < 3) {
        toast.error("Please upload at least 2 images before proceeding.");
        return false;
      }

      if (
        !formData.modificationRequest ||
        formData.modificationRequest.trim().length < 15
      ) {
        toast.error(
          "Please provide a modification description (min 15 characters)."
        );
        return false;
      }

      if (!formData.description || formData.description.trim() === "") {
        toast.error("Please provide a description (max 100 words).");
        return false;
      }

      const descWords = formData.description
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      if (descWords > 100) {
        toast.error("The description field must not exceed 100 words.");
        return false;
      }

      return true;
    }

    // Moving from step 2 -> 3: ensure customization fields are selected
    if (targetStep === 3) {
      // Ensure step1 requirements are met first
      if (!validateForStep(2)) return false;

      const customizationFields: Array<keyof typeof formData> = [
        "diamondOrigin",
        "diamondShape",
        "diamondSize",
        "diamondColor",
        "metal",
        "metalColor",
        "goldKarat",
        "ringSize",
      ];

      for (const field of customizationFields) {
        const valueRaw = (formData as Record<string, unknown>)[
          field as unknown as string
        ];
        const value = typeof valueRaw === "string" ? valueRaw : "";
        if (!value || value.trim() === "") {
          toast.error(`Please fill out the ${field} field.`);
          return false;
        }
      }

      return true;
    }

    return true;
  };

  const handleNextStep = (step: number) => {
    if (validateForStep(step)) setCurrentStep(step);
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
                <span>Tell us what to modify </span>
                <span className="text-red-500">*</span>
                <span className="font-light text-gray-400 text-xs ml-1">
                  (Min. 15 characters)
                </span>
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
              <p className="text-xs text-gray-500 ">
                {formData.modificationRequest.length} / 15 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                <span>Add Description </span>
                <span className="text-red-500">*</span>
                <span className="font-light text-gray-400 text-xs ml-1">
                  (Max. 100 characters)
                </span>
              </label>
              <Textarea
                placeholder="Enter Description..."
                value={formData.description}
                onChange={(e) => {
                  const newText = e.target.value;

                  if (newText.length <= 100) {
                    setFormData({ ...formData, description: newText });
                  }
                }}
                maxLength={100}
                className="min-h-24"
              />
              <p className="text-xs text-gray-500 ">
                {formData.description.length}/100 characters
              </p>

              {/* <p className="text-xs text-muted-foreground">
                {formData.description.length} characters.
              </p> */}
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">*</span>
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
          onClick={() => handleNextStep(2)}
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
          <div className="space-y-6">
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
                  onClick={() => setCurrentStep(1)}
                  size="sm"
                  className={`text-[#328F94] ${
                    formData.sameAsImage ? "text-[#328F94]" : ""
                  }`}
                >
                  Change Image
                </Button>
              </div>
              <div className="flex gap-4">
                {uploadedImages.map((image, index) => (
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
                      <Edit
                        onClick={() => setCurrentStep(1)}
                        className="w-3 h-3"
                      />
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
                Select Diamond Shape <span className="text-red-500">*</span> :{" "}
                <span className="text-gray-400 font-light">
                  {formData.diamondShape}
                </span>
                {formData.sameAsImage && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Same as Image)
                  </span>
                )}
              </h3>
              <div
                className={`grid grid-cols-5 gap-2 ${
                  formData.sameAsImage ? "pointer-events-none opacity-50" : ""
                }`}
              >
                {diamondShapes.map((shape) => (
                  <button
                    key={shape.name}
                    onClick={() => {
                      if (!formData.sameAsImage) {
                        setFormData({ ...formData, diamondShape: shape.name });

                        console.log("💎 Diamond Shape Selected:", {
                          diamondShape: shape.name,
                          userId: formData.userId,
                          sameAsImage: formData.sameAsImage,
                          customizationDisabled: formData.sameAsImage,
                        });
                      }
                    }}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-xs ${
                      formData.diamondShape === shape.name
                        ? "bg-[#328F94]/20"
                        : ""
                    }`}
                  >
                    <span className="text-2xl mb-1 h-10 w-10 flex items-center justify-center">
                      {shape.icon}
                    </span>
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
                Select Diamond Specification{" "}
                <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-lg ">
                  <label className="text-sm text-muted-foreground">
                    Diamond Size <span className="text-red-500">*</span>
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
                    <SelectContent className="bg-white">
                      <SelectItem value="0.5 Carat">0.5 Carat</SelectItem>
                      <SelectItem value="1 Carat">1 Carat</SelectItem>
                      <SelectItem value="1.5 Carat">1.5 Carat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Diamond Color & Clarity{" "}
                    <span className="text-red-500">*</span>
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
                    <SelectContent className="bg-white">
                      <SelectItem value="D-FL">D-FL</SelectItem>
                      <SelectItem value="E-VVS1">E-VVS1</SelectItem>
                      <SelectItem value="F-VVS2">F-VVS2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Metal Type and Karat - 2 Column Layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Metal Type */}
              <div>
                <label className="text-sm text-muted-foreground">
                  Metal Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.metal}
                  onValueChange={(value) => {
                    setFormData({ ...formData, metal: value });
                    // Auto-set appropriate karat based on metal type
                    if (value === "Gold") {
                      setFormData({
                        ...formData,
                        metal: value,
                        goldKarat: "18KT",
                      });
                    } else if (value === "Platinum") {
                      setFormData({
                        ...formData,
                        metal: value,
                        goldKarat: "950",
                      });
                    } else if (value === "Silver") {
                      setFormData({
                        ...formData,
                        metal: value,
                        goldKarat: "925",
                      });
                    }
                  }}
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

              {/* Karat Section with Scrollable UI */}
              <div>
                <h3 className="my-1 text-sm">
                  {formData.metal === "Gold"
                    ? "Gold Karat"
                    : formData.metal === "Platinum"
                    ? "Platinum Purity"
                    : "Silver Purity"}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (metalTypesRef.current) {
                        metalTypesRef.current.scrollBy({
                          left: -100,
                          behavior: "smooth",
                        });
                      }
                    }}
                    aria-label="Scroll left"
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#8D8A91]" />
                  </button>
                  <div
                    ref={metalTypesRef}
                    className="flex gap-2 overflow-x-hidden scroll-smooth flex-1"
                  >
                    {formData.metal === "Gold" &&
                      ["18KT", "14KT", "9KT"].map((karat) => (
                        <button
                          key={karat}
                          onClick={() => {
                            setFormData({ ...formData, goldKarat: karat });
                            console.log("🥇 Karat Selected:", {
                              goldKarat: karat,
                              metal: formData.metal,
                            });
                          }}
                          className={`px-3 py-1.5 rounded-full border text-xs min-w-max whitespace-nowrap ${
                            formData.goldKarat === karat
                              ? "border-[#328F94] bg-[#328F94]/10 text-[#328F94]"
                              : "border-neutral-600 text-neutral-600"
                          }`}
                        >
                          {karat}
                        </button>
                      ))}
                    {formData.metal === "Platinum" &&
                      ["950"].map((purity) => (
                        <button
                          key={purity}
                          onClick={() => {
                            setFormData({ ...formData, goldKarat: purity });
                            console.log("🥈 Platinum Purity Selected:", {
                              goldKarat: purity,
                              metal: formData.metal,
                            });
                          }}
                          className={`px-3 py-1.5 rounded-full border text-xs min-w-max whitespace-nowrap ${
                            formData.goldKarat === purity
                              ? "border-[#328F94] bg-[#328F94]/10 text-[#328F94]"
                              : "border-neutral-600 text-neutral-600"
                          }`}
                        >
                          {purity}
                        </button>
                      ))}
                    {formData.metal === "Silver" &&
                      ["925"].map((purity) => (
                        <button
                          key={purity}
                          onClick={() => {
                            setFormData({ ...formData, goldKarat: purity });
                            console.log("🥉 Silver Purity Selected:", {
                              goldKarat: purity,
                              metal: formData.metal,
                            });
                          }}
                          className={`px-3 py-1.5 rounded-full border text-xs min-w-max whitespace-nowrap ${
                            formData.goldKarat === purity
                              ? "border-[#328F94] bg-[#328F94]/10 text-[#328F94]"
                              : "border-neutral-600 text-neutral-600"
                          }`}
                        >
                          {purity}
                        </button>
                      ))}
                  </div>
                  <button
                    onClick={() => {
                      if (metalTypesRef.current) {
                        metalTypesRef.current.scrollBy({
                          left: 100,
                          behavior: "smooth",
                        });
                      }
                    }}
                    aria-label="Scroll right"
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-5 h-5 text-[#8D8A91]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
        rightColumn={
          <div className="space-y-6">
            {/* Diamond Origin */}
            <div>
              <label className="text-sm text-muted-foreground">
                Diamond Origin <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      diamondOrigin: "Natural Diamond",
                    })
                  }
                  className={`p-2 rounded-2xl border-2 transition-all ${
                    formData.diamondOrigin === "Natural Diamond"
                      ? "border-[#328F94] bg-[#328F94]/5"
                      : "border-gray-200 hover:border-[#328F94]/50"
                  }`}
                >
                  <span className="text-sm font-medium">Natural Diamond</span>
                </button>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      diamondOrigin: "Lab Grown Diamond",
                    })
                  }
                  className={`p-2 rounded-2xl border-2 transition-all ${
                    formData.diamondOrigin === "Lab Grown Diamond"
                      ? "border-[#328F94] bg-[#328F94]/5"
                      : "border-gray-200 hover:border-[#328F94]/50"
                  }`}
                >
                  <span className="text-sm font-medium">Lab Grown Diamond</span>
                </button>
              </div>
            </div>

            {/* Metal Color */}
            <div>
              <label
                className={`text-sm text-muted-foreground ${
                  formData.sameAsImage ? "text-gray-400" : ""
                }`}
              >
                Metal Color:{" "}
                {metalTypesRef.current ? ` ${formData.metalColor}` : ""}{" "}
                <span className="text-red-500">*</span>
                {formData.sameAsImage && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Same as Image)
                  </span>
                )}
              </label>
              <Select
                value={formData.metalColor}
                onValueChange={(value) =>
                  setFormData({ ...formData, metalColor: value })
                }
                disabled={formData.sameAsImage}
              >
                <SelectTrigger
                  className={formData.sameAsImage ? "opacity-50" : ""}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {formData.metal === "Gold" && (
                    <>
                      <SelectItem value="Yellow Gold" className="gap-">
                        <img
                          src="/colors/gold.png"
                          alt="Yellow Gold"
                          className="inline-block h-6 w-6 mr-2 mb-1"
                        />
                        Yellow Gold{" "}
                      </SelectItem>
                      <SelectItem value="White Gold">
                        <img
                          src="/colors/white.png"
                          alt="White Gold"
                          className="inline-block h-6 w-6 mr-2 mb-1"
                        />
                        White Gold
                      </SelectItem>
                      <SelectItem value="Rose Gold">
                        <img
                          src="/colors/rosegold.png"
                          alt="Rose Gold"
                          className="inline-block h-6 w-6 mr-2 mb-1"
                        />
                        Rose Gold
                      </SelectItem>
                    </>
                  )}
                  {(formData.metal === "Platinum" ||
                    formData.metal === "Silver") && (
                    <SelectItem value="White Gold">
                      <img
                        src="/colors/white.png"
                        alt="White Gold"
                        className="inline-block h-6 w-6 mr-2 mb-1"
                      />
                      White Gold
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Ring Size */}
            <div>
              <label className="text-sm text-muted-foreground">
                Ring Size (Indian)
              </label>
              <Select
                value={formData.ringSize}
                onValueChange={(value) =>
                  setFormData({ ...formData, ringSize: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Ring Size" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {ringSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      Size {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="link"
                size="sm"
                className="text-[#328F94] p-0 mt-1"
                onClick={() => setIsRingSizePopupOpen(true)}
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

              {/* Engraving Button */}
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    if (engravingDone) {
                      toast.error("Engraving can only be performed once.");
                      return;
                    }

                    console.log(
                      "🎨 Opening engraving popup with /newring.jpg:",
                      {
                        selectedImage: "/newring.jpg",
                        jewelryType: formData.jewelryType,
                        userId: formData.userId,
                      }
                    );

                    setSelectedEngravingImage("/newring.jpg");
                    setShowEngravingPopup(true);
                  }}
                  className={`w-full text-sm py-2 transition-all ${
                    engravingDone
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#328F94] text-white hover:bg-[#328F94]/90"
                  }`}
                  disabled={engravingDone}
                >
                  {engravingDone ? "Engraving Already Done" : "Add Engraving"}
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
          onClick={() => handleNextStep(3)}
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
      {showPaymentForm && customizationData && authUser ? (
        <CustomizationPaymentForm
          customizationData={customizationData}
          amount={1800}
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
          onPaymentSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
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
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="link"
                    size="sm"
                    className="text-[#328F94]"
                  >
                    Change Image
                  </Button>
                </div>
                <div className="flex gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Final ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center">
                        <Edit
                          onClick={() => setCurrentStep(1)}
                          className="w-3 h-3 "
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Properties */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Selected Properties</h3>
                  <Button
                    variant="link"
                    onClick={() => setCurrentStep(2)}
                    size="sm"
                    className="text-[#328F94]"
                  >
                    Change Properties
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Diamond Shape:
                    </span>
                    <span className="text-sm text-[#328F94]">
                      {formData.diamondShape}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Diamond Size:
                      </span>
                      <div className="text-[#328F94]">
                        {formData.diamondSize}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Diamond Color & Clarity:
                      </span>
                      <div className="text-[#328F94]">
                        {formData.diamondColor}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground w-1/2">
                        Metal Type:
                      </span>
                      <div className="text-[#328F94]">{formData.metal}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gold Karat:</span>
                      <div className="text-[#328F94]">{formData.goldKarat}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Metal Color:
                      </span>
                      <div className="text-[#328F94]">
                        {formData.metalColor}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ring Size:</span>
                      <div className="text-[#328F94]">{formData.ringSize}</div>
                    </div>
                  </div>
                  {formData.engraving && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Engraving Added:
                      </span>
                      <span className="text-sm text-[#328F94]">
                        {formData.engraving}
                      </span>
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
                      <label className="text-sm">
                        Enter Your Name <span className="text-red-500">*</span>
                      </label>
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
                    <label className="text-sm">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={selectedCountry}
                        onValueChange={setSelectedCountry}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent className="bg-white max-h-60">
                          {countries.map((country) => (
                            <SelectItem
                              key={country.isoCode}
                              value={country.isoCode}
                            >
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm">
                        Region/State <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={selectedState}
                        onValueChange={setSelectedState}
                        disabled={!selectedCountry}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent className="bg-white max-h-60">
                          {states.map((state) => (
                            <SelectItem
                              key={state.isoCode}
                              value={state.isoCode}
                            >
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm">
                        City <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={selectedCity}
                        onValueChange={setSelectedCity}
                        disabled={!selectedState}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent className="bg-white max-h-60">
                          {cities.map((city) => (
                            <SelectItem key={city.name} value={city.name}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm">
                        Zip Code <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.zipCode}
                        onChange={(e) => handleZipCodeChange(e.target.value)}
                        placeholder="Enter 6-digit pincode"
                        maxLength={6}
                        pattern="\d{6}"
                      />
                      {serviceabilityMessage && (
                        <div
                          className={`text-xs mt-1 ${
                            serviceabilityStatus === "serviceable"
                              ? "text-green-600"
                              : serviceabilityStatus === "not-serviceable"
                              ? "text-red-600"
                              : serviceabilityStatus === "checking"
                              ? "text-blue-600"
                              : "text-gray-600"
                          }`}
                        >
                          {serviceabilityMessage}
                        </div>
                      )}
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
                    <label className="text-sm">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
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
                      <span>₹1,800</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* <Button
                onClick={createOrder}
                className="w-full bg-[#328F94] hover:bg-[#328F94]/90 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={Loading || !formData.zipCode || serviceabilityStatus !== 'serviceable'}
              >
                {Loading ? "Creating Order..." : 
                 !formData.zipCode ? "Enter Pincode First" :
                 serviceabilityStatus === 'checking' ? "Checking Area..." :
                 serviceabilityStatus === 'not-serviceable' ? "Area Not Serviceable" :
                 serviceabilityStatus !== 'serviceable' ? "Check Pincode Serviceability" :
                 "Create Order →"}
              </Button> */}

              <Button
                onClick={requestCustomization}
                className="w-full mt-3 bg-[#328F94] hover:bg-[#328F94]/90 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={
                  Loading ||
                  !formData.zipCode ||
                  serviceabilityStatus !== "serviceable"
                }
              >
                {Loading
                  ? "Creating Request..."
                  : !formData.zipCode
                  ? "Enter Pincode First"
                  : serviceabilityStatus === "checking"
                  ? "Checking Area..."
                  : serviceabilityStatus === "not-serviceable"
                  ? "Area Not Serviceable"
                  : serviceabilityStatus !== "serviceable"
                  ? "Check Pincode Serviceability"
                  : "Request Customization →"}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                {/* Assistance Header */}
                <div className="text-center text-sm text-gray-600 mb-6">
                  <a
                    href="https://wa.me/918235567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:underline"
                  >
                    Need Assistance? <span className="underline">Chat Now</span>
                  </a>{" "}
                  &nbsp;or&nbsp;
                  <a href="tel:+918235567890" className="hover:underline">
                    call <span className="underline">+91 8235567890</span>
                  </a>
                </div>
                <p className="font-medium text-red-500">
                  * Your custom jewelry is in progress! HD images and videos
                  will be shared within 7 business days.
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
          {/* {createdOrderId && (
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
          )} */}
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

    // Mark engraving as done
    setEngravingDone(true);

    // If we received an engraved image URL (blob URL), convert it to blob and store
    if (engravingImageUrl) {
      try {
        // Fetch the blob from the blob URL
        const response = await fetch(engravingImageUrl);
        const blob = await response.blob();

        // Store both blob and display URL
        setEngravingBlobs((prev) => [
          ...prev,
          { blob, url: engravingImageUrl },
        ]);
        setUploadedImages((prev) => [...prev, engravingImageUrl]);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, engravingImageUrl],
        }));

        console.log("🖼️ Added engraved image blob to collection:", {
          blobSize: blob.size,
          blobType: blob.type,
          displayUrl: engravingImageUrl,
        });
      } catch (error) {
        console.error("❌ Error converting engraved image to blob:", error);
      }
    }

    setShowEngravingPopup(false);
  };

  // Function to check serviceability using Sequel247 API
  const checkServiceability = async (pinCode: string): Promise<boolean> => {
    if (!pinCode || pinCode.length !== 6 || !/^\d{6}$/.test(pinCode)) {
      setServiceabilityStatus("idle");
      setServiceabilityMessage("");
      return false;
    }

    try {
      setServiceabilityStatus("checking");
      setServiceabilityMessage("Checking serviceability...");
      console.log("🚀 Checking serviceability for pincode:", pinCode);

      const response = await fetch(
        "https://test.sequel247.com/api/checkServiceability",
        {
          method: "POST",
          body: JSON.stringify({
            token: "b228a27399f07927985d57c0f7d94ce8",
            pin_code: pinCode,
          }),
        }
      );

      const result = await response.json();
      console.log("📍 Serviceability check result:", result);

      // Handle API returning boolean true or string variants like 'true', 'True', '1'
      const statusRaw = result?.status;
      console.debug(
        "🔎 Raw serviceability status from API:",
        statusRaw,
        typeof statusRaw
      );
      const statusStr =
        statusRaw == null ? "" : String(statusRaw).trim().toLowerCase();
      const isServiceableApi =
        statusRaw === true || ["true", "1", "yes"].includes(statusStr);

      if (isServiceableApi) {
        setServiceabilityStatus("serviceable");
        setServiceabilityMessage(
          "✅ Great! This area is serviceable for delivery."
        );
        return true;
      } else {
        setServiceabilityStatus("not-serviceable");
        setServiceabilityMessage(
          "❌ Sorry, this area is not serviceable for delivery."
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Error checking serviceability:", error);
      toast.error("⚠️ Unable to check serviceability. Please try again.");
      setServiceabilityStatus("idle");
      setServiceabilityMessage(
        "⚠️ Unable to check serviceability. Please try again."
      );
      return false;
    }
  };

  // Handle zip code change with real-time serviceability check
  const handleZipCodeChange = async (value: string) => {
    setFormData({ ...formData, zipCode: value });

    // Check serviceability when user enters a valid 6-digit pincode
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      await checkServiceability(value);
    } else if (value.length < 6) {
      setServiceabilityStatus("idle");
      setServiceabilityMessage("");
    }
  };

  const requestCustomization = async () => {
    try {
      setLoading(true);
      console.log("🎨 Starting customization request process...");

      // Ensure we have the latest userId
      const currentUserId = getUserId();
      if (!currentUserId) {
        toast.error("Please login to proceed with customization request.");
        navigate("/login");
        return;
      }

      // Check if zip code is provided and valid
      if (!formData.zipCode) {
        toast.error(
          "Please enter your zip code before creating the customization request."
        );
        setLoading(false);
        return;
      }

      if (formData.zipCode.length !== 6 || !/^\d{6}$/.test(formData.zipCode)) {
        toast.error("Please enter a valid 6-digit pincode.");
        setLoading(false);
        return;
      }

      // Check if serviceability has been verified
      if (serviceabilityStatus !== "serviceable") {
        if (serviceabilityStatus === "not-serviceable") {
          toast.error(
            "❌ Sorry, we cannot process customization requests to your area as it is not serviceable. Please contact customer support for more information."
          );
          setLoading(false);
          return;
        } else if (serviceabilityStatus === "checking") {
          toast.info("Please wait while we check if your area is serviceable.");
          setLoading(false);
          return;
        } else {
          // Status is 'idle' - need to check serviceability
          console.log(
            "📍 Checking serviceability for pincode:",
            formData.zipCode
          );
          const isServiceable = await checkServiceability(formData.zipCode);

          if (!isServiceable) {
            toast.error(
              "❌ Sorry, we cannot process customization requests to your area as it is not serviceable. Please contact customer support for more information."
            );
            setLoading(false);
            return;
          }
        }
      }

      console.log(
        "✅ Area is serviceable, proceeding with customization request..."
      );

      // Calculate Estimated Delivery Date (EDD) via Sequel247 before sending request
      // let eddResult: { estimated_delivery?: string; estimated_day?: string } | null = null;
      // try {
      //   const pickupDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      //   console.log('📦 [EDD] Requesting EDD from Sequel247', { origin: '400097', destination: formData.zipCode, pickupDate });

      //   if (formData.zipCode && /^\d{6}$/.test(formData.zipCode)) {
      //     const eddResp = await fetch('https://test.sequel247.com/api/shipment/calculateEDD', {
      //       method: 'POST',
      //       body: JSON.stringify({
      //         token: 'b228a27399f07927985d57c0f7d94ce8',
      //         origin_pincode: '400097',
      //         destination_pincode: formData.zipCode,
      //         pickup_date: pickupDate,
      //       }),
      //     });

      //     const eddJson = await eddResp.json();
      //     console.log('📦 [EDD] Raw API response:', JSON.stringify(eddJson, null, 2));
      //     const statusRaw = eddJson?.status;
      //     const statusStr = statusRaw == null ? '' : String(statusRaw).trim().toLowerCase();
      //     const ok = statusRaw === true || ['true', '1', 'yes'].includes(statusStr);

      //     if (ok && eddJson?.data?.estimated_delivery) {
      //       eddResult = {
      //         estimated_delivery: eddJson.data.estimated_delivery,
      //         estimated_day: eddJson.data.estimated_day,
      //       };
      //       console.log('✅ [EDD] Successfully parsed EDD data:', eddResult);
      //     } else {
      //       console.warn('⚠️ [EDD] EDD not available from API or not serviceable', { status: statusRaw, data: eddJson?.data });
      //       alert('⚠️ Unable to fetch estimated delivery date. Customization request will continue without EDD.');
      //     }
      //   } else {
      //     console.warn('⚠️ [EDD] Skipping EDD request - invalid destination pincode', formData.zipCode);
      //     alert('⚠️ Invalid pincode format for EDD calculation. Please check your zip code.');
      //   }
      // } catch (eddError) {
      //   console.error('❌ [EDD] Error fetching EDD:', eddError);
      //   alert('⚠️ Failed to fetch estimated delivery date. Customization request will be created without EDD.');
      // }
      const eddResult: { estimated_delivery?: string; estimated_day?: string } =
        {
          estimated_delivery: "2025-10-24",
          estimated_day: "monday",
        };

      // Prepare customization request data for payment
      const customizationRequestData = {
        title: `Custom ${formData.jewelryType} Design Request`,
        description:
          formData.description?.trim() ||
          `Custom ${formData.jewelryType} with ${formData.diamondShape} diamond`,
        category: formData.jewelryType.toUpperCase(),
        subCategory:
          formData.jewelryType === "ring"
            ? "Custom Rings"
            : `Custom ${formData.jewelryType}`,
        jewelryType: formData.jewelryType,
        stylingName: "CUSTOM",
        referenceImages: uploadedImages,
        inspirationImages: uploadedImages,
        diamondOrigin: formData.diamondOrigin,
        diamondShape: formData.diamondShape,
        diamondSize: formData.diamondSize,
        diamondColor: formData.diamondColor,
        diamondClarity: formData.diamondClarity,
        metalType: formData.metal,
        metalKarat: formData.goldKarat,
        metalColor: formData.metalColor,
        ringSize: formData.ringSize,
        engraving: formData.engraving
          ? {
              text: formData.engraving,
              font: "Classic",
              position: "Inside",
            }
          : undefined,
        specialInstructions:
          formData.specialInstructions || formData.modificationRequest,
        // Add user contact information
        contactInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          city: formData.city,
          state: formData.region,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        customData: {
          sameAsImage: formData.sameAsImage,
          modificationRequest: formData.modificationRequest,
          priority: formData.priority,
          stepData: {
            step1: {
              jewelryType: formData.jewelryType,
              images: uploadedImages,
              sameAsImage: formData.sameAsImage,
              modificationRequest: formData.modificationRequest,
            },
            step2: {
              diamondOrigin: formData.diamondOrigin,
              diamondShape: formData.diamondShape,
              diamondSize: formData.diamondSize,
              diamondColor: formData.diamondColor,
              metal: formData.metal,
              metalColor: formData.metalColor,
              goldKarat: formData.goldKarat,
              ringSize: formData.ringSize,
            },
          },
        },
        tags: ["custom", "design-your-own", formData.jewelryType],
        // Add EDD information
        estimatedDelivery: eddResult?.estimated_delivery || null,
        estimatedDeliveryDay: eddResult?.estimated_day || null,
      };

      console.log(
        "📤 Creating customization request with payment:",
        customizationRequestData
      );
      console.log("📋 Current formData state:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        region: formData.region,
        zipCode: formData.zipCode,
        country: formData.country,
      });

      // First upload all images (including engraving blobs) to Cloudinary
      let uploadedImageUrls: string[] = [];

      if (uploadedFiles.length > 0 || engravingBlobs.length > 0) {
        console.log("📤 Uploading images to Cloudinary first...");
        console.log(
          `📎 Files to upload: ${uploadedFiles.length} original + ${engravingBlobs.length} engraving`
        );

        // Prepare FormData for image upload (same as order creation)
        const imageFormData = new FormData();
        imageFormData.append("userId", currentUserId);
        imageFormData.append("jewelryType", formData.jewelryType);

        // Add uploaded files
        uploadedFiles.forEach((file, index) => {
          imageFormData.append("images", file);
          console.log(`📎 Adding file ${index + 1}:`, {
            name: file.name,
            size: file.size,
            type: file.type,
          });
        });

        // Add engraving blobs as files
        engravingBlobs.forEach((engravingBlob, index) => {
          const engravingFile = new File(
            [engravingBlob.blob],
            `engraving-${index + 1}.png`,
            {
              type: "image/png",
            }
          );
          imageFormData.append("images", engravingFile);
          console.log(`🖼️ Adding engraving file ${index + 1}:`, {
            name: engravingFile.name,
            size: engravingFile.size,
            type: engravingFile.type,
          });
        });

        // Upload images using the same endpoint as order creation
        const imageResponse = await fetch("/api/rings/upload", {
          method: "POST",
          body: imageFormData,
        });

        const imageResult = await imageResponse.json();

        if (imageResult.success && imageResult.data?.images) {
          uploadedImageUrls = imageResult.data.images;
          console.log("✅ Images uploaded successfully:", uploadedImageUrls);
        } else {
          console.error("❌ Failed to upload images:", imageResult.message);
          toast.error("Failed to upload images. Please try again.");
          setLoading(false);
          return;
        }
      }

      // Now create customization request with uploaded image URLs
      const customizationRequestDataWithImages = {
        ...customizationRequestData,
        referenceImages: uploadedImageUrls,
        inspirationImages: uploadedImageUrls, // Same as reference images for now
      };

      console.log(
        "📤 Creating customization request with uploaded images:",
        customizationRequestDataWithImages
      );
      console.log("🔍 Required fields check:", {
        title: customizationRequestDataWithImages.title,
        description: customizationRequestDataWithImages.description,
        category: customizationRequestDataWithImages.category,
        subCategory: customizationRequestDataWithImages.subCategory,
        jewelryType: customizationRequestDataWithImages.jewelryType,
      });
      console.log(
        "📞 Contact information being sent:",
        customizationRequestDataWithImages.contactInfo
      );

      // Validate required fields before sending
      if (
        !customizationRequestDataWithImages.title ||
        !customizationRequestDataWithImages.description ||
        !customizationRequestDataWithImages.category ||
        !customizationRequestDataWithImages.subCategory ||
        !customizationRequestDataWithImages.jewelryType
      ) {
        console.error("❌ Missing required fields:", {
          title: !!customizationRequestDataWithImages.title,
          description: !!customizationRequestDataWithImages.description,
          category: !!customizationRequestDataWithImages.category,
          subCategory: !!customizationRequestDataWithImages.subCategory,
          jewelryType: !!customizationRequestDataWithImages.jewelryType,
        });
        toast.error(
          "Missing required information. Please fill in all required fields."
        );
        setLoading(false);
        return;
      }

      // Validate contact information
      if (
        !customizationRequestDataWithImages.contactInfo ||
        !customizationRequestDataWithImages.contactInfo.firstName ||
        !customizationRequestDataWithImages.contactInfo.lastName ||
        !customizationRequestDataWithImages.contactInfo.email ||
        !customizationRequestDataWithImages.contactInfo.phoneNumber ||
        !customizationRequestDataWithImages.contactInfo.address ||
        !customizationRequestDataWithImages.contactInfo.city ||
        !customizationRequestDataWithImages.contactInfo.zipCode
      ) {
        console.error(
          "❌ Missing contact information:",
          customizationRequestDataWithImages.contactInfo
        );
        toast.error(
          "Please fill in all contact information fields (name, email, phone, address, city, pincode)."
        );
        setLoading(false);
        return;
      }

      // Create customization request with payment integration
      console.log(
        "🔑 Auth token:",
        localStorage.getItem("token") ? "Present" : "Missing"
      );

      // Test server connectivity first
      try {
        const testResponse = await fetch("/api/customization/my-requests", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("🔗 Server connectivity test:", testResponse.status);
      } catch (error) {
        console.error("❌ Server connectivity error:", error);
        toast.error(
          "Cannot connect to server. Please make sure the server is running."
        );
        setLoading(false);
        return;
      }

      const response = await fetch("/api/customization/request-with-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(customizationRequestDataWithImages),
      });

      const result = await response.json();

      console.log("📥 Server response:", {
        status: response.status,
        success: result.success,
        message: result.message,
        data: result.data,
      });

      if (result.success) {
        console.log(
          "✅ Customization request created successfully:",
          result.data
        );

        // Prepare customization request data for payment
        const customizationRequestDataForPayment = {
          title: `Custom ${formData.jewelryType} Design Request`,
          description:
            formData.description?.trim() ||
            `Custom ${formData.jewelryType} with ${formData.diamondShape} diamond`,
          category: formData.jewelryType.toUpperCase(),
          subCategory:
            formData.jewelryType === "ring"
              ? "Custom Rings"
              : `Custom ${formData.jewelryType}`,
          jewelryType: formData.jewelryType,
          stylingName: "CUSTOM",
          referenceImages: uploadedImageUrls,
          inspirationImages: uploadedImageUrls,
          diamondOrigin: formData.diamondOrigin,
          diamondShape: formData.diamondShape,
          diamondSize: formData.diamondSize,
          diamondColor: formData.diamondColor,
          metalType: formData.metal,
          metalKarat: formData.goldKarat,
          metalColor: formData.metalColor,
          contactInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            city: formData.city,
            state: formData.region,
            zipCode: formData.zipCode,
            country: formData.country,
          },
          customData: {
            sameAsImage: formData.sameAsImage,
            modificationRequest: formData.modificationRequest,
            priority: formData.priority,
          },
          tags: ["custom", "design-your-own", formData.jewelryType],
          // Add EDD information (ensure strings to satisfy CustomizationDataType)
          estimatedDelivery: eddResult?.estimated_delivery || "",
          estimatedDeliveryDay: eddResult?.estimated_day || "",
        };

        console.log(
          "💳 [PAYMENT] Preparing customization data for payment:",
          customizationRequestDataForPayment
        );

        // Set customization data and show payment form
        setCustomizationData(
          customizationRequestDataForPayment as CustomizationDataType
        );
        setShowPaymentForm(true);
        setCurrentStep(3);

        const eddInfo = eddResult?.estimated_delivery
          ? `EDD: ${eddResult.estimated_delivery} (${
              eddResult.estimated_day || "N/A"
            })`
          : "No EDD";

        toast.success(
          `Customization request created successfully! ${eddInfo}\n\nProceeding to payment...`
        );

        setLoading(false);
      } else {
        console.error(
          "❌ Failed to create customization request:",
          result.message
        );
        toast.error(
          `❌ Failed to submit customization request: ${result.message}`
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ Error creating customization request:", error);
      toast.error(
        "❌ An error occurred while submitting your customization request. Please try again."
      );
      setLoading(false);
    }
  };

  // const createOrder = async () => {
  //   try {
  //     setLoading(true);
  //     console.log("🚀 Starting order creation process...");

  //     // Ensure we have the latest userId
  //     const currentUserId = getUserId();
  //     if (!currentUserId) {
  //       alert("Please login to proceed with order creation.");
  //       navigate("/login");
  //       return;
  //     }

  //     // Check if zip code is provided and valid
  //     if (!formData.zipCode) {
  //       alert("Please enter your zip code before creating the order.");
  //       setLoading(false);
  //       return;
  //     }

  //     if (formData.zipCode.length !== 6 || !/^\d{6}$/.test(formData.zipCode)) {
  //       alert("Please enter a valid 6-digit pincode.");
  //       setLoading(false);
  //       return;
  //     }

  //     // Check if serviceability has been verified
  //     if (serviceabilityStatus !== 'serviceable') {
  //       if (serviceabilityStatus === 'not-serviceable') {
  //         alert("❌ Sorry, we cannot process orders to your area as it is not serviceable. Please contact customer support for more information.");
  //         setLoading(false);
  //         return;
  //       } else if (serviceabilityStatus === 'checking') {
  //         alert("Please wait while we check if your area is serviceable.");
  //         setLoading(false);
  //         return;
  //       } else {
  //         // Status is 'idle' - need to check serviceability
  //         console.log("📍 Checking serviceability for pincode:", formData.zipCode);
  //         const isServiceable = await checkServiceability(formData.zipCode);

  //         if (!isServiceable) {
  //           alert("❌ Sorry, we cannot process orders to your area as it is not serviceable. Please contact customer support for more information.");
  //           setLoading(false);
  //           return;
  //         }
  //       }
  //     }

  //     console.log("✅ Area is serviceable, proceeding with order creation...");

  //     // Update formData with current userId
  //     const updatedFormData = { ...formData, userId: currentUserId };

  //     // Calculate Estimated Delivery Date (EDD) via Sequel247 before sending order
  //     let eddResult: { estimated_delivery?: string; estimated_day?: string } | null = null;
  //     try {
  //       const pickupDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  //       console.log('📦 [EDD] Requesting EDD from Sequel247', { origin: '400097', destination: updatedFormData.zipCode, pickupDate });

  //       if (updatedFormData.zipCode && /^\d{6}$/.test(updatedFormData.zipCode)) {
  //         const eddResp = await fetch('https://test.sequel247.com/api/shipment/calculateEDD', {
  //           method: 'POST',
  //           body: JSON.stringify({
  //             token: 'b228a27399f07927985d57c0f7d94ce8',
  //             origin_pincode: '400097',
  //             destination_pincode: updatedFormData.zipCode,
  //             pickup_date: pickupDate,
  //           }),
  //         });

  //         const eddJson = await eddResp.json();
  //         console.log('📦 [EDD] Raw API response:', JSON.stringify(eddJson, null, 2));
  //         const statusRaw = eddJson?.status;
  //         const statusStr = statusRaw == null ? '' : String(statusRaw).trim().toLowerCase();
  //         const ok = statusRaw === true || ['true', '1', 'yes'].includes(statusStr);

  //         if (ok && eddJson?.data?.estimated_delivery) {
  //           // API returns estimated_delivery in dd-mm-yyyy (example). Keep as-is and also attempt to convert to ISO.
  //           eddResult = {
  //             estimated_delivery: eddJson.data.estimated_delivery,
  //             estimated_day: eddJson.data.estimated_day,
  //           };
  //           console.log('✅ [EDD] Successfully parsed EDD data:', eddResult);
  //           console.log('✅ [EDD] Will append to FormData and payment payload');
  //         } else {
  //           console.warn('⚠️ [EDD] EDD not available from API or not serviceable', { status: statusRaw, data: eddJson?.data });
  //           alert('⚠️ Unable to fetch estimated delivery date. Order creation will continue without EDD.');
  //         }
  //       } else {
  //         console.warn('⚠️ [EDD] Skipping EDD request - invalid destination pincode', updatedFormData.zipCode);
  //         alert('⚠️ Invalid pincode format for EDD calculation. Please check your zip code.');
  //       }
  //     } catch (eddError) {
  //       console.error('❌ [EDD] Error fetching EDD:', eddError);
  //       alert('⚠️ Failed to fetch estimated delivery date. Order will be created without EDD.');
  //     }

  //     // Prepare the complete payload for upload-you-own API
  //     const formDataPayload = new FormData();

  //     // Add basic information with ensured userId
  //     formDataPayload.append("userId", currentUserId);
  //     formDataPayload.append("jewelryType", updatedFormData.jewelryType);
  //     // Attach estimated delivery info (if available)
  //     if (eddResult?.estimated_delivery) {
  //       formDataPayload.append('estimatedDelivery', eddResult.estimated_delivery);
  //       console.log('📦 [EDD] Added estimatedDelivery to FormData:', eddResult.estimated_delivery);
  //     } else {
  //       console.warn('⚠️ [EDD] No estimatedDelivery to append to FormData');
  //     }

  //     if (eddResult?.estimated_day) {
  //       formDataPayload.append('estimatedDeliveryDay', eddResult.estimated_day);
  //       console.log('📦 [EDD] Added estimatedDeliveryDay to FormData:', eddResult.estimated_day);
  //     } else {
  //       console.warn('⚠️ [EDD] No estimatedDeliveryDay to append to FormData');
  //     }

  //     // Add uploaded files (original images)
  //     if (uploadedFiles.length > 0) {
  //       uploadedFiles.forEach((file, index) => {
  //         formDataPayload.append("images", file);
  //         console.log(`📎 Adding original file ${index + 1}:`, {
  //           name: file.name,
  //           size: file.size,
  //           type: file.type,
  //         });
  //       });
  //     }

  //     // Add engraved images as files for batch upload
  //     if (engravingBlobs.length > 0) {
  //       engravingBlobs.forEach((engravingData, index) => {
  //         // Convert blob to File object with proper name
  //         const engravingFile = new File(
  //           [engravingData.blob],
  //           `engraved-image-${index + 1}.png`,
  //           { type: 'image/png' }
  //         );
  //         formDataPayload.append("images", engravingFile);
  //         console.log(`🎨 Adding engraved file ${index + 1}:`, {
  //           name: engravingFile.name,
  //           size: engravingFile.size,
  //           type: engravingFile.type,
  //         });
  //       });
  //     }

  //     // Add image URLs if provided
  //     if (formData.url) {
  //       formDataPayload.append("imageUrls", formData.url);
  //       console.log("🔗 Adding URL:", formData.url);
  //     }

  //     // Add customization data
  //     formDataPayload.append("sameAsImage", formData.sameAsImage.toString());
  //     formDataPayload.append(
  //       "modificationRequest",
  //       formData.modificationRequest
  //     );
  //     formDataPayload.append("description", formData.description);
  //     formDataPayload.append("diamondShape", formData.diamondShape);
  //     formDataPayload.append("diamondSize", formData.diamondSize);
  //     formDataPayload.append("diamondColor", formData.diamondColor);
  //     formDataPayload.append("diamondClarity", formData.diamondClarity);
  //     formDataPayload.append("metal", formData.metal);
  //     formDataPayload.append("metalColor", formData.metalColor);
  //     formDataPayload.append("goldKarat", formData.goldKarat);
  //     formDataPayload.append("ringSize", formData.ringSize);
  //     formDataPayload.append("engraving", formData.engraving);
  //     formDataPayload.append("priority", formData.priority);
  //     formDataPayload.append(
  //       "specialInstructions",
  //       formData.specialInstructions
  //     );

  //     console.log("📦 Complete order payload prepared:", {
  //       userId: currentUserId,
  //       jewelryType: updatedFormData.jewelryType,
  //       originalFilesCount: uploadedFiles.length,
  //       engravingBlobsCount: engravingBlobs.length,
  //       totalImagesCount: uploadedFiles.length + engravingBlobs.length,
  //       hasUrl: !!formData.url,
  //       sameAsImage: formData.sameAsImage,
  //       customization: {
  //         diamondShape: formData.diamondShape,
  //         metal: formData.metal,
  //         goldKarat: formData.goldKarat,
  //         engraving: formData.engraving,
  //       },
  //       contactInfo: {
  //         firstName: formData.firstName,
  //         lastName: formData.lastName,
  //         email: formData.email,
  //         phoneNumber: formData.phoneNumber,
  //       },
  //     });

  //     // Debug: output uploadedFiles and engravingBlobs before sending
  //     console.log("🔍 Debug pre-upload:", {
  //       originalFilesCount: uploadedFiles.length,
  //       originalFilesPreview: uploadedFiles.map((f) => ({
  //         name: f.name,
  //         size: f.size,
  //       })),
  //       engravingBlobsCount: engravingBlobs.length,
  //       engravingBlobsPreview: engravingBlobs.map((e, index) => ({
  //         index: index + 1,
  //         size: e.blob.size,
  //         type: e.blob.type,
  //         displayUrl: e.url.substring(0, 50) + '...'
  //       })),
  //       totalImagesForUpload: uploadedFiles.length + engravingBlobs.length,
  //       formDataImages: formData.images,
  //       formDataUrl: formData.url,
  //     });

  //     //check if user is authenticated
  //     if (!authUser) {
  //       alert("Please login to proceed with order creation.");
  //       navigate("/login");
  //       return;
  //     }

  //     // Make API call to create jewelry order
  //     const response = await fetch("/api/rings/upload", {
  //       method: "POST",
  //       body: formDataPayload,
  //     });

  //     const result = await response.json();

  //     console.log("🎯 API Response received:", {
  //       status: response.status,
  //       success: result.success,
  //       message: result.message,
  //       data: result.data,
  //     });

  //     // Debug: explicitly log returned image list from backend
  //     console.log("🔍 Backend returned images:", result.data?.images);

  //     if (result.success) {
  //       alert("✅ Order created successfully!");
  //       console.log("📋 Complete order details:", result.data);
  //       alert(result.data.images);

  //       // Ensure returned image URLs are stored in state for use in payment
  //       if (result.data?.images && Array.isArray(result.data.images)) {
  //         console.log(
  //           "✅ Setting uploadedImages and formData.images from backend response:",
  //           result.data.images
  //         );
  //         setUploadedImages(result.data.images);
  //         setFormData((prev) => ({ ...prev, images: result.data.images }));
  //       } else {
  //         console.warn(
  //           "⚠️ No images returned from backend after upload",
  //           result.data?.images
  //         );
  //       }

  //       // Extract jewelry ID from multiple possible response structures
  //       const jewelryId =
  //         result.data?.ringId ||
  //         result.data?.jewelryId ||
  //         result.data?._id ||
  //         result.data?.id ||
  //         "";

  //       console.log("🆔 Extracted jewelry ID:", jewelryId);

  //       setCreatedOrderId(jewelryId);

  //       // Generate payment order data with proper IDs
  //       const timestamp = Date.now();
  //       const randomSuffix = Math.random().toString(36).substr(2, 9);
  //       const orderId = `KYNA${timestamp}${randomSuffix}`;

  //       const basePrice = 6500;
  //       const gst = Math.round(basePrice * 0.18);
  //       const totalAmount = basePrice + gst;

  //       const paymentOrderData = {
  //         orderId,
  //         orderNumber: orderId,
  //         orderCategory: 'design-your-own',
  //         orderType: 'customized',
  //         amount: totalAmount,
  //         items: [
  //           {
  //             name: `Custom ${updatedFormData.jewelryType} Design${
  //               jewelryId ? ` - ${jewelryId}` : ""
  //             }`,
  //             quantity: 1,
  //             price: totalAmount,
  //           },
  //         ],
  //         jewelryId: jewelryId || `custom_${timestamp}`,
  //         userId: currentUserId, // Use the reliably obtained userId
  //         customData: {
  //           jewelryType: updatedFormData.jewelryType,
  //           customizationComplete: true,
  //           backendJewelryId: jewelryId,
  //         },
  //         // Comprehensive order details with all customization data
  //         orderDetails: {
  //           jewelryType: updatedFormData.jewelryType,
  //           description: formData.description || `Custom ${updatedFormData.jewelryType} Design`,

  //           // Images from all steps
  //           images: result.data?.images?.map((url: string, index: number) => ({
  //             url,
  //             source: "cloudinary",
  //             step: "design",
  //             alt: `Custom ${updatedFormData.jewelryType} design image ${index + 1}`,
  //             uploadedAt: new Date().toISOString(),
  //           })) || [],

  //           // Diamond selection details from form
  //           diamond: {
  //             shape: formData.diamondShape,
  //             size: formData.diamondSize,
  //             color: formData.diamondColor,
  //             clarity: formData.diamondClarity,
  //           },

  //           // Metal and setting details
  //           metal: {
  //             type: formData.metal || "Gold",
  //             color: formData.metalColor || "Same as Image",
  //             karat: formData.goldKarat || "18KT",
  //           },

  //           // Ring specific details
  //           ringDetails: {
  //             size: formData.ringSize,
  //             jewelryType: updatedFormData.jewelryType,
  //           },

  //           // All step data for complete history
  //           stepData: {
  //             step1: {
  //               jewelryType: updatedFormData.jewelryType,
  //               sameAsImage: formData.sameAsImage,
  //               modificationRequest: formData.modificationRequest
  //             },
  //             step2: {
  //               diamondShape: formData.diamondShape,
  //               diamondSize: formData.diamondSize,
  //               diamondColor: formData.diamondColor,
  //               diamondClarity: formData.diamondClarity
  //             },
  //             step3: {
  //               metal: formData.metal,
  //               metalColor: formData.metalColor,
  //               goldKarat: formData.goldKarat,
  //               ringSize: formData.ringSize
  //             },
  //             step4: {
  //               engraving: formData.engraving,
  //               priority: formData.priority,
  //               specialInstructions: formData.specialInstructions
  //             },
  //             step5: {
  //               imagesUploaded: result.data?.images?.length || 0,
  //               reviewCompleted: true,
  //               timestamp: new Date().toISOString()
  //             }
  //           },

  //           // Additional customization
  //           engraving: {
  //             text: formData.engraving,
  //           },

  //           // Special requests and notes
  //           specialRequests: formData.specialInstructions || "",
  //           notes: `Custom ${updatedFormData.jewelryType} designed through ring builder. Priority: ${formData.priority}`,

  //           // Contact information included
  //           contactInfo: {
  //             firstName: formData.firstName,
  //             lastName: formData.lastName,
  //             address: formData.address,
  //             country: formData.country,
  //             region: formData.region,
  //             phoneNumber: formData.phoneNumber
  //           },

  //           // Estimated Delivery Date from courier API
  //           estimatedDelivery: eddResult?.estimated_delivery || null,
  //           estimatedDeliveryDay: eddResult?.estimated_day || null,

  //           // Completion status
  //           customizationComplete: true,
  //           completedSteps: ["step1", "step2", "step3", "step4", "step5"],

  //           // Reference IDs
  //           backendJewelryId: jewelryId,
  //           designId: `design_${timestamp}`,

  //           // Pricing breakdown
  //           priceBreakdown: {
  //             basePrice: basePrice,
  //             gst: gst,
  //             total: totalAmount
  //           }
  //         },
  //         // Include uploaded image URLs returned from backend (Cloudinary)
  //         images:
  //           result.data?.images?.map((url: string) => ({
  //             url,
  //             source: "cloudinary",
  //             uploadedAt: new Date().toISOString(),
  //           })) || [],
  //       };

  //       console.log(
  //         "💳 [PAYMENT] PAYMENT ORDER DATA IMAGES:",
  //         JSON.stringify(paymentOrderData.images)
  //       );
  //       console.log(
  //         "💳 [PAYMENT] PAYMENT ORDER DATA IMAGES COUNT:",
  //         paymentOrderData.images?.length || 0
  //       );

  //       // Log EDD data being included in payment order
  //       console.log('📦 [EDD] EDD data in payment order:', {
  //         estimatedDelivery: paymentOrderData.orderDetails?.estimatedDelivery,
  //         estimatedDeliveryDay: paymentOrderData.orderDetails?.estimatedDeliveryDay,
  //         hasEddData: !!(paymentOrderData.orderDetails?.estimatedDelivery)
  //       });

  //       if (!paymentOrderData.images || paymentOrderData.images.length === 0) {
  //         console.error("❌ CRITICAL: paymentOrderData.images is empty!");
  //         console.log(
  //           "� result.data.images was:",
  //           JSON.stringify(result.data?.images)
  //         );
  //       }

  //       // Enhanced alert to show EDD info
  //       alert(
  //         `RINGBUILDER: Setting orderData with ${
  //           paymentOrderData.images?.length || 0
  //         } images and EDD: ${paymentOrderData.orderDetails?.estimatedDelivery || 'No EDD'}`
  //       );

  //       // Log complete payment order data structure before setting
  //       console.log('💳 [PAYMENT] Complete payment order data structure:', JSON.stringify(paymentOrderData, null, 2));

  //       setOrderData(paymentOrderData as PaymentOrderType);
  //       setShowPaymentForm(true);

  //       // Automatically navigate to step 3 to show the PaymentForm
  //       setCurrentStep(3);

  //       const eddInfo = eddResult?.estimated_delivery ?
  //         `EDD: ${eddResult.estimated_delivery} (${eddResult.estimated_day || 'N/A'})` :
  //         'No EDD';

  //       alert(
  //         `Order created successfully! ${
  //           jewelryId ? `Jewelry ID: ${jewelryId}` : "Ready for payment"
  //         } | ${eddInfo}`
  //       );

  //       console.log('📦 [EDD] Final order creation summary:', {
  //         orderCreated: true,
  //         jewelryId: jewelryId,
  //         eddIncluded: !!(eddResult?.estimated_delivery),
  //         eddData: eddResult,
  //         paymentFormReady: true
  //       });
  //       setLoading(false);
  //     } else {
  //       console.error("❌ Order creation failed:", result.message);
  //       alert(`Failed to create order: ${result.message}`);
  //     }
  //   } catch (error) {
  //     console.error("💥 Order creation error:", error);
  //     alert(
  //       `Error creating order: ${
  //         error instanceof Error ? error.message : "Unknown error"
  //       }`
  //     );
  //   }
  // };

  // Add the missing payment handler functions
  const handlePaymentSuccess = async (customizationResult: {
    requestId: string;
    requestNumber: string;
  }) => {
    try {
      console.log(
        "🎉 Customization request saved successfully:",
        customizationResult
      );
      toast.success(
        "🎉 Payment successful! Your customization request has been submitted successfully."
      );

      // Navigate to success page or dashboard
      navigate("/");
    } catch (error) {
      console.error("❌ Error handling payment success:", error);
      toast.error(
        "Payment successful but there was an issue. Please contact support."
      );
    }
  };

  const handlePaymentCancel = () => {
    console.log("❌ Payment cancelled by user");
    setShowPaymentForm(false);
    setCustomizationData(null);
  };

  const handlePaymentError = (error: string) => {
    console.error("❌ Payment error:", error);
    toast.error(`Payment Error: ${error}`);
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
      <RingSizeGuidePopup 
        isOpen={isRingSizePopupOpen} 
        onClose={() => setIsRingSizePopupOpen(false)} 
      />
    </div>
  );
}
