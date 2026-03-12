export type PlanId = 'MONTHLY' | 'ANNUAL' | 'BUSINESS_MONTHLY' | 'BUSINESS_ANNUAL';

export type BillingPeriod = 'month' | 'year';

export interface PlanDetail {
    id: PlanId;
    name: string;
    amount: number;
    currency: string;
    billingPeriod: BillingPeriod;
    /** Fully formatted price with currency and cadence */
    displayPrice: string;
    /** Short label used alongside plan name selections */
    planDisplay: string;
}

export const PLAN_DETAILS: Record<PlanId, PlanDetail> = {
    MONTHLY: {
        id: 'MONTHLY',
        name: 'STARTER Mensal',
        amount: 29,
        currency: 'BRL',
        billingPeriod: 'month',
        displayPrice: 'R$ 29,00 / mês',
        planDisplay: 'STARTER Mensal - R$ 29,00/mês',
    },
    ANNUAL: {
        id: 'ANNUAL',
        name: 'STARTER Anual',
        amount: 297,
        currency: 'BRL',
        billingPeriod: 'year',
        displayPrice: 'R$ 297,00 / ano',
        planDisplay: 'STARTER Anual - R$ 297,00/ano',
    },
    BUSINESS_MONTHLY: {
        id: 'BUSINESS_MONTHLY',
        name: 'TEAM Mensal',
        amount: 59,
        currency: 'BRL',
        billingPeriod: 'month',
        displayPrice: 'R$ 59,00 / mês',
        planDisplay: 'TEAM Mensal - R$ 59,00/mês',
    },
    BUSINESS_ANNUAL: {
        id: 'BUSINESS_ANNUAL',
        name: 'TEAM Anual',
        amount: 597,
        currency: 'BRL',
        billingPeriod: 'year',
        displayPrice: 'R$ 597,00 / ano',
        planDisplay: 'TEAM Anual - R$ 597,00/ano',
    },
};

export const PLAN_LIST: PlanDetail[] = Object.values(PLAN_DETAILS);

export const formatPlanAmount = (amount: number, locale = 'pt-BR', currency = 'BRL'): string => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};
