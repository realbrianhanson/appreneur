import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export interface TrackingParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  fb_ad_id: string | null;
  fb_adset_id: string | null;
  fb_campaign_id: string | null;
  fbclid: string | null;
}

const STORAGE_KEY = "tracking_params";

export function useTrackingParams(): TrackingParams {
  const [searchParams] = useSearchParams();
  const [params, setParams] = useState<TrackingParams>(() => {
    // Try to get from sessionStorage first
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      fb_ad_id: null,
      fb_adset_id: null,
      fb_campaign_id: null,
      fbclid: null,
    };
  });

  useEffect(() => {
    // Only update if we have new params in the URL
    const utm_source = searchParams.get("utm_source");
    const utm_medium = searchParams.get("utm_medium");
    const utm_campaign = searchParams.get("utm_campaign");
    const utm_content = searchParams.get("utm_content");
    const fbclid = searchParams.get("fbclid");
    const fb_ad_id = searchParams.get("fb_ad_id") || searchParams.get("ad_id");
    const fb_adset_id = searchParams.get("fb_adset_id") || searchParams.get("adset_id");
    const fb_campaign_id = searchParams.get("fb_campaign_id") || searchParams.get("campaign_id");

    // Check if any params exist in URL
    if (utm_source || utm_medium || utm_campaign || utm_content || fbclid || fb_ad_id || fb_adset_id || fb_campaign_id) {
      const newParams: TrackingParams = {
        utm_source: utm_source || params.utm_source,
        utm_medium: utm_medium || params.utm_medium,
        utm_campaign: utm_campaign || params.utm_campaign,
        utm_content: utm_content || params.utm_content,
        fb_ad_id: fb_ad_id || params.fb_ad_id,
        fb_adset_id: fb_adset_id || params.fb_adset_id,
        fb_campaign_id: fb_campaign_id || params.fb_campaign_id,
        fbclid: fbclid || params.fbclid,
      };

      setParams(newParams);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newParams));
    }
  }, [searchParams]);

  return params;
}

export function getStoredTrackingParams(): TrackingParams {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    fb_ad_id: null,
    fb_adset_id: null,
    fb_campaign_id: null,
    fbclid: null,
  };
}

export function clearTrackingParams(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
