import smtplib
import os
from dotenv import load_dotenv
import sys

# Add backend to path to find .env if needed, but load_dotenv should handle it if we point to it
# Assuming .env is in backend/
dotenv_path = os.path.join(os.path.dirname(__file__), 'backend', '.env')
load_dotenv(dotenv_path, override=True)

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

print(f"Testing email configuration...")
print(f"Loading .env from: {dotenv_path}")
print(f"Server: {SMTP_SERVER}:{SMTP_PORT}")
print(f"User: {repr(EMAIL_USER)}")

if EMAIL_PASSWORD:
    masked_pwd = EMAIL_PASSWORD[0] + "*" * (len(EMAIL_PASSWORD) - 2) + EMAIL_PASSWORD[-1] if len(EMAIL_PASSWORD) > 2 else "***"
    print(f"Password (repr): {repr(EMAIL_PASSWORD)}")
    print(f"Password (masked): {masked_pwd} (Length: {len(EMAIL_PASSWORD)})")
    
    if " " in EMAIL_PASSWORD:
        print("⚠️  WARNING: Password contains spaces! App Passwords should not have spaces.")
else:
    print("Password: Not set")

if not EMAIL_USER or not EMAIL_PASSWORD:
    print("❌ Error: EMAIL_USER or EMAIL_PASSWORD not set in .env")
    sys.exit(1)

if " " in EMAIL_USER:
    print("⚠️  WARNING: Email address contains spaces!")

try:
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.set_debuglevel(1) # Enable debug output for SMTP connection
    server.starttls()
    print("✅ TLS connection established")
    
    server.login(EMAIL_USER, EMAIL_PASSWORD)
    print("✅ Login successful!")
    
    server.quit()
    print("🎉 Email credentials are valid.")
except Exception as e:
    print(f"❌ Login failed with original password: {e}")
    
    if " " in EMAIL_PASSWORD:
        print("\n🔄 Retrying with spaces removed from password...")
        try:
            clean_password = EMAIL_PASSWORD.replace(" ", "")
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            server.login(EMAIL_USER, clean_password)
            print("✅ Login successful with spaces removed!")
            print("💡 SOLUTION: Please remove the spaces from EMAIL_PASSWORD in your backend/.env file.")
            print(f"   Current: '{EMAIL_PASSWORD}'")
            print(f"   Change to: '{clean_password}'")
            server.quit()
            sys.exit(0)
        except Exception as retry_error:
             print(f"❌ Login failed even with spaces removed: {retry_error}")

    print("\nTroubleshooting:")
    print("1. Ensure you are using an App Password, not your login password.")
    print("2. Check if 2-Step Verification is enabled.")
    print("3. Verify there are no leading/trailing spaces in the .env file.")
