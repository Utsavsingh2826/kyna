const mongoose = require("mongoose");
const Review = require("./src/models/reviewModel").default;
const { UserModel: User } = require("./src/models/userModel");
require("dotenv").config();

const sampleReviews = [
  {
    rating: 5,
    title: "Absolutely stunning ring!",
    comment:
      "I bought this engagement ring for my fiancée and she absolutely loves it! The craftsmanship is exceptional, and the diamond sparkles beautifully. The setting is elegant and well-made. Highly recommend!",
    userEmail: "priya.sharma@example.com",
    userName: "Priya Sharma",
    location: "Mumbai",
  },
  {
    rating: 4,
    title: "Beautiful design, great quality",
    comment:
      "Really impressed with the quality of this ring. The engraving work is detailed and precise. It's exactly what I was looking for. Only minor issue was the delivery took a bit longer than expected.",
    userEmail: "rajesh.kumar@example.com",
    userName: "Rajesh Kumar",
    location: "Delhi",
  },
  {
    rating: 5,
    title: "Perfect anniversary gift!",
    comment:
      "Bought this as an anniversary gift for my wife. The ring is gorgeous and the personalization options made it extra special. The packaging was beautiful too. Will definitely order again!",
    userEmail: "amit.patel@example.com",
    userName: "Amit Patel",
    location: "Ahmedabad",
  },
  {
    rating: 4,
    title: "Excellent craftsmanship",
    comment:
      "The attention to detail in this ring is remarkable. The metal finish is smooth and the overall design is very elegant. Good value for money. Customer service was also very helpful.",
    userEmail: "sneha.reddy@example.com",
    userName: "Sneha Reddy",
    location: "Bangalore",
  },
  {
    rating: 5,
    title: "Exceeded expectations!",
    comment:
      "I was a bit hesitant ordering jewelry online, but this ring exceeded all my expectations. The quality is amazing and it looks even better in person. Fast shipping and secure packaging.",
    userEmail: "vikram.singh@example.com",
    userName: "Vikram Singh",
    location: "Jaipur",
  },
];

async function seedReviewsForENG1() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    // First, create or find users for the reviews
    const users = [];

    for (const reviewData of sampleReviews) {
      let user = await User.findOne({ email: reviewData.userEmail });

      if (!user) {
        // Create a new user
        const nameParts = reviewData.userName.split(" ");
        user = await User.create({
          email: reviewData.userEmail,
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" "),
          name: reviewData.userName,
          password: "hashedPassword123", // dummy password
          isVerified: true,
          city: reviewData.location,
          phoneNumber: `+91${Math.floor(
            1000000000 + Math.random() * 9000000000
          )}`,
        });
        console.log(`Created user: ${reviewData.userName}`);
      }

      users.push(user);
    }

    // Check if reviews already exist for ENG1
    const existingReviews = await Review.find({ product: "ENG1" });
    if (existingReviews.length > 0) {
      console.log(
        `Found ${existingReviews.length} existing reviews for ENG1. Deleting them first...`
      );
      await Review.deleteMany({ product: "ENG1" });
    }

    // Create reviews for ENG1 model
    const reviewsToCreate = sampleReviews.map((reviewData, index) => ({
      user: users[index]._id,
      product: "ENG1",
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      images: [], // No images for now
      likes: [],
      replies: [],
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ), // Random date within last 30 days
    }));

    const createdReviews = await Review.insertMany(reviewsToCreate);
    console.log(
      `Successfully created ${createdReviews.length} reviews for ENG1 model`
    );

    // Display the created reviews
    const populatedReviews = await Review.find({ product: "ENG1" })
      .populate("user", "firstName lastName email city")
      .sort({ createdAt: -1 });

    console.log("\nCreated Reviews for ENG1:");
    populatedReviews.forEach((review: any, index: number) => {
      console.log(
        `\n${index + 1}. ${review.title} - Rating: ${"★".repeat(
          review.rating
        )}${"☆".repeat(5 - review.rating)} (${review.rating}/5)`
      );
      console.log(
        `   Author: ${(review.user as any).firstName} ${
          (review.user as any).lastName
        } (${(review.user as any).email})`
      );
      console.log(`   Location: ${(review.user as any).city}`);
      console.log(`   Comment: ${review.comment.substring(0, 100)}...`);
      console.log(`   Created: ${review.createdAt.toLocaleDateString()}`);
    });

    console.log(
      `\n✅ Successfully seeded ${createdReviews.length} reviews for ENG1 model`
    );
    console.log("You can now test the reviews fetching on the frontend!");
  } catch (error) {
    console.error("Error seeding reviews:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedReviewsForENG1();
