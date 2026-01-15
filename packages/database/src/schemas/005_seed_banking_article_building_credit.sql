-- Seed: Building Credit as an International Student article

-- Ensure summary column exists
ALTER TABLE banking_resources ADD COLUMN IF NOT EXISTS summary TEXT;

INSERT INTO banking_resources (
  title,
  slug,
  content,
  category,
  resource_type,
  tags,
  summary,
  source_urls,
  last_verified,
  published
) VALUES (
  'Building Credit as an International Student',
  'building-credit-as-international-student',
  '<p>Building credit in the U.S. is crucial for your financial future. The good news is that you can open a U.S. bank account without an SSN – for example, Bank of America confirms international students can open accounts by providing foreign IDs, a tax ID, and proof of U.S. and foreign address. Once you have a bank account, you can start using credit products (like secured credit cards) to build your credit history. This guide explains why a strong credit score matters and outlines steps for international students to build credit in the U.S.</p>

<h2>Why Credit Matters</h2>

<h3>Easier Renting</h3>
<p>Landlords often review your credit score when you apply to rent. A good score can mean lower security deposits and more apartment choices.</p>

<h3>Lower Loan Rates</h3>
<p>Lenders use credit scores to set loan terms. With a higher score you''ll typically qualify for loans (e.g. car loans, mortgages) with better interest rates and terms.</p>

<h3>Better Financial Opportunities</h3>
<p>A strong credit history can help you qualify for a wider range of credit products. For example, Capital One notes that "a strong credit history can help when you''re applying for a job, renting an apartment, applying for a mortgage or even just getting approved for a higher credit limit". In short, good credit makes it easier to access premium credit cards, loans, and other financial services.</p>

<h2>Getting Started</h2>

<p>First, understand that most U.S. credit products require a Social Security Number (SSN) or an Individual Taxpayer Identification Number (ITIN). If you have an F‑1 or J‑1 visa and can work (even part-time on campus), you may qualify for an SSN. If not, you can apply for an ITIN by filing <a href="https://www.irs.gov/forms-pubs/about-form-w-7" target="_blank" rel="noopener noreferrer">IRS Form W-7</a> – many banks and credit card issuers will accept an ITIN in place of an SSN.</p>

<p>At the same time, open a U.S. checking account right away. Banks like Bank of America report that international students can open accounts with two IDs and proof of address (no SSN needed). Having a U.S. bank account is important: the CFPB notes you typically need one to deposit paychecks or apply for loans/mortgages. It also lays the groundwork for future credit-building and makes it easier to get credit cards from the same bank later.</p>

<h2>Step 1: Get a Secured Credit Card</h2>

<p>A secured credit card is a great first step. These cards require you to put down a refundable cash deposit (for example, $200) that becomes your credit limit. Because of the deposit, banks are often willing to approve secured cards for those with no credit history. You use the card just like any other (e.g. for groceries or gas) and pay off the balance each month. Over time, making every payment on time will establish your credit history. In fact, building credit with a secured card is "a good way to get on the U.S. credit radar," and on-time payments will eventually qualify you for more credit options.</p>

<h3>Recommended Secured Credit Cards</h3>

<p><strong>Bank of America BankAmericard® Secured Credit Card</strong></p>
<p>This secured card helps you build credit while offering the benefits of a Bank of America credit card. The security deposit becomes your credit line.</p>
<p><strong>Learn more:</strong> <a href="https://www.bankofamerica.com/credit-cards/products/secured-credit-card/" target="_blank" rel="noopener noreferrer">BankAmericard® Secured Credit Card</a></p>

<p><strong>Capital One Platinum Secured Credit Card</strong></p>
<p>Another excellent option for building credit. Capital One reports to all three major credit bureaus and offers a clear path to building credit history.</p>
<p><strong>Learn more:</strong> <a href="https://www.capitalone.com/credit-cards/platinum-secured/" target="_blank" rel="noopener noreferrer">Capital One Platinum Secured Credit Card</a></p>

<p><strong>Discover it® Secured Credit Card</strong></p>
<p>Discover offers a secured credit card that reports to credit bureaus, helping you establish credit history while earning cash back rewards.</p>
<p><strong>Learn more:</strong> <a href="https://www.discover.com/credit-cards/secured-credit-card/" target="_blank" rel="noopener noreferrer">Discover Secured Credit Card</a></p>

<h2>Step 2: Become an Authorized User</h2>

<p>If you have a trusted friend or family member with good credit, ask them to add you as an authorized user on their credit card. Capital One explains that if both the primary cardholder and the authorized user use the account responsibly, it can help build good credit for both people. (Note that card issuers don''t always report authorized-user activity to the credit bureaus – Capital One does, for example.) As long as the card is paid on time, you will get a credit history boost. This is a common strategy for newcomers who lack their own credit history and SSN.</p>

<h2>Step 3: Pay Bills On Time</h2>

<p>Payment history is by far the most important factor in your credit score. Experian notes that payment history makes up about 35% of your FICO® credit score. That means every bill you pay late can hurt your score, while every on-time payment builds it.</p>

<p>Always pay at least the minimum payment by the due date on any credit card or loan. Also keep your balances low – experts recommend using no more than about 30% of your available credit. For example, if your card limit is $300, try not to let the balance exceed $90. Finally, avoid applying for too much new credit at once. By using your secured card (and any other student cards you obtain) responsibly over time, your score will grow steadily.</p>

<h2>Additional Resources</h2>

<h3>Bank of America Resources</h3>
<ul>
<li><a href="https://www.bankofamerica.com/credit-cards/student-credit-cards/" target="_blank" rel="noopener noreferrer">Student Credit Cards Overview</a> – Official student card information</li>
<li><a href="https://www.bankofamerica.com/credit-cards/credit-cards-to-build-credit/" target="_blank" rel="noopener noreferrer">Credit Cards to Build Credit</a> – Official guide to building credit</li>
<li><a href="https://bettermoneyhabits.bankofamerica.com/en/credit/start-building-credit" target="_blank" rel="noopener noreferrer">How to Build Credit from Scratch</a> – Educational article from Better Money Habits®</li>
<li><a href="https://bettermoneyhabits.bankofamerica.com/en/credit/build-credit-with-a-secured-credit-card" target="_blank" rel="noopener noreferrer">What Is a Secured Credit Card and How It Works</a> – Educational guide</li>
<li><a href="https://info.bankofamerica.com/en/student-banking/credit-borrowing" target="_blank" rel="noopener noreferrer">Student & Young Adult Credit/Borrowing Resources</a> – Comprehensive student banking resources</li>
<li><a href="https://www.bankofamerica.com/credit-cards/compare-credit-cards/" target="_blank" rel="noopener noreferrer">Credit Card Comparison Tool</a> – Compare different credit card options</li>
</ul>

<h3>Other Resources</h3>
<ul>
<li><a href="https://www.discover.com/credit-cards/" target="_blank" rel="noopener noreferrer">Discover Credit Cards Overview</a> – Explore Discover credit card options</li>
</ul>

<h2>Summary</h2>

<p>By following these steps – opening a bank account, using secured credit cards responsibly, and paying on time – even new international students can establish a U.S. credit history. A good credit score will make future milestones (renting, car loans, premium credit cards, etc.) much easier. Building credit takes time, but starting early with these verified strategies will set you up for success.</p>

<p><strong>Sources:</strong> This guide is based on information from trusted financial institutions and government agencies, including Bank of America, Capital One, Discover, Experian, and the Consumer Financial Protection Bureau (CFPB).</p>',
  'Credit',
  'guide',
  ARRAY['Credit', 'Credit Cards', 'Credit Score', 'Secured Cards', 'International Students'],
  'Learn how to build credit in the U.S. as an international student. Discover strategies using secured credit cards, authorized user accounts, and on-time payments to establish a strong credit history.',
  ARRAY[
    'https://www.bankofamerica.com/credit-cards/products/secured-credit-card/',
    'https://www.bankofamerica.com/credit-cards/student-credit-cards/',
    'https://www.bankofamerica.com/credit-cards/credit-cards-to-build-credit/',
    'https://bettermoneyhabits.bankofamerica.com/en/credit/start-building-credit',
    'https://bettermoneyhabits.bankofamerica.com/en/credit/build-credit-with-a-secured-credit-card',
    'https://info.bankofamerica.com/en/student-banking/credit-borrowing',
    'https://www.capitalone.com/credit-cards/platinum-secured/',
    'https://www.discover.com/credit-cards/secured-credit-card/',
    'https://www.irs.gov/forms-pubs/about-form-w-7'
  ],
  CURRENT_DATE,
  true
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  resource_type = EXCLUDED.resource_type,
  tags = EXCLUDED.tags,
  summary = EXCLUDED.summary,
  source_urls = EXCLUDED.source_urls,
  last_verified = EXCLUDED.last_verified,
  updated_at = CURRENT_TIMESTAMP;

