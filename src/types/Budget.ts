export interface Budget {
    id: string;
    categoryId: string;
    limit: number;
    period: 'monthly' | 'weekly' | 'yearly';
}
