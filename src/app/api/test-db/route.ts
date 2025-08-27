import { createClient } from '@/lib/supabase/server'

// Temporary type until database types are properly generated
type SupabaseClient = {
  from: (table: string) => any
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test basic connection
    const { error } = await (supabase as SupabaseClient)
      .from('investment_opportunities')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database connection error:', error)
      return Response.json({ 
        success: false, 
        error: error.message,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }
    
    return Response.json({ 
      success: true, 
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
