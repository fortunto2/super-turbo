# Environment Variables Setup for Super Landing

This document explains how to set up environment variables for the Super Landing application.

## Required Environment Variables

### SuperDuperAI Configuration

```bash
SUPERDUPERAI_URL=https://dev-editor.superduperai.co
SUPERDUPERAI_TOKEN=your_superduperai_token
```

### Azure OpenAI Configuration

```bash
AZURE_OPENAI_RESOURCE_NAME=your-azure-resource-name
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

### Stripe Configuration

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Optional Environment Variables

### Database Configuration (for future use)

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/superlanding
DATABASE_URL_UNPOOLED=postgresql://user:password@localhost:5432/superlanding
PGHOST=localhost
PGHOST_UNPOOLED=localhost
PGUSER=user
PGDATABASE=superlanding
PGPASSWORD=password
```

### Redis Configuration

```bash
REDIS_URL=redis://localhost:6379
```

### Public URLs

```bash
NEXT_PUBLIC_SITE_URL=https://superduperai.co
NEXT_PUBLIC_APP_URL=https://superduperai.co
NEXT_PUBLIC_BASE_URL=https://superduperai.co
```

### Analytics (Optional)

```bash
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX
```

### LangSmith (Optional)

```bash
LANGCHAIN_API_KEY=your_langchain_api_key
```

## Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all required variables for Production environment
4. For optional variables, add them if you plan to use those features

## Local Development

1. Copy the example file:

   ```bash
   cp env.example .env.local
   ```

2. Fill in your actual values in `.env.local`

3. Start the development server:
   ```bash
   pnpm dev
   ```

## Build Configuration

The application is configured to work with placeholder values during build time. This allows the build to succeed even if some environment variables are not set, but the application will show appropriate error messages when trying to use features that require those variables.

## Troubleshooting

### Build Errors

If you encounter build errors related to missing environment variables:

1. Check that all required variables are set in your deployment platform
2. Ensure variable names match exactly (case-sensitive)
3. Verify that values don't contain placeholder text like "your\__" or "placeholder-_"

### Runtime Errors

If the application runs but shows errors when using features:

1. Check that the required environment variables are properly set
2. Verify that API keys and tokens are valid
3. Check the browser console and server logs for specific error messages

## Security Notes

- Never commit `.env.local` or any files containing real API keys to version control
- Use different API keys for development and production environments
- Rotate API keys regularly
- Store sensitive variables in your deployment platform's secure environment variable system
