/**
 * AMC site content — factual source of truth.
 * Only verified public facts live under `verified`.
 * Generated campaign imagery is labeled and never presented as real staff/patients.
 * Narrative lines are short in-scene thoughts — never chapter labels or bridge narration.
 */

export type AssetKind = "generated_editorial" | "real_photography" | "placeholder";

export type MediaAsset = {
  id: string;
  src: string;
  alt: string;
  kind: AssetKind;
  note?: string;
};

export const site = {
  brand: {
    name: "Animal Medical Center",
    shortName: "AMC",
    tagline:
      "Advanced veterinary medicine, rooted in the understanding that pets are family.",
    city: "Mohali, Punjab, India",
  },
  verified: {
    name: "Animal Medical Center (AMC)",
    locality: "Sector 70, Mohali",
    landmark: "Opposite Community Center",
    region: "Sahibzada Ajit Singh Nagar (Mohali), Punjab, India",
    serving: "Mohali and the wider Chandigarh Tricity",
    listingSource:
      "Public business listing: Animal Medical Center (AMC), Opposite Community Center, Mohali Sector 70",
    phone: "+91 70370 38787" as string | null,
    whatsapp: "+91 70370 38787" as string | null,
    email: null as string | null,
    instagram: "https://www.instagram.com/amc.mohali/",
    instagramHandle: "@amc.mohali",
    emergencyHoursLabel: "24/7 Emergency",
    emergencyHoursVerified: true,
  },
  philosophy:
    "Care is a journey between an animal, the person who loves them, and the people who care for them.",
  hero: {
    eyebrow: "Sector 70 · Mohali",
    headline: "Every animal that comes through this door is afraid.",
    support: "This is where that stops.",
    waitHint: "The room is waiting.",
    primaryCta: "Begin",
    emergencyCta: "24/7 Emergency",
  },
  chapters: [
    {
      id: "concern" as const,
      signal: "concern" as const,
      timeLabel: "9:42 PM",
      line: "Hasn't eaten since morning.",
      thought: "You know them better than any chart.",
      image: "06-concern",
    },
    {
      id: "consultation" as const,
      signal: "consultation" as const,
      timeLabel: "Night",
      line: "The first ten minutes matter more than the next ten tests.",
      thought: "Hands slow. Voices lower.",
      image: "07-consultation",
      reveal: true,
    },
    {
      id: "diagnosis" as const,
      signal: "diagnosis" as const,
      timeLabel: "Quiet hours",
      line: "Love sees the animal. Medicine looks for what love cannot name yet.",
      thought: "What the eye cannot settle, the room must find.",
      image: "08-diagnosis",
      secondaryImage: "seeing-under",
    },
    {
      id: "treatment" as const,
      signal: "treatment" as const,
      timeLabel: "Care",
      line: "Not brave. Just held.",
      thought: "Steady hands beside a worried owner.",
      image: "09-care",
    },
    {
      id: "recovery" as const,
      signal: "recovery" as const,
      timeLabel: "Morning",
      line: "By the time you leave, the line doesn't lie.",
      thought: "Breath lengthens. Home is close.",
      image: "10-journey-recovery",
      secondaryImage: "03-recovery",
    },
  ],
  emotionalCenter: {
    beats: [
      {
        id: "bond",
        line: "The reason you came.",
        image: "17-bond-close",
      },
      {
        id: "trust",
        line: "Quiet confidence between hands.",
        image: "18-trust",
      },
      {
        id: "home",
        line: "The walk back feels lighter.",
        image: "19-home",
      },
    ],
  },
  servicesIntro: {
    title: "What care can look like here",
    body: "Critical care, careful diagnostics, and surgical attention for families across Mohali and the Tricity — ready for everyday wellness and urgent nights.",
  },
  services: [
    {
      id: "emergency",
      title: "Emergency & Critical Care",
      body: "Urgent medical attention when minutes count, with round-the-clock support so families are not alone at the worst moment.",
      image: "11-emergency",
      accent: true,
    },
    {
      id: "diagnostics",
      title: "Diagnostics",
      body: "Clear answers that guide the next step, so you understand what is happening before treatment begins.",
      image: "13-diagnostics",
      accent: false,
    },
    {
      id: "surgery",
      title: "Surgery",
      body: "Prepared rooms and careful recovery for planned procedures and urgent surgical needs.",
      image: "12-surgery",
      accent: false,
    },
    {
      id: "preventive",
      title: "Preventive Care",
      body: "Thoughtful wellness planning that protects the bond before a crisis arrives.",
      image: "14-preventive",
      accent: false,
    },
    {
      id: "dentistry",
      title: "Dentistry",
      body: "Oral health as part of whole-animal comfort, vitality, and everyday wellbeing.",
      image: "15-dentistry",
      accent: false,
    },
    {
      id: "critical",
      title: "Hospitalization & Monitoring",
      body: "Close observation when one visit is not enough, with steady oversight through recovery.",
      image: "16-critical",
      accent: false,
    },
  ],
  whenToVisit: {
    title: "When to bring your pet in",
    body: "Pets often hide discomfort. If something feels wrong, it is better to ask early than to wait through the night.",
    signs: [
      "Difficulty breathing, persistent panting, or prolonged coughing",
      "Sudden lethargy, weakness, or inability to stand",
      "Possible poisoning or swallowing something unsafe",
      "Ongoing vomiting, repeated dry heaving, or a swollen belly",
      "Serious bleeding, trauma, or sudden limping",
      "Straining or inability to urinate",
    ],
  },
  whyVisitsMatter: {
    title: "Why regular visits matter",
    body: "Routine checkups give the clinical team a clear baseline, catch quiet changes early, and often prevent harder emergency nights later.",
  },
  team: {
    title: "The people behind the care",
    body: "Real AMC team photography belongs here. Until those portraits are supplied, this section holds space — never with invented doctor names or generated faces labeled as staff.",
    note: "Generated people in campaign imagery are not AMC doctors or staff.",
  },
  ending: {
    headline: "Yours will not be, for long.",
    steadyTag: "You made it through steady.",
    appointmentCta: "Request an appointment",
    emergencyCta: "Emergency path",
    contactHeadline: "We are here when your pet needs us.",
    contactBody:
      "Located in Sector 70, Mohali, Animal Medical Center is prepared to help families across the Chandigarh Tricity with routine care and urgent medical support.",
  },
  assetDisclaimer:
    "Editorial visuals on this site are campaign imagery for mood and storytelling. Real AMC doctors, staff, patients, and facility photographs establish trust and should replace generated frames when available.",
} as const;

export const media: Record<string, MediaAsset> = {
  "hero-motion": {
    id: "hero-motion",
    src: "/media/hero-motion.jpg",
    alt: "Editorial consultation scene with a calm cat, pet owner, and veterinarian — campaign imagery",
    kind: "generated_editorial",
  },
  "01-bond": {
    id: "01-bond",
    src: "/media/01-bond.jpg",
    alt: "Editorial image of a person with a recovering dog — campaign imagery",
    kind: "generated_editorial",
  },
  "02-hands": {
    id: "02-hands",
    src: "/media/02-hands.jpg",
    alt: "Close-up of careful hands examining a paw — campaign imagery",
    kind: "generated_editorial",
  },
  "03-recovery": {
    id: "03-recovery",
    src: "/media/03-recovery.jpg",
    alt: "Dog walking calmly after treatment — campaign imagery",
    kind: "generated_editorial",
  },
  "04-anatomy": {
    id: "04-anatomy",
    src: "/media/04-anatomy.jpg",
    alt: "Editorial anatomical care visualization — campaign imagery",
    kind: "generated_editorial",
  },
  "05-living": {
    id: "05-living",
    src: "/media/05-living.jpg",
    alt: "Living-system editorial veterinary visual — campaign imagery",
    kind: "generated_editorial",
  },
  "06-concern": {
    id: "06-concern",
    src: "/media/06-concern.jpg",
    alt: "Quiet moment of concern with a pet — campaign imagery",
    kind: "generated_editorial",
  },
  "07-consultation": {
    id: "07-consultation",
    src: "/media/07-consultation.jpg",
    alt: "Calm veterinary consultation — campaign imagery",
    kind: "generated_editorial",
  },
  "08-diagnosis": {
    id: "08-diagnosis",
    src: "/media/08-diagnosis.jpg",
    alt: "Diagnostic environment visual — campaign imagery",
    kind: "generated_editorial",
  },
  "seeing-under": {
    id: "seeing-under",
    src: "/media/seeing-under.jpg",
    alt: "Anatomical underlayer of a calm consultation — campaign imagery for the diagnosis reveal",
    kind: "generated_editorial",
  },
  "09-care": {
    id: "09-care",
    src: "/media/09-care.jpg",
    alt: "Treatment and care visual — campaign imagery",
    kind: "generated_editorial",
  },
  "10-journey-recovery": {
    id: "10-journey-recovery",
    src: "/media/10-journey-recovery.jpg",
    alt: "Recovery journey visual — campaign imagery",
    kind: "generated_editorial",
  },
  "11-emergency": {
    id: "11-emergency",
    src: "/media/11-emergency.jpg",
    alt: "Emergency care atmosphere — campaign imagery",
    kind: "generated_editorial",
  },
  "12-surgery": {
    id: "12-surgery",
    src: "/media/12-surgery.jpg",
    alt: "Surgical care atmosphere — campaign imagery",
    kind: "generated_editorial",
  },
  "13-diagnostics": {
    id: "13-diagnostics",
    src: "/media/13-diagnostics.jpg",
    alt: "Diagnostics atmosphere — campaign imagery",
    kind: "generated_editorial",
  },
  "14-preventive": {
    id: "14-preventive",
    src: "/media/14-preventive.jpg",
    alt: "Preventive care atmosphere — campaign imagery",
    kind: "generated_editorial",
  },
  "15-dentistry": {
    id: "15-dentistry",
    src: "/media/15-dentistry.jpg",
    alt: "Veterinary dentistry atmosphere — campaign imagery",
    kind: "generated_editorial",
  },
  "16-critical": {
    id: "16-critical",
    src: "/media/16-critical.jpg",
    alt: "Critical monitoring atmosphere — campaign imagery",
    kind: "generated_editorial",
  },
  "17-bond-close": {
    id: "17-bond-close",
    src: "/media/17-bond-close.jpg",
    alt: "Human and animal closeness — campaign imagery",
    kind: "generated_editorial",
  },
  "18-trust": {
    id: "18-trust",
    src: "/media/18-trust.jpg",
    alt: "Trust between caregiver and animal — campaign imagery",
    kind: "generated_editorial",
  },
  "19-home": {
    id: "19-home",
    src: "/media/19-home.jpg",
    alt: "Return home after care — campaign imagery",
    kind: "generated_editorial",
  },
  "20-macro": {
    id: "20-macro",
    src: "/media/20-macro.jpg",
    alt: "Macro fur and light texture — campaign imagery",
    kind: "generated_editorial",
  },
  "21-material": {
    id: "21-material",
    src: "/media/21-material.jpg",
    alt: "Clinic material texture — campaign imagery",
    kind: "generated_editorial",
  },
  "22-organic": {
    id: "22-organic",
    src: "/media/22-organic.jpg",
    alt: "Organic transition texture — campaign imagery",
    kind: "generated_editorial",
  },
};

export function getMedia(id: string): MediaAsset {
  return media[id] ?? {
    id,
    src: "/media/21-material.jpg",
    alt: "Editorial clinic atmosphere",
    kind: "generated_editorial",
  };
}
