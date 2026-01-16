import { Request, Response } from "express";
import { getGooglePlaceDetails } from "../services/GoogleReviewsService";

// GET /api/reviews/site
export const getSiteReviews = async (req: Request, res: Response) => {
  try {
    const details = await getGooglePlaceDetails();

    // The frontend expects the reviews array in 'data'
    // We can also include the summary info if needed, but for now we follow the existing pattern
    // or we can send the whole details object if we update the frontend type.
    // Given the requirement "Map Google review fields to existing Site Review UI fields",
    // and "Do NOT change UI layout", we will return the reviews array as the main data
    // but maybe include overall rating in meta or separate field if we want.
    // Existing frontend expects: { success: true, data: GoogleReview[] }

    return res.status(200).json({
      success: true,
      data: details.reviews,
      summary: {
        name: details.name,
        rating: details.rating,
        total_ratings: details.user_ratings_total
      }
    });

  } catch (error) {
    console.error("Error in getSiteReviews controller:", error);
    return res.status(500).json({
      success: false,
      data: [],
      message: "Internal server error fetching site reviews"
    });
  }
};

// Keep existing alias if needed or just use the one above.
// The user asked to create "GoogleReviewsController (or similar)".
// This file is googleReviewsController.ts.

