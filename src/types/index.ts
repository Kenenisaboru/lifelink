/**
 * LifeLink — Enterprise Strict Domain Type Definitions
 * HIPAA/GDPR-compliant interfaces for all core entities
 */

// ─── Blood Types ──────────────────────────────────────────────
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// ─── Geolocation ──────────────────────────────────────────────
export interface GeoLocation {
  lat: number;
  lng: number;
  city: string;
}

// ─── User Roles ───────────────────────────────────────────────
export type UserRole = 'donor' | 'hospital';

export interface BaseUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  location: GeoLocation;
  /** ISO date string */
  createdAt?: string;
  /** FCM/APNs push token for emergency notifications */
  pushToken?: string;
  /** Whether account is verified */
  verified?: boolean;
}

export interface DonorUser extends BaseUser {
  role: 'donor';
  bloodType: BloodType;
  available: boolean;
  /** ISO date of last donation */
  lastDonationDate?: string;
  /** Cumulative donor score */
  donorScore?: number;
  /** Current tier */
  tier?: DonorTierName;
}

export interface HospitalUser extends BaseUser {
  role: 'hospital';
  hospitalName: string;
  /** License / registration number */
  registrationNumber?: string;
  /** Hospital's region/district */
  region?: string;
}

export type User = DonorUser | HospitalUser;

// ─── Donor Passport ──────────────────────────────────────────
export interface DonorPassport {
  donorId: string;
  name: string;
  bloodType: BloodType;
  verified: boolean;
  donations: number;
  tier: DonorTierName;
  /** QR payload version */
  version: string;
  /** ISO expiry of this QR token */
  expiresAt: string;
  /** HMAC-SHA256 signature for QR integrity */
  signature?: string;
}

// ─── Emergency Request ───────────────────────────────────────
export type UrgencyLevel = 'critical' | 'medium' | 'low';
export type RequestStatus = 'open' | 'fulfilled' | 'cancelled';

export interface DonorResponse {
  donorId: string;
  donorName: string;
  bloodType: BloodType | string;
  amountPaid: number;
  paymentMethod?: string;
  paymentMethodId?: string;
  transactionId: string;
  respondedAt: string;
  /** Approximate ETA when donor responded */
  etaMinutes?: number;
}

export interface BloodRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bloodType: BloodType | string;
  urgency: UrgencyLevel;
  unitsNeeded: number;
  location: GeoLocation;
  suggestedAmount: number;
  notes: string;
  status: RequestStatus;
  createdAt: string;
  responses: DonorResponse[];
  /** Push notification broadcast status */
  notified?: boolean;
  /** Fulfilled timestamp */
  fulfilledAt?: string;
}

// ─── Blood Inventory ─────────────────────────────────────────
export type InventoryStock = Record<BloodType, number>;

export type StockStatusType = 'critical' | 'medium' | 'low';

export interface StockStatus {
  label: string;
  color: string;
  type: StockStatusType;
}

export interface StockHistoryDay {
  day: string;
  'O+': number;
  'A+': number;
  'O-': number;
  [key: string]: string | number;
}

/** Full inventory item with metadata */
export interface InventoryItem {
  bloodType: BloodType;
  units: number;
  status: StockStatus;
  lastUpdated: string;
  /** Hospital that owns this inventory */
  hospitalId: string;
}

// ─── Payment Transaction ─────────────────────────────────────
export type PaymentGateway = 'telebirr' | 'mpesa' | 'cbebirr' | 'chapa' | 'amole';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface PaymentMethod {
  id: PaymentGateway;
  name: string;
  subtitle: string;
  color: string;
  badgeText: string;
  prefix: string;
  icon: string;
  phonePlaceholder: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string | null;
  error?: string | null;
  rawResponse?: Record<string, unknown> | null;
}

export interface PaymentTransaction {
  id: string;
  donorId: string;
  hospitalId: string;
  requestId: string;
  amount: number;
  currency: 'ETB' | 'KES' | 'USD';
  gateway: PaymentGateway;
  status: PaymentStatus;
  transactionId: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  /** Raw webhook payload from gateway */
  webhookPayload?: Record<string, unknown>;
  /** HMAC signature from gateway for validation */
  signature?: string;
}

export interface ChapaPaymentResult extends PaymentResult {
  checkoutUrl?: string | null;
  txRef?: string;
}

export interface ChapaVerificationResult {
  verified: boolean;
  status: string;
  amount: number;
  rawResponse?: Record<string, unknown>;
  error?: string;
}

// ─── Escrow ──────────────────────────────────────────────────
export type EscrowStatus = 'held' | 'released' | 'refunded';

export interface EscrowRecord {
  escrowId: string;
  donorId: string;
  hospitalId: string;
  requestId: string;
  amount: number;
  transactionId: string;
  status: EscrowStatus;
  createdAt: number;
  releaseAt: number;
  releasedAt: number | null;
  refundedAt: number | null;
  confirmedBy?: string;
  refundReason?: string;
}

export interface EscrowHoldResult {
  escrowId: string;
  status: EscrowStatus;
  releaseAt: string;
}

export interface EscrowActionResult {
  success: boolean;
  message: string;
  escrow?: EscrowRecord;
}

// ─── Gamification ────────────────────────────────────────────
export type DonorTierName = 'New Donor' | 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'special' | 'legendary';

/** For Badge component variant */
export type BadgeType =
  | 'critical'
  | 'medium'
  | 'low'
  | 'donor'
  | 'hospital'
  | 'primary';

export interface DonorTier {
  name: DonorTierName;
  emoji: string;
  color: string;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  requirement: number;
  tier: BadgeTier;
}

export interface HealthPerk {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  status: 'available' | 'locked';
  tier: BadgeTier;
}

export interface DonationRecord {
  id: string;
  date: string;
  hospital: string;
  bloodType: BloodType | string;
  units: number;
  transactionId: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  bloodType: BloodType | string;
  donations: number;
  score: number;
  badges: number;
}

// ─── ETA ─────────────────────────────────────────────────────
export interface ETAResult {
  minutes: number;
  formatted: string;
  urgencyColor: string;
}

// ─── Biometric ───────────────────────────────────────────────
export interface BiometricAvailability {
  available: boolean;
  hasHardware?: boolean;
  isEnrolled?: boolean;
  isFaceId?: boolean;
  isFingerprint?: boolean;
  typeLabel: string;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string | null;
  warning?: string | null;
}

// ─── Notification ────────────────────────────────────────────
export interface EmergencyPushPayload {
  to: string;
  channelId: string;
  title: string;
  body: string;
  sound: string;
  priority: string;
  data: {
    type: string;
    requestId: string;
    bloodType: string;
    hospitalName: string;
  };
  badge: number;
}

// ─── Offline Sync ────────────────────────────────────────────
export type OfflineOperationType =
  | 'CREATE_REQUEST'
  | 'ADD_RESPONSE'
  | 'MARK_FULFILLED'
  | 'UPDATE_STOCK';

export interface OfflineOperation {
  id: string;
  type: OfflineOperationType;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

// ─── Background Location Task ─────────────────────────────────
export interface BackgroundLocationPayload {
  locations: Array<{
    coords: {
      latitude: number;
      longitude: number;
      accuracy: number | null;
      speed: number | null;
    };
    timestamp: number;
  }>;
}

// ─── Webhook Signatures ──────────────────────────────────────
export interface WebhookEvent {
  gateway: PaymentGateway;
  event: string;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  signature: string;
  receivedAt: string;
  rawBody: string;
}

// ─── Firebase Security Rule Types ────────────────────────────
export interface FirestoreRuleContext {
  request: {
    auth: { uid: string; token: Record<string, unknown> } | null;
    resource: { data: Record<string, unknown> };
  };
  resource: { data: Record<string, unknown> } | null;
}
