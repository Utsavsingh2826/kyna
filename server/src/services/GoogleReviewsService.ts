import fetch from "node-fetch";

interface GoogleReview {
    author_name: string;
    author_url: string;
    profile_photo_url: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
}

interface GooglePlaceDetails {
    name?: string;
    rating?: number;
    user_ratings_total?: number;
    reviews: GoogleReview[];
}

interface CachedData {
    data: GooglePlaceDetails;
    lastFetched: number;
}

// Cache duration: 6 hours in milliseconds
const CACHE_DURATION = 6 * 60 * 60 * 1000;

let cache: CachedData | null = null;

export const getGooglePlaceDetails = async (): Promise<GooglePlaceDetails> => {
    const now = Date.now();
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
    const PLACE_ID = process.env.GOOGLE_PLACE_ID;

    // 1. Check if we have valid cache
    if (cache && (now - cache.lastFetched < CACHE_DURATION)) {
        console.log("Serving Google Place Details from cache");
        return cache.data;
    }

    // 2. Validate Env Vars
    if (!GOOGLE_PLACES_API_KEY || !PLACE_ID) {
        console.warn("GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID is not configured in .env");
        // Return existing cache if possible, otherwise empty
        return cache ? cache.data : { reviews: [] };
    }

    // 3. Fetch from Google API
    try {
        console.log("Fetching new data from Google Places API...");
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,user_ratings_total,reviews&key=${GOOGLE_PLACES_API_KEY}`;

        // Use a timeout for the fetch
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Google API responded with status: ${response.status}`);
        }

        const data = await response.json() as any;

        if (data.status === "OK" && data.result) {

            const reviews = (data.result.reviews || []).map((review: any) => ({
                author_name: review.author_name,
                author_url: review.author_url,
                profile_photo_url: review.profile_photo_url,
                rating: review.rating,
                relative_time_description: review.relative_time_description,
                text: review.text,
                time: review.time,
            }));

            const resultData: GooglePlaceDetails = {
                name: data.result.name,
                rating: data.result.rating,
                user_ratings_total: data.result.user_ratings_total,
                reviews: reviews
            };

            // Update Cache
            cache = {
                data: resultData,
                lastFetched: now
            };

            return resultData;
        } else {
            console.warn(`Google Places API Status: ${data.status}`, data.error_message);
            // Fallback to cache if API quota exceeded or other error
            return cache ? cache.data : { reviews: [] };
        }

    } catch (error) {
        console.error("Error in GoogleReviewsService:", error);
        // Fallback to cache on network error
        return cache ? cache.data : { reviews: [] };
    }
};
