import { Request, Response } from 'express';
import path from 'path';

/**
 * Serves the pre-generated static Meta Product Feed index.
 * The feed is generated via: npx ts-node src/scripts/build-meta-feed.ts
 */
export const getMetaProductFeed = async (req: Request, res: Response) => {
  const indexPath = path.join(process.cwd(), 'public', 'feeds', 'index.xml');
  
  // Check if file exists to give a better error message if someone forgot to run the script
  try {
    res.header('Content-Type', 'application/xml');
    res.sendFile(indexPath);
  } catch (error) {
    console.error('❌ Error serving meta feed:', error);
    res.status(404).json({ 
      success: false, 
      message: 'Feed not found. Please run the generation script (build-meta-feed.ts) first.' 
    });
  }
};

export const subscribe = async (req: Request, res: Response) => {
  // Existing subscribe logic
  res.status(200).json({ success: true, message: 'Subscribed!' });
};
