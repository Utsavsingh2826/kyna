import ReactPixel from 'react-facebook-pixel';

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '1562132752582015';

export const initPixel = () => {
  if (typeof window !== 'undefined') {
    ReactPixel.init(PIXEL_ID, undefined, {
      debug: false,
      autoConfig: true
    });
    console.log('✅ Meta Pixel Initialized');
  }
};

export const trackPageView = () => {
  if (typeof window !== 'undefined') {
    ReactPixel.pageView();
  }
};

export const trackEvent = (event: string, data: any = {}, eventID?: string) => {
  if (typeof window !== 'undefined') {
    if (eventID) {
      ReactPixel.track(event, data, { eventID });
    } else {
      ReactPixel.track(event, data);
    }
    console.log(`📡 Meta Event Tracked: ${event}`, data);
  }
};
