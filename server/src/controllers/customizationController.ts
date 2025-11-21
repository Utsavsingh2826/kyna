import { Request, Response } from "express";
import CustomizationRequest, {
  CustomizationStatus,
  ICustomizationRequest,
} from "../models/CustomizationRequest";
import { AuthRequest } from "../types";

/**
 * Create a new customization request with payment integration
 * POST /api/customization/request-with-payment
 */
export const createCustomizationRequestWithPayment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const {
      title,
      description,
      category,
      subCategory,
      jewelryType,
      stylingName,
      referenceImages = [],
      inspirationImages = [],
      diamondShape,
      diamondSize,
      diamondColor,
      diamondClarity,
      diamondOrigin,
      metalType,
      metalKarat,
      metalColor,
      // size normalization candidates
      size,
      ringSize,
      braceletSize,
      bangleSize,
      dimensions,
      engraving,
      specialInstructions,
      budgetRange,
      contactInfo,
      customData,
      tags = [],
      estimatedDelivery,
      estimatedDeliveryDay,
      paymentId,
      paymentStatus,
      paymentAmount,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !subCategory || !jewelryType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: [
          "title",
          "description",
          "category",
          "subCategory",
          "jewelryType",
        ],
      });
    }

    // Normalize size across jewelry types
    const normalizedSize = size || ringSize || braceletSize || bangleSize;

    // Create customization request
    const customizationRequest = new CustomizationRequest({
      userId,
      title,
      description,
      category,
      subCategory,
      jewelryType,
      stylingName: stylingName || "CUSTOM",
      referenceImages,
      inspirationImages,
      diamondShape,
      diamondSize,
      diamondColor,
      diamondClarity,
      diamondOrigin,
      metalType,
      metalKarat,
      metalColor,
      // Save generic size; keep ringSize only for backward-compat when provided
      size: normalizedSize,
      ...(ringSize ? { ringSize } : {}),
      dimensions,
      engraving,
      specialInstructions,
      budgetRange,
      contactInfo,
      customData,
      tags,
      status: CustomizationStatus.PENDING,
      progress: 10,
      requestedAt: new Date(),
      estimatedDelivery: estimatedDelivery
        ? new Date(estimatedDelivery)
        : undefined,
      estimatedDeliveryDay,
      // Payment fields (if provided)
      paymentId: paymentId || undefined,
      paymentStatus: paymentStatus || (paymentId ? "success" : undefined),
      paymentAmount: paymentAmount || undefined,
    });

    console.log("📝 Customization request data before save:", {
      requestId: customizationRequest.requestId,
      requestNumber: customizationRequest.requestNumber,
      userId: customizationRequest.userId,
      title: customizationRequest.title,
      contactInfo: customizationRequest.contactInfo,
    });

    await customizationRequest.save();

    console.log("✅ Customization request saved successfully:", {
      requestId: customizationRequest.requestId,
      requestNumber: customizationRequest.requestNumber,
      _id: customizationRequest._id,
    });

    // Add initial message
    await customizationRequest.addMessage(
      "user",
      `Customization request created: ${title}`
    );

    console.log(
      `✅ Customization request created: ${customizationRequest.requestId}`
    );

    // Return data for payment processing
    res.status(201).json({
      success: true,
      message: "Customization request created successfully",
      data: {
        requestId: customizationRequest.requestId,
        requestNumber: customizationRequest.requestNumber,
        status: customizationRequest.status,
        progress: customizationRequest.progress,
        createdAt: customizationRequest.createdAt,
        size:
          customizationRequest.size || customizationRequest.ringSize || null,
        ringSize: customizationRequest.ringSize || null,
        amount: customizationRequest.paymentAmount || 1000, // Use actual payment amount or default
        estimatedDelivery: customizationRequest.estimatedDelivery,
        estimatedDeliveryDay: customizationRequest.estimatedDeliveryDay,
        // Include payment information
        paymentId: customizationRequest.paymentId,
        paymentStatus: customizationRequest.paymentStatus,
        paymentAmount: customizationRequest.paymentAmount,
      },
    });
  } catch (error) {
    console.error("❌ Error creating customization request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create customization request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Create a new customization request
 * POST /api/customization/request
 */
export const createCustomizationRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const {
      title,
      description,
      category,
      subCategory,
      jewelryType,
      stylingName,
      referenceImages = [],
      inspirationImages = [],
      diamondShape,
      diamondSize,
      diamondColor,
      diamondClarity,
      diamondOrigin,
      metalType,
      metalKarat,
      metalColor,
      // size normalization candidates
      size,
      ringSize,
      braceletSize,
      bangleSize,
      dimensions,
      engraving,
      specialInstructions,
      budgetRange,
      customData,
      tags = [],
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !subCategory || !jewelryType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: [
          "title",
          "description",
          "category",
          "subCategory",
          "jewelryType",
        ],
      });
    }

    // Normalize size across jewelry types
    const normalizedSize2 = size || ringSize || braceletSize || bangleSize;

    // Create customization request
    const customizationRequest = new CustomizationRequest({
      userId,
      title,
      description,
      category,
      subCategory,
      jewelryType,
      stylingName: stylingName || "CUSTOM",
      referenceImages,
      inspirationImages,
      diamondShape,
      diamondSize,
      diamondColor,
      diamondClarity,
      diamondOrigin,
      metalType,
      metalKarat,
      metalColor,
      size: normalizedSize2,
      ...(ringSize ? { ringSize } : {}),
      dimensions,
      engraving,
      specialInstructions,
      budgetRange,
      customData,
      tags,
      status: CustomizationStatus.PENDING,
      progress: 10,
      requestedAt: new Date(),
    });

    console.log("📝 Customization request data before save:", {
      requestId: customizationRequest.requestId,
      requestNumber: customizationRequest.requestNumber,
      userId: customizationRequest.userId,
      title: customizationRequest.title,
      contactInfo: customizationRequest.contactInfo,
    });

    await customizationRequest.save();

    console.log("✅ Customization request saved successfully:", {
      requestId: customizationRequest.requestId,
      requestNumber: customizationRequest.requestNumber,
      _id: customizationRequest._id,
    });

    // Add initial message
    await customizationRequest.addMessage(
      "user",
      `Customization request created: ${title}`
    );

    console.log(
      `✅ Customization request created: ${customizationRequest.requestId}`
    );

    res.status(201).json({
      success: true,
      message: "Customization request created successfully",
      data: {
        requestId: customizationRequest.requestId,
        requestNumber: customizationRequest.requestNumber,
        status: customizationRequest.status,
        progress: customizationRequest.progress,
        createdAt: customizationRequest.createdAt,
        size:
          customizationRequest.size || customizationRequest.ringSize || null,
        ringSize: customizationRequest.ringSize || null,
      },
    });
  } catch (error) {
    console.error("❌ Error creating customization request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create customization request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get user's customization requests
 * GET /api/customization/my-requests
 */
export const getMyCustomizationRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;
    const { limit = 10, status } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    let query: any = { userId };
    if (status) {
      query.status = status;
    }

    const requests = await CustomizationRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      message: "Customization requests retrieved successfully",
      data: requests,
    });
  } catch (error) {
    console.error("❌ Error fetching customization requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customization requests",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get specific customization request
 * GET /api/customization/request/:requestId
 */
export const getCustomizationRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;
    const { requestId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const request = await CustomizationRequest.findOne({
      requestId,
      userId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Customization request not found",
      });
    }

    res.json({
      success: true,
      message: "Customization request retrieved successfully",
      data: request,
    });
  } catch (error) {
    console.error("❌ Error fetching customization request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customization request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Add message to customization request
 * POST /api/customization/request/:requestId/message
 */
export const addMessageToRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { requestId } = req.params;
    const { message, attachments = [] } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const request = await CustomizationRequest.findOne({
      requestId,
      userId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Customization request not found",
      });
    }

    await request.addMessage("user", message, attachments);

    res.json({
      success: true,
      message: "Message added successfully",
      data: {
        requestId: request.requestId,
        messageCount: request.messages.length,
      },
    });
  } catch (error) {
    console.error("❌ Error adding message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Cancel customization request
 * PATCH /api/customization/request/:requestId/cancel
 */
export const cancelCustomizationRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;
    const { requestId } = req.params;
    const { reason } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const request = await CustomizationRequest.findOne({
      requestId,
      userId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Customization request not found",
      });
    }

    if (request.status === CustomizationStatus.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed request",
      });
    }

    await request.updateStatus(
      CustomizationStatus.CANCELLED,
      reason ? `Request cancelled: ${reason}` : "Request cancelled by user"
    );

    res.json({
      success: true,
      message: "Customization request cancelled successfully",
      data: {
        requestId: request.requestId,
        status: request.status,
      },
    });
  } catch (error) {
    console.error("❌ Error cancelling customization request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel customization request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Admin: Get all customization requests
 * GET /api/customization/admin/all
 */
export const getAllCustomizationRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { limit = 20, status, category } = req.query;

    let query: any = {};
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }

    const requests = await CustomizationRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      message: "All customization requests retrieved successfully",
      data: requests,
    });
  } catch (error) {
    console.error("❌ Error fetching all customization requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customization requests",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Admin: Update customization request status
 * PATCH /api/customization/admin/request/:requestId/status
 */
export const updateCustomizationRequestStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { requestId } = req.params;
    const { status, message, adminNotes } = req.body;

    if (!Object.values(CustomizationStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const request = await CustomizationRequest.findByRequestId(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Customization request not found",
      });
    }

    await request.updateStatus(status, message);

    if (adminNotes) {
      request.adminNotes = adminNotes;
      await request.save();
    }

    res.json({
      success: true,
      message: "Customization request status updated successfully",
      data: {
        requestId: request.requestId,
        status: request.status,
        progress: request.progress,
      },
    });
  } catch (error) {
    console.error("❌ Error updating customization request status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update customization request status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Admin: Add admin message to customization request
 * POST /api/customization/admin/request/:requestId/message
 */
export const addAdminMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const { message, attachments = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const request = await CustomizationRequest.findByRequestId(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Customization request not found",
      });
    }

    await request.addMessage("admin", message, attachments);

    res.json({
      success: true,
      message: "Admin message added successfully",
      data: {
        requestId: request.requestId,
        messageCount: request.messages.length,
      },
    });
  } catch (error) {
    console.error("❌ Error adding admin message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add admin message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
