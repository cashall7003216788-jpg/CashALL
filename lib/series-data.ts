export interface SeriesItem {
  id: string;
  name: string;
  matchPattern?: string[]; // keywords to match model names
}

export const BRAND_SERIES_MAP: Record<string, SeriesItem[]> = {
  samsung: [
    { id: "s-sam-s", name: "Galaxy S Series", matchPattern: ["Galaxy S", "S26", "S25", "S24", "S23", "S22", "S21", "S20", "S10", "S9", "S8", "S7", "S6"] },
    { id: "s-sam-a", name: "Galaxy A Series", matchPattern: ["Galaxy A", " A0", " A1", " A2", " A3", " A5", " A7", " A8", " A9", " A50", " A51", " A52", " A53", " A54", " A55", " A70", " A71", " A72", " A73"] },
    { id: "s-sam-m", name: "Galaxy M Series", matchPattern: ["Galaxy M", " M0", " M1", " M2", " M3", " M5", " M10", " M20", " M30", " M51", " M52", " M53", " M54", " M55"] },
    { id: "s-sam-z", name: "Galaxy Z Flip / Fold", matchPattern: ["Galaxy Z", "Fold", "Flip"] },
    { id: "s-sam-note", name: "Galaxy Note Series", matchPattern: ["Galaxy Note", "Note"] },
    { id: "s-sam-f", name: "Galaxy F Series", matchPattern: ["Galaxy F", " F0", " F1", " F2", " F3", " F5", " F14", " F15", " F54", " F55"] },
    { id: "s-sam-j", name: "Galaxy J Series", matchPattern: ["Galaxy J", " J1", " J2", " J3", " J5", " J7", " J8"] },
    { id: "s-sam-on", name: "Galaxy On Series", matchPattern: ["Galaxy On", " On5", " On6", " On7", " On8"] },
    { id: "s-sam-c", name: "Galaxy C Series", matchPattern: ["Galaxy C", " C5", " C7", " C9", " C55"] },
  ],
  apple: [
    { id: "s-app-17", name: "iPhone 17 Series", matchPattern: ["iPhone 17", "iPhone Air"] },
    { id: "s-app-16", name: "iPhone 16 Series", matchPattern: ["iPhone 16"] },
    { id: "s-app-15", name: "iPhone 15 Series", matchPattern: ["iPhone 15"] },
    { id: "s-app-14", name: "iPhone 14 Series", matchPattern: ["iPhone 14"] },
    { id: "s-app-13", name: "iPhone 13 Series", matchPattern: ["iPhone 13"] },
    { id: "s-app-12", name: "iPhone 12 Series", matchPattern: ["iPhone 12"] },
    { id: "s-app-11", name: "iPhone 11 Series", matchPattern: ["iPhone 11"] },
    { id: "s-app-x", name: "iPhone X / XS / XR", matchPattern: ["iPhone X", "iPhone XS", "iPhone XR"] },
    { id: "s-app-se", name: "iPhone SE Series", matchPattern: ["iPhone SE"] },
    { id: "s-app-legacy", name: "iPhone 8 / 7 / 6 Series", matchPattern: ["iPhone 8", "iPhone 7", "iPhone 6"] },
  ],
  xiaomi: [
    { id: "s-xio-note", name: "Redmi Note Series", matchPattern: ["Redmi Note", "Note"] },
    { id: "s-xio-redmi", name: "Redmi Series", matchPattern: ["Redmi"] },
    { id: "s-xio-num", name: "Xiaomi Number Series", matchPattern: ["Xiaomi 14", "Xiaomi 13", "Xiaomi 12", "Xiaomi 11", "Xiaomi 15", "14 CIVI"] },
    { id: "s-xio-mi", name: "Mi Series", matchPattern: ["Mi 11", "Mi 10", "Mi Mix", "Mi "] },
    { id: "s-xio-k", name: "Redmi K Series", matchPattern: ["Redmi K"] },
    { id: "s-xio-a", name: "Redmi A Series", matchPattern: ["Redmi A"] },
  ],
  oneplus: [
    { id: "s-op-nord", name: "Nord Series", matchPattern: ["Nord"] },
    { id: "s-op-num", name: "Number Series", matchPattern: ["OnePlus 12", "OnePlus 11", "OnePlus 10", "OnePlus 9", "OnePlus 8", "OnePlus 7", "OnePlus 6", "OnePlus 5", "OnePlus 3"] },
    { id: "s-op-r", name: "R Series", matchPattern: ["12R", "11R", "10R", "9R", "9RT"] },
    { id: "s-op-open", name: "Open Series", matchPattern: ["Open"] },
  ],
  vivo: [
    { id: "s-viv-v", name: "V Series", matchPattern: ["Vivo V", "V1", "V2", "V3", "V4", "V5", "V7", "V9", "V11", "V15", "V17", "V19", "V20", "V21", "V23", "V25", "V27", "V29", "V30", "V40"] },
    { id: "s-viv-y", name: "Y Series", matchPattern: ["Vivo Y", " Y1", " Y2", " Y3", " Y5", " Y7", " Y8", " Y9", " Y100", " Y200"] },
    { id: "s-viv-x", name: "X Series", matchPattern: ["Vivo X", " X50", " X60", " X70", " X80", " X90", " X100"] },
    { id: "s-viv-t", name: "T Series", matchPattern: ["Vivo T", " T1", " T2", " T3"] },
    { id: "s-viv-s", name: "S Series", matchPattern: ["Vivo S1", "Vivo S5", "Vivo S6", "Vivo S7", "Vivo S9", "Vivo S10", "Vivo S12", "Vivo S15", "Vivo S16", "Vivo S17", "Vivo S18"] },
    { id: "s-viv-z", name: "Z Series", matchPattern: ["Vivo Z", " Z1", " Z3", " Z5", " Z6"] },
  ],
  oppo: [
    { id: "s-opp-reno", name: "Reno Series", matchPattern: ["Reno"] },
    { id: "s-opp-a", name: "A Series", matchPattern: [" A", "A1", "A3", "A5", "A7", "A8", "A9", "A15", "A16", "A17", "A31", "A38", "A53", "A54", "A55", "A57", "A58", "A77", "A78", "A79"] },
    { id: "s-opp-f", name: "F Series", matchPattern: [" F", "F1", "F3", "F5", "F7", "F9", "F11", "F15", "F17", "F19", "F21", "F23", "F25", "F27"] },
    { id: "s-opp-k", name: "K Series", matchPattern: [" K", "K1", "K3", "K10", "K11", "K12"] },
    { id: "s-opp-find", name: "Find Series", matchPattern: ["Find"] },
  ],
  realme: [
    { id: "s-rea-gt", name: "GT Series", matchPattern: ["GT"] },
    { id: "s-rea-num", name: "Number Series", matchPattern: ["Realme 1", "Realme 2", "Realme 3", "Realme 5", "Realme 6", "Realme 7", "Realme 8", "Realme 9", "Realme 10", "Realme 11", "Realme 12", "Realme 13", "Realme 14"] },
    { id: "s-rea-c", name: "C Series", matchPattern: [" C", "C1", "C2", "C3", "C11", "C12", "C15", "C21", "C25", "C30", "C31", "C33", "C35", "C51", "C53", "C55", "C65", "C67"] },
    { id: "s-rea-narzo", name: "Narzo Series", matchPattern: ["Narzo"] },
    { id: "s-rea-p", name: "P Series", matchPattern: [" P1", " P2"] },
    { id: "s-rea-x", name: "X Series", matchPattern: [" X", "X2", "X3", "X7", "X50"] },
  ],
  poco: [
    { id: "s-poc-f", name: "POCO F Series", matchPattern: ["F1", "F2", "F3", "F4", "F5", "F6", "F7"] },
    { id: "s-poc-x", name: "POCO X Series", matchPattern: ["X2", "X3", "X4", "X5", "X6", "X7"] },
    { id: "s-poc-m", name: "POCO M Series", matchPattern: ["M2", "M3", "M4", "M5", "M6", "M7"] },
    { id: "s-poc-c", name: "POCO C Series", matchPattern: ["C3", "C31", "C50", "C51", "C55", "C65", "C75"] },
  ],
  motorola: [
    { id: "s-mot-edge", name: "Moto Edge Series", matchPattern: ["Edge"] },
    { id: "s-mot-g", name: "Moto G Series", matchPattern: ["Moto G", " G1", " G2", " G3", " G4", " G5", " G6", " G7", " G8", " G9", " G10", " G14", " G22", " G24", " G30", " G31", " G32", " G34", " G40", " G50", " G51", " G52", " G54", " G60", " G71", " G72", " G73", " G82", " G84"] },
    { id: "s-mot-e", name: "Moto E Series", matchPattern: ["Moto E", " E4", " E5", " E6", " E7", " E13", " E22", " E32", " E40"] },
    { id: "s-mot-razr", name: "Razr Series", matchPattern: ["Razr"] },
    { id: "s-mot-one", name: "Moto One Series", matchPattern: ["Moto One", "One Vision", "One Action", "One Fusion", "One Macro"] },
  ],
  google: [
    { id: "s-goo-9", name: "Pixel 9 Series", matchPattern: ["Pixel 9"] },
    { id: "s-goo-8", name: "Pixel 8 Series", matchPattern: ["Pixel 8"] },
    { id: "s-goo-7", name: "Pixel 7 Series", matchPattern: ["Pixel 7"] },
    { id: "s-goo-6", name: "Pixel 6 Series", matchPattern: ["Pixel 6"] },
    { id: "s-goo-legacy", name: "Pixel 5 / 4 / 3 Series", matchPattern: ["Pixel 5", "Pixel 4", "Pixel 3", "Pixel 2", "Pixel 3a", "Pixel 4a"] },
  ],
  iqoo: [
    { id: "s-iq-num", name: "iQOO Number Series", matchPattern: ["iQOO 3", "iQOO 7", "iQOO 9", "iQOO 11", "iQOO 12", "iQOO 13", "iQOO 15"] },
    { id: "s-iq-neo", name: "Neo Series", matchPattern: ["Neo"] },
    { id: "s-iq-z", name: "Z Series", matchPattern: ["Z3", "Z5", "Z6", "Z7", "Z9"] },
  ],
  nothing: [
    { id: "s-not-main", name: "Phone (1) / (2) / (3) Series", matchPattern: ["Phone"] },
  ],
  nokia: [
    { id: "s-nok-g", name: "Nokia G Series", matchPattern: ["G10", "G20", "G21", "G42", "G60"] },
    { id: "s-nok-c", name: "Nokia C Series", matchPattern: ["C01", "C10", "C12", "C20", "C22", "C30", "C31", "C32"] },
    { id: "s-nok-x", name: "Nokia X Series", matchPattern: ["X10", "X20", "X30", "XR20"] },
    { id: "s-nok-num", name: "Nokia Number Series", matchPattern: ["Nokia 2", "Nokia 3", "Nokia 5", "Nokia 6", "Nokia 7", "Nokia 8"] },
  ],
  infinix: [
    { id: "s-inf-gt", name: "GT Series", matchPattern: ["GT"] },
    { id: "s-inf-zero", name: "Zero Series", matchPattern: ["Zero"] },
    { id: "s-inf-note", name: "Note Series", matchPattern: ["Note"] },
    { id: "s-inf-hot", name: "Hot Series", matchPattern: ["Hot"] },
    { id: "s-inf-smart", name: "Smart Series", matchPattern: ["Smart"] },
  ],
  tecno: [
    { id: "s-tec-camon", name: "Camon Series", matchPattern: ["Camon"] },
    { id: "s-tec-spark", name: "Spark Series", matchPattern: ["Spark"] },
    { id: "s-tec-pova", name: "Pova Series", matchPattern: ["Pova", "POVA"] },
    { id: "s-tec-phantom", name: "Phantom Series", matchPattern: ["Phantom"] },
    { id: "s-tec-pop", name: "Pop Series", matchPattern: ["Pop", "POP"] },
  ],
  lenovo: [
    { id: "s-len-k", name: "K Series", matchPattern: [" K", "K3", "K4", "K5", "K6", "K8", "K10", "K12", "K13", "K14"] },
    { id: "s-len-a", name: "A Series", matchPattern: [" A", "A6", "A7", "A1000", "A2010", "A6000", "A7000"] },
    { id: "s-len-zuk", name: "ZUK Series", matchPattern: ["Zuk", "ZUK"] },
    { id: "s-len-phab", name: "Phab Series", matchPattern: ["Phab"] },
  ],
  lg: [
    { id: "s-lg-g", name: "G Series", matchPattern: ["G2", "G3", "G4", "G5", "G6", "G7", "G8"] },
    { id: "s-lg-v", name: "V Series", matchPattern: ["V20", "V30", "V40", "V50", "V60"] },
    { id: "s-lg-q", name: "Q Series", matchPattern: ["Q6", "Q7", "Q60", "Q92"] },
    { id: "s-lg-w", name: "W Series", matchPattern: ["W10", "W30", "W41"] },
    { id: "s-lg-k", name: "K Series", matchPattern: ["K10", "K42", "K52", "K61"] },
  ],
  honor: [
    { id: "s-hon-num", name: "Honor Number Series", matchPattern: ["Honor 7", "Honor 8", "Honor 9", "Honor 10", "Honor 20", "Honor 50", "Honor 70", "Honor 90", "Honor 200"] },
    { id: "s-hon-play", name: "Honor Play Series", matchPattern: ["Play"] },
    { id: "s-hon-holly", name: "Honor Holly Series", matchPattern: ["Holly"] },
  ],
  asus: [
    { id: "s-asu-rog", name: "ROG Series", matchPattern: ["ROG"] },
    { id: "s-asu-zen", name: "Zenfone Series", matchPattern: ["Zenfone", "ZenFone"] },
  ]
};

export function getSeriesForBrand(brandSlug: string): SeriesItem[] {
  return BRAND_SERIES_MAP[brandSlug.toLowerCase()] || [];
}

export function filterModelsBySeries(models: any[], series: SeriesItem | null): any[] {
  if (!series || !series.matchPattern || series.matchPattern.length === 0) {
    return models;
  }

  return models.filter((m) => {
    const name = (m.name || "").trim().toLowerCase();
    return series.matchPattern!.some((pattern) => {
      const p = pattern.trim().toLowerCase();
      // If matching Vivo S series, ensure name doesn't belong to Vivo V, Y, X, T, Z series
      if (series.id === "s-viv-s" && (name.startsWith("vivo v") || name.startsWith("vivo y") || name.startsWith("vivo x") || name.startsWith("vivo t") || name.startsWith("vivo z"))) {
        return false;
      }
      return name.includes(p);
    });
  });
}
