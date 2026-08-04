/**
 * Re-export Prisma enums for app-wide use.
 * Prefer these over raw string literals for role/tier/status checks.
 */
export {
  UserRole,
  UserTier,
  BookingStatus,
  InterviewerStatus,
  PayoutStatus,
  PaymentType,
  PaymentStatus,
} from '@prisma/client';
