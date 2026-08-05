/**
 * useGamificationStore — Zustand Gamification Store (replaces GamificationContext)
 * Manages donor badges, donor score, eligibility countdown, tier progression, and leaderboard
 */
import { create } from 'zustand';
import type { Badge, HealthPerk, LeaderboardEntry, DonationRecord, DonorTier } from '../types';
import { useAuthStore } from './useAuthStore';

// Badge definitions
export const BADGES: Badge[] = [
  { id: 'first_drop', name: 'First Drop', emoji: '🩸', desc: 'Completed your first blood donation', requirement: 1, tier: 'bronze' },
  { id: 'life_saver_1', name: 'Life Saver I', emoji: '🥉', desc: 'Completed 3 blood donations', requirement: 3, tier: 'bronze' },
  { id: 'life_saver_2', name: 'Life Saver II', emoji: '🥈', desc: 'Completed 5 blood donations', requirement: 5, tier: 'silver' },
  { id: 'life_saver_3', name: 'Life Saver III', emoji: '🥇', desc: 'Completed 10 blood donations', requirement: 10, tier: 'gold' },
  { id: 'elite_donor', name: 'Elite Donor', emoji: '💎', desc: 'Completed 25 blood donations', requirement: 25, tier: 'diamond' },
  { id: 'first_responder', name: 'Emergency Responder', emoji: '🚨', desc: 'Responded to a CRITICAL request within 10 minutes', requirement: 1, tier: 'special' },
  { id: 'streak_3', name: 'Streak Champion', emoji: '🔥', desc: '3 consecutive months staying active', requirement: 3, tier: 'special' },
  { id: 'community_hero', name: 'Community Hero', emoji: '🦸', desc: 'Top 10 donor in your region', requirement: 1, tier: 'legendary' },
];

// Health perks / partner vouchers
export const HEALTH_PERKS: HealthPerk[] = [
  { id: 'perk_checkup', name: 'Free Health Checkup', desc: 'Annual health screening at partner clinics', emoji: '🏥', status: 'available', tier: 'bronze' },
  { id: 'perk_transport', name: '50% Transport Discount', desc: 'Next 3 emergency transport fees halved', emoji: '🚕', status: 'available', tier: 'silver' },
  { id: 'perk_pharmacy', name: 'Pharmacy Credit KSh 500', desc: 'Redeemable at partner pharmacies', emoji: '💊', status: 'locked', tier: 'gold' },
  { id: 'perk_insurance', name: 'Emergency Insurance Cover', desc: '1-month basic health insurance', emoji: '🛡️', status: 'locked', tier: 'diamond' },
];

// Simulated leaderboard data
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Grace Wambui', bloodType: 'O-', donations: 28, score: 9800, badges: 6 },
  { rank: 2, name: 'David Ochieng', bloodType: 'A+', donations: 22, score: 8400, badges: 5 },
  { rank: 3, name: 'Sarah Connor', bloodType: 'O+', donations: 18, score: 7200, badges: 5 },
  { rank: 4, name: 'James Kariuki', bloodType: 'B+', donations: 15, score: 6100, badges: 4 },
  { rank: 5, name: 'Amina Hassan', bloodType: 'AB+', donations: 12, score: 5000, badges: 3 },
  { rank: 6, name: 'Peter Mwangi', bloodType: 'O+', donations: 10, score: 4200, badges: 3 },
  { rank: 7, name: 'Fatima Ali', bloodType: 'A-', donations: 8, score: 3500, badges: 2 },
  { rank: 8, name: 'John Otieno', bloodType: 'B-', donations: 6, score: 2800, badges: 2 },
];

// Donation history mock data
const MOCK_DONATION_HISTORY: DonationRecord[] = [
  { id: 'don-1', date: '2026-07-15', hospital: 'Nairobi National Hospital', bloodType: 'O+', units: 1, transactionId: 'TELEBIRR-XN901243' },
  { id: 'don-2', date: '2026-05-22', hospital: 'Kenyatta University Hospital', bloodType: 'O+', units: 1, transactionId: 'MPESA-KU882910' },
  { id: 'don-3', date: '2026-03-10', hospital: 'Nairobi National Hospital', bloodType: 'O+', units: 2, transactionId: 'CBEBIRR-NB112039' },
];

const DONATION_INTERVAL_DAYS = 56;

interface GamificationState {
  donationCount: number;
  donationHistory: DonationRecord[];
  streakMonths: number;
  criticalResponses: number;
  lastDonationDate: Date;
  allBadges: Badge[];
  healthPerks: HealthPerk[];
  leaderboard: LeaderboardEntry[];

  // Actions
  recordDonation: (hospitalName: string, transactionId: string) => void;

  // Computed helper methods
  getEarnedBadges: () => Badge[];
  getDaysUntilEligible: () => number;
  getIsEligible: () => boolean;
  getEligibilityProgress: () => number;
  getTier: () => DonorTier;
  getDonorScore: () => number;
}

export const useGamificationStore = create<GamificationState>()((set, get) => ({
  donationCount: 3,
  donationHistory: MOCK_DONATION_HISTORY,
  streakMonths: 2,
  criticalResponses: 1,
  lastDonationDate: new Date('2026-07-15'),
  allBadges: BADGES,
  healthPerks: HEALTH_PERKS,
  leaderboard: MOCK_LEADERBOARD,

  recordDonation: (hospitalName, transactionId) => {
    const currentUser = useAuthStore.getState().user;
    const newDonation: DonationRecord = {
      id: 'don-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      hospital: hospitalName,
      bloodType: (currentUser && 'bloodType' in currentUser ? currentUser.bloodType : 'O+'),
      units: 1,
      transactionId,
    };
    set((state) => ({
      donationHistory: [newDonation, ...state.donationHistory],
      donationCount: state.donationCount + 1,
      lastDonationDate: new Date(),
    }));
  },

  getEarnedBadges: () => {
    const { donationCount, criticalResponses, streakMonths } = get();
    return BADGES.filter((badge) => {
      if (badge.id === 'first_drop') return donationCount >= 1;
      if (badge.id === 'life_saver_1') return donationCount >= 3;
      if (badge.id === 'life_saver_2') return donationCount >= 5;
      if (badge.id === 'life_saver_3') return donationCount >= 10;
      if (badge.id === 'elite_donor') return donationCount >= 25;
      if (badge.id === 'first_responder') return criticalResponses >= 1;
      if (badge.id === 'streak_3') return streakMonths >= 3;
      return false;
    });
  },

  getDaysUntilEligible: () => {
    const days = Math.floor((Date.now() - get().lastDonationDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, DONATION_INTERVAL_DAYS - days);
  },

  getIsEligible: () => get().getDaysUntilEligible() === 0,

  getEligibilityProgress: () => {
    const days = Math.floor((Date.now() - get().lastDonationDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(1, days / DONATION_INTERVAL_DAYS);
  },

  getTier: (): DonorTier => {
    const count = get().donationCount;
    if (count >= 25) return { name: 'Diamond', emoji: '💎', color: '#00E5FF' };
    if (count >= 10) return { name: 'Gold', emoji: '🥇', color: '#FFC400' };
    if (count >= 5) return { name: 'Silver', emoji: '🥈', color: '#94A3B8' };
    if (count >= 1) return { name: 'Bronze', emoji: '🥉', color: '#CD7F32' };
    return { name: 'New Donor', emoji: '🩸', color: '#FF3B5C' };
  },

  getDonorScore: () => {
    const { donationCount, criticalResponses, streakMonths } = get();
    return (donationCount * 350) + (criticalResponses * 500) + (streakMonths * 200);
  },
}));

// Backward-compatible hook wrapper
export function useGamification() {
  const store = useGamificationStore();
  return {
    ...store,
    earnedBadges: store.getEarnedBadges(),
    daysUntilEligible: store.getDaysUntilEligible(),
    isEligible: store.getIsEligible(),
    eligibilityProgress: store.getEligibilityProgress(),
    tier: store.getTier(),
    donorScore: store.getDonorScore(),
  };
}
