import { Request, Response } from "express";
import fetch from "node-fetch";

// Google Reviews API endpoint
// This endpoint fetches Google Reviews using Google Places API
export const getGoogleReviews = async (req: Request, res: Response) => {
  try {
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    const PLACE_ID = process.env.GOOGLE_PLACE_ID; // Your Google Business Place ID

    if (!GOOGLE_PLACES_API_KEY || !PLACE_ID) {
      // Return empty array if API key is not configured
      return res.status(200).json({
        success: true,
        data: [],
        message: "Google Reviews API not configured",
      });
    }

    // Fetch reviews from Google Places API
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.status === "OK" && data.result && data.result.reviews) {
      // Transform Google reviews to match our format
      const reviews = data.result.reviews.map((review: any) => ({
        author_name: review.author_name,
        author_url: review.author_url,
        profile_photo_url: review.profile_photo_url,
        rating: review.rating,
        relative_time_description: review.relative_time_description,
        text: review.text,
        time: review.time,
      }));

      return res.status(200).json({
        success: true,
        data: reviews,
      });
    } else {
      // If API call fails, return empty array
      console.warn("Google Places API error:", data.status);
      return res.status(200).json({
        success: true,
        data: [],
        message: "Unable to fetch Google reviews",
      });
    }
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
    // Return empty array on error instead of failing
    return res.status(200).json({
      success: true,
      data: [],
      message: "Failed to fetch Google reviews",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
