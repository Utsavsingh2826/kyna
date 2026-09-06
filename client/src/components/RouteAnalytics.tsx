import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView as trackMetaPageView } from "@/utils/pixel";
import { trackPageView as trackGa4PageView } from "@/utils/analytics";

export default function RouteAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}`;
    trackMetaPageView();
    trackGa4PageView(pagePath);
  }, [location]);

  return null;
}
