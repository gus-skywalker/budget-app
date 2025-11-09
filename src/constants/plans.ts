export type PlanId = 'MONTHLY' | 'ANNUAL';

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
        name: 'Plano Mensal',
        amount: 27.5,
        currency: 'BRL',
        billingPeriod: 'month',
        displayPrice: 'R$ 27,50 / mês',
        planDisplay: 'Mensal - R$ 27,50/mês',
    },
    ANNUAL: {
        id: 'ANNUAL',
        name: 'Plano Anual',
        amount: 330,
        currency: 'BRL',
        billingPeriod: 'year',
        displayPrice: 'R$ 330,00 / ano',
        planDisplay: 'Anual - R$ 330,00/ano',
    },
};

export const PLAN_LIST: PlanDetail[] = Object.values(PLAN_DETAILS);

export const formatPlanAmount = (amount: number, locale = 'pt-BR', currency = 'BRL'): string => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};
