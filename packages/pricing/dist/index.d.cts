import { SupabaseClient } from '@supabase/supabase-js';

declare function runPricingSync(supabase: SupabaseClient): Promise<{
    success: boolean;
    count: number;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    count?: undefined;
}>;

export { runPricingSync };
