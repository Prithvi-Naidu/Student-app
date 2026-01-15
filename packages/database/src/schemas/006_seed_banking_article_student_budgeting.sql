-- Seed: Student Budgeting 101 article

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
  'Student Budgeting 101',
  'student-budgeting-101',
  '<p>Managing your finances as a student is essential for a stress-free academic experience. Budgeting helps you control your money, avoid overspending, and achieve your financial goals. This guide provides step-by-step instructions and proven strategies from university financial aid offices to help you create and maintain a successful budget.</p>

<h2>What Is Budgeting?</h2>

<p>Budgeting is planning how your money will be spent so you can cover necessities and reach financial goals. It helps you avoid overspending and achieve control over your money instead of wondering where it all went. A well-planned budget gives you clarity on your income and expenses, helping you make informed financial decisions throughout your academic journey.</p>

<h2>Step-by-Step: How to Build Your Budget</h2>

<h3>Step 1: Calculate Your Monthly Income</h3>

<p>Start by identifying all sources of income you receive each month. Include:</p>
<ul>
<li>Part-time job earnings</li>
<li>Scholarships and grants (divide annual amounts by 12 for monthly income)</li>
<li>Financial aid refunds</li>
<li>Allowances from family</li>
<li>Work-study income</li>
<li>Any other regular income sources</li>
</ul>

<p>Calculate your total monthly income to understand how much money you have available to work with each month.</p>

<h3>Step 2: Track Your Expenses</h3>

<p>Before creating your budget, track your actual spending for a few weeks or a month. Record every expense, no matter how small. Common student expense categories include:</p>

<ul>
<li><strong>Housing:</strong> Rent, utilities (electric, water, internet), renter''s insurance</li>
<li><strong>Food:</strong> Groceries, dining out, meal plans</li>
<li><strong>Transportation:</strong> Gas, public transit, car payments, insurance, parking</li>
<li><strong>Education:</strong> Tuition, fees, books, supplies, software subscriptions</li>
<li><strong>Personal:</strong> Clothing, toiletries, haircuts, medical expenses</li>
<li><strong>Entertainment:</strong> Movies, concerts, subscriptions (Netflix, Spotify), hobbies</li>
<li><strong>Savings:</strong> Emergency fund, long-term savings</li>
<li><strong>Other:</strong> Phone bill, subscriptions, gifts, miscellaneous</li>
</ul>

<p>Use a notebook, spreadsheet, or budgeting app to track where your money goes. This will help you identify spending patterns and areas where you can cut back.</p>

<h3>Step 3: Categorize Needs vs. Wants</h3>

<p>Once you''ve tracked your expenses, categorize them into needs and wants:</p>

<p><strong>Needs (Essential Expenses):</strong></p>
<ul>
<li>Housing (rent, utilities)</li>
<li>Food (groceries, basic meal plan)</li>
<li>Transportation (essential travel to school/work)</li>
<li>Education expenses (tuition, required books, fees)</li>
<li>Basic healthcare</li>
<li>Minimum debt payments</li>
</ul>

<p><strong>Wants (Discretionary Expenses):</strong></p>
<ul>
<li>Dining out and entertainment</li>
<li>Premium subscriptions</li>
<li>Non-essential clothing and personal items</li>
<li>Recreational activities</li>
<li>Hobbies and luxury items</li>
</ul>

<p>This categorization helps you prioritize essential expenses and identify areas where you can reduce spending if needed.</p>

<h3>Step 4: Create Your Budget</h3>

<p>Now that you know your income and expenses, allocate your money using this priority order:</p>

<ol>
<li><strong>Essential needs first:</strong> Cover all necessary expenses (rent, food, transportation, education)</li>
<li><strong>Savings second:</strong> Set aside money for emergency fund and future goals (aim for 10-20% of income if possible)</li>
<li><strong>Wants last:</strong> Use remaining money for discretionary spending</li>
</ol>

<p>A popular budgeting method is the 50/30/20 rule:</p>
<ul>
<li><strong>50%</strong> for needs (housing, food, transportation, essential expenses)</li>
<li><strong>30%</strong> for wants (entertainment, dining out, hobbies)</li>
<li><strong>20%</strong> for savings and debt repayment</li>
</ul>

<p>As a student, you may need to adjust these percentages based on your income level and expenses.</p>

<h3>Step 5: Compare and Adjust</h3>

<p>At the end of each month, compare your actual spending with your planned budget. Review what went well and where you overspent. Use this information to:</p>

<ul>
<li>Adjust next month''s budget allocations</li>
<li>Identify areas where you consistently overspend</li>
<li>Find opportunities to save more</li>
<li>Celebrate staying within budget in certain categories</li>
</ul>

<p>Remember, budgeting is an ongoing process. Your budget should evolve as your income, expenses, and financial goals change.</p>

<h2>Budgeting Tools & Tips</h2>

<h3>Budgeting Apps and Tools</h3>

<p>Several tools can help you create and track your budget:</p>

<ul>
<li><strong>Spreadsheets:</strong> Create your own budget template using Excel, Google Sheets, or free templates from university financial aid offices</li>
<li><strong>Budgeting Apps:</strong> Consider apps like YNAB (You Need A Budget), Goodbudget, Mint, or PocketGuard for automated tracking</li>
<li><strong>Banking Apps:</strong> Many banks offer spending categorization and budgeting features in their mobile apps</li>
<li><strong>Pen and Paper:</strong> A simple notebook works if you prefer manual tracking</li>
</ul>

<h3>Student Discounts</h3>

<p>Always ask for student pricing to reduce your expenses. Student discounts are commonly available for:</p>

<ul>
<li><strong>Software:</strong> Microsoft Office, Adobe Creative Suite, various productivity tools</li>
<li><strong>Entertainment:</strong> Movie theaters, streaming services, museums, concerts</li>
<li><strong>Transportation:</strong> Public transit passes, Amtrak, some airlines</li>
<li><strong>Food:</strong> Many restaurants offer student discounts</li>
<li><strong>Technology:</strong> Apple Education pricing, Dell student discounts</li>
<li><strong>Retail:</strong> Clothing stores, bookstores, and more</li>
</ul>

<p>Always carry your student ID and don''t hesitate to ask "Do you offer a student discount?"</p>

<h3>Build an Emergency Fund</h3>

<p>Start setting aside a little money each month to build an emergency fund. This fund should cover unexpected expenses like:</p>

<ul>
<li>Medical emergencies</li>
<li>Car repairs</li>
<li>Unexpected travel costs</li>
<li>Job loss</li>
<li>Emergency situations</li>
</ul>

<p>Aim to save $500-$1,000 initially, then build toward 3-6 months of essential expenses. Even saving $20-50 per month adds up over time and provides financial security.</p>

<h3>Additional Budgeting Tips</h3>

<ul>
<li><strong>Use cash envelopes:</strong> For discretionary categories, withdraw cash and use it for that category only</li>
<li><strong>Set up automatic savings:</strong> Transfer money to savings immediately when you receive income</li>
<li><strong>Review subscriptions regularly:</strong> Cancel unused subscriptions to free up money</li>
<li><strong>Cook at home:</strong> Eating out is expensive; meal prep and cooking can save significant money</li>
<li><strong>Buy used textbooks:</strong> Look for used books, rentals, or digital versions to save on education costs</li>
<li><strong>Track small purchases:</strong> Small daily expenses (coffee, snacks) add up quickly</li>
<li><strong>Plan for irregular expenses:</strong> Set aside money each month for annual or semi-annual expenses (insurance, tuition, etc.)</li>
</ul>

<h2>Common Budgeting Mistakes to Avoid</h2>

<ul>
<li><strong>Not tracking expenses:</strong> You can''t budget effectively without knowing where your money goes</li>
<li><strong>Being too restrictive:</strong> Budgets that are too strict are hard to maintain; allow some flexibility for enjoyment</li>
<li><strong>Ignoring irregular expenses:</strong> Remember to budget for annual fees, seasonal costs, and unexpected expenses</li>
<li><strong>Not reviewing regularly:</strong> A budget is useless if you don''t review and adjust it monthly</li>
<li><strong>Not having an emergency fund:</strong> Without savings, unexpected expenses can derail your entire budget</li>
<li><strong>Comparing to others:</strong> Everyone''s financial situation is different; focus on your own goals</li>
</ul>

<h2>Additional Resources</h2>

<h3>University Financial Aid Budgeting Guides</h3>

<p>These official university resources provide comprehensive budgeting guidance:</p>

<ul>
<li><a href="https://financialaid.uchicago.edu/undergraduate/managing-your-money/budgeting-your-money/" target="_blank" rel="noopener noreferrer">University of Chicago — Budgeting Your Money</a> — Step-by-step guide on income, expenses, needs vs. wants, and tracking</li>
<li><a href="https://education.musc.edu/students/enrollment/financial-literacy/learn-money-management/budgeting" target="_blank" rel="noopener noreferrer">Medical University of South Carolina — Budgeting 101 Guide</a> — Foundations of budgeting, tools, and planning</li>
<li><a href="https://financialaid.ucr.edu/financial-wellness-program/budgeting" target="_blank" rel="noopener noreferrer">University of California, Riverside — Budgeting (Financial Wellness Program)</a> — Income vs. expenses, prioritizing, apps/tools</li>
<li><a href="https://www.sfa.ufl.edu/budgeting-tips/" target="_blank" rel="noopener noreferrer">University of Florida — Budgeting Tips for Students</a> — Tips on needs vs. wants, saving emergency funds, planning</li>
<li><a href="https://financialaid.uiowa.edu/financial-wellness/budgeting" target="_blank" rel="noopener noreferrer">The University of Iowa — Budgeting (Financial Wellness)</a> — Track spending, prioritize, create and adjust a budget</li>
<li><a href="https://www.ohio.edu/financial-aid/resources/financial-literacy" target="_blank" rel="noopener noreferrer">Ohio University — Financial Literacy (Budgeting Tools & Templates)</a> — Templates, worksheets, educational resources</li>
<li><a href="https://college.harvard.edu/guides/financial-literacy" target="_blank" rel="noopener noreferrer">Harvard College — Financial Literacy (Budgeting Section)</a> — Introduction to budgeting as part of overall financial literacy</li>
</ul>

<h2>Summary</h2>

<p>Effective budgeting is a crucial skill for student financial success. By calculating your income, tracking expenses, categorizing needs vs. wants, creating a realistic budget, and regularly reviewing and adjusting, you can take control of your finances. Use budgeting tools, take advantage of student discounts, and build an emergency fund to strengthen your financial foundation. Remember that budgeting is an ongoing process that requires regular attention and adjustment as your circumstances change.</p>

<p><strong>Sources:</strong> This guide is based on information from official university financial aid offices and financial literacy programs, including University of Chicago, Medical University of South Carolina, University of California Riverside, University of Florida, University of Iowa, Ohio University, and Harvard College.</p>',
  'Budgeting',
  'guide',
  ARRAY['Budgeting', 'Money Management', 'Student Finance', 'Financial Planning', 'Savings'],
  'Learn essential budgeting strategies for students. Step-by-step guide to creating and maintaining a budget, tracking expenses, prioritizing needs vs. wants, and using tools to achieve financial goals.',
  ARRAY[
    'https://financialaid.uchicago.edu/undergraduate/managing-your-money/budgeting-your-money/',
    'https://education.musc.edu/students/enrollment/financial-literacy/learn-money-management/budgeting',
    'https://financialaid.ucr.edu/financial-wellness-program/budgeting',
    'https://www.sfa.ufl.edu/budgeting-tips/',
    'https://financialaid.uiowa.edu/financial-wellness/budgeting',
    'https://www.ohio.edu/financial-aid/resources/financial-literacy',
    'https://college.harvard.edu/guides/financial-literacy'
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
