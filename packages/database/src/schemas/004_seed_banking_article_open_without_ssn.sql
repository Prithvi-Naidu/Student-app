-- Seed: Banking article - "How to Open a Bank Account Without SSN"
-- Notes:
-- - Content is stored as safe HTML (curated by us).
-- - Source URLs are official where possible; always verify at time of use.

INSERT INTO banking_resources (
  title,
  slug,
  content,
  category,
  resource_type,
  tags,
  published,
  summary,
  source_urls,
  last_verified
)
VALUES (
  'How to Open a Bank Account Without SSN (International Students)',
  'open-bank-account-without-ssn',
  $html$
<section>
  <p><strong>Quick answer:</strong> Yes—many banks can open a checking account without an SSN if you provide alternative identification (often a passport and supporting documents). Requirements vary by bank and even by branch, so always call ahead.</p>
</section>

<section>
  <h2>What banks are required to do (identity verification)</h2>
  <p>Banks must verify your identity and keep certain records. If you do not have an SSN, a bank may accept other identifiers and documents. This is a normal situation for international students and new arrivals.</p>
</section>

<section>
  <h2>Common documents that work (international students)</h2>
  <p>Bring more than you think you’ll need—some branches ask for extras.</p>
  <h3>Primary ID</h3>
  <ul>
    <li><strong>Passport</strong> (unexpired)</li>
    <li><strong>U.S. visa</strong> (if applicable)</li>
  </ul>
  <h3>Student status</h3>
  <ul>
    <li><strong>Form I-20</strong> (F-1 students) or <strong>DS-2019</strong> (J-1 students)</li>
    <li><strong>University admission letter</strong> or <strong>enrollment verification</strong> (optional but helpful)</li>
  </ul>
  <h3>U.S. address proof (varies by bank/branch)</h3>
  <ul>
    <li>Lease agreement</li>
    <li>Utility bill (if you have one)</li>
    <li>Official mail from your university housing office</li>
  </ul>
  <h3>Other helpful items</h3>
  <ul>
    <li>Student ID</li>
    <li>Secondary ID from your home country (if you have it)</li>
    <li>Initial deposit (cash/card) if the bank requires it</li>
  </ul>
</section>

<section>
  <h2>Step-by-step: open the account (without SSN)</h2>
  <ol>
    <li><strong>Pick 2–3 banks near you</strong> and call branches directly. Ask: “Can I open a checking account without an SSN? What documents should I bring?”</li>
    <li><strong>Schedule an appointment</strong> if possible—this reduces the chance you’ll be turned away due to staffing.</li>
    <li><strong>Bring your document set</strong> (passport + I-20/DS-2019 + proof of address + student ID).</li>
    <li><strong>Apply in person</strong>. If an employee says SSN is required, politely ask whether an alternate ID can be used and whether a manager can confirm the policy.</li>
    <li><strong>Set up online banking</strong> and confirm how you’ll receive your debit card (mail vs in-branch pickup).</li>
    <li><strong>Confirm fees</strong> (monthly maintenance, overdraft, ATM fees) and ask about any student waivers.</li>
  </ol>
</section>

<section>
  <h2>What about an ITIN?</h2>
  <p>Some banks accept an <strong>ITIN</strong> as an alternative identifier. If you do not have an SSN and want another official number, you can learn about ITINs and the IRS application process (Form W-7). Not every student needs an ITIN immediately—call the bank first and decide based on their requirements.</p>
</section>

<section>
  <h2>Bank options (start here)</h2>
  <p>Below are common starting points for students. Always check the bank’s official product page and confirm requirements with your local branch.</p>
  <ul>
    <li><strong>Chase</strong>: Student Checking / College Checking</li>
    <li><strong>Bank of America</strong>: Advantage Banking / Student Banking options</li>
    <li><strong>Wells Fargo</strong>: Everyday Checking</li>
  </ul>
</section>

<section>
  <h2>Tips if you get told “SSN required”</h2>
  <ul>
    <li><strong>Try another branch</strong> (policies are applied inconsistently).</li>
    <li><strong>Ask to speak with a banker/manager</strong> rather than a teller.</li>
    <li><strong>Bring extra documentation</strong> (student ID, housing letter, lease).</li>
    <li><strong>Ask about ITIN support</strong> if they require a tax ID number.</li>
  </ul>
</section>

<section>
  <h2>Sources (official)</h2>
  <ul>
    <li><a href="https://www.consumerfinance.gov/ask-cfpb/can-i-get-a-checking-account-without-a-social-security-number-or-drivers-license-en-929/" rel="noopener noreferrer" target="_blank">CFPB: Checking account without SSN or driver’s license</a></li>
    <li><a href="https://www.irs.gov/individuals/individual-taxpayer-identification-number" rel="noopener noreferrer" target="_blank">IRS: Individual Taxpayer Identification Number (ITIN)</a></li>
    <li><a href="https://www.irs.gov/forms-pubs/about-form-w-7" rel="noopener noreferrer" target="_blank">IRS: About Form W-7</a></li>
    <li><a href="https://www.chase.com/personal/checking/student-checking" rel="noopener noreferrer" target="_blank">Chase: Student Checking (product page)</a></li>
    <li><a href="https://www.bankofamerica.com/deposits/checking/advantage-banking/" rel="noopener noreferrer" target="_blank">Bank of America: Advantage Banking (product page)</a></li>
    <li><a href="https://www.wellsfargo.com/checking/everyday/" rel="noopener noreferrer" target="_blank">Wells Fargo: Everyday Checking (product page)</a></li>
  </ul>
  <p><em>Last verified:</em> 2025-12-24</p>
</section>
$html$,
  'Banking',
  'article',
  ARRAY['SSN','ITIN','International Students','Checking Account','Getting Started'],
  true,
  'A practical, step-by-step guide for international students to open a U.S. bank account without an SSN, including required documents, branch tips, and official references.',
  ARRAY[
    'https://www.consumerfinance.gov/ask-cfpb/can-i-get-a-checking-account-without-a-social-security-number-or-drivers-license-en-929/',
    'https://www.irs.gov/individuals/individual-taxpayer-identification-number',
    'https://www.irs.gov/forms-pubs/about-form-w-7',
    'https://www.chase.com/personal/checking/student-checking',
    'https://www.bankofamerica.com/deposits/checking/advantage-banking/',
    'https://www.wellsfargo.com/checking/everyday/'
  ],
  DATE '2025-12-24'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  resource_type = EXCLUDED.resource_type,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published,
  summary = EXCLUDED.summary,
  source_urls = EXCLUDED.source_urls,
  last_verified = EXCLUDED.last_verified,
  updated_at = CURRENT_TIMESTAMP;


