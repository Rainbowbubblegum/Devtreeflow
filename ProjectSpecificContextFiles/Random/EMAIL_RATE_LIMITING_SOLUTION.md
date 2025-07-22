# Microsoft Graph API Rate Limiting Solution

## Problem
The application was experiencing Microsoft Graph API throttling errors with the message "Application is over its MailboxConcurrency limit." This was causing email sending failures and job retries in Hangfire.

## Root Cause
- Too many concurrent requests to Microsoft Graph API `/sendMail` endpoint
- No rate limiting or concurrency control in place
- Microsoft Graph API has limits on concurrent requests per application

## Solution Implemented

### 1. Retry Logic with Exponential Backoff
- Added intelligent retry mechanism with exponential backoff
- Properly handles HTTP 429 (TooManyRequests) responses
- Respects `Retry-After` headers from Graph API
- Maximum of 3 retry attempts with delays of 1s, 2s, 4s (with jitter)

### 2. Concurrency Control
- Implemented static semaphore to limit concurrent Graph API requests
- Default limit: 4 concurrent requests (configurable)
- Shared across all EmailSender instances

### 3. Rate Limiting
- Minimum delay between requests (default: 500ms)
- Configurable via `EmailSettings:RateLimiting` section
- Prevents rapid-fire requests that trigger throttling

### 4. Configuration Options
Added to `appsettings.json`:
```json
"EmailSettings": {
  "RateLimiting": {
    "MaxConcurrentRequests": 4,
    "MinDelayBetweenRequestsMs": 500,
    "EnableRateLimiting": true
  }
}
```

## Key Implementation Details

### Rate Limiting Method
```csharp
private async Task ApplyRateLimitingAsync()
{
    // Waits for semaphore slot
    // Enforces minimum delay between requests
    // Thread-safe with lock mechanism
}
```

### Error Handling
- Distinguishes between throttling errors (429) and other errors
- Proper semaphore cleanup in finally blocks
- Comprehensive logging for monitoring

### Exponential Backoff
- Base delay: 1 second
- Exponential multiplier: 2x per attempt
- Jitter: Up to 10% randomization to prevent thundering herd
- Maximum cap: 30 seconds

## Benefits
1. **Prevents Throttling**: Proactive rate limiting reduces 429 errors
2. **Intelligent Retries**: Automatic recovery from temporary throttling
3. **Better Resource Usage**: Controlled concurrency prevents resource exhaustion
4. **Configurable**: Easy to adjust limits based on Microsoft Graph API quotas
5. **Monitoring**: Comprehensive logging for debugging and monitoring

## Monitoring
The solution includes detailed logging:
- Rate limiting application and release
- Retry attempts with delays
- Semaphore wait times
- Graph API response codes and errors

## Configuration Recommendations
- **Production**: `MaxConcurrentRequests: 4`, `MinDelayBetweenRequestsMs: 500`
- **High Volume**: Consider reducing to `MaxConcurrentRequests: 2-3`
- **Low Volume**: Can increase to `MaxConcurrentRequests: 6-8`

## Microsoft Graph API Limits
Microsoft Graph API has the following limits:
- Mailbox concurrency limit (varies by tenant)
- Requests per second limits
- Daily quota limits

This solution helps stay within these limits while maintaining good email throughput.

## Testing
To test the solution:
1. Monitor logs for rate limiting messages
2. Check for reduced 429 errors
3. Verify email delivery success rates
4. Monitor Hangfire retry rates

## Future Improvements
1. Dynamic rate limit adjustment based on 429 responses
2. Per-tenant rate limiting if supporting multiple tenants
3. Circuit breaker pattern for extended outages
4. Metrics collection for rate limiting effectiveness 