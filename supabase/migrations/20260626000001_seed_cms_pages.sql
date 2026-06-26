-- Seed CMS Pages with Default Content for 247Billz

INSERT INTO cms_pages (title, slug, content, status)
VALUES 
(
  'Privacy Policy', 
  'privacy-policy', 
  '<h1>Privacy Policy</h1>
  <p>Welcome to 247Billz. Your privacy is critically important to us.</p>
  <h2>1. Information We Collect</h2>
  <p>We only collect the information necessary to provide you with secure invoicing and payment services. This includes your name, email, business details, and necessary payment routing information.</p>
  <h2>2. How We Use Your Information</h2>
  <p>Your information is used strictly to operate the 247Billz platform, process your transactions, and communicate with you regarding your account. We do not sell your data to third parties.</p>
  <h2>3. Data Security</h2>
  <p>We use industry-standard encryption to protect your data. Payment data is processed securely through our verified payment partners (Paystack, Flutterwave) and is never stored in plain text on our servers.</p>
  <p><em>Last updated: June 2026</em></p>', 
  'published'
),
(
  'Terms of Service', 
  'terms-of-service', 
  '<h1>Terms of Service</h1>
  <p>By registering for and using 247Billz, you agree to the following terms and conditions.</p>
  <h2>1. Account Responsibilities</h2>
  <p>You are responsible for maintaining the security of your account credentials. You must immediately notify us of any unauthorized use of your account.</p>
  <h2>2. Acceptable Use</h2>
  <p>247Billz must not be used for any illegal or fraudulent activities. Invoices generated through our platform must represent legitimate goods or services provided by your business.</p>
  <h2>3. Fees and Payments</h2>
  <p>Any applicable subscription fees or transaction processing percentages will be clearly communicated. By using our payment gateways, you agree to the deduction of these fees prior to payout.</p>
  <h2>4. Termination</h2>
  <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</p>
  <p><em>Last updated: June 2026</em></p>', 
  'published'
),
(
  'About Us', 
  'about-us', 
  '<h1>About 247Billz</h1>
  <p>247Billz is the premier invoicing and business management platform designed for modern entrepreneurs and freelancers.</p>
  <p>Our mission is to simplify how businesses get paid. By combining powerful invoicing tools, integrated payment gateways, and seamless receipt generation, we empower you to focus on what you do best—growing your business.</p>
  <p>Whether you are sending a quick quote or managing recurring subscriptions, 247Billz is built to scale with you.</p>', 
  'published'
);
