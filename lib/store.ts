export interface BrandData {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  category: "MOBILE" | "LAPTOP" | "BOTH";
  sortOrder: number;
  active: boolean;
}

export interface DeviceModelData {
  id: string;
  brandId: string;
  brandSlug: string;
  name: string;
  slug: string;
  imageUrl: string;
  releaseYear: number;
  popular: boolean;
  active: boolean;
}

export interface DeviceVariantData {
  id: string;
  modelId: string;
  ram?: string;
  storage: string;
  basePrice: number;
  active: boolean;
}

export interface QuestionOptionData {
  id: string;
  label: string;
  description?: string;
  iconName?: string;
  sortOrder: number;
}

export interface QuestionData {
  id: string;
  title: string;
  subtitle?: string;
  group: "BASIC" | "SCREEN" | "BODY" | "FUNCTIONAL" | "REPAIR" | "ACCESSORIES";
  type: "SINGLE" | "MULTIPLE";
  sortOrder: number;
  options: QuestionOptionData[];
}

export interface PricingRuleData {
  id: string;
  questionId: string;
  optionId: string;
  adjustmentType: "FIXED_DEDUCTION" | "PERCENTAGE_DEDUCTION" | "FIXED_BONUS";
  adjustmentValue: number;
}

export interface QuoteData {
  id: string;
  quoteNumber: string;
  variantId: string;
  selectedAnswersJson: string;
  basePrice: number;
  totalDeductions: number;
  estimatedPrice: number;
  breakdownJson: string;
  expiresAt: string;
  status: "ACTIVE" | "ORDERED" | "EXPIRED";
  createdAt: string;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  quoteId: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  addressId?: string;
  addressSummary?: string;
  pincode: string;
  pickupDate: string;
  pickupTimeSlot: string;
  status:
    | "QUOTE_CREATED"
    | "PICKUP_SCHEDULED"
    | "PARTNER_ASSIGNED"
    | "PARTNER_ON_THE_WAY"
    | "INSPECTION_STARTED"
    | "FINAL_OFFER_PENDING"
    | "ACCEPTED"
    | "DECLINED"
    | "PAYMENT_PROCESSING"
    | "PAID"
    | "COMPLETED"
    | "CANCELLED";
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  revisedPrice?: number;
  priceDifferenceReason?: string;
  declaredConditionSummary?: string;
  inspectedConditionSummary?: string;
  imeiNumber?: string;
  paymentStatus?: "PENDING" | "PROCESSING" | "PAID" | "FAILED";
  paymentTxRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceAreaData {
  id: string;
  pincode: string;
  city: string;
  state: string;
  active: boolean;
  pickupAvailable: boolean;
}

export interface PartnerData {
  id: string;
  name: string;
  phone: string;
  email: string;
  businessName: string;
  city: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  rating: number;
  completedPickups: number;
}

export interface FAQData {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// SEEDED INITIAL DATA
export const INITIAL_BRANDS: BrandData[] = [
  // Mobile Phone Brands
  { id: "b-apple", name: "Apple", slug: "apple", category: "BOTH", sortOrder: 1, active: true },
  { id: "b-samsung", name: "Samsung", slug: "samsung", category: "BOTH", sortOrder: 2, active: true },
  { id: "b-oneplus", name: "OnePlus", slug: "oneplus", category: "MOBILE", sortOrder: 3, active: true },
  { id: "b-xiaomi", name: "Xiaomi", slug: "xiaomi", category: "MOBILE", sortOrder: 4, active: true },
  { id: "b-vivo", name: "Vivo", slug: "vivo", category: "MOBILE", sortOrder: 5, active: true },
  { id: "b-oppo", name: "Oppo", slug: "oppo", category: "MOBILE", sortOrder: 6, active: true },
  { id: "b-realme", name: "Realme", slug: "realme", category: "MOBILE", sortOrder: 7, active: true },
  { id: "b-motorola", name: "Motorola", slug: "motorola", category: "MOBILE", sortOrder: 8, active: true },
  { id: "b-google", name: "Google", slug: "google", category: "MOBILE", sortOrder: 9, active: true },
  { id: "b-nothing", name: "Nothing", slug: "nothing", category: "MOBILE", sortOrder: 10, active: true },
  { id: "b-poco", name: "Poco", slug: "poco", category: "MOBILE", sortOrder: 11, active: true },
  { id: "b-iqoo", name: "iQOO", slug: "iqoo", category: "MOBILE", sortOrder: 12, active: true },
  { id: "b-infinix", name: "Infinix", slug: "infinix", category: "MOBILE", sortOrder: 13, active: true },
  { id: "b-tecno", name: "Tecno", slug: "tecno", category: "MOBILE", sortOrder: 14, active: true },
  { id: "b-honor", name: "Honor", slug: "honor", category: "MOBILE", sortOrder: 15, active: true },

  // Laptop Brands
  { id: "b-dell", name: "Dell", slug: "dell", category: "LAPTOP", sortOrder: 16, active: true },
  { id: "b-hp", name: "HP", slug: "hp", category: "LAPTOP", sortOrder: 17, active: true },
  { id: "b-lenovo", name: "Lenovo", slug: "lenovo", category: "LAPTOP", sortOrder: 18, active: true },
  { id: "b-asus", name: "Asus", slug: "asus", category: "BOTH", sortOrder: 19, active: true },
  { id: "b-acer", name: "Acer", slug: "acer", category: "LAPTOP", sortOrder: 20, active: true },
  { id: "b-lg", name: "LG", slug: "lg", category: "LAPTOP", sortOrder: 21, active: true },
  { id: "b-microsoft", name: "Microsoft", slug: "microsoft", category: "LAPTOP", sortOrder: 22, active: true },
  { id: "b-msi", name: "MSI", slug: "msi", category: "LAPTOP", sortOrder: 23, active: true },
];

export const INITIAL_MODELS: DeviceModelData[] = [
  // Apple Mobile
  { id: "m-iphone-16-pro-max", brandId: "b-apple", brandSlug: "apple", name: "iPhone 16 Pro Max", slug: "iphone-16-pro-max", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80", releaseYear: 2024, popular: true, active: true },
  { id: "m-iphone-16", brandId: "b-apple", brandSlug: "apple", name: "iPhone 16", slug: "iphone-16", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80", releaseYear: 2024, popular: true, active: true },
  { id: "m-iphone-15-pro", brandId: "b-apple", brandSlug: "apple", name: "iPhone 15 Pro", slug: "iphone-15-pro", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },
  { id: "m-iphone-15", brandId: "b-apple", brandSlug: "apple", name: "iPhone 15", slug: "iphone-15", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },
  { id: "m-iphone-14", brandId: "b-apple", brandSlug: "apple", name: "iPhone 14", slug: "iphone-14", imageUrl: "https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=600&q=80", releaseYear: 2022, popular: true, active: true },
  { id: "m-iphone-13", brandId: "b-apple", brandSlug: "apple", name: "iPhone 13", slug: "iphone-13", imageUrl: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=600&q=80", releaseYear: 2021, popular: true, active: true },

  // Apple Laptops
  { id: "m-macbook-air-m2", brandId: "b-apple", brandSlug: "apple", name: "MacBook Air M2", slug: "macbook-air-m2", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80", releaseYear: 2022, popular: true, active: true },
  { id: "m-macbook-pro-14", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro 14-inch", slug: "macbook-pro-14", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },

  // Samsung Mobile & Laptops
  { id: "m-s24-ultra", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy S24 Ultra", slug: "galaxy-s24-ultra", imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80", releaseYear: 2024, popular: true, active: true },
  { id: "m-s24", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy S24", slug: "galaxy-s24", imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80", releaseYear: 2024, popular: true, active: true },
  { id: "m-s23", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy S23", slug: "galaxy-s23", imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },
  { id: "m-samsung-galaxy-book4", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book4 Pro", slug: "galaxy-book4-pro", imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80", releaseYear: 2024, popular: true, active: true },
  { id: "m-samsung-galaxy-book3", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book3 360", slug: "galaxy-book3-360", imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: false, active: true },

  // OnePlus
  { id: "m-oneplus-12", brandId: "b-oneplus", brandSlug: "oneplus", name: "OnePlus 12", slug: "oneplus-12", imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80", releaseYear: 2024, popular: true, active: true },
  { id: "m-oneplus-11", brandId: "b-oneplus", brandSlug: "oneplus", name: "OnePlus 11", slug: "oneplus-11", imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },

  // Dell Laptops
  { id: "m-dell-xps-13", brandId: "b-dell", brandSlug: "dell", name: "Dell XPS 13", slug: "dell-xps-13", imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },
  { id: "m-dell-inspiron-15", brandId: "b-dell", brandSlug: "dell", name: "Dell Inspiron 15", slug: "dell-inspiron-15", imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },

  // HP Laptops
  { id: "m-hp-spectre-x360", brandId: "b-hp", brandSlug: "hp", name: "HP Spectre x360", slug: "hp-spectre-x360", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },
  { id: "m-hp-pavilion-15", brandId: "b-hp", brandSlug: "hp", name: "HP Pavilion 15", slug: "hp-pavilion-15", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },

  // Lenovo Laptops
  { id: "m-lenovo-thinkpad-x1", brandId: "b-lenovo", brandSlug: "lenovo", name: "ThinkPad X1 Carbon", slug: "thinkpad-x1-carbon", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },
  { id: "m-lenovo-ideapad-3", brandId: "b-lenovo", brandSlug: "lenovo", name: "IdeaPad 3", slug: "ideapad-3", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },

  // Asus Laptops
  { id: "m-asus-rog-zephyrus", brandId: "b-asus", brandSlug: "asus", name: "Asus ROG Zephyrus G14", slug: "asus-rog-zephyrus-g14", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },
  { id: "m-asus-zenbook-14", brandId: "b-asus", brandSlug: "asus", name: "Asus ZenBook 14", slug: "asus-zenbook-14", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },

  // Acer Laptops
  { id: "m-acer-swift-3", brandId: "b-acer", brandSlug: "acer", name: "Acer Swift 3", slug: "acer-swift-3", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },

  // LG Laptops
  { id: "m-lg-gram-16", brandId: "b-lg", brandSlug: "lg", name: "LG Gram 16", slug: "lg-gram-16", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },
  { id: "m-lg-gram-17", brandId: "b-lg", brandSlug: "lg", name: "LG Gram 17", slug: "lg-gram-17", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: false, active: true },

  // Microsoft Laptops
  { id: "m-microsoft-surface-laptop-5", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Laptop 5", slug: "surface-laptop-5", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },
  { id: "m-microsoft-surface-pro-9", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Pro 9", slug: "surface-pro-9", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },

  // MSI Laptops
  { id: "m-msi-stealth-16", brandId: "b-msi", brandSlug: "msi", name: "MSI Stealth 16", slug: "msi-stealth-16", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },

  // Google
  { id: "m-pixel-8-pro", brandId: "b-google", brandSlug: "google", name: "Pixel 8 Pro", slug: "pixel-8-pro", imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },

  // Nothing
  { id: "m-nothing-2", brandId: "b-nothing", brandSlug: "nothing", name: "Nothing Phone (2)", slug: "nothing-phone-2", imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true },
];

export const INITIAL_VARIANTS: DeviceVariantData[] = [
  // iPhone 15
  { id: "v-ip15-128", modelId: "m-iphone-15", storage: "128 GB", basePrice: 32000, active: true },
  { id: "v-ip15-256", modelId: "m-iphone-15", storage: "256 GB", basePrice: 38000, active: true },
  { id: "v-ip15-512", modelId: "m-iphone-15", storage: "512 GB", basePrice: 45000, active: true },

  // iPhone 15 Pro
  { id: "v-ip15p-128", modelId: "m-iphone-15-pro", storage: "128 GB", basePrice: 48000, active: true },
  { id: "v-ip15p-256", modelId: "m-iphone-15-pro", storage: "256 GB", basePrice: 55000, active: true },

  // Laptop Variants
  { id: "v-macbook-m2-256", modelId: "m-macbook-air-m2", ram: "8 GB RAM", storage: "256 GB SSD", basePrice: 42000, active: true },
  { id: "v-macbook-m2-512", modelId: "m-macbook-air-m2", ram: "16 GB RAM", storage: "512 GB SSD", basePrice: 54000, active: true },
  { id: "v-macbook-pro14-512", modelId: "m-macbook-pro-14", ram: "18 GB RAM", storage: "512 GB SSD", basePrice: 78000, active: true },
  { id: "v-samsung-book4-512", modelId: "m-samsung-galaxy-book4", ram: "16 GB RAM", storage: "512 GB SSD", basePrice: 52000, active: true },
  { id: "v-samsung-book3-256", modelId: "m-samsung-galaxy-book3", ram: "8 GB RAM", storage: "256 GB SSD", basePrice: 38000, active: true },
  { id: "v-dell-xps13-512", modelId: "m-dell-xps-13", ram: "16 GB RAM", storage: "512 GB SSD", basePrice: 46000, active: true },
  { id: "v-dell-inspiron-512", modelId: "m-dell-inspiron-15", ram: "8 GB RAM", storage: "512 GB SSD", basePrice: 28000, active: true },
  { id: "v-hp-spectre-512", modelId: "m-hp-spectre-x360", ram: "16 GB RAM", storage: "512 GB SSD", basePrice: 44000, active: true },
  { id: "v-hp-pavilion-512", modelId: "m-hp-pavilion-15", ram: "8 GB RAM", storage: "512 GB SSD", basePrice: 26000, active: true },
  { id: "v-lenovo-x1-512", modelId: "m-lenovo-thinkpad-x1", ram: "16 GB RAM", storage: "512 GB SSD", basePrice: 48000, active: true },
  { id: "v-lg-gram16-512", modelId: "m-lg-gram-16", ram: "16 GB RAM", storage: "512 GB SSD", basePrice: 45000, active: true },
  { id: "v-surface-l5-512", modelId: "m-microsoft-surface-laptop-5", ram: "16 GB RAM", storage: "512 GB SSD", basePrice: 49000, active: true },
  { id: "v-msi-stealth-1tb", modelId: "m-msi-stealth-16", ram: "32 GB RAM", storage: "1 TB SSD", basePrice: 62000, active: true },
  { id: "v-acer-swift-512", modelId: "m-acer-swift-3", ram: "8 GB RAM", storage: "512 GB SSD", basePrice: 24000, active: true },

  // iPhone 14
  { id: "v-ip14-128", modelId: "m-iphone-14", storage: "128 GB", basePrice: 24000, active: true },
  { id: "v-ip14-256", modelId: "m-iphone-14", storage: "256 GB", basePrice: 29000, active: true },

  // Galaxy S24
  { id: "v-s24-256", modelId: "m-s24", ram: "8 GB", storage: "256 GB", basePrice: 34000, active: true },

  // OnePlus 12
  { id: "v-op12-256", modelId: "m-oneplus-12", ram: "12 GB", storage: "256 GB", basePrice: 28000, active: true },
];

export const INITIAL_QUESTIONS: QuestionData[] = [
  {
    id: "q-power",
    title: "Does your phone switch on?",
    subtitle: "Turn on the phone screen and check basic power function",
    group: "BASIC",
    type: "SINGLE",
    sortOrder: 1,
    options: [
      { id: "o-p-yes", label: "Turns ON normally", description: "Phone powers up to home screen", iconName: "Power", sortOrder: 1 },
      { id: "o-p-no", label: "Power / Boot Issue", description: "Does not turn on or gets stuck on logo", iconName: "PowerOff", sortOrder: 2 },
    ],
  },
  {
    id: "q-screen",
    title: "What is the physical condition of the screen?",
    subtitle: "Check under clear light for scratches, cracks or display tint",
    group: "SCREEN",
    type: "SINGLE",
    sortOrder: 2,
    options: [
      { id: "o-s-flawless", label: "Flawless / Like New", description: "No scratches, zero defects", iconName: "Sparkles", sortOrder: 1 },
      { id: "o-s-minor", label: "Minor Scratches", description: "1-2 light surface hairline scratches", iconName: "Minimize2", sortOrder: 2 },
      { id: "o-s-heavy", label: "Heavy Scratches", description: "Multiple deep noticeable scratches", iconName: "Layers", sortOrder: 3 },
      { id: "o-s-cracked", label: "Cracked / Damaged Glass", description: "Visible glass cracks or touch issue", iconName: "Smartphone", sortOrder: 4 },
    ],
  },
  {
    id: "q-body",
    title: "What is the condition of the body / side frame?",
    subtitle: "Inspect side edges, back glass, camera bump and corners",
    group: "BODY",
    type: "SINGLE",
    sortOrder: 3,
    options: [
      { id: "o-b-excellent", label: "Flawless Body", description: "No dents, no scratches", iconName: "ShieldCheck", sortOrder: 1 },
      { id: "o-b-minor", label: "Minor Wear", description: "Light paint wear or minor micro scuffs", iconName: "Sliders", sortOrder: 2 },
      { id: "o-b-dents", label: "Dents / Scratches", description: "Noticeable dents on corners or back glass scuffs", iconName: "AlertTriangle", sortOrder: 3 },
      { id: "o-b-damaged", label: "Heavy Structural Damage", description: "Bent frame, cracked back panel", iconName: "XCircle", sortOrder: 4 },
    ],
  },
  {
    id: "q-functional",
    title: "Are there any functional issues?",
    subtitle: "Select all features that are broken or malfunctioning",
    group: "FUNCTIONAL",
    type: "SINGLE", // Simplified to single choice options for clean step UI
    sortOrder: 4,
    options: [
      { id: "o-f-none", label: "All Functions Work Perfectly", description: "Cameras, Wi-Fi, Speakers, Fingerprint/FaceID all fine", iconName: "CheckCircle2", sortOrder: 1 },
      { id: "o-f-minor", label: "1-2 Minor Issues", description: "Weak battery health or slightly muffled speaker", iconName: "AlertCircle", sortOrder: 2 },
      { id: "o-f-major", label: "Major Fault (Camera/Wi-Fi/Biometric)", description: "Camera blurry, FaceID failed or Wi-Fi unresponsive", iconName: "AlertTriangle", sortOrder: 3 },
    ],
  },
  {
    id: "q-accessories",
    title: "Which original accessories do you have?",
    subtitle: "Having original box and charger increases your phone's value",
    group: "ACCESSORIES",
    type: "SINGLE",
    sortOrder: 5,
    options: [
      { id: "o-a-all", label: "Original Box + Original Charger", description: "Complete inbox packaging included", iconName: "PackageCheck", sortOrder: 1 },
      { id: "o-a-box", label: "Original Box Only", description: "No charger cable included", iconName: "Package", sortOrder: 2 },
      { id: "o-a-charger", label: "Original Charger Only", description: "No original box included", iconName: "Zap", sortOrder: 3 },
      { id: "o-a-none", label: "Device Only", description: "No box or charger included", iconName: "Smartphone", sortOrder: 4 },
    ],
  },
];

export const INITIAL_PRICING_RULES: PricingRuleData[] = [
  // Power
  { id: "r-p-no", questionId: "q-power", optionId: "o-p-no", adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 50 },

  // Screen
  { id: "r-s-flawless", questionId: "q-screen", optionId: "o-s-flawless", adjustmentType: "FIXED_BONUS", adjustmentValue: 500 },
  { id: "r-s-minor", questionId: "q-screen", optionId: "o-s-minor", adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 1200 },
  { id: "r-s-heavy", questionId: "q-screen", optionId: "o-s-heavy", adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 2800 },
  { id: "r-s-cracked", questionId: "q-screen", optionId: "o-s-cracked", adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 5500 },

  // Body
  { id: "r-b-excellent", questionId: "q-body", optionId: "o-b-excellent", adjustmentType: "FIXED_BONUS", adjustmentValue: 300 },
  { id: "r-b-minor", questionId: "q-body", optionId: "o-b-minor", adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 800 },
  { id: "r-b-dents", questionId: "q-body", optionId: "o-b-dents", adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 1800 },
  { id: "r-b-damaged", questionId: "q-body", optionId: "o-b-damaged", adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 3500 },

  // Functional
  { id: "r-f-none", questionId: "q-functional", optionId: "o-f-none", adjustmentType: "FIXED_BONUS", adjustmentValue: 0 },
  { id: "r-f-minor", questionId: "q-functional", optionId: "o-f-minor", adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 1500 },
  { id: "r-f-major", questionId: "q-functional", optionId: "o-f-major", adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 3800 },

  // Accessories
  { id: "r-a-all", questionId: "q-accessories", optionId: "o-a-all", adjustmentType: "FIXED_BONUS", adjustmentValue: 600 },
  { id: "r-a-box", questionId: "q-accessories", optionId: "o-a-box", adjustmentType: "FIXED_BONUS", adjustmentValue: 300 },
  { id: "r-a-charger", questionId: "q-accessories", optionId: "o-a-charger", adjustmentType: "FIXED_BONUS", adjustmentValue: 200 },
  { id: "r-a-none", questionId: "q-accessories", optionId: "o-a-none", adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 500 },
];

export const INITIAL_SERVICE_AREAS: ServiceAreaData[] = [
  { id: "sa-1", pincode: "110001", city: "New Delhi", state: "Delhi", active: true, pickupAvailable: true },
  { id: "sa-2", pincode: "400001", city: "Mumbai", state: "Maharashtra", active: true, pickupAvailable: true },
  { id: "sa-3", pincode: "560001", city: "Bengaluru", state: "Karnataka", active: true, pickupAvailable: true },
  { id: "sa-4", pincode: "700001", city: "Kolkata", state: "West Bengal", active: true, pickupAvailable: true },
  { id: "sa-5", pincode: "600001", city: "Chennai", state: "Tamil Nadu", active: true, pickupAvailable: true },
  { id: "sa-6", pincode: "500001", city: "Hyderabad", state: "Telangana", active: true, pickupAvailable: true },
  { id: "sa-7", pincode: "380001", city: "Ahmedabad", state: "Gujarat", active: true, pickupAvailable: true },
  { id: "sa-8", pincode: "411001", city: "Pune", state: "Maharashtra", active: true, pickupAvailable: true },
];

export const INITIAL_FAQS: FAQData[] = [
  {
    id: "faq-1",
    question: "How does CashALL calculate my phone's value?",
    answer: "CashALL uses a transparent, rule-based pricing engine that combines your phone's real market base value with deductions or bonuses based on your screen condition, physical body wear, functional status, and original accessories.",
    category: "PRICING",
  },
  {
    id: "faq-2",
    question: "How fast is doorstep pickup?",
    answer: "CashALL provides express fast doorstep pickup. Our pickup agent arrives at your preferred date and time window to verify your device.",
    category: "PICKUP",
  },
  {
    id: "faq-3",
    question: "Can my final price change during physical inspection?",
    answer: "Your online price is an estimate based on the condition answers you provide. During physical inspection, our pickup agent verifies the device. If the physical condition matches your selection, the price remains identical. If any physical discrepancy is found (e.g. deeper screen scratches), a revised price with clear reasons is presented for your approval before proceeding.",
    category: "INSPECTION",
  },
  {
    id: "faq-4",
    question: "When and how will I receive my payment?",
    answer: "Payment is transferred instantly via UPI or IMPS Bank Transfer to your account immediately after physical inspection verification and your final approval.",
    category: "PAYMENT",
  },
  {
    id: "faq-5",
    question: "What happens to the personal data on my device?",
    answer: "Our pickup partner helps you perform a factory data reset in your presence during pickup. CashALL ensures complete data wiping protocols before devices enter recommerce.",
    category: "SECURITY",
  },
];

export const INITIAL_PARTNERS: PartnerData[] = [
  { id: "part-1", name: "Rahul Sharma", phone: "+91 9876543210", email: "rahul@cashallpartners.in", businessName: "Express Logistics NCR", city: "New Delhi", status: "ACTIVE", rating: 4.9, completedPickups: 142 },
  { id: "part-2", name: "Vikram Patil", phone: "+91 9812345678", email: "vikram@cashallpartners.in", businessName: "Apex Courier Services", city: "Mumbai", status: "ACTIVE", rating: 4.8, completedPickups: 98 },
];

// DEMO SAMPLE ORDERS
export const INITIAL_ORDERS: OrderData[] = [
  {
    id: "ord-sample-1",
    orderNumber: "CA10482",
    quoteId: "q-sample-1",
    userId: "u-sample-1",
    customerName: "Ananya Roy",
    customerPhone: "+91 9876501234",
    pincode: "110001",
    pickupDate: "Tomorrow",
    pickupTimeSlot: "10 AM - 1 PM",
    status: "PICKUP_SCHEDULED",
    assignedPartnerId: "part-1",
    assignedPartnerName: "Rahul Sharma",
    declaredConditionSummary: "Turns ON | Minor Screen Scratches | Flawless Body | Box + Charger",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
