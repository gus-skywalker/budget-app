# Contact Form Integration

## Overview
This document describes the integration between the landing page contact form in `budget-app` and the backend email service in `budget-api`.

## Architecture

### Frontend (budget-app)

#### Component: LandingPage.vue
- **Location**: `/Users/guga/workspace/budget/budget-app/src/views/LandingPage.vue`
- **Purpose**: Displays the contact form and handles user interactions
- **Key Features**:
  - Form validation (email format check)
  - Loading state during submission
  - Error handling with user-friendly messages
  - Form reset after successful submission

#### Service: NotificationService.ts
- **Location**: `/Users/guga/workspace/budget/budget-app/src/services/NotificationService.ts`
- **Method**: `sendContactForm(contactData: { name: string; email: string; message: string })`
- **Endpoint**: `POST /api/notifications/contact`
- **Purpose**: Sends contact form data to backend

### Backend (budget-api)

#### REST Resource: NotificationResource.java
- **Location**: `/Users/guga/workspace/budget/budget-api/src/main/java/org/budget/adapters/input/rest/NotificationResource.java`
- **Endpoint**: `POST /notifications/contact`
- **Security**: `@PermitAll` (no authentication required)
- **Purpose**: Receives contact form submissions and sends emails

#### DTO: ContactFormRequest.java
- **Location**: `/Users/guga/workspace/budget/budget-api/src/main/java/org/budget/adapters/input/rest/dto/ContactFormRequest.java`
- **Fields**:
  - `name` (String): Sender's name
  - `email` (String): Sender's email address
  - `message` (String): Message content
- **Validation**:
  - All fields are required
  - Email must contain '@'

#### Email Service: NotificationService.java
- **Location**: `/Users/guga/workspace/budget/budget-api/src/main/java/org/budget/adapters/output/integration/notification/impl/NotificationService.java`
- **Method**: `sendEmail(String to, String subject, String body)`
- **Configuration**: Uses Quarkus Mailer configured in `application.yml`

## Email Configuration

The email service is configured in `/Users/guga/workspace/budget/budget-api/src/main/resources/application.yml`:

```yaml
quarkus:
  mailer:
    auth-methods: PLAIN LOGIN
    from: notifications@cobudget.app
    host: smtp.hostinger.com
    port: 465
    username: support@cobudget.app
    password: ${EMAIL_PASSWORD:password}
    ssl: true
    mock: false
```

**Environment Variables Required**:
- `EMAIL_PASSWORD`: Password for the SMTP account
- `EMAIL_USERNAME`: Optional override for username (default: support@cobudget.app)
- `EMAIL_ALIAS_NOTIFICATION`: Optional override for from address (default: notifications@cobudget.app)

## Email Recipients

Contact form submissions are sent to:
- **Primary**: `help@cobudget.app`
- **Alternative**: `contact@cobudget.app` (displayed on form but not used in code)

To change the recipient, modify the `recipientEmail` variable in `NotificationResource.sendContactEmail()`.

## Flow Diagram

```
┌─────────────┐
│ User fills  │
│ contact form│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ LandingPage.vue             │
│ - Validates email format    │
│ - Sets loading state        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ NotificationService.ts      │
│ POST /notifications/contact │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ NotificationResource.java   │
│ - Validates request         │
│ - Calls NotificationService │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ NotificationService.java    │
│ - Formats email             │
│ - Sends via Quarkus Mailer  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ SMTP Server (Hostinger)     │
│ Delivers to help@cobudget   │
└─────────────────────────────┘
```

## API Contract

### Request
```json
POST /notifications/contact
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "message": "Gostaria de saber mais sobre o CoBudget."
}
```

### Success Response
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Mensagem enviada com sucesso!"
}
```

### Error Responses

#### Validation Error
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Email é obrigatório"
}
```

#### Server Error
```json
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "Erro ao enviar mensagem. Por favor, tente novamente."
}
```

## Email Template

The email sent to `help@cobudget.app` has the following format:

```
Subject: Nova mensagem de contato de [Name]

Nome: [Name]
Email: [Email]

Mensagem:
[Message]
```

## Testing

### Manual Testing

1. **Start the backend**:
   ```bash
   cd /Users/guga/workspace/budget/budget-api
   ./gradlew quarkusDev
   ```

2. **Start the frontend**:
   ```bash
   cd /Users/guga/workspace/budget/budget-app
   npm run dev
   ```

3. **Navigate to landing page**:
   - Open browser to `http://localhost:5173/`
   - Scroll to the "Contato" section
   - Fill in the form and submit

### Testing with cURL

```bash
curl -X POST http://localhost:8080/notifications/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message"
  }'
```

## Security Considerations

1. **Rate Limiting**: Consider implementing rate limiting to prevent spam
2. **CAPTCHA**: For production, consider adding CAPTCHA to prevent bots
3. **Input Sanitization**: The backend validates input but doesn't sanitize HTML - this is acceptable for email but consider XSS protection if storing messages
4. **Public Endpoint**: The endpoint is public (`@PermitAll`) which is intentional for contact forms

## Future Enhancements

1. **Auto-reply**: Send confirmation email to the user
2. **Database Storage**: Store contact form submissions for audit trail
3. **Admin Dashboard**: View and manage contact form submissions
4. **CAPTCHA Integration**: Add reCAPTCHA v3 for spam prevention
5. **Email Templates**: Use proper HTML email templates instead of plain text
6. **Notification System**: Integrate with Slack or other notification systems
7. **Analytics**: Track form submission rates and common inquiries

## Troubleshooting

### Email not being sent

1. **Check SMTP configuration**:
   - Verify `EMAIL_PASSWORD` environment variable is set
   - Confirm SMTP credentials are correct
   - Check if SMTP server is accessible from your network

2. **Check logs**:
   ```bash
   # Backend logs
   tail -f /Users/guga/workspace/budget/budget-api/logs/application.log
   ```

3. **Test SMTP connection**:
   ```bash
   telnet smtp.hostinger.com 465
   ```

### Frontend errors

1. **CORS issues**: Ensure backend CORS is configured to allow requests from frontend origin
2. **Network errors**: Check browser console for detailed error messages
3. **Validation errors**: Check if all required fields are filled

## Related Documentation

- [Email Service Configuration](../budget-api/docs/EMAIL_CONFIGURATION.md)
- [Notification System](../budget-api/docs/NOTIFICATION_SYSTEM.md)
- [Landing Page Documentation](./LANDING_PAGE.md)

