import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase-client';
import { isSupabaseAdminConfigured } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        supabase_client: isSupabaseConfigured(),
        supabase_admin: isSupabaseAdminConfigured(),
        nextjs: true
      },
      environment: {
        node_env: process.env.NODE_ENV,
        has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        has_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        service_role_key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      }
    };

    const allServicesUp = Object.values(health.services).every(Boolean);
    
    return NextResponse.json(health, {
      status: allServicesUp ? 200 : 503
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}