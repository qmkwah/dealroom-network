# Supabase Setup Guide for Dealroom Network

This guide will help you complete the Supabase configuration for your project.

## Prerequisites

- ✅ Supabase project created at [supabase.com](https://supabase.com)
- ✅ Environment variables added to `.env.local`
- ✅ Supabase CLI installed as dev dependency

## Environment Variables

Make sure your `.env.local` file contains these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: For local development
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
```

## Step 1: Link Your Supabase Project

1. Go to your Supabase project dashboard
2. Copy your **Project Reference ID** (found in Settings > General)
3. Run this command (replace `YOUR_PROJECT_REF` with your actual project reference):

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

## Step 2: Push Database Schema

Push your database schema to Supabase:

```bash
npm run db:push
```

This will create all the tables, indexes, and RLS policies defined in your migration files.

## Step 3: Generate TypeScript Types

Generate TypeScript types from your database schema:

```bash
npm run db:types
```

**Important:** Update the script in `package.json` with your actual project reference ID first.

## Step 4: Configure Authentication

### Enable Email Authentication

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Email provider
3. Configure email templates if needed

### Set up Row Level Security (RLS)

Your migration already includes RLS policies, but you may need to:

1. Go to Authentication > Policies in your Supabase dashboard
2. Verify that RLS is enabled on all tables
3. Check that policies are properly applied

## Step 5: Configure Storage (Optional)

If you plan to use file uploads:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `opportunity-documents`
3. Set appropriate permissions

## Step 6: Test Your Setup

### Test Database Connection

Create a simple test API endpoint to verify your connection:

```typescript
// app/api/test-db/route.ts
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('investment_opportunities').select('count')
    
    if (error) throw error
    
    return Response.json({ success: true, count: data })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
```

### Test Authentication

Test user registration and login through your auth forms.

## Available Commands

```bash
# Database operations
npm run db:push      # Push local schema to remote
npm run db:reset     # Reset remote database
npm run db:diff      # Show differences between local and remote
npm run db:types     # Generate TypeScript types

# Local development
npm run db:start     # Start local Supabase instance
npm run db:stop      # Stop local Supabase instance
```

## Troubleshooting

### Common Issues

1. **Connection refused**: Check your environment variables
2. **RLS policies not working**: Verify policies are enabled and properly configured
3. **Type generation fails**: Ensure your project is linked correctly

### Debug Commands

```bash
# Check project status
npx supabase status

# View logs
npx supabase logs

# Check database connection
npx supabase db ping
```

## Next Steps

1. **Test your API endpoints** - Ensure they can connect to Supabase
2. **Set up user roles** - Configure sponsor vs investor permissions
3. **Test file uploads** - If using storage features
4. **Monitor performance** - Use Supabase dashboard analytics

## Security Considerations

- Never expose your `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Use RLS policies to control data access
- Regularly review and update your security policies
- Monitor authentication logs for suspicious activity

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
