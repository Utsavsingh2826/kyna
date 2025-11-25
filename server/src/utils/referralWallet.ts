import { Document, Types } from "mongoose";
import { IUser } from "../types";

export type ReferralUserDocument = (IUser &
  Document<any, any, IUser>) & {
  referralPendingBalance?: number;
  referralAvailableBalance?: number;
};

const DEFAULT_LOCK_DAYS = Number(process.env.REFERRAL_LOCK_DAYS || "60");
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const computeRedeemableAt = (
  lockDays?: number,
  fromDate: Date = new Date()
) => {
  const days = Number.isFinite(lockDays) ? Number(lockDays) : DEFAULT_LOCK_DAYS;
  return new Date(fromDate.getTime() + days * MS_PER_DAY);
};

const ensureReferralStructures = (user: ReferralUserDocument | null) => {
  if (!user) {
    return;
  }

  if (user.referralPendingBalance == null) {
    user.referralPendingBalance = 0;
  }

  if (user.referralAvailableBalance == null) {
    user.referralAvailableBalance = user.totalReferralEarnings || 0;
  }

  if (user.availableOffers == null) {
    user.availableOffers = 0;
  }

  user.referralEarningsHistory = user.referralEarningsHistory || [];
};

export const releasePendingReferralCredits = (
  user: ReferralUserDocument | null,
  asOf: Date = new Date()
) => {
  if (!user) {
    return 0;
  }

  ensureReferralStructures(user);

  let releasedAmount = 0;

  for (const entry of user.referralEarningsHistory || []) {
    if (entry.type !== "credit") continue;

    entry.redeemedAmount = entry.redeemedAmount || 0;

    if (!entry.status) {
      entry.status = "available";
      entry.redeemableAt = entry.redeemableAt || entry.createdAt || asOf;
      entry.releasedAt = entry.releasedAt || entry.createdAt || asOf;
      continue;
    }

    if (
      entry.status === "pending" &&
      (!entry.redeemableAt || entry.redeemableAt <= asOf)
    ) {
      entry.status = "available";
      entry.releasedAt = asOf;
      releasedAmount += Math.max(0, entry.amount - entry.redeemedAmount);
    }
  }

  if (releasedAmount > 0) {
    user.referralPendingBalance = Math.max(
      0,
      (user.referralPendingBalance || 0) - releasedAmount
    );
    user.referralAvailableBalance =
      (user.referralAvailableBalance || 0) + releasedAmount;
    user.availableOffers = (user.availableOffers || 0) + releasedAmount;
  }

  return releasedAmount;
};

interface QueueReferralCreditOptions {
  orderId?: Types.ObjectId | string;
  note?: string;
  lockDays?: number;
  redeemableAt?: Date;
}

export const queueReferralCredit = (
  user: ReferralUserDocument | null,
  amount: number,
  options: QueueReferralCreditOptions = {}
) => {
  if (!user || amount <= 0) {
    return;
  }

  ensureReferralStructures(user);

  const now = new Date();
  const redeemableAt =
    options.redeemableAt || computeRedeemableAt(options.lockDays, now);

  user.totalReferralEarnings = (user.totalReferralEarnings || 0) + amount;
  user.referralPendingBalance = (user.referralPendingBalance || 0) + amount;

  user.referralEarningsHistory!.push({
    type: "credit",
    amount,
    orderId: options.orderId as any,
    note: options.note,
    createdAt: now,
    status: "pending",
    redeemableAt,
    redeemedAmount: 0,
  } as any);
};

interface ConsumeReferralOptions {
  orderId?: Types.ObjectId | string;
}

export const consumeReferralCredits = (
  user: ReferralUserDocument | null,
  amount: number,
  _options: ConsumeReferralOptions = {}
) => {
  if (!user || amount <= 0) {
    return 0;
  }

  ensureReferralStructures(user);

  let remaining = amount;
  const now = new Date();

  for (const entry of user.referralEarningsHistory || []) {
    if (remaining <= 0) break;
    if (entry.type !== "credit") continue;
    if (entry.status !== "available") continue;

    entry.redeemedAmount = entry.redeemedAmount || 0;
    const entryBalance = Math.max(0, entry.amount - entry.redeemedAmount);
    if (entryBalance <= 0) {
      entry.status = "redeemed";
      entry.redeemedAt = entry.redeemedAt || now;
      continue;
    }

    const deduction = Math.min(entryBalance, remaining);
    entry.redeemedAmount += deduction;
    if (entry.redeemedAmount >= entry.amount) {
      entry.status = "redeemed";
      entry.redeemedAt = now;
    }

    remaining -= deduction;
  }

  const consumed = amount - remaining;
  if (consumed > 0) {
    user.referralAvailableBalance = Math.max(
      0,
      (user.referralAvailableBalance || 0) - consumed
    );
    user.availableOffers = Math.max(
      0,
      (user.availableOffers || 0) - consumed
    );
  }

  return consumed;
};

export const getReferralLockDays = () => DEFAULT_LOCK_DAYS;


