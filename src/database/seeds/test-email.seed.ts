import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { EmailService } from '../../shared/email/email.service';

/**
 * Test Email Service
 *
 * Script untuk test apakah email service berfungsi dengan baik.
 *
 * Usage:
 * npm run test:email
 */
async function testEmailService() {
  console.log('🚀 Starting Email Service Test...\n');

  // Create NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);
  const emailService = app.get(EmailService);

  try {
    // Test 1: Email Verifikasi
    console.log('📧 Test 1: Sending Email Verifikasi...');
    await emailService.kirimEmailVerifikasi(
      'medinastuff01@gmail.com', // Ganti dengan email Anda untuk testing
      'Test User',
      'test-user-id-123',
      '123456',
    );
    console.log('✅ Email Verifikasi sent successfully!\n');

    // Wait 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test 2: Email Reset Password
    console.log('📧 Test 2: Sending Email Reset Password...');
    await emailService.kirimEmailResetPassword(
      'medinastuff01@gmail.com', // Ganti dengan email Anda untuk testing
      'Test User',
      'test-reset-token-abc123',
    );
    console.log('✅ Email Reset Password sent successfully!\n');

    // Wait 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test 3: Email Welcome
    console.log('📧 Test 3: Sending Email Welcome...');
    await emailService.kirimEmailWelcome(
      'medinastuff01@gmail.com', // Ganti dengan email Anda untuk testing
      'Test User',
    );
    console.log('✅ Email Welcome sent successfully!\n');

    console.log('🎉 All email tests completed!');
    console.log('📬 Check your inbox: medinastuff01@gmail.com\n');
    console.log('Expected emails:');
    console.log('  1. ✅ Verifikasi Email Anda - MyMedina');
    console.log('  2. 🔐 Reset Password Anda - MyMedina');
    console.log('  3. 🎉 Selamat Datang di MyMedina!\n');
  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.error('\nPossible issues:');
    console.error('  1. Check EMAIL_USER and EMAIL_PASSWORD in .env');
    console.error('  2. Make sure App Password is correct (16 characters)');
    console.error('  3. Check internet connection');
    console.error('  4. Gmail SMTP might be blocked by firewall\n');
  } finally {
    await app.close();
  }
}

// Run the test
testEmailService()
  .then(() => {
    console.log('✅ Test completed. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
