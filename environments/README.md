# Environment Configuration

This folder contains environment-specific configurations for different deployment stages.

## Environments

### 1. Development (`.env.development`)
- **Purpose**: Local development
- **Backend**: http://localhost:8000
- **Features**: Demo mode enabled, debug logging, Keycloak optional
- **Usage**: Automatically loaded when running `npm run dev`

### 2. Staging (`.env.staging`)
- **Purpose**: Testing and QA
- **Backend**: Staging server URL
- **Features**: Demo mode enabled, info logging, Keycloak enabled
- **Usage**: For pre-production testing

### 3. Production (`.env.production`)
- **Purpose**: Live production deployment
- **Backend**: Production server URL
- **Features**: Demo mode disabled, error logging only, all security enabled
- **Usage**: For Vercel production deployment

## How to Use

### Local Development
```bash
# Uses .env.development automatically
npm run dev
```

### Staging Deployment
```bash
# Copy staging env to .env.local
cp environments/.env.staging .env.local
npm run build
npm start
```

### Production Deployment (Vercel)
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from `environments/.env.production`
3. Set environment to "Production"
4. Deploy

## Environment Variables

### Required Variables
- `NEXT_PUBLIC_API_URL` - Backend API endpoint
- `NEXT_PUBLIC_WS_URL` - WebSocket endpoint
- `NEXT_PUBLIC_KEYCLOAK_URL` - Keycloak authentication server
- `NEXT_PUBLIC_KEYCLOAK_REALM` - Keycloak realm name
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` - Keycloak client ID

### Optional Variables
- `NEXT_PUBLIC_ENVIRONMENT` - Environment name (development/staging/production)
- `NEXT_PUBLIC_LOG_LEVEL` - Logging level (debug/info/warn/error)
- `NEXT_PUBLIC_ENABLE_DEMO_MODE` - Enable demo mode fallback
- `NEXT_PUBLIC_ENABLE_WEBSOCKET` - Enable WebSocket connections
- `NEXT_PUBLIC_ENABLE_KEYCLOAK` - Enable Keycloak authentication
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Enable analytics tracking
- `NEXT_PUBLIC_ENABLE_COMPRESSION` - Enable response compression
- `NEXT_PUBLIC_ENABLE_CACHING` - Enable client-side caching
- `NEXT_PUBLIC_ENABLE_CSP` - Enable Content Security Policy
- `NEXT_PUBLIC_ENABLE_HSTS` - Enable HTTP Strict Transport Security

## Security Notes

⚠️ **NEVER commit actual credentials or secrets to Git!**

- Use `.env.local` for local secrets (already in .gitignore)
- Use Vercel environment variables for production secrets
- Update placeholder URLs with actual values
- Rotate credentials regularly

## Vercel Deployment

### Add Environment Variables in Vercel:

1. **Development Environment**:
   - Copy from `environments/.env.development`
   - Used for preview deployments

2. **Production Environment**:
   - Copy from `environments/.env.production`
   - Update URLs with actual production values
   - Used for main branch deployments

### Example Vercel Setup:
```
Variable Name: NEXT_PUBLIC_API_URL
Value: https://api.yourdomain.com
Environment: Production
```

## Testing Different Environments

### Test Development:
```bash
cp environments/.env.development .env.local
npm run dev
```

### Test Staging:
```bash
cp environments/.env.staging .env.local
npm run build
npm start
```

### Test Production:
```bash
cp environments/.env.production .env.local
npm run build
npm start
```

## Environment Comparison

| Feature | Development | Staging | Production |
|---------|------------|---------|------------|
| Backend | localhost:8000 | Staging URL | Production URL |
| Demo Mode | ✅ Enabled | ✅ Enabled | ❌ Disabled |
| Keycloak | ⚠️ Optional | ✅ Required | ✅ Required |
| Logging | 🔍 Debug | ℹ️ Info | ⚠️ Error only |
| Analytics | ❌ Disabled | ❌ Disabled | ✅ Enabled |
| WebSocket | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| Compression | ❌ Disabled | ⚠️ Optional | ✅ Enabled |
| Security Headers | ❌ Disabled | ⚠️ Optional | ✅ Enabled |

## Troubleshooting

### Backend not connecting?
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check CORS configuration on backend

### Keycloak errors?
- Verify `NEXT_PUBLIC_KEYCLOAK_URL` is accessible
- Check realm and client ID are correct
- Ensure redirect URIs are configured in Keycloak

### Environment variables not loading?
- Restart dev server after changing .env files
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`

## Best Practices

✅ Use environment-specific configurations
✅ Keep secrets in .env.local (not committed)
✅ Test in staging before production
✅ Use feature flags for gradual rollouts
✅ Monitor logs in each environment
✅ Document all environment variables
✅ Rotate credentials regularly
✅ Use HTTPS in staging and production
