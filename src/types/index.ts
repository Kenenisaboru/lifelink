/**
 * LifeLink — Strict Domain Type Definitions
 * All core entity interfaces, union types, and enums
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
}

export interface DonorUser extends BaseUser {
  role: 'donor';
  bloodType: BloodType;
  available: boolean;
}

export interface HospitalUser extends BaseUser {
  role: 'hospital';
  hospitalName: string;
}

export type User = DonorUser | HospitalUser;

// ─── Emergency Request ───────────────────────────────────────
export type UrgencyLevel = 'critical' | 'medium' | 'low';
export type RequestStatus = 'open' | 'fulfilled';

export interface DonorResponse {
  donorId: string;
  donorName: string;
  bloodType: BloodType | string;
  amountPaid: number;
  paymentMethod?: string;
  paymentMethodId?: string;
  transactionId: string;
  respondedAt: string;
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

// ─── Payment ─────────────────────────────────────────────────
export type PaymentGateway = 'telebirr' | 'mpesa' | 'cbebirr' | 'chapa' | 'amole';

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
export type OfflineOperationType = 'CREATE_REQUEST' | 'ADD_RESPONSE' | 'MARK_FULFILLED' | 'UPDATE_STOCK';

export interface OfflineOperation {
  id: string;
  type: OfflineOperationType;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}
