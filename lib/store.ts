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
  contactForPrice?: boolean;
  category?: "MOBILE" | "LAPTOP";
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
  { id: "b-xiaomi", name: "Xiaomi", slug: "xiaomi", category: "BOTH", sortOrder: 4, active: true },
  { id: "b-vivo", name: "Vivo", slug: "vivo", category: "MOBILE", sortOrder: 5, active: true },
  { id: "b-oppo", name: "Oppo", slug: "oppo", category: "MOBILE", sortOrder: 6, active: true },
  { id: "b-realme", name: "Realme", slug: "realme", category: "BOTH", sortOrder: 7, active: true },
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
  { id: "b-nokia", name: "Nokia", slug: "nokia", category: "LAPTOP", sortOrder: 24, active: true },
  { id: "b-avita", name: "AVITA", slug: "avita", category: "LAPTOP", sortOrder: 25, active: true },
  { id: "b-other-laptop", name: "Other Laptop", slug: "other-laptop", category: "LAPTOP", sortOrder: 26, active: true },
];

export const INITIAL_MODELS: DeviceModelData[] = [
  // Apple Mobile
  { id: "m-iphone-16-pro-max", brandId: "b-apple", brandSlug: "apple", name: "iPhone 16 Pro Max", slug: "iphone-16-pro-max", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80", releaseYear: 2024, popular: true, active: true , category: "MOBILE" },
  { id: "m-iphone-16", brandId: "b-apple", brandSlug: "apple", name: "iPhone 16", slug: "iphone-16", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80", releaseYear: 2024, popular: true, active: true , category: "MOBILE" },
  { id: "m-iphone-15-pro", brandId: "b-apple", brandSlug: "apple", name: "iPhone 15 Pro", slug: "iphone-15-pro", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true , category: "MOBILE" },
  { id: "m-iphone-15", brandId: "b-apple", brandSlug: "apple", name: "iPhone 15", slug: "iphone-15", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true , category: "MOBILE" },
  { id: "m-iphone-14", brandId: "b-apple", brandSlug: "apple", name: "iPhone 14", slug: "iphone-14", imageUrl: "https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=600&q=80", releaseYear: 2022, popular: true, active: true , category: "MOBILE" },
  { id: "m-iphone-13", brandId: "b-apple", brandSlug: "apple", name: "iPhone 13", slug: "iphone-13", imageUrl: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=600&q=80", releaseYear: 2021, popular: true, active: true , category: "MOBILE" },

  // Samsung Mobile
  { id: "m-s24-ultra", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy S24 Ultra", slug: "galaxy-s24-ultra", imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80", releaseYear: 2024, popular: true, active: true, contactForPrice: false , category: "MOBILE" },
  { id: "m-s24", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy S24", slug: "galaxy-s24", imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80", releaseYear: 2024, popular: true, active: true, contactForPrice: false , category: "MOBILE" },
  { id: "m-s23", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy S23", slug: "galaxy-s23", imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true, contactForPrice: false , category: "MOBILE" },

  // OnePlus
  { id: "m-oneplus-12", brandId: "b-oneplus", brandSlug: "oneplus", name: "OnePlus 12", slug: "oneplus-12", imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80", releaseYear: 2024, popular: true, active: true, contactForPrice: false , category: "MOBILE" },
  { id: "m-oneplus-11", brandId: "b-oneplus", brandSlug: "oneplus", name: "OnePlus 11", slug: "oneplus-11", imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true, contactForPrice: false , category: "MOBILE" },

  // Google
  { id: "m-pixel-8-pro", brandId: "b-google", brandSlug: "google", name: "Pixel 8 Pro", slug: "pixel-8-pro", imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true, contactForPrice: false , category: "MOBILE" },

  // Nothing
  { id: "m-nothing-2", brandId: "b-nothing", brandSlug: "nothing", name: "Nothing Phone (2)", slug: "nothing-phone-2", imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80", releaseYear: 2023, popular: true, active: true, contactForPrice: false , category: "MOBILE" },

  // ── LAPTOP MODELS ───────────────────────────────────
  { id: "m-xiaomi-mi-notebook", brandId: "b-xiaomi", brandSlug: "xiaomi", name: "Mi Notebook", slug: "mi-notebook", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-xiaomi-mi-air-series", brandId: "b-xiaomi", brandSlug: "xiaomi", name: "Mi Air Series", slug: "mi-air-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-xiaomi-mi-pro-series", brandId: "b-xiaomi", brandSlug: "xiaomi", name: "Mi Pro Series", slug: "mi-pro-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-xiaomi-redmibook-series", brandId: "b-xiaomi", brandSlug: "xiaomi", name: "RedmiBook Series", slug: "redmibook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-air-2025", brandId: "b-apple", brandSlug: "apple", name: "Macbook Air 2025", slug: "macbook-air-2025", imageUrl: "", releaseYear: 2025, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-2025", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro 2025", slug: "macbook-pro-2025", imageUrl: "", releaseYear: 2025, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-neo-series", brandId: "b-apple", brandSlug: "apple", name: "Macbook Neo Series", slug: "macbook-neo-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-air-2026", brandId: "b-apple", brandSlug: "apple", name: "Macbook Air 2026", slug: "macbook-air-2026", imageUrl: "", releaseYear: 2026, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-2024", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro 2024", slug: "macbook-pro-2024", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-2023", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro 2023", slug: "macbook-pro-2023", imageUrl: "", releaseYear: 2023, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-2022", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro 2022", slug: "macbook-pro-2022", imageUrl: "", releaseYear: 2022, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-2020-touch-bar-four-thunderbolt-3-ports", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro 2020 (Touch Bar Four Thunderbolt 3 ports)", slug: "macbook-pro-2020-touch-bar-four-thunderbolt-3-ports", imageUrl: "", releaseYear: 2020, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-2021", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro 2021", slug: "macbook-pro-2021", imageUrl: "", releaseYear: 2021, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-2020-touch-bar-two-thunderbolt-3-ports", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro 2020 (Touch Bar Two Thunderbolt 3 ports)", slug: "macbook-pro-2020-touch-bar-two-thunderbolt-3-ports", imageUrl: "", releaseYear: 2020, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-2020", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro 2020", slug: "macbook-pro-2020", imageUrl: "", releaseYear: 2020, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-2019", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro 2019", slug: "macbook-pro-2019", imageUrl: "", releaseYear: 2019, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-2019-touch-bar-four-thunderbolt-3-ports", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro 2019 (Touch Bar Four Thunderbolt 3 ports)", slug: "macbook-pro-2019-touch-bar-four-thunderbolt-3-ports", imageUrl: "", releaseYear: 2019, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-2019-touch-bar-two-thunderbolt-3-ports", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro 2019 (Touch Bar Two Thunderbolt 3 ports)", slug: "macbook-pro-2019-touch-bar-two-thunderbolt-3-ports", imageUrl: "", releaseYear: 2019, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-2019-touch-bar", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro 2019 (Touch Bar)", slug: "macbook-pro-2019-touch-bar", imageUrl: "", releaseYear: 2019, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-mid-2018-touch-bar-four-thunderbolt-3-po", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro Mid-2018 Touch Bar Four Thunderbolt 3 Ports", slug: "macbook-pro-mid-2018-touch-bar-four-thunderbolt-3-ports", imageUrl: "", releaseYear: 2018, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-mid-2017-touch-bar-four-thunderbolt-3-po", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro Mid-2017 Touch Bar Four Thunderbolt 3 Ports", slug: "macbook-pro-mid-2017-touch-bar-four-thunderbolt-3-ports", imageUrl: "", releaseYear: 2017, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-mid-2017-two-thunderbolt-3-ports", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro Mid-2017 Two Thunderbolt 3 Ports", slug: "macbook-pro-mid-2017-two-thunderbolt-3-ports", imageUrl: "", releaseYear: 2017, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-late-2016-touch-bar-four-thunderbolt-3-p", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro Late 2016 Touch Bar Four Thunderbolt 3 Ports", slug: "macbook-pro-late-2016-touch-bar-four-thunderbolt-3-ports", imageUrl: "", releaseYear: 2016, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-late-2016-two-thunderbolt-3-ports", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro Late 2016 Two Thunderbolt 3 Ports", slug: "macbook-pro-late-2016-two-thunderbolt-3-ports", imageUrl: "", releaseYear: 2016, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-retina-mid-2015", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro Retina Mid 2015", slug: "macbook-pro-retina-mid-2015", imageUrl: "", releaseYear: 2015, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-retina-early-2015", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro Retina Early 2015", slug: "macbook-pro-retina-early-2015", imageUrl: "", releaseYear: 2015, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-retina-mid-2014", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro Retina Mid 2014", slug: "macbook-pro-retina-mid-2014", imageUrl: "", releaseYear: 2014, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-retina-late-2013", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro Retina Late 2013", slug: "macbook-pro-retina-late-2013", imageUrl: "", releaseYear: 2013, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-pro-retina-early-2013", brandId: "b-apple", brandSlug: "apple", name: "MacBook Pro Retina Early 2013", slug: "macbook-pro-retina-early-2013", imageUrl: "", releaseYear: 2013, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-air-2023", brandId: "b-apple", brandSlug: "apple", name: "MacBook Air 2023", slug: "macbook-air-2023", imageUrl: "", releaseYear: 2023, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-air-2022", brandId: "b-apple", brandSlug: "apple", name: "MacBook Air 2022", slug: "macbook-air-2022", imageUrl: "", releaseYear: 2022, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-air-2020", brandId: "b-apple", brandSlug: "apple", name: "MacBook Air 2020", slug: "macbook-air-2020", imageUrl: "", releaseYear: 2020, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-air-2024", brandId: "b-apple", brandSlug: "apple", name: "MacBook Air 2024", slug: "macbook-air-2024", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-air-2019", brandId: "b-apple", brandSlug: "apple", name: "MacBook Air 2019", slug: "macbook-air-2019", imageUrl: "", releaseYear: 2019, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-air-2018", brandId: "b-apple", brandSlug: "apple", name: "MacBook Air 2018", slug: "macbook-air-2018", imageUrl: "", releaseYear: 2018, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-air-mid-2017", brandId: "b-apple", brandSlug: "apple", name: "MacBook Air Mid 2017", slug: "macbook-air-mid-2017", imageUrl: "", releaseYear: 2017, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-air-early-2015", brandId: "b-apple", brandSlug: "apple", name: "MacBook Air Early 2015", slug: "macbook-air-early-2015", imageUrl: "", releaseYear: 2015, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-air-early-2014", brandId: "b-apple", brandSlug: "apple", name: "MacBook Air Early 2014", slug: "macbook-air-early-2014", imageUrl: "", releaseYear: 2014, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-air-mid-2013", brandId: "b-apple", brandSlug: "apple", name: "MacBook Air Mid 2013", slug: "macbook-air-mid-2013", imageUrl: "", releaseYear: 2013, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-retina-mid-2017", brandId: "b-apple", brandSlug: "apple", name: "MacBook Retina Mid 2017", slug: "macbook-retina-mid-2017", imageUrl: "", releaseYear: 2017, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-retina-early-2016", brandId: "b-apple", brandSlug: "apple", name: "MacBook Retina Early 2016", slug: "macbook-retina-early-2016", imageUrl: "", releaseYear: 2016, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-apple-macbook-retina-early-2015", brandId: "b-apple", brandSlug: "apple", name: "MacBook Retina Early 2015", slug: "macbook-retina-early-2015", imageUrl: "", releaseYear: 2015, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book-go-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book Go Series", slug: "galaxy-book-go-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book2-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book2 Series", slug: "galaxy-book2-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book2-360-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book2 360 Series", slug: "galaxy-book2-360-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book2-pro-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book2 Pro Series", slug: "galaxy-book2-pro-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book2-pro-360-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book2 Pro 360 Series", slug: "galaxy-book2-pro-360-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book3-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book3 Series", slug: "galaxy-book3-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book3-360-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book3 360 Series", slug: "galaxy-book3-360-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book3-ultra-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book3 Ultra Series", slug: "galaxy-book3-ultra-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book3-pro-360-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book3 Pro 360 Series", slug: "galaxy-book3-pro-360-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book4-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book4 Series", slug: "galaxy-book4-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book4-360-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book4 360 Series", slug: "galaxy-book4-360-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book4-pro-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book4 Pro Series", slug: "galaxy-book4-pro-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book4-pro-360-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book4 Pro 360 Series", slug: "galaxy-book4-pro-360-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book4-ultra-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book4 Ultra Series", slug: "galaxy-book4-ultra-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book4-edge-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book4 Edge Series", slug: "galaxy-book4-edge-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book5-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book5 Series", slug: "galaxy-book5-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book5-360-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book5 360 Series", slug: "galaxy-book5-360-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book5-pro-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book5 Pro Series", slug: "galaxy-book5-pro-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-galaxy-book5-pro-360-series", brandId: "b-samsung", brandSlug: "samsung", name: "Galaxy Book5 Pro 360 Series", slug: "galaxy-book5-pro-360-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-samsung-others-samsung-series", brandId: "b-samsung", brandSlug: "samsung", name: "Others Samsung Series", slug: "others-samsung-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-realme-book-prime-series", brandId: "b-realme", brandSlug: "realme", name: "Book Prime Series", slug: "book-prime-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-realme-book-slim-series", brandId: "b-realme", brandSlug: "realme", name: "Book Slim Series", slug: "book-slim-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-ideapad-5-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "IdeaPad 5 Series", slug: "ideapad-5-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-yoga-slim-7-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Yoga Slim 7 Series", slug: "yoga-slim-7-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-lenovo-loq-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Lenovo LOQ Series", slug: "lenovo-loq-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-legion-5i-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Legion 5i Series", slug: "legion-5i-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-legion-slim-5-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Legion Slim 5 Series", slug: "legion-slim-5-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-legion-slim-5i-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Legion Slim 5i Series", slug: "legion-slim-5i-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-legion-5i-pro-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Legion 5i Pro Series", slug: "legion-5i-pro-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-legion-pro-5-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Legion Pro 5 Series", slug: "legion-pro-5-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-legion-pro-5i-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Legion Pro 5i Series", slug: "legion-pro-5i-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-legion-pro-7i-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Legion Pro 7i Series", slug: "legion-pro-7i-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-ideapad-300-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "IdeaPad 300 Series", slug: "ideapad-300-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-ideapad-500-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "IdeaPad 500 Series", slug: "ideapad-500-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-thinkpad-t-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Thinkpad T Series", slug: "thinkpad-t-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-ideapad-100-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "IdeaPad 100 Series", slug: "ideapad-100-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-ideapad-s-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "IdeaPad S Series", slug: "ideapad-s-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-yoga-500-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Yoga 500 Series", slug: "yoga-500-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-thinkpad-l-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Thinkpad L Series", slug: "thinkpad-l-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-lenovo-y-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Lenovo Y Series", slug: "lenovo-y-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-ideapad-flex-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "IdeaPad Flex Series", slug: "ideapad-flex-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-thinkpad-e-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Thinkpad E Series", slug: "thinkpad-e-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-ideapad-slim-3i-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "IdeaPad Slim 3i Series", slug: "ideapad-slim-3i-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-lenovo-v-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Lenovo V Series", slug: "lenovo-v-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-thinkpad-x-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Thinkpad X Series", slug: "thinkpad-x-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-thinkpad-edge-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Thinkpad Edge Series", slug: "thinkpad-edge-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-lenovo-300e-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Lenovo 300e Series", slug: "lenovo-300e-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-legion-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Legion Series", slug: "legion-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-lenovo-n-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Lenovo N Series", slug: "lenovo-n-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-lenovo-500e-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Lenovo 500e Series", slug: "lenovo-500e-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-yoga-700-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Yoga 700 Series", slug: "yoga-700-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-ideapad-gaming-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "IdeaPad Gaming Series", slug: "ideapad-gaming-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-thinkpad-a-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Thinkpad A Series", slug: "thinkpad-a-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-yoga-900-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Yoga 900 Series", slug: "yoga-900-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-ideapad-d-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "IdeaPad D Series", slug: "ideapad-d-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-thinkpad-twist-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Thinkpad Twist Series", slug: "thinkpad-twist-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-ideapad-700-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "IdeaPad 700 Series", slug: "ideapad-700-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-yoga-c-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Yoga C Series", slug: "yoga-c-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-thinkpad-11e-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Thinkpad 11e Series", slug: "thinkpad-11e-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-legion-5-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Legion 5 Series", slug: "legion-5-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-ideapad-slim-5i-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "IdeaPad Slim 5i Series", slug: "ideapad-slim-5i-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-thinkbook-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "ThinkBook Series", slug: "thinkbook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-thinkpad-p-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Thinkpad P Series", slug: "thinkpad-p-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-lenovo-100e-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Lenovo 100e Series", slug: "lenovo-100e-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-lenovo-11e-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Lenovo 11e Series", slug: "lenovo-11e-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-thinkpad-helix-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Thinkpad Helix Series", slug: "thinkpad-helix-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-ideapad-900-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "IdeaPad 900 Series", slug: "ideapad-900-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-legion-7-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Legion 7 Series", slug: "legion-7-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-student-chromebooks", brandId: "b-lenovo", brandSlug: "lenovo", name: "Student Chromebooks", slug: "student-chromebooks", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lenovo-other-lenovo-series", brandId: "b-lenovo", brandSlug: "lenovo", name: "Other Lenovo Series", slug: "other-lenovo-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-nokia-nokia-purebook-series", brandId: "b-nokia", brandSlug: "nokia", name: "Nokia PureBook Series", slug: "nokia-purebook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-vostro-series", brandId: "b-dell", brandSlug: "dell", name: "Vostro Series", slug: "vostro-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-inspiron-series", brandId: "b-dell", brandSlug: "dell", name: "Inspiron Series", slug: "inspiron-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-g15-gaming-series", brandId: "b-dell", brandSlug: "dell", name: "G15 Gaming Series", slug: "g15-gaming-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-g16-gaming-series", brandId: "b-dell", brandSlug: "dell", name: "G16 Gaming Series", slug: "g16-gaming-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-vostro-3000-series", brandId: "b-dell", brandSlug: "dell", name: "Vostro 3000 Series", slug: "vostro-3000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-vostro-5000-series", brandId: "b-dell", brandSlug: "dell", name: "Vostro 5000 Series", slug: "vostro-5000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-vostro-7000-series", brandId: "b-dell", brandSlug: "dell", name: "Vostro 7000 Series", slug: "vostro-7000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-3000-2-in-1-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude 3000 2-in-1 Series", slug: "latitude-3000-2-in-1-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-5000-2-in-1-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude 5000 2-in-1 Series", slug: "latitude-5000-2-in-1-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-7000-2-in-1-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude 7000 2-in-1 Series", slug: "latitude-7000-2-in-1-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-9000-2-in-1-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude 9000 2-in-1 Series", slug: "latitude-9000-2-in-1-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-dell-15-series", brandId: "b-dell", brandSlug: "dell", name: "Dell 15 Series", slug: "dell-15-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-inspiron-3000-series", brandId: "b-dell", brandSlug: "dell", name: "Inspiron 3000 Series", slug: "inspiron-3000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-inspiron-3000-2-in-1-series", brandId: "b-dell", brandSlug: "dell", name: "Inspiron 3000 2-in-1 Series", slug: "inspiron-3000-2-in-1-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-inspiron-5000-series", brandId: "b-dell", brandSlug: "dell", name: "Inspiron 5000 Series", slug: "inspiron-5000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-inspiron-5000-2-in-1-series", brandId: "b-dell", brandSlug: "dell", name: "Inspiron 5000 2-in-1 Series", slug: "inspiron-5000-2-in-1-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-inspiron-7000-series", brandId: "b-dell", brandSlug: "dell", name: "Inspiron 7000 Series", slug: "inspiron-7000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-inspiron-7000-2-in-1-series", brandId: "b-dell", brandSlug: "dell", name: "Inspiron 7000 2-in-1 Series", slug: "inspiron-7000-2-in-1-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-inspiron-n5000-series", brandId: "b-dell", brandSlug: "dell", name: "Inspiron N5000 Series", slug: "inspiron-n5000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-inspiron-gaming-series", brandId: "b-dell", brandSlug: "dell", name: "Inspiron Gaming Series", slug: "inspiron-gaming-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude Series", slug: "latitude-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-e3000-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude E3000 Series", slug: "latitude-e3000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-e4000-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude E4000 Series", slug: "latitude-e4000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-e5000-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude E5000 Series", slug: "latitude-e5000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-e6000-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude E6000 Series", slug: "latitude-e6000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-e7000-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude E7000 Series", slug: "latitude-e7000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-3000-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude 3000 Series", slug: "latitude-3000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-5000-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude 5000 Series", slug: "latitude-5000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-6000-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude 6000 Series", slug: "latitude-6000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-7000-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude 7000 Series", slug: "latitude-7000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-latitude-9000-series", brandId: "b-dell", brandSlug: "dell", name: "Latitude 9000 Series", slug: "latitude-9000-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-precision-series", brandId: "b-dell", brandSlug: "dell", name: "Precision Series", slug: "precision-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-studio-series", brandId: "b-dell", brandSlug: "dell", name: "Studio Series", slug: "studio-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-alienware-series", brandId: "b-dell", brandSlug: "dell", name: "Alienware Series", slug: "alienware-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-dell-chromebook-series", brandId: "b-dell", brandSlug: "dell", name: "Dell Chromebook Series", slug: "dell-chromebook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-g7-gaming-series", brandId: "b-dell", brandSlug: "dell", name: "G7 Gaming Series", slug: "g7-gaming-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-g5-gaming-series", brandId: "b-dell", brandSlug: "dell", name: "G5 Gaming Series", slug: "g5-gaming-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-g3-gaming-series", brandId: "b-dell", brandSlug: "dell", name: "G3 Gaming Series", slug: "g3-gaming-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-xps-series", brandId: "b-dell", brandSlug: "dell", name: "XPS Series", slug: "xps-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-dell-other-dell-series", brandId: "b-dell", brandSlug: "dell", name: "Other Dell Series", slug: "other-dell-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-pavilion-series", brandId: "b-hp", brandSlug: "hp", name: "Pavilion Series", slug: "pavilion-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-zbook-8-series", brandId: "b-hp", brandSlug: "hp", name: "ZBook 8 Series", slug: "zbook-8-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-zbook-firefly-series", brandId: "b-hp", brandSlug: "hp", name: "ZBook Firefly Series", slug: "zbook-firefly-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-zbook-fury-series", brandId: "b-hp", brandSlug: "hp", name: "ZBook Fury Series", slug: "zbook-fury-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-zbook-power-series", brandId: "b-hp", brandSlug: "hp", name: "ZBook Power Series", slug: "zbook-power-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-zbook-studio-series", brandId: "b-hp", brandSlug: "hp", name: "ZBook Studio Series", slug: "zbook-studio-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-zbook-x-series", brandId: "b-hp", brandSlug: "hp", name: "ZBook X Series", slug: "zbook-x-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-hp-15-series", brandId: "b-hp", brandSlug: "hp", name: "HP 15 Series", slug: "hp-15-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-hp-notebook-series", brandId: "b-hp", brandSlug: "hp", name: "HP Notebook Series", slug: "hp-notebook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-probook-series", brandId: "b-hp", brandSlug: "hp", name: "Probook Series", slug: "probook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-elitebook-series", brandId: "b-hp", brandSlug: "hp", name: "Elitebook Series", slug: "elitebook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-g-series", brandId: "b-hp", brandSlug: "hp", name: "G Series", slug: "g-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-envy-series", brandId: "b-hp", brandSlug: "hp", name: "Envy Series", slug: "envy-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-hp-14-series", brandId: "b-hp", brandSlug: "hp", name: "HP 14 Series", slug: "hp-14-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-pavilion-power-series", brandId: "b-hp", brandSlug: "hp", name: "Pavilion Power Series", slug: "pavilion-power-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-hp-300-series", brandId: "b-hp", brandSlug: "hp", name: "HP 300 Series", slug: "hp-300-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-spectre-series", brandId: "b-hp", brandSlug: "hp", name: "Spectre Series", slug: "spectre-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-split-series", brandId: "b-hp", brandSlug: "hp", name: "Split Series", slug: "split-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-hp-chromebook-series", brandId: "b-hp", brandSlug: "hp", name: "HP Chromebook Series", slug: "hp-chromebook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-omen-series", brandId: "b-hp", brandSlug: "hp", name: "Omen Series", slug: "omen-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-200-series", brandId: "b-hp", brandSlug: "hp", name: "200 Series", slug: "200-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-hp-17-series", brandId: "b-hp", brandSlug: "hp", name: "HP 17 Series", slug: "hp-17-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-stream-series", brandId: "b-hp", brandSlug: "hp", name: "Stream Series", slug: "stream-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-zbook-series", brandId: "b-hp", brandSlug: "hp", name: "ZBook Series", slug: "zbook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-pavilion-gaming-series", brandId: "b-hp", brandSlug: "hp", name: "Pavilion Gaming Series", slug: "pavilion-gaming-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-slatebook-series", brandId: "b-hp", brandSlug: "hp", name: "SlateBook Series", slug: "slatebook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-victus-series", brandId: "b-hp", brandSlug: "hp", name: "Victus Series", slug: "victus-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-hp-other-hp-series", brandId: "b-hp", brandSlug: "hp", name: "Other HP Series", slug: "other-hp-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-x-series", brandId: "b-asus", brandSlug: "asus", name: "Asus X Series", slug: "asus-x-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-vivobook-series", brandId: "b-asus", brandSlug: "asus", name: "VivoBook Series", slug: "vivobook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-k-series", brandId: "b-asus", brandSlug: "asus", name: "Asus K Series", slug: "asus-k-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-r-series", brandId: "b-asus", brandSlug: "asus", name: "Asus R Series", slug: "asus-r-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-e-series", brandId: "b-asus", brandSlug: "asus", name: "Asus E Series", slug: "asus-e-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-rog-series", brandId: "b-asus", brandSlug: "asus", name: "ROG Series", slug: "rog-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-eeebook-series", brandId: "b-asus", brandSlug: "asus", name: "EeeBook Series", slug: "eeebook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-a-series", brandId: "b-asus", brandSlug: "asus", name: "Asus A Series", slug: "asus-a-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-vivobook-s-series", brandId: "b-asus", brandSlug: "asus", name: "VivoBook S Series", slug: "vivobook-s-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-f-series", brandId: "b-asus", brandSlug: "asus", name: "Asus F Series", slug: "asus-f-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-tuf-gaming-series", brandId: "b-asus", brandSlug: "asus", name: "TUF Gaming Series", slug: "tuf-gaming-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-zenbook-series", brandId: "b-asus", brandSlug: "asus", name: "ZenBook Series", slug: "zenbook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-gaming-series", brandId: "b-asus", brandSlug: "asus", name: "Gaming Series", slug: "gaming-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-q-series", brandId: "b-asus", brandSlug: "asus", name: "Asus Q Series", slug: "asus-q-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-n-series", brandId: "b-asus", brandSlug: "asus", name: "Asus N Series", slug: "asus-n-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-vivobook-pro-series", brandId: "b-asus", brandSlug: "asus", name: "VivoBook Pro Series", slug: "vivobook-pro-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-fx-series", brandId: "b-asus", brandSlug: "asus", name: "Asus FX Series", slug: "asus-fx-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-rog-strix-series", brandId: "b-asus", brandSlug: "asus", name: "ROG Strix Series", slug: "rog-strix-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asuspro-p-series", brandId: "b-asus", brandSlug: "asus", name: "AsusPro P Series", slug: "asuspro-p-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-zenbook-u-series", brandId: "b-asus", brandSlug: "asus", name: "ZenBook U Series", slug: "zenbook-u-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-zenbook-flip-series", brandId: "b-asus", brandSlug: "asus", name: "ZenBook Flip Series", slug: "zenbook-flip-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-chromebook-series", brandId: "b-asus", brandSlug: "asus", name: "Asus Chromebook Series", slug: "asus-chromebook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-vivobook-flip-series", brandId: "b-asus", brandSlug: "asus", name: "VivoBook Flip Series", slug: "vivobook-flip-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-chromebook-flip-series", brandId: "b-asus", brandSlug: "asus", name: "Asus Chromebook Flip Series", slug: "asus-chromebook-flip-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-b-series", brandId: "b-asus", brandSlug: "asus", name: "Asus B Series", slug: "asus-b-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-nx-series", brandId: "b-asus", brandSlug: "asus", name: "Asus NX Series", slug: "asus-nx-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-p-series", brandId: "b-asus", brandSlug: "asus", name: "Asus P Series", slug: "asus-p-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-zenbook-s-series", brandId: "b-asus", brandSlug: "asus", name: "ZenBook S Series", slug: "zenbook-s-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asuspro-b-series", brandId: "b-asus", brandSlug: "asus", name: "AsusPro B Series", slug: "asuspro-b-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-fz-series", brandId: "b-asus", brandSlug: "asus", name: "Asus FZ Series", slug: "asus-fz-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-zenbook-pro-series", brandId: "b-asus", brandSlug: "asus", name: "ZenBook Pro Series", slug: "zenbook-pro-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-rog-zephyrus-series", brandId: "b-asus", brandSlug: "asus", name: "ROG Zephyrus Series", slug: "rog-zephyrus-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-asus-v-series", brandId: "b-asus", brandSlug: "asus", name: "Asus V Series", slug: "asus-v-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-proart-studiobook-series", brandId: "b-asus", brandSlug: "asus", name: "ProArt StudioBook Series", slug: "proart-studiobook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-asus-other-asus-series", brandId: "b-asus", brandSlug: "asus", name: "Other Asus Series", slug: "other-asus-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lg-other-lg-series", brandId: "b-lg", brandSlug: "lg", name: "Other LG Series", slug: "other-lg-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-lg-lg-gram-series", brandId: "b-lg", brandSlug: "lg", name: "LG Gram Series", slug: "lg-gram-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-travelmate-p4-series", brandId: "b-acer", brandSlug: "acer", name: "TravelMate P4 Series", slug: "travelmate-p4-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-travelmate-p2-series", brandId: "b-acer", brandSlug: "acer", name: "TravelMate P2 Series", slug: "travelmate-p2-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-travelmate-p6-series", brandId: "b-acer", brandSlug: "acer", name: "TravelMate P6 Series", slug: "travelmate-p6-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-aspire-series", brandId: "b-acer", brandSlug: "acer", name: "Aspire Series", slug: "aspire-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-aspire-one-series", brandId: "b-acer", brandSlug: "acer", name: "Aspire One Series", slug: "aspire-one-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-aspire-e-series", brandId: "b-acer", brandSlug: "acer", name: "Aspire E Series", slug: "aspire-e-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-aspire-5-series", brandId: "b-acer", brandSlug: "acer", name: "Aspire 5 Series", slug: "aspire-5-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-aspire-3-series", brandId: "b-acer", brandSlug: "acer", name: "Aspire 3 Series", slug: "aspire-3-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-predator-series", brandId: "b-acer", brandSlug: "acer", name: "Predator Series", slug: "predator-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-switch-series", brandId: "b-acer", brandSlug: "acer", name: "Switch Series", slug: "switch-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-nitro-spin-series", brandId: "b-acer", brandSlug: "acer", name: "Nitro Spin Series", slug: "nitro-spin-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-spin-series", brandId: "b-acer", brandSlug: "acer", name: "Spin Series", slug: "spin-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-acer-chromebook-series", brandId: "b-acer", brandSlug: "acer", name: "Acer Chromebook Series", slug: "acer-chromebook-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-swift-series", brandId: "b-acer", brandSlug: "acer", name: "Swift Series", slug: "swift-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-nitro-5-series", brandId: "b-acer", brandSlug: "acer", name: "Nitro 5 Series", slug: "nitro-5-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-aspire-7-series", brandId: "b-acer", brandSlug: "acer", name: "Aspire 7 Series", slug: "aspire-7-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-predator-helios-300-series", brandId: "b-acer", brandSlug: "acer", name: "Predator Helios 300 Series", slug: "predator-helios-300-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-swift-5-series", brandId: "b-acer", brandSlug: "acer", name: "Swift 5 Series", slug: "swift-5-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-extensa-series", brandId: "b-acer", brandSlug: "acer", name: "Extensa Series", slug: "extensa-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-swift-3-series", brandId: "b-acer", brandSlug: "acer", name: "Swift 3 Series", slug: "swift-3-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-nitro-5-spin-series", brandId: "b-acer", brandSlug: "acer", name: "Nitro 5 Spin Series", slug: "nitro-5-spin-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-spin-1-series", brandId: "b-acer", brandSlug: "acer", name: "Spin 1 Series", slug: "spin-1-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-spin-5-series", brandId: "b-acer", brandSlug: "acer", name: "Spin 5 Series", slug: "spin-5-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-switch-5-series", brandId: "b-acer", brandSlug: "acer", name: "Switch 5 Series", slug: "switch-5-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-spin-3-series", brandId: "b-acer", brandSlug: "acer", name: "Spin 3 Series", slug: "spin-3-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-predator-15-series", brandId: "b-acer", brandSlug: "acer", name: "Predator 15 Series", slug: "predator-15-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-nitro-7-series", brandId: "b-acer", brandSlug: "acer", name: "Nitro 7 Series", slug: "nitro-7-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-spin-7-series", brandId: "b-acer", brandSlug: "acer", name: "Spin 7 Series", slug: "spin-7-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-swift-7-series", brandId: "b-acer", brandSlug: "acer", name: "Swift 7 Series", slug: "swift-7-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-swift-x-series", brandId: "b-acer", brandSlug: "acer", name: "Swift X Series", slug: "swift-x-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-swift-3x-series", brandId: "b-acer", brandSlug: "acer", name: "Swift 3x Series", slug: "swift-3x-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-conceptd-3-series", brandId: "b-acer", brandSlug: "acer", name: "ConceptD 3 Series", slug: "conceptd-3-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-conceptd-5-series", brandId: "b-acer", brandSlug: "acer", name: "ConceptD 5 Series", slug: "conceptd-5-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-conceptd-7-series", brandId: "b-acer", brandSlug: "acer", name: "ConceptD 7 Series", slug: "conceptd-7-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-conceptd-9-series", brandId: "b-acer", brandSlug: "acer", name: "ConceptD 9 Series", slug: "conceptd-9-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-predator-triton-300-series", brandId: "b-acer", brandSlug: "acer", name: "Predator Triton 300 Series", slug: "predator-triton-300-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-predator-triton-500-series", brandId: "b-acer", brandSlug: "acer", name: "Predator Triton 500 Series", slug: "predator-triton-500-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-predator-triton-700-series", brandId: "b-acer", brandSlug: "acer", name: "Predator Triton 700 Series", slug: "predator-triton-700-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-predator-triton-900-series", brandId: "b-acer", brandSlug: "acer", name: "Predator Triton 900 Series", slug: "predator-triton-900-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-predator-helios-500-series", brandId: "b-acer", brandSlug: "acer", name: "Predator Helios 500 Series", slug: "predator-helios-500-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-predator-helios-700-series", brandId: "b-acer", brandSlug: "acer", name: "Predator Helios 700 Series", slug: "predator-helios-700-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-predator-17-series", brandId: "b-acer", brandSlug: "acer", name: "Predator 17 Series", slug: "predator-17-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-predator-21x-series", brandId: "b-acer", brandSlug: "acer", name: "Predator 21x Series", slug: "predator-21x-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-acer-other-acer-series", brandId: "b-acer", brandSlug: "acer", name: "Other Acer Series", slug: "other-acer-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-pro-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Pro Series", slug: "surface-pro-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-pro-4-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Pro 4 Series", slug: "surface-pro-4-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Series", slug: "surface-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-book-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Book Series", slug: "surface-book-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-pro-3-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Pro 3 Series", slug: "surface-pro-3-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-book-2-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Book 2 Series", slug: "surface-book-2-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-go-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Go Series", slug: "surface-go-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-pro-5-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Pro 5 Series", slug: "surface-pro-5-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-laptop-2-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Laptop 2 Series", slug: "surface-laptop-2-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-pro-2-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Pro 2 Series", slug: "surface-pro-2-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-laptop-3-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Laptop 3 Series", slug: "surface-laptop-3-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-2-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface 2 Series", slug: "surface-2-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-3-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface 3 Series", slug: "surface-3-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-pro-6-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Pro 6 Series", slug: "surface-pro-6-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-laptop-4-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Laptop 4 Series", slug: "surface-laptop-4-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-pro-7-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Pro 7 Series", slug: "surface-pro-7-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-laptop-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Laptop Series", slug: "surface-laptop-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-book-3-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Book 3 Series", slug: "surface-book-3-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-pro-x-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Pro X Series", slug: "surface-pro-x-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-surface-go-2-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Surface Go 2 Series", slug: "surface-go-2-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-microsof-other-microsoft-series", brandId: "b-microsoft", brandSlug: "microsoft", name: "Other Microsoft Series", slug: "other-microsoft-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-msi-crosshair-series", brandId: "b-msi", brandSlug: "msi", name: "MSI Crosshair Series", slug: "msi-crosshair-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: true , category: "LAPTOP" },
  { id: "m-msi-gl-series", brandId: "b-msi", brandSlug: "msi", name: "GL Series", slug: "gl-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-gf-series", brandId: "b-msi", brandSlug: "msi", name: "GF Series", slug: "gf-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-modern-series", brandId: "b-msi", brandSlug: "msi", name: "Modern Series", slug: "modern-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-gp-leopard-series", brandId: "b-msi", brandSlug: "msi", name: "GP Leopard Series", slug: "gp-leopard-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-ge-raider-series", brandId: "b-msi", brandSlug: "msi", name: "GE Raider Series", slug: "ge-raider-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-prestige-series", brandId: "b-msi", brandSlug: "msi", name: "Prestige Series", slug: "prestige-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-gs-stealth-series", brandId: "b-msi", brandSlug: "msi", name: "GS Stealth Series", slug: "gs-stealth-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-gt-titan-series", brandId: "b-msi", brandSlug: "msi", name: "GT Titan Series", slug: "gt-titan-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-alpha-series", brandId: "b-msi", brandSlug: "msi", name: "Alpha Series", slug: "alpha-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-creator-series", brandId: "b-msi", brandSlug: "msi", name: "Creator Series", slug: "creator-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-wp-series", brandId: "b-msi", brandSlug: "msi", name: "WP Series", slug: "wp-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-delta-series", brandId: "b-msi", brandSlug: "msi", name: "Delta Series", slug: "delta-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-wt-series", brandId: "b-msi", brandSlug: "msi", name: "WT Series", slug: "wt-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-ws-series", brandId: "b-msi", brandSlug: "msi", name: "WS Series", slug: "ws-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-wf-series", brandId: "b-msi", brandSlug: "msi", name: "WF Series", slug: "wf-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-we-series", brandId: "b-msi", brandSlug: "msi", name: "WE Series", slug: "we-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-bravo-series", brandId: "b-msi", brandSlug: "msi", name: "Bravo Series", slug: "bravo-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-msi-summit-series", brandId: "b-msi", brandSlug: "msi", name: "Summit Series", slug: "summit-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-avita-essential-series", brandId: "b-avita", brandSlug: "avita", name: "Essential Series", slug: "essential-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-avita-liber-series", brandId: "b-avita", brandSlug: "avita", name: "Liber Series", slug: "liber-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-avita-pura-series", brandId: "b-avita", brandSlug: "avita", name: "Pura Series", slug: "pura-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-avita-cosmos-series", brandId: "b-avita", brandSlug: "avita", name: "Cosmos Series", slug: "cosmos-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-avita-magus-lite", brandId: "b-avita", brandSlug: "avita", name: "Magus Lite", slug: "magus-lite", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-avita-admiror-series", brandId: "b-avita", brandSlug: "avita", name: "Admiror Series", slug: "admiror-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
  { id: "m-otherlap-other-laptop-series", brandId: "b-other-laptop", brandSlug: "other-laptop", name: "Other Laptop Series", slug: "other-laptop-series", imageUrl: "", releaseYear: 2024, popular: false, active: true, contactForPrice: false , category: "LAPTOP" },
];

export const INITIAL_VARIANTS: DeviceVariantData[] = [
  // iPhone 15
  { id: "v-ip15-128", modelId: "m-iphone-15", storage: "128 GB", basePrice: 32000, active: true },
  { id: "v-ip15-256", modelId: "m-iphone-15", storage: "256 GB", basePrice: 38000, active: true },
  { id: "v-ip15-512", modelId: "m-iphone-15", storage: "512 GB", basePrice: 45000, active: true },

  // iPhone 15 Pro
  { id: "v-ip15p-128", modelId: "m-iphone-15-pro", storage: "128 GB", basePrice: 48000, active: true },
  { id: "v-ip15p-256", modelId: "m-iphone-15-pro", storage: "256 GB", basePrice: 55000, active: true },

  // ── LAPTOP VARIANTS ──────────────────────────────────
  { id: "v-xiaomi-mi-notebook", modelId: "m-xiaomi-mi-notebook", ram: "Standard", storage: "Standard", basePrice: 16030, active: true },
  { id: "v-xiaomi-mi-air-series", modelId: "m-xiaomi-mi-air-series", ram: "Standard", storage: "Standard", basePrice: 9100, active: true },
  { id: "v-xiaomi-mi-pro-series", modelId: "m-xiaomi-mi-pro-series", ram: "Standard", storage: "Standard", basePrice: 12470, active: true },
  { id: "v-xiaomi-redmibook-series", modelId: "m-xiaomi-redmibook-series", ram: "Standard", storage: "Standard", basePrice: 13850, active: true },
  { id: "v-apple-macbook-air-2025", modelId: "m-apple-macbook-air-2025", ram: "Standard", storage: "Standard", basePrice: 70000, active: true },
  { id: "v-apple-macbook-pro-2025", modelId: "m-apple-macbook-pro-2025", ram: "Standard", storage: "Standard", basePrice: 95000, active: true },
  { id: "v-apple-macbook-neo-series", modelId: "m-apple-macbook-neo-series", ram: "Standard", storage: "Standard", basePrice: 36000, active: true },
  { id: "v-apple-macbook-air-2026", modelId: "m-apple-macbook-air-2026", ram: "Standard", storage: "Standard", basePrice: 70000, active: true },
  { id: "v-apple-macbook-pro-2024", modelId: "m-apple-macbook-pro-2024", ram: "Standard", storage: "Standard", basePrice: 65000, active: true },
  { id: "v-apple-macbook-pro-2023", modelId: "m-apple-macbook-pro-2023", ram: "Standard", storage: "Standard", basePrice: 70000, active: true },
  { id: "v-apple-macbook-pro-2022", modelId: "m-apple-macbook-pro-2022", ram: "Standard", storage: "Standard", basePrice: 62000, active: true },
  { id: "v-apple-macbook-pro-2020-touch-bar-four-thunderbolt-3-ports", modelId: "m-apple-macbook-pro-2020-touch-bar-four-thunderbolt-3-ports", ram: "Standard", storage: "Standard", basePrice: 43640, active: true },
  { id: "v-apple-macbook-pro-2021", modelId: "m-apple-macbook-pro-2021", ram: "Standard", storage: "Standard", basePrice: 60000, active: true },
  { id: "v-apple-macbook-pro-2020-touch-bar-two-thunderbolt-3-ports", modelId: "m-apple-macbook-pro-2020-touch-bar-two-thunderbolt-3-ports", ram: "Standard", storage: "Standard", basePrice: 35450, active: true },
  { id: "v-apple-macbook-pro-2020", modelId: "m-apple-macbook-pro-2020", ram: "Standard", storage: "Standard", basePrice: 42000, active: true },
  { id: "v-apple-macbook-pro-2019", modelId: "m-apple-macbook-pro-2019", ram: "Standard", storage: "Standard", basePrice: 36070, active: true },
  { id: "v-apple-macbook-pro-2019-touch-bar-four-thunderbolt-3-ports", modelId: "m-apple-macbook-pro-2019-touch-bar-four-thunderbolt-3-ports", ram: "Standard", storage: "Standard", basePrice: 35450, active: true },
  { id: "v-apple-macbook-pro-2019-touch-bar-two-thunderbolt-3-ports", modelId: "m-apple-macbook-pro-2019-touch-bar-two-thunderbolt-3-ports", ram: "Standard", storage: "Standard", basePrice: 33310, active: true },
  { id: "v-apple-macbook-pro-2019-touch-bar", modelId: "m-apple-macbook-pro-2019-touch-bar", ram: "Standard", storage: "Standard", basePrice: 36160, active: true },
  { id: "v-apple-macbook-pro-mid-2018-touch-bar-four-thunderbolt-3-po", modelId: "m-apple-macbook-pro-mid-2018-touch-bar-four-thunderbolt-3-po", ram: "Standard", storage: "Standard", basePrice: 32920, active: true },
  { id: "v-apple-macbook-pro-mid-2017-touch-bar-four-thunderbolt-3-po", modelId: "m-apple-macbook-pro-mid-2017-touch-bar-four-thunderbolt-3-po", ram: "Standard", storage: "Standard", basePrice: 27860, active: true },
  { id: "v-apple-macbook-pro-mid-2017-two-thunderbolt-3-ports", modelId: "m-apple-macbook-pro-mid-2017-two-thunderbolt-3-ports", ram: "Standard", storage: "Standard", basePrice: 26170, active: true },
  { id: "v-apple-macbook-pro-late-2016-touch-bar-four-thunderbolt-3-p", modelId: "m-apple-macbook-pro-late-2016-touch-bar-four-thunderbolt-3-p", ram: "Standard", storage: "Standard", basePrice: 27860, active: true },
  { id: "v-apple-macbook-pro-late-2016-two-thunderbolt-3-ports", modelId: "m-apple-macbook-pro-late-2016-two-thunderbolt-3-ports", ram: "Standard", storage: "Standard", basePrice: 25320, active: true },
  { id: "v-apple-macbook-pro-retina-mid-2015", modelId: "m-apple-macbook-pro-retina-mid-2015", ram: "Standard", storage: "Standard", basePrice: 24890, active: true },
  { id: "v-apple-macbook-pro-retina-early-2015", modelId: "m-apple-macbook-pro-retina-early-2015", ram: "Standard", storage: "Standard", basePrice: 15000, active: true },
  { id: "v-apple-macbook-pro-retina-mid-2014", modelId: "m-apple-macbook-pro-retina-mid-2014", ram: "Standard", storage: "Standard", basePrice: 18440, active: true },
  { id: "v-apple-macbook-pro-retina-late-2013", modelId: "m-apple-macbook-pro-retina-late-2013", ram: "Standard", storage: "Standard", basePrice: 14510, active: true },
  { id: "v-apple-macbook-pro-retina-early-2013", modelId: "m-apple-macbook-pro-retina-early-2013", ram: "Standard", storage: "Standard", basePrice: 13930, active: true },
  { id: "v-apple-macbook-air-2023", modelId: "m-apple-macbook-air-2023", ram: "Standard", storage: "Standard", basePrice: 54350, active: true },
  { id: "v-apple-macbook-air-2022", modelId: "m-apple-macbook-air-2022", ram: "Standard", storage: "Standard", basePrice: 48520, active: true },
  { id: "v-apple-macbook-air-2020", modelId: "m-apple-macbook-air-2020", ram: "Standard", storage: "Standard", basePrice: 35650, active: true },
  { id: "v-apple-macbook-air-2024", modelId: "m-apple-macbook-air-2024", ram: "Standard", storage: "Standard", basePrice: 60000, active: true },
  { id: "v-apple-macbook-air-2019", modelId: "m-apple-macbook-air-2019", ram: "Standard", storage: "Standard", basePrice: 26750, active: true },
  { id: "v-apple-macbook-air-2018", modelId: "m-apple-macbook-air-2018", ram: "Standard", storage: "Standard", basePrice: 23030, active: true },
  { id: "v-apple-macbook-air-mid-2017", modelId: "m-apple-macbook-air-mid-2017", ram: "Standard", storage: "Standard", basePrice: 17720, active: true },
  { id: "v-apple-macbook-air-early-2015", modelId: "m-apple-macbook-air-early-2015", ram: "Standard", storage: "Standard", basePrice: 14510, active: true },
  { id: "v-apple-macbook-air-early-2014", modelId: "m-apple-macbook-air-early-2014", ram: "Standard", storage: "Standard", basePrice: 11400, active: true },
  { id: "v-apple-macbook-air-mid-2013", modelId: "m-apple-macbook-air-mid-2013", ram: "Standard", storage: "Standard", basePrice: 11400, active: true },
  { id: "v-apple-macbook-retina-mid-2017", modelId: "m-apple-macbook-retina-mid-2017", ram: "Standard", storage: "Standard", basePrice: 18420, active: true },
  { id: "v-apple-macbook-retina-early-2016", modelId: "m-apple-macbook-retina-early-2016", ram: "Standard", storage: "Standard", basePrice: 15540, active: true },
  { id: "v-apple-macbook-retina-early-2015", modelId: "m-apple-macbook-retina-early-2015", ram: "Standard", storage: "Standard", basePrice: 13810, active: true },
  { id: "v-samsung-galaxy-book-go-series", modelId: "m-samsung-galaxy-book-go-series", ram: "Standard", storage: "Standard", basePrice: 10860, active: true },
  { id: "v-samsung-galaxy-book2-series", modelId: "m-samsung-galaxy-book2-series", ram: "Standard", storage: "Standard", basePrice: 21990, active: true },
  { id: "v-samsung-galaxy-book2-360-series", modelId: "m-samsung-galaxy-book2-360-series", ram: "Standard", storage: "Standard", basePrice: 27340, active: true },
  { id: "v-samsung-galaxy-book2-pro-series", modelId: "m-samsung-galaxy-book2-pro-series", ram: "Standard", storage: "Standard", basePrice: 29060, active: true },
  { id: "v-samsung-galaxy-book2-pro-360-series", modelId: "m-samsung-galaxy-book2-pro-360-series", ram: "Standard", storage: "Standard", basePrice: 29490, active: true },
  { id: "v-samsung-galaxy-book3-series", modelId: "m-samsung-galaxy-book3-series", ram: "Standard", storage: "Standard", basePrice: 30000, active: true },
  { id: "v-samsung-galaxy-book3-360-series", modelId: "m-samsung-galaxy-book3-360-series", ram: "Standard", storage: "Standard", basePrice: 33000, active: true },
  { id: "v-samsung-galaxy-book3-ultra-series", modelId: "m-samsung-galaxy-book3-ultra-series", ram: "Standard", storage: "Standard", basePrice: 55000, active: true },
  { id: "v-samsung-galaxy-book3-pro-360-series", modelId: "m-samsung-galaxy-book3-pro-360-series", ram: "Standard", storage: "Standard", basePrice: 40000, active: true },
  { id: "v-samsung-galaxy-book4-series", modelId: "m-samsung-galaxy-book4-series", ram: "Standard", storage: "Standard", basePrice: 29830, active: true },
  { id: "v-samsung-galaxy-book4-360-series", modelId: "m-samsung-galaxy-book4-360-series", ram: "Standard", storage: "Standard", basePrice: 31470, active: true },
  { id: "v-samsung-galaxy-book4-pro-series", modelId: "m-samsung-galaxy-book4-pro-series", ram: "Standard", storage: "Standard", basePrice: 30870, active: true },
  { id: "v-samsung-galaxy-book4-pro-360-series", modelId: "m-samsung-galaxy-book4-pro-360-series", ram: "Standard", storage: "Standard", basePrice: 45000, active: true },
  { id: "v-samsung-galaxy-book4-ultra-series", modelId: "m-samsung-galaxy-book4-ultra-series", ram: "Standard", storage: "Standard", basePrice: 50000, active: true },
  { id: "v-samsung-galaxy-book4-edge-series", modelId: "m-samsung-galaxy-book4-edge-series", ram: "Standard", storage: "Standard", basePrice: 30000, active: true },
  { id: "v-samsung-galaxy-book5-series", modelId: "m-samsung-galaxy-book5-series", ram: "Standard", storage: "Standard", basePrice: 42100, active: true },
  { id: "v-samsung-galaxy-book5-360-series", modelId: "m-samsung-galaxy-book5-360-series", ram: "Standard", storage: "Standard", basePrice: 43460, active: true },
  { id: "v-samsung-galaxy-book5-pro-series", modelId: "m-samsung-galaxy-book5-pro-series", ram: "Standard", storage: "Standard", basePrice: 46680, active: true },
  { id: "v-samsung-galaxy-book5-pro-360-series", modelId: "m-samsung-galaxy-book5-pro-360-series", ram: "Standard", storage: "Standard", basePrice: 49900, active: true },
  { id: "v-samsung-others-samsung-series", modelId: "m-samsung-others-samsung-series", ram: "Standard", storage: "Standard", basePrice: 4030, active: true },
  { id: "v-realme-book-prime-series", modelId: "m-realme-book-prime-series", ram: "Standard", storage: "Standard", basePrice: 25120, active: true },
  { id: "v-realme-book-slim-series", modelId: "m-realme-book-slim-series", ram: "Standard", storage: "Standard", basePrice: 18240, active: true },
  { id: "v-lenovo-ideapad-5-series", modelId: "m-lenovo-ideapad-5-series", ram: "Standard", storage: "Standard", basePrice: 12500, active: true },
  { id: "v-lenovo-yoga-slim-7-series", modelId: "m-lenovo-yoga-slim-7-series", ram: "Standard", storage: "Standard", basePrice: 26500, active: true },
  { id: "v-lenovo-lenovo-loq-series", modelId: "m-lenovo-lenovo-loq-series", ram: "Standard", storage: "Standard", basePrice: 27570, active: true },
  { id: "v-lenovo-legion-5i-series", modelId: "m-lenovo-legion-5i-series", ram: "Standard", storage: "Standard", basePrice: 35000, active: true },
  { id: "v-lenovo-legion-slim-5-series", modelId: "m-lenovo-legion-slim-5-series", ram: "Standard", storage: "Standard", basePrice: 29000, active: true },
  { id: "v-lenovo-legion-slim-5i-series", modelId: "m-lenovo-legion-slim-5i-series", ram: "Standard", storage: "Standard", basePrice: 38000, active: true },
  { id: "v-lenovo-legion-5i-pro-series", modelId: "m-lenovo-legion-5i-pro-series", ram: "Standard", storage: "Standard", basePrice: 43000, active: true },
  { id: "v-lenovo-legion-pro-5-series", modelId: "m-lenovo-legion-pro-5-series", ram: "Standard", storage: "Standard", basePrice: 40000, active: true },
  { id: "v-lenovo-legion-pro-5i-series", modelId: "m-lenovo-legion-pro-5i-series", ram: "Standard", storage: "Standard", basePrice: 39000, active: true },
  { id: "v-lenovo-legion-pro-7i-series", modelId: "m-lenovo-legion-pro-7i-series", ram: "Standard", storage: "Standard", basePrice: 50000, active: true },
  { id: "v-lenovo-ideapad-300-series", modelId: "m-lenovo-ideapad-300-series", ram: "Standard", storage: "Standard", basePrice: 11480, active: true },
  { id: "v-lenovo-ideapad-500-series", modelId: "m-lenovo-ideapad-500-series", ram: "Standard", storage: "Standard", basePrice: 6310, active: true },
  { id: "v-lenovo-thinkpad-t-series", modelId: "m-lenovo-thinkpad-t-series", ram: "Standard", storage: "Standard", basePrice: 6050, active: true },
  { id: "v-lenovo-ideapad-100-series", modelId: "m-lenovo-ideapad-100-series", ram: "Standard", storage: "Standard", basePrice: 4970, active: true },
  { id: "v-lenovo-ideapad-s-series", modelId: "m-lenovo-ideapad-s-series", ram: "Standard", storage: "Standard", basePrice: 5540, active: true },
  { id: "v-lenovo-yoga-500-series", modelId: "m-lenovo-yoga-500-series", ram: "Standard", storage: "Standard", basePrice: 10020, active: true },
  { id: "v-lenovo-thinkpad-l-series", modelId: "m-lenovo-thinkpad-l-series", ram: "Standard", storage: "Standard", basePrice: 8690, active: true },
  { id: "v-lenovo-lenovo-y-series", modelId: "m-lenovo-lenovo-y-series", ram: "Standard", storage: "Standard", basePrice: 18780, active: true },
  { id: "v-lenovo-ideapad-flex-series", modelId: "m-lenovo-ideapad-flex-series", ram: "Standard", storage: "Standard", basePrice: 6700, active: true },
  { id: "v-lenovo-thinkpad-e-series", modelId: "m-lenovo-thinkpad-e-series", ram: "Standard", storage: "Standard", basePrice: 11880, active: true },
  { id: "v-lenovo-ideapad-slim-3i-series", modelId: "m-lenovo-ideapad-slim-3i-series", ram: "Standard", storage: "Standard", basePrice: 17330, active: true },
  { id: "v-lenovo-lenovo-v-series", modelId: "m-lenovo-lenovo-v-series", ram: "Standard", storage: "Standard", basePrice: 6380, active: true },
  { id: "v-lenovo-thinkpad-x-series", modelId: "m-lenovo-thinkpad-x-series", ram: "Standard", storage: "Standard", basePrice: 7330, active: true },
  { id: "v-lenovo-thinkpad-edge-series", modelId: "m-lenovo-thinkpad-edge-series", ram: "Standard", storage: "Standard", basePrice: 5110, active: true },
  { id: "v-lenovo-lenovo-300e-series", modelId: "m-lenovo-lenovo-300e-series", ram: "Standard", storage: "Standard", basePrice: 5690, active: true },
  { id: "v-lenovo-legion-series", modelId: "m-lenovo-legion-series", ram: "Standard", storage: "Standard", basePrice: 16870, active: true },
  { id: "v-lenovo-lenovo-n-series", modelId: "m-lenovo-lenovo-n-series", ram: "Standard", storage: "Standard", basePrice: 4490, active: true },
  { id: "v-lenovo-lenovo-500e-series", modelId: "m-lenovo-lenovo-500e-series", ram: "Standard", storage: "Standard", basePrice: 3980, active: true },
  { id: "v-lenovo-yoga-700-series", modelId: "m-lenovo-yoga-700-series", ram: "Standard", storage: "Standard", basePrice: 10340, active: true },
  { id: "v-lenovo-ideapad-gaming-series", modelId: "m-lenovo-ideapad-gaming-series", ram: "Standard", storage: "Standard", basePrice: 20110, active: true },
  { id: "v-lenovo-thinkpad-a-series", modelId: "m-lenovo-thinkpad-a-series", ram: "Standard", storage: "Standard", basePrice: 5490, active: true },
  { id: "v-lenovo-yoga-900-series", modelId: "m-lenovo-yoga-900-series", ram: "Standard", storage: "Standard", basePrice: 10340, active: true },
  { id: "v-lenovo-ideapad-d-series", modelId: "m-lenovo-ideapad-d-series", ram: "Standard", storage: "Standard", basePrice: 5950, active: true },
  { id: "v-lenovo-thinkpad-twist-series", modelId: "m-lenovo-thinkpad-twist-series", ram: "Standard", storage: "Standard", basePrice: 6460, active: true },
  { id: "v-lenovo-ideapad-700-series", modelId: "m-lenovo-ideapad-700-series", ram: "Standard", storage: "Standard", basePrice: 6980, active: true },
  { id: "v-lenovo-yoga-c-series", modelId: "m-lenovo-yoga-c-series", ram: "Standard", storage: "Standard", basePrice: 4680, active: true },
  { id: "v-lenovo-thinkpad-11e-series", modelId: "m-lenovo-thinkpad-11e-series", ram: "Standard", storage: "Standard", basePrice: 5590, active: true },
  { id: "v-lenovo-legion-5-series", modelId: "m-lenovo-legion-5-series", ram: "Standard", storage: "Standard", basePrice: 21860, active: true },
  { id: "v-lenovo-ideapad-slim-5i-series", modelId: "m-lenovo-ideapad-slim-5i-series", ram: "Standard", storage: "Standard", basePrice: 22250, active: true },
  { id: "v-lenovo-thinkbook-series", modelId: "m-lenovo-thinkbook-series", ram: "Standard", storage: "Standard", basePrice: 5850, active: true },
  { id: "v-lenovo-thinkpad-p-series", modelId: "m-lenovo-thinkpad-p-series", ram: "Standard", storage: "Standard", basePrice: 7620, active: true },
  { id: "v-lenovo-lenovo-100e-series", modelId: "m-lenovo-lenovo-100e-series", ram: "Standard", storage: "Standard", basePrice: 3980, active: true },
  { id: "v-lenovo-lenovo-11e-series", modelId: "m-lenovo-lenovo-11e-series", ram: "Standard", storage: "Standard", basePrice: 2880, active: true },
  { id: "v-lenovo-thinkpad-helix-series", modelId: "m-lenovo-thinkpad-helix-series", ram: "Standard", storage: "Standard", basePrice: 6080, active: true },
  { id: "v-lenovo-ideapad-900-series", modelId: "m-lenovo-ideapad-900-series", ram: "Standard", storage: "Standard", basePrice: 10520, active: true },
  { id: "v-lenovo-legion-7-series", modelId: "m-lenovo-legion-7-series", ram: "Standard", storage: "Standard", basePrice: 32850, active: true },
  { id: "v-lenovo-student-chromebooks", modelId: "m-lenovo-student-chromebooks", ram: "Standard", storage: "Standard", basePrice: 1320, active: true },
  { id: "v-lenovo-other-lenovo-series", modelId: "m-lenovo-other-lenovo-series", ram: "Standard", storage: "Standard", basePrice: 4410, active: true },
  { id: "v-nokia-nokia-purebook-series", modelId: "m-nokia-nokia-purebook-series", ram: "Standard", storage: "Standard", basePrice: 17110, active: true },
  { id: "v-dell-vostro-series", modelId: "m-dell-vostro-series", ram: "Standard", storage: "Standard", basePrice: 11590, active: true },
  { id: "v-dell-inspiron-series", modelId: "m-dell-inspiron-series", ram: "Standard", storage: "Standard", basePrice: 12690, active: true },
  { id: "v-dell-g15-gaming-series", modelId: "m-dell-g15-gaming-series", ram: "Standard", storage: "Standard", basePrice: 22000, active: true },
  { id: "v-dell-g16-gaming-series", modelId: "m-dell-g16-gaming-series", ram: "Standard", storage: "Standard", basePrice: 20000, active: true },
  { id: "v-dell-vostro-3000-series", modelId: "m-dell-vostro-3000-series", ram: "Standard", storage: "Standard", basePrice: 12500, active: true },
  { id: "v-dell-vostro-5000-series", modelId: "m-dell-vostro-5000-series", ram: "Standard", storage: "Standard", basePrice: 13500, active: true },
  { id: "v-dell-vostro-7000-series", modelId: "m-dell-vostro-7000-series", ram: "Standard", storage: "Standard", basePrice: 14000, active: true },
  { id: "v-dell-latitude-3000-2-in-1-series", modelId: "m-dell-latitude-3000-2-in-1-series", ram: "Standard", storage: "Standard", basePrice: 9000, active: true },
  { id: "v-dell-latitude-5000-2-in-1-series", modelId: "m-dell-latitude-5000-2-in-1-series", ram: "Standard", storage: "Standard", basePrice: 10500, active: true },
  { id: "v-dell-latitude-7000-2-in-1-series", modelId: "m-dell-latitude-7000-2-in-1-series", ram: "Standard", storage: "Standard", basePrice: 11500, active: true },
  { id: "v-dell-latitude-9000-2-in-1-series", modelId: "m-dell-latitude-9000-2-in-1-series", ram: "Standard", storage: "Standard", basePrice: 18500, active: true },
  { id: "v-dell-dell-15-series", modelId: "m-dell-dell-15-series", ram: "Standard", storage: "Standard", basePrice: 17000, active: true },
  { id: "v-dell-inspiron-3000-series", modelId: "m-dell-inspiron-3000-series", ram: "Standard", storage: "Standard", basePrice: 10400, active: true },
  { id: "v-dell-inspiron-3000-2-in-1-series", modelId: "m-dell-inspiron-3000-2-in-1-series", ram: "Standard", storage: "Standard", basePrice: 8500, active: true },
  { id: "v-dell-inspiron-5000-series", modelId: "m-dell-inspiron-5000-series", ram: "Standard", storage: "Standard", basePrice: 10600, active: true },
  { id: "v-dell-inspiron-5000-2-in-1-series", modelId: "m-dell-inspiron-5000-2-in-1-series", ram: "Standard", storage: "Standard", basePrice: 10800, active: true },
  { id: "v-dell-inspiron-7000-series", modelId: "m-dell-inspiron-7000-series", ram: "Standard", storage: "Standard", basePrice: 13200, active: true },
  { id: "v-dell-inspiron-7000-2-in-1-series", modelId: "m-dell-inspiron-7000-2-in-1-series", ram: "Standard", storage: "Standard", basePrice: 14000, active: true },
  { id: "v-dell-inspiron-n5000-series", modelId: "m-dell-inspiron-n5000-series", ram: "Standard", storage: "Standard", basePrice: 6500, active: true },
  { id: "v-dell-inspiron-gaming-series", modelId: "m-dell-inspiron-gaming-series", ram: "Standard", storage: "Standard", basePrice: 9800, active: true },
  { id: "v-dell-latitude-series", modelId: "m-dell-latitude-series", ram: "Standard", storage: "Standard", basePrice: 9790, active: true },
  { id: "v-dell-latitude-e3000-series", modelId: "m-dell-latitude-e3000-series", ram: "Standard", storage: "Standard", basePrice: 9000, active: true },
  { id: "v-dell-latitude-e4000-series", modelId: "m-dell-latitude-e4000-series", ram: "Standard", storage: "Standard", basePrice: 7000, active: true },
  { id: "v-dell-latitude-e5000-series", modelId: "m-dell-latitude-e5000-series", ram: "Standard", storage: "Standard", basePrice: 12000, active: true },
  { id: "v-dell-latitude-e6000-series", modelId: "m-dell-latitude-e6000-series", ram: "Standard", storage: "Standard", basePrice: 11000, active: true },
  { id: "v-dell-latitude-e7000-series", modelId: "m-dell-latitude-e7000-series", ram: "Standard", storage: "Standard", basePrice: 12500, active: true },
  { id: "v-dell-latitude-3000-series", modelId: "m-dell-latitude-3000-series", ram: "Standard", storage: "Standard", basePrice: 9500, active: true },
  { id: "v-dell-latitude-5000-series", modelId: "m-dell-latitude-5000-series", ram: "Standard", storage: "Standard", basePrice: 11100, active: true },
  { id: "v-dell-latitude-6000-series", modelId: "m-dell-latitude-6000-series", ram: "Standard", storage: "Standard", basePrice: 8000, active: true },
  { id: "v-dell-latitude-7000-series", modelId: "m-dell-latitude-7000-series", ram: "Standard", storage: "Standard", basePrice: 13000, active: true },
  { id: "v-dell-latitude-9000-series", modelId: "m-dell-latitude-9000-series", ram: "Standard", storage: "Standard", basePrice: 19000, active: true },
  { id: "v-dell-precision-series", modelId: "m-dell-precision-series", ram: "Standard", storage: "Standard", basePrice: 22620, active: true },
  { id: "v-dell-studio-series", modelId: "m-dell-studio-series", ram: "Standard", storage: "Standard", basePrice: 5760, active: true },
  { id: "v-dell-alienware-series", modelId: "m-dell-alienware-series", ram: "Standard", storage: "Standard", basePrice: 17700, active: true },
  { id: "v-dell-dell-chromebook-series", modelId: "m-dell-dell-chromebook-series", ram: "Standard", storage: "Standard", basePrice: 3070, active: true },
  { id: "v-dell-g7-gaming-series", modelId: "m-dell-g7-gaming-series", ram: "Standard", storage: "Standard", basePrice: 25220, active: true },
  { id: "v-dell-g5-gaming-series", modelId: "m-dell-g5-gaming-series", ram: "Standard", storage: "Standard", basePrice: 16920, active: true },
  { id: "v-dell-g3-gaming-series", modelId: "m-dell-g3-gaming-series", ram: "Standard", storage: "Standard", basePrice: 16780, active: true },
  { id: "v-dell-xps-series", modelId: "m-dell-xps-series", ram: "Standard", storage: "Standard", basePrice: 11840, active: true },
  { id: "v-dell-other-dell-series", modelId: "m-dell-other-dell-series", ram: "Standard", storage: "Standard", basePrice: 1270, active: true },
  { id: "v-hp-pavilion-series", modelId: "m-hp-pavilion-series", ram: "Standard", storage: "Standard", basePrice: 6680, active: true },
  { id: "v-hp-zbook-8-series", modelId: "m-hp-zbook-8-series", ram: "Standard", storage: "Standard", basePrice: 35000, active: true },
  { id: "v-hp-zbook-firefly-series", modelId: "m-hp-zbook-firefly-series", ram: "Standard", storage: "Standard", basePrice: 40000, active: true },
  { id: "v-hp-zbook-fury-series", modelId: "m-hp-zbook-fury-series", ram: "Standard", storage: "Standard", basePrice: 45000, active: true },
  { id: "v-hp-zbook-power-series", modelId: "m-hp-zbook-power-series", ram: "Standard", storage: "Standard", basePrice: 45000, active: true },
  { id: "v-hp-zbook-studio-series", modelId: "m-hp-zbook-studio-series", ram: "Standard", storage: "Standard", basePrice: 45000, active: true },
  { id: "v-hp-zbook-x-series", modelId: "m-hp-zbook-x-series", ram: "Standard", storage: "Standard", basePrice: 40000, active: true },
  { id: "v-hp-hp-15-series", modelId: "m-hp-hp-15-series", ram: "Standard", storage: "Standard", basePrice: 13390, active: true },
  { id: "v-hp-hp-notebook-series", modelId: "m-hp-hp-notebook-series", ram: "Standard", storage: "Standard", basePrice: 11210, active: true },
  { id: "v-hp-probook-series", modelId: "m-hp-probook-series", ram: "Standard", storage: "Standard", basePrice: 10700, active: true },
  { id: "v-hp-elitebook-series", modelId: "m-hp-elitebook-series", ram: "Standard", storage: "Standard", basePrice: 15030, active: true },
  { id: "v-hp-g-series", modelId: "m-hp-g-series", ram: "Standard", storage: "Standard", basePrice: 7830, active: true },
  { id: "v-hp-envy-series", modelId: "m-hp-envy-series", ram: "Standard", storage: "Standard", basePrice: 12610, active: true },
  { id: "v-hp-hp-14-series", modelId: "m-hp-hp-14-series", ram: "Standard", storage: "Standard", basePrice: 11710, active: true },
  { id: "v-hp-pavilion-power-series", modelId: "m-hp-pavilion-power-series", ram: "Standard", storage: "Standard", basePrice: 6310, active: true },
  { id: "v-hp-hp-300-series", modelId: "m-hp-hp-300-series", ram: "Standard", storage: "Standard", basePrice: 11100, active: true },
  { id: "v-hp-spectre-series", modelId: "m-hp-spectre-series", ram: "Standard", storage: "Standard", basePrice: 16780, active: true },
  { id: "v-hp-split-series", modelId: "m-hp-split-series", ram: "Standard", storage: "Standard", basePrice: 2130, active: true },
  { id: "v-hp-hp-chromebook-series", modelId: "m-hp-hp-chromebook-series", ram: "Standard", storage: "Standard", basePrice: 4150, active: true },
  { id: "v-hp-omen-series", modelId: "m-hp-omen-series", ram: "Standard", storage: "Standard", basePrice: 15860, active: true },
  { id: "v-hp-200-series", modelId: "m-hp-200-series", ram: "Standard", storage: "Standard", basePrice: 9590, active: true },
  { id: "v-hp-hp-17-series", modelId: "m-hp-hp-17-series", ram: "Standard", storage: "Standard", basePrice: 10920, active: true },
  { id: "v-hp-stream-series", modelId: "m-hp-stream-series", ram: "Standard", storage: "Standard", basePrice: 2610, active: true },
  { id: "v-hp-zbook-series", modelId: "m-hp-zbook-series", ram: "Standard", storage: "Standard", basePrice: 22730, active: true },
  { id: "v-hp-pavilion-gaming-series", modelId: "m-hp-pavilion-gaming-series", ram: "Standard", storage: "Standard", basePrice: 23280, active: true },
  { id: "v-hp-slatebook-series", modelId: "m-hp-slatebook-series", ram: "Standard", storage: "Standard", basePrice: 2650, active: true },
  { id: "v-hp-victus-series", modelId: "m-hp-victus-series", ram: "Standard", storage: "Standard", basePrice: 23950, active: true },
  { id: "v-hp-other-hp-series", modelId: "m-hp-other-hp-series", ram: "Standard", storage: "Standard", basePrice: 4690, active: true },
  { id: "v-asus-asus-x-series", modelId: "m-asus-asus-x-series", ram: "Standard", storage: "Standard", basePrice: 5690, active: true },
  { id: "v-asus-vivobook-series", modelId: "m-asus-vivobook-series", ram: "Standard", storage: "Standard", basePrice: 9250, active: true },
  { id: "v-asus-asus-k-series", modelId: "m-asus-asus-k-series", ram: "Standard", storage: "Standard", basePrice: 10140, active: true },
  { id: "v-asus-asus-r-series", modelId: "m-asus-asus-r-series", ram: "Standard", storage: "Standard", basePrice: 5540, active: true },
  { id: "v-asus-asus-e-series", modelId: "m-asus-asus-e-series", ram: "Standard", storage: "Standard", basePrice: 4290, active: true },
  { id: "v-asus-rog-series", modelId: "m-asus-rog-series", ram: "Standard", storage: "Standard", basePrice: 18560, active: true },
  { id: "v-asus-eeebook-series", modelId: "m-asus-eeebook-series", ram: "Standard", storage: "Standard", basePrice: 3090, active: true },
  { id: "v-asus-asus-a-series", modelId: "m-asus-asus-a-series", ram: "Standard", storage: "Standard", basePrice: 7770, active: true },
  { id: "v-asus-vivobook-s-series", modelId: "m-asus-vivobook-s-series", ram: "Standard", storage: "Standard", basePrice: 7040, active: true },
  { id: "v-asus-asus-f-series", modelId: "m-asus-asus-f-series", ram: "Standard", storage: "Standard", basePrice: 10240, active: true },
  { id: "v-asus-tuf-gaming-series", modelId: "m-asus-tuf-gaming-series", ram: "Standard", storage: "Standard", basePrice: 25000, active: true },
  { id: "v-asus-zenbook-series", modelId: "m-asus-zenbook-series", ram: "Standard", storage: "Standard", basePrice: 9080, active: true },
  { id: "v-asus-gaming-series", modelId: "m-asus-gaming-series", ram: "Standard", storage: "Standard", basePrice: 7830, active: true },
  { id: "v-asus-asus-q-series", modelId: "m-asus-asus-q-series", ram: "Standard", storage: "Standard", basePrice: 5540, active: true },
  { id: "v-asus-asus-n-series", modelId: "m-asus-asus-n-series", ram: "Standard", storage: "Standard", basePrice: 6210, active: true },
  { id: "v-asus-vivobook-pro-series", modelId: "m-asus-vivobook-pro-series", ram: "Standard", storage: "Standard", basePrice: 9080, active: true },
  { id: "v-asus-asus-fx-series", modelId: "m-asus-asus-fx-series", ram: "Standard", storage: "Standard", basePrice: 5590, active: true },
  { id: "v-asus-rog-strix-series", modelId: "m-asus-rog-strix-series", ram: "Standard", storage: "Standard", basePrice: 28400, active: true },
  { id: "v-asus-asuspro-p-series", modelId: "m-asus-asuspro-p-series", ram: "Standard", storage: "Standard", basePrice: 12920, active: true },
  { id: "v-asus-zenbook-u-series", modelId: "m-asus-zenbook-u-series", ram: "Standard", storage: "Standard", basePrice: 4290, active: true },
  { id: "v-asus-zenbook-flip-series", modelId: "m-asus-zenbook-flip-series", ram: "Standard", storage: "Standard", basePrice: 15800, active: true },
  { id: "v-asus-asus-chromebook-series", modelId: "m-asus-asus-chromebook-series", ram: "Standard", storage: "Standard", basePrice: 2140, active: true },
  { id: "v-asus-vivobook-flip-series", modelId: "m-asus-vivobook-flip-series", ram: "Standard", storage: "Standard", basePrice: 10920, active: true },
  { id: "v-asus-asus-chromebook-flip-series", modelId: "m-asus-asus-chromebook-flip-series", ram: "Standard", storage: "Standard", basePrice: 17370, active: true },
  { id: "v-asus-asus-b-series", modelId: "m-asus-asus-b-series", ram: "Standard", storage: "Standard", basePrice: 7550, active: true },
  { id: "v-asus-asus-nx-series", modelId: "m-asus-asus-nx-series", ram: "Standard", storage: "Standard", basePrice: 8220, active: true },
  { id: "v-asus-asus-p-series", modelId: "m-asus-asus-p-series", ram: "Standard", storage: "Standard", basePrice: 5540, active: true },
  { id: "v-asus-zenbook-s-series", modelId: "m-asus-zenbook-s-series", ram: "Standard", storage: "Standard", basePrice: 5540, active: true },
  { id: "v-asus-asuspro-b-series", modelId: "m-asus-asuspro-b-series", ram: "Standard", storage: "Standard", basePrice: 12920, active: true },
  { id: "v-asus-asus-fz-series", modelId: "m-asus-asus-fz-series", ram: "Standard", storage: "Standard", basePrice: 8220, active: true },
  { id: "v-asus-zenbook-pro-series", modelId: "m-asus-zenbook-pro-series", ram: "Standard", storage: "Standard", basePrice: 26050, active: true },
  { id: "v-asus-rog-zephyrus-series", modelId: "m-asus-rog-zephyrus-series", ram: "Standard", storage: "Standard", basePrice: 32920, active: true },
  { id: "v-asus-asus-v-series", modelId: "m-asus-asus-v-series", ram: "Standard", storage: "Standard", basePrice: 4290, active: true },
  { id: "v-asus-proart-studiobook-series", modelId: "m-asus-proart-studiobook-series", ram: "Standard", storage: "Standard", basePrice: 26830, active: true },
  { id: "v-asus-other-asus-series", modelId: "m-asus-other-asus-series", ram: "Standard", storage: "Standard", basePrice: 4290, active: true },
  { id: "v-lg-other-lg-series", modelId: "m-lg-other-lg-series", ram: "Standard", storage: "Standard", basePrice: 6110, active: true },
  { id: "v-lg-lg-gram-series", modelId: "m-lg-lg-gram-series", ram: "Standard", storage: "Standard", basePrice: 8500, active: true },
  { id: "v-acer-travelmate-p4-series", modelId: "m-acer-travelmate-p4-series", ram: "Standard", storage: "Standard", basePrice: 17000, active: true },
  { id: "v-acer-travelmate-p2-series", modelId: "m-acer-travelmate-p2-series", ram: "Standard", storage: "Standard", basePrice: 15000, active: true },
  { id: "v-acer-travelmate-p6-series", modelId: "m-acer-travelmate-p6-series", ram: "Standard", storage: "Standard", basePrice: 19000, active: true },
  { id: "v-acer-aspire-series", modelId: "m-acer-aspire-series", ram: "Standard", storage: "Standard", basePrice: 7670, active: true },
  { id: "v-acer-aspire-one-series", modelId: "m-acer-aspire-one-series", ram: "Standard", storage: "Standard", basePrice: 3570, active: true },
  { id: "v-acer-aspire-e-series", modelId: "m-acer-aspire-e-series", ram: "Standard", storage: "Standard", basePrice: 9240, active: true },
  { id: "v-acer-aspire-5-series", modelId: "m-acer-aspire-5-series", ram: "Standard", storage: "Standard", basePrice: 13740, active: true },
  { id: "v-acer-aspire-3-series", modelId: "m-acer-aspire-3-series", ram: "Standard", storage: "Standard", basePrice: 8320, active: true },
  { id: "v-acer-predator-series", modelId: "m-acer-predator-series", ram: "Standard", storage: "Standard", basePrice: 13980, active: true },
  { id: "v-acer-switch-series", modelId: "m-acer-switch-series", ram: "Standard", storage: "Standard", basePrice: 11070, active: true },
  { id: "v-acer-nitro-spin-series", modelId: "m-acer-nitro-spin-series", ram: "Standard", storage: "Standard", basePrice: 13320, active: true },
  { id: "v-acer-spin-series", modelId: "m-acer-spin-series", ram: "Standard", storage: "Standard", basePrice: 11070, active: true },
  { id: "v-acer-acer-chromebook-series", modelId: "m-acer-acer-chromebook-series", ram: "Standard", storage: "Standard", basePrice: 3860, active: true },
  { id: "v-acer-swift-series", modelId: "m-acer-swift-series", ram: "Standard", storage: "Standard", basePrice: 11640, active: true },
  { id: "v-acer-nitro-5-series", modelId: "m-acer-nitro-5-series", ram: "Standard", storage: "Standard", basePrice: 15390, active: true },
  { id: "v-acer-aspire-7-series", modelId: "m-acer-aspire-7-series", ram: "Standard", storage: "Standard", basePrice: 17140, active: true },
  { id: "v-acer-predator-helios-300-series", modelId: "m-acer-predator-helios-300-series", ram: "Standard", storage: "Standard", basePrice: 20930, active: true },
  { id: "v-acer-swift-5-series", modelId: "m-acer-swift-5-series", ram: "Standard", storage: "Standard", basePrice: 19610, active: true },
  { id: "v-acer-extensa-series", modelId: "m-acer-extensa-series", ram: "Standard", storage: "Standard", basePrice: 5000, active: true },
  { id: "v-acer-swift-3-series", modelId: "m-acer-swift-3-series", ram: "Standard", storage: "Standard", basePrice: 9170, active: true },
  { id: "v-acer-nitro-5-spin-series", modelId: "m-acer-nitro-5-spin-series", ram: "Standard", storage: "Standard", basePrice: 15100, active: true },
  { id: "v-acer-spin-1-series", modelId: "m-acer-spin-1-series", ram: "Standard", storage: "Standard", basePrice: 4240, active: true },
  { id: "v-acer-spin-5-series", modelId: "m-acer-spin-5-series", ram: "Standard", storage: "Standard", basePrice: 9840, active: true },
  { id: "v-acer-switch-5-series", modelId: "m-acer-switch-5-series", ram: "Standard", storage: "Standard", basePrice: 11620, active: true },
  { id: "v-acer-spin-3-series", modelId: "m-acer-spin-3-series", ram: "Standard", storage: "Standard", basePrice: 8320, active: true },
  { id: "v-acer-predator-15-series", modelId: "m-acer-predator-15-series", ram: "Standard", storage: "Standard", basePrice: 16860, active: true },
  { id: "v-acer-nitro-7-series", modelId: "m-acer-nitro-7-series", ram: "Standard", storage: "Standard", basePrice: 15910, active: true },
  { id: "v-acer-spin-7-series", modelId: "m-acer-spin-7-series", ram: "Standard", storage: "Standard", basePrice: 17240, active: true },
  { id: "v-acer-swift-7-series", modelId: "m-acer-swift-7-series", ram: "Standard", storage: "Standard", basePrice: 18920, active: true },
  { id: "v-acer-swift-x-series", modelId: "m-acer-swift-x-series", ram: "Standard", storage: "Standard", basePrice: 18190, active: true },
  { id: "v-acer-swift-3x-series", modelId: "m-acer-swift-3x-series", ram: "Standard", storage: "Standard", basePrice: 21510, active: true },
  { id: "v-acer-conceptd-3-series", modelId: "m-acer-conceptd-3-series", ram: "Standard", storage: "Standard", basePrice: 26730, active: true },
  { id: "v-acer-conceptd-5-series", modelId: "m-acer-conceptd-5-series", ram: "Standard", storage: "Standard", basePrice: 28290, active: true },
  { id: "v-acer-conceptd-7-series", modelId: "m-acer-conceptd-7-series", ram: "Standard", storage: "Standard", basePrice: 30670, active: true },
  { id: "v-acer-conceptd-9-series", modelId: "m-acer-conceptd-9-series", ram: "Standard", storage: "Standard", basePrice: 31780, active: true },
  { id: "v-acer-predator-triton-300-series", modelId: "m-acer-predator-triton-300-series", ram: "Standard", storage: "Standard", basePrice: 18760, active: true },
  { id: "v-acer-predator-triton-500-series", modelId: "m-acer-predator-triton-500-series", ram: "Standard", storage: "Standard", basePrice: 21130, active: true },
  { id: "v-acer-predator-triton-700-series", modelId: "m-acer-predator-triton-700-series", ram: "Standard", storage: "Standard", basePrice: 21500, active: true },
  { id: "v-acer-predator-triton-900-series", modelId: "m-acer-predator-triton-900-series", ram: "Standard", storage: "Standard", basePrice: 24230, active: true },
  { id: "v-acer-predator-helios-500-series", modelId: "m-acer-predator-helios-500-series", ram: "Standard", storage: "Standard", basePrice: 23730, active: true },
  { id: "v-acer-predator-helios-700-series", modelId: "m-acer-predator-helios-700-series", ram: "Standard", storage: "Standard", basePrice: 28100, active: true },
  { id: "v-acer-predator-17-series", modelId: "m-acer-predator-17-series", ram: "Standard", storage: "Standard", basePrice: 17710, active: true },
  { id: "v-acer-predator-21x-series", modelId: "m-acer-predator-21x-series", ram: "Standard", storage: "Standard", basePrice: 18660, active: true },
  { id: "v-acer-other-acer-series", modelId: "m-acer-other-acer-series", ram: "Standard", storage: "Standard", basePrice: 4240, active: true },
  { id: "v-microsof-surface-pro-series", modelId: "m-microsof-surface-pro-series", ram: "Standard", storage: "Standard", basePrice: 7520, active: true },
  { id: "v-microsof-surface-pro-4-series", modelId: "m-microsof-surface-pro-4-series", ram: "Standard", storage: "Standard", basePrice: 12810, active: true },
  { id: "v-microsof-surface-series", modelId: "m-microsof-surface-series", ram: "Standard", storage: "Standard", basePrice: 4800, active: true },
  { id: "v-microsof-surface-book-series", modelId: "m-microsof-surface-book-series", ram: "Standard", storage: "Standard", basePrice: 12350, active: true },
  { id: "v-microsof-surface-pro-3-series", modelId: "m-microsof-surface-pro-3-series", ram: "Standard", storage: "Standard", basePrice: 10270, active: true },
  { id: "v-microsof-surface-book-2-series", modelId: "m-microsof-surface-book-2-series", ram: "Standard", storage: "Standard", basePrice: 14260, active: true },
  { id: "v-microsof-surface-go-series", modelId: "m-microsof-surface-go-series", ram: "Standard", storage: "Standard", basePrice: 3560, active: true },
  { id: "v-microsof-surface-pro-5-series", modelId: "m-microsof-surface-pro-5-series", ram: "Standard", storage: "Standard", basePrice: 14130, active: true },
  { id: "v-microsof-surface-laptop-2-series", modelId: "m-microsof-surface-laptop-2-series", ram: "Standard", storage: "Standard", basePrice: 14260, active: true },
  { id: "v-microsof-surface-pro-2-series", modelId: "m-microsof-surface-pro-2-series", ram: "Standard", storage: "Standard", basePrice: 8400, active: true },
  { id: "v-microsof-surface-laptop-3-series", modelId: "m-microsof-surface-laptop-3-series", ram: "Standard", storage: "Standard", basePrice: 17420, active: true },
  { id: "v-microsof-surface-2-series", modelId: "m-microsof-surface-2-series", ram: "Standard", storage: "Standard", basePrice: 4890, active: true },
  { id: "v-microsof-surface-3-series", modelId: "m-microsof-surface-3-series", ram: "Standard", storage: "Standard", basePrice: 5490, active: true },
  { id: "v-microsof-surface-pro-6-series", modelId: "m-microsof-surface-pro-6-series", ram: "Standard", storage: "Standard", basePrice: 16330, active: true },
  { id: "v-microsof-surface-laptop-4-series", modelId: "m-microsof-surface-laptop-4-series", ram: "Standard", storage: "Standard", basePrice: 19340, active: true },
  { id: "v-microsof-surface-pro-7-series", modelId: "m-microsof-surface-pro-7-series", ram: "Standard", storage: "Standard", basePrice: 19970, active: true },
  { id: "v-microsof-surface-laptop-series", modelId: "m-microsof-surface-laptop-series", ram: "Standard", storage: "Standard", basePrice: 12350, active: true },
  { id: "v-microsof-surface-book-3-series", modelId: "m-microsof-surface-book-3-series", ram: "Standard", storage: "Standard", basePrice: 17420, active: true },
  { id: "v-microsof-surface-pro-x-series", modelId: "m-microsof-surface-pro-x-series", ram: "Standard", storage: "Standard", basePrice: 23170, active: true },
  { id: "v-microsof-surface-go-2-series", modelId: "m-microsof-surface-go-2-series", ram: "Standard", storage: "Standard", basePrice: 8880, active: true },
  { id: "v-microsof-other-microsoft-series", modelId: "m-microsof-other-microsoft-series", ram: "Standard", storage: "Standard", basePrice: 10720, active: true },
  { id: "v-msi-msi-crosshair-series", modelId: "m-msi-msi-crosshair-series", ram: "Standard", storage: "Standard", basePrice: 0, active: true },
  { id: "v-msi-gl-series", modelId: "m-msi-gl-series", ram: "Standard", storage: "Standard", basePrice: 23690, active: true },
  { id: "v-msi-gf-series", modelId: "m-msi-gf-series", ram: "Standard", storage: "Standard", basePrice: 20820, active: true },
  { id: "v-msi-modern-series", modelId: "m-msi-modern-series", ram: "Standard", storage: "Standard", basePrice: 21730, active: true },
  { id: "v-msi-gp-leopard-series", modelId: "m-msi-gp-leopard-series", ram: "Standard", storage: "Standard", basePrice: 23690, active: true },
  { id: "v-msi-ge-raider-series", modelId: "m-msi-ge-raider-series", ram: "Standard", storage: "Standard", basePrice: 24660, active: true },
  { id: "v-msi-prestige-series", modelId: "m-msi-prestige-series", ram: "Standard", storage: "Standard", basePrice: 21730, active: true },
  { id: "v-msi-gs-stealth-series", modelId: "m-msi-gs-stealth-series", ram: "Standard", storage: "Standard", basePrice: 20820, active: true },
  { id: "v-msi-gt-titan-series", modelId: "m-msi-gt-titan-series", ram: "Standard", storage: "Standard", basePrice: 20820, active: true },
  { id: "v-msi-alpha-series", modelId: "m-msi-alpha-series", ram: "Standard", storage: "Standard", basePrice: 17250, active: true },
  { id: "v-msi-creator-series", modelId: "m-msi-creator-series", ram: "Standard", storage: "Standard", basePrice: 19970, active: true },
  { id: "v-msi-wp-series", modelId: "m-msi-wp-series", ram: "Standard", storage: "Standard", basePrice: 8950, active: true },
  { id: "v-msi-delta-series", modelId: "m-msi-delta-series", ram: "Standard", storage: "Standard", basePrice: 17950, active: true },
  { id: "v-msi-wt-series", modelId: "m-msi-wt-series", ram: "Standard", storage: "Standard", basePrice: 8950, active: true },
  { id: "v-msi-ws-series", modelId: "m-msi-ws-series", ram: "Standard", storage: "Standard", basePrice: 8950, active: true },
  { id: "v-msi-wf-series", modelId: "m-msi-wf-series", ram: "Standard", storage: "Standard", basePrice: 8950, active: true },
  { id: "v-msi-we-series", modelId: "m-msi-we-series", ram: "Standard", storage: "Standard", basePrice: 8950, active: true },
  { id: "v-msi-bravo-series", modelId: "m-msi-bravo-series", ram: "Standard", storage: "Standard", basePrice: 17950, active: true },
  { id: "v-msi-summit-series", modelId: "m-msi-summit-series", ram: "Standard", storage: "Standard", basePrice: 27130, active: true },
  { id: "v-avita-essential-series", modelId: "m-avita-essential-series", ram: "Standard", storage: "Standard", basePrice: 3520, active: true },
  { id: "v-avita-liber-series", modelId: "m-avita-liber-series", ram: "Standard", storage: "Standard", basePrice: 8130, active: true },
  { id: "v-avita-pura-series", modelId: "m-avita-pura-series", ram: "Standard", storage: "Standard", basePrice: 7360, active: true },
  { id: "v-avita-cosmos-series", modelId: "m-avita-cosmos-series", ram: "Standard", storage: "Standard", basePrice: 8390, active: true },
  { id: "v-avita-magus-lite", modelId: "m-avita-magus-lite", ram: "Standard", storage: "Standard", basePrice: 1870, active: true },
  { id: "v-avita-admiror-series", modelId: "m-avita-admiror-series", ram: "Standard", storage: "Standard", basePrice: 10810, active: true },
  { id: "v-otherlap-other-laptop-series", modelId: "m-otherlap-other-laptop-series", ram: "Standard", storage: "Standard", basePrice: 3030, active: true },

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

export const AVAILABLE_STATES = ["West Bengal", "Uttar Pradesh", "Jharkhand"];

export const INITIAL_SERVICE_AREAS: ServiceAreaData[] = [
  { id: "sa-1", pincode: "700001", city: "Kolkata", state: "West Bengal", active: true, pickupAvailable: true },
  { id: "sa-2", pincode: "226001", city: "Lucknow", state: "Uttar Pradesh", active: true, pickupAvailable: true },
  { id: "sa-3", pincode: "834001", city: "Ranchi", state: "Jharkhand", active: true, pickupAvailable: true },
  { id: "sa-4", pincode: "711101", city: "Howrah", state: "West Bengal", active: true, pickupAvailable: true },
  { id: "sa-5", pincode: "208001", city: "Kanpur", state: "Uttar Pradesh", active: true, pickupAvailable: true },
  { id: "sa-6", pincode: "831001", city: "Jamshedpur", state: "Jharkhand", active: true, pickupAvailable: true },
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
  { id: "part-1", name: "Rahul Sharma", phone: "+91 9876543210", email: "rahul@cashallpartners.in", businessName: "Express Logistics East", city: "Kolkata", status: "ACTIVE", rating: 4.9, completedPickups: 142 },
  { id: "part-2", name: "Vikram Kumar", phone: "+91 9812345678", email: "vikram@cashallpartners.in", businessName: "Apex Courier Services", city: "Lucknow", status: "ACTIVE", rating: 4.8, completedPickups: 98 },
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
    pincode: "700001",
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
