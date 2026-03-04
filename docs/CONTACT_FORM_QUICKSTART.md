# 🎉 Contact Form Integration - Quick Start Guide

Your landing page contact form is now fully integrated with the backend email service!

## ✅ What Was Done

1. ✨ **Backend Endpoint Created**: `POST /notifications/contact` - receives contact form submissions
2. ✨ **Email Service Integrated**: Sends emails to `help@cobudget.app` using your SMTP configuration
3. ✨ **Frontend Connected**: Landing page form now sends data to the backend
4. ✨ **User Experience Enhanced**: Added loading states, error handling, and success messages

## 🚀 How to Test

### Step 1: Set Environment Variable

Make sure the email password is configured:

```bash
export EMAIL_PASSWORD="your-smtp-password-here"
```

Or add it to your `.env` file or IDE run configuration.

### Step 2: Start the Backend

```bash
cd /Users/guga/workspace/budget/budget-api
./gradlew quarkusDev
```

Wait for the message: "Listening on: http://0.0.0.0:8080"

### Step 3: Start the Frontend

In a new terminal:

```bash
cd /Users/guga/workspace/budget/budget-app
npm run dev
```

Wait for the message showing the local URL (usually http://localhost:5173)

### Step 4: Test the Form

1. Open your browser to `http://localhost:5173/`
2. Scroll down to the **"Entre em Contato Conosco"** section
3. Fill in the form:
   - **Nome**: Your name
   - **E-mail**: Your email address
   - **Mensagem**: Your message
4. Click **"Enviar"**
5. You should see:
   - The button changes to "Enviando..."
   - After a moment, an alert: "Mensagem enviada com sucesso! Entraremos em contato em breve."
   - The form clears

### Step 5: Check Email

Check the inbox of `help@cobudget.app` for the email with:
- **Subject**: "Nova mensagem de contato de [Your Name]"
- **Body**: Your name, email, and message

## 🧪 Test with cURL (Optional)

You can also test the backend directly:

```bash
curl -X POST http://localhost:8080/notifications/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message from cURL"
  }'
```

Expected response:
```json
{
  "message": "Mensagem enviada com sucesso!"
}
```

## 📧 Email Details

- **From**: notifications@cobudget.app
- **To**: help@cobudget.app
- **SMTP**: smtp.hostinger.com:465 (SSL)

## ❗ Troubleshooting

### "Erro ao enviar mensagem"

**Possible causes**:
1. EMAIL_PASSWORD not set
2. SMTP credentials incorrect
3. Network issues

**Solution**:
- Check backend logs for detailed error
- Verify EMAIL_PASSWORD environment variable
- Test SMTP connection: `telnet smtp.hostinger.com 465`

### Form doesn't submit / no response

**Possible causes**:
1. Backend not running
2. CORS issues
3. Network connectivity

**Solution**:
- Check browser console for errors
- Verify backend is running on http://localhost:8080
- Check backend logs for incoming requests

### 401 Unauthorized error

**Possible causes**:
1. @PermitAll annotation not working
2. Security configuration issue

**Solution**:
- Verify NotificationResource has `@PermitAll` annotation
- Check backend logs for security-related messages
- Restart backend after code changes

## 📁 Files Changed

### Backend (Java)
- ✨ Created: `ContactFormRequest.java` - DTO for contact form
- 🔧 Modified: `NotificationResource.java` - Added contact endpoint

### Frontend (TypeScript/Vue)
- 🔧 Modified: `NotificationService.ts` - Added sendContactForm method
- 🔧 Modified: `LandingPage.vue` - Connected form to backend

### Documentation
- ✨ Created: `CONTACT_FORM_INTEGRATION.md` - Detailed integration docs
- ✨ Created: `CONTACT_FORM_IMPLEMENTATION_SUMMARY.md` - Implementation summary
- ✨ Created: `CONTACT_FORM_QUICKSTART.md` - This file!

## 🎯 Next Steps

Consider these enhancements:

1. **Rate Limiting**: Add rate limiting to prevent spam
2. **CAPTCHA**: Implement reCAPTCHA v3 for production
3. **Auto-reply**: Send confirmation email to the user
4. **Database**: Store submissions for audit trail
5. **Analytics**: Track submission rates and topics

## 📚 More Information

For detailed technical documentation, see:
- `CONTACT_FORM_INTEGRATION.md` - Complete integration guide with architecture diagrams
- `CONTACT_FORM_IMPLEMENTATION_SUMMARY.md` - Summary of what was implemented

---

**Need help?** Contact the development team or check the documentation in `/docs/`.

