import { useState, useEffect } from "react";
import { contentApi } from "../lib/api";
import type { SiteContent } from "../types";

const defaultContent: SiteContent = {
  institute_name: "SKYWAY MINISTRIES OF CHRIST",
  tagline: "TEACH - PREACH - HEAL",
  since: "SINCE 2023",
  logo_url: "",
  hero_title: "Teach · Preach · Heal",
  hero_description: "",
  hero_image_url: "",
  about_text: "",
  about_mission: "",
  about_vision: "",
  about_intro: "",
  contact_email: "",
  contact_phone: "",
  contact_address: "",
  donation_instructions: "",
  donation_jazzcash: "",
  donation_easypaisa: "",
  donation_bank_details: "",
  social_facebook: "",
  social_twitter: "",
  social_instagram: "",
};

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentApi
      .get()
      .then((data) => {
        setContent({
          ...defaultContent,
          ...(data as unknown as SiteContent),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { content, loading, setContent };
}
