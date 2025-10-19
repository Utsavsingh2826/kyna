import { useState } from "react";
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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    url: "",
    modification: "",
    description: "",
    diamondShape: "Round",
    diamondSize: "Center Stone",
    diamondColor: "Center Stone",
    metalType: "Gold",
    metalColor: "Same as Image",
    ringSize: "",
    goldKarat: "22KT",
    engraving: "",
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageUrls = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setUploadedImages([...uploadedImages, ...imageUrls]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const updateSteps = (step: number) => {
    setCurrentStep(step);
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
  const [same_as_image, setSame_as_image] = useState(false);
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
            <div>
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
            </div>
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
                "We want to make sure your ring is exactly how you envision it.
                Please share your thoughts on."
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="same-image"
                  className="rounded border-border"
                  onClick={() => {
                    setSame_as_image(!same_as_image);
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
              same_as_image ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {/* Selected Images */}
            <div>
              <div
                className={`flex items-center justify-between mb-4 ${
                  same_as_image ? "text-gray-400" : ""
                }`}
              >
                <h3 className="font-medium">Selected Images</h3>
                <Button
                  variant="link"
                  size="sm"
                  className={`text-[#328F94] ${
                    same_as_image ? "text-gray-400 pointer-events-none" : ""
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
                        same_as_image ? "pointer-events-none" : ""
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
                  same_as_image ? "text-gray-400" : ""
                }`}
              >
                Select Diamond Shape * : {formData.diamondShape}
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {diamondShapes.map((shape) => (
                  <button
                    key={shape.name}
                    onClick={() =>
                      setFormData({ ...formData, diamondShape: shape.name })
                    }
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-xs ${
                      formData.diamondShape === shape.name
                        ? "bg-[#328F94]/20"
                        : ""
                    } ${
                      same_as_image ? "text-gray-400 pointer-events-none" : ""
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
                  same_as_image ? "text-gray-400" : ""
                }`}
              >
                Select Diamond Specification
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-lg ">
                  <label
                    className={`text-sm text-muted-foreground ${
                      same_as_image ? "text-gray-400" : ""
                    }`}
                  >
                    Diamond Size *
                  </label>
                  <Select
                    value={formData.diamondSize}
                    onValueChange={(value) =>
                      setFormData({ ...formData, diamondSize: value })
                    }
                    disabled={same_as_image}
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
                      same_as_image ? "text-gray-400" : ""
                    }`}
                  >
                    Diamond Color & Clarity *
                  </label>
                  <Select
                    value={formData.diamondColor}
                    onValueChange={(value) =>
                      setFormData({ ...formData, diamondColor: value })
                    }
                    disabled={same_as_image}
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
                  same_as_image ? "text-gray-400" : ""
                }`}
              >
                Metal Type *
              </label>
              <Select
                value={formData.metalType}
                onValueChange={(value) =>
                  setFormData({ ...formData, metalType: value })
                }
                disabled={same_as_image}
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

            {/* Gold Karat */}
            <div>
              <label
                className={`text-sm font-medium mb-2 block ${
                  same_as_image ? "text-gray-400" : ""
                }`}
              >
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
                    } ${
                      same_as_image ? "text-gray-400 pointer-events-none" : ""
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
              same_as_image ? "pointer-events-none opacity-50" : ""
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

            {/* Add Engraving */}
            <Link to="/engrave-your-ring" className="text-sm text-[#328F94]">
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
              </div>
            </Link>
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
                    setFormData({ ...formData, phoneNumber: e.target.value })
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

          <Button className="w-full bg-[#328F94] hover:bg-[#328F94]/90 text-white">
            Make Payment →
          </Button>

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
    </div>
  );
}
