import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// Check serviceability endpoint
router.post('/check', async (req: Request, res: Response) => {
  try {
    const { pin_code } = req.body;
    
    if (!pin_code || !/^\d{6}$/.test(pin_code)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit PIN code'
      });
    }

    console.log('🚀 Checking serviceability for PIN:', pin_code);

    const response = await fetch('https://test.sequel247.com/api/checkServiceability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'b228a27399f07927985d57c0f7d94ce8',
        pin_code: pin_code,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result: any = await response.json();
    console.log('📍 Serviceability API response:', result);

    // Handle different response formats
    const isServiceable = result.status === true || 
                         result.status === 'true' || 
                         result.success === true ||
                         result.serviceable === true;

    res.json({
      success: true,
      serviceable: isServiceable,
      message: isServiceable ? 'Area is serviceable' : 'Area is not serviceable',
      data: result,
      pin_code: pin_code
    });

  } catch (error) {
    console.error('❌ Serviceability check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check serviceability',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Calculate EDD endpoint
router.post('/calculate-edd', async (req: Request, res: Response) => {
  try {
    const { destination_pincode, origin_pincode = '400097' } = req.body;
    
    if (!destination_pincode || !/^\d{6}$/.test(destination_pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid destination PIN code'
      });
    }

    console.log('📦 Calculating EDD for destination:', destination_pincode);

    const response = await fetch('https://test.sequel247.com/api/shipment/calculateEDD', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'b228a27399f07927985d57c0f7d94ce8',
        origin_pincode: origin_pincode,
        destination_pincode: destination_pincode,
        pickup_date: new Date().toISOString().split('T')[0]
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result: any = await response.json();
    console.log('📅 EDD API response:', result);

    // Extract EDD data from different possible response formats
    const eddData = result.result || result.data || result;
    
    res.json({
      success: true,
      data: result,
      estimated_delivery: eddData?.estimated_delivery,
      estimated_day: eddData?.estimated_day,
      origin_pincode: origin_pincode,
      destination_pincode: destination_pincode,
      message: 'EDD calculated successfully'
    });

  } catch (error) {
    console.error('❌ EDD calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate delivery date',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint to check if serviceability routes are working
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Serviceability routes are working!',
    endpoints: {
      check: 'POST /api/serviceability/check',
      calculateEDD: 'POST /api/serviceability/calculate-edd'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;