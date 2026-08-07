import { BaseRepository } from "./base.repository";
import {
  User,
  Order,
  DeviceVariant,
  DeviceModel,
  Brand,
  Quote,
  Pickup,
  QcReport,
  Partner,
  ServiceArea,
  FAQ,
  SystemSetting,
} from "@prisma/client";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super("user");
  }

  async findByPhone(phone: string) {
    return this.findFirst({ phone });
  }

  async findByFirebaseUid(firebaseUid: string) {
    return this.findFirst({ firebaseUid });
  }
}

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super("order");
  }

  async findByOrderNumber(orderNumber: string) {
    return this.findFirst({ orderNumber });
  }
}

export class DeviceVariantRepository extends BaseRepository<DeviceVariant> {
  constructor() {
    super("deviceVariant");
  }
}

export class DeviceModelRepository extends BaseRepository<DeviceModel> {
  constructor() {
    super("deviceModel");
  }
}

export class BrandRepository extends BaseRepository<Brand> {
  constructor() {
    super("brand");
  }
}

export class QuoteRepository extends BaseRepository<Quote> {
  constructor() {
    super("quote");
  }

  async findByQuoteNumber(quoteNumber: string) {
    return this.findFirst({ quoteNumber });
  }
}

export class PickupRepository extends BaseRepository<Pickup> {
  constructor() {
    super("pickup");
  }
}

export class QcReportRepository extends BaseRepository<QcReport> {
  constructor() {
    super("qcReport");
  }
}

export class PartnerRepository extends BaseRepository<Partner> {
  constructor() {
    super("partner");
  }
}

export class ServiceAreaRepository extends BaseRepository<ServiceArea> {
  constructor() {
    super("serviceArea");
  }

  async findByPincode(pincode: string) {
    return this.findFirst({ pincode });
  }
}

export class FAQRepository extends BaseRepository<FAQ> {
  constructor() {
    super("fAQ"); // prisma.fAQ
  }
}

export class SystemSettingRepository extends BaseRepository<SystemSetting> {
  constructor() {
    super("systemSetting");
  }
}
