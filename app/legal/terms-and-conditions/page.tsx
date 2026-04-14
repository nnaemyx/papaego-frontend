export default function TermsAndConditionsPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 mb-8">
      
<style>{`
  .section-number {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #C8922A;
    margin-bottom: 8px;
  }
  .content h2 {
    font-size: 1.55rem;
    font-weight: 600;
    color: #0F2244;
    margin-bottom: 18px;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  .content h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1A3461;
    margin: 22px 0 10px;
    letter-spacing: 0.01em;
  }
  .content p {
    color: #3D3D55;
    margin-bottom: 14px;
    font-size: 15px;
    line-height: 1.78;
  }
  .content ul, .content ol {
    margin: 10px 0 16px 0;
    padding-left: 0;
    list-style: none;
  }
  .content ul li, .content ol li {
    position: relative;
    padding-left: 20px;
    font-size: 15px;
    color: #3D3D55;
    line-height: 1.72;
    margin-bottom: 6px;
  }
  .content ul li::before {
    content: '';
    position: absolute;
    left: 0; top: 10px;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #C8922A;
  }
  .callout {
    padding: 18px 22px;
    border-radius: 10px;
    margin: 20px 0;
    font-size: 14px;
    line-height: 1.65;
  }
  .callout-info {
    background: rgba(30,79,173,0.07);
    border-left: 3px solid #3B6FD4;
    color: #1A3461;
  }
  .callout-warn {
    background: rgba(200,146,42,0.08);
    border-left: 3px solid #C8922A;
    color: #5A3A00;
  }
  .def-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 14px;
  }
  .def-table tr { border-bottom: 1px solid #D8D3C8; }
  .def-table td { padding: 12px 16px; vertical-align: top; line-height: 1.6; }
  .def-table td:first-child { font-weight: 600; color: #0F2244; width: 180px; white-space: nowrap; }
  .def-table td:last-child { color: #3D3D55; }
  .section-rule { border: none; border-top: 1px solid #D8D3C8; margin: 2.8rem 0; }
  .contact-card { background: #0F2244; border-radius: 14px; padding: 28px 32px; margin-top: 16px; }
  .contact-card h4 { font-size: 1.15rem; color: #FFFFFF; margin-bottom: 16px; }
  .contact-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; font-size: 14px; }
  .contact-key { color: #E5AF4D; font-weight: 500; min-width: 80px; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding-top: 1px; }
  .contact-val { color: rgba(255,255,255,0.72); line-height: 1.5; }
`}</style>

      <h1 className="text-3xl font-bold mb-6" style={{ color: "#2B2F33" }}>Terms of Service</h1>
      <div className="content">
        

    <div className="callout callout-warn">
      <strong>Please read these Terms carefully.</strong> By registering for, accessing, or using any of Papa Ego's services, you agree to be legally bound by these Terms of Service. If you do not agree, you must not use our platform.
    </div>

    
    <section id="acceptance">
      <div className="section-number">Section 01</div>
      <h2>Acceptance of Terms</h2>
      <p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("Customer", "you", or "your") and <strong>Papa Ego Technologies Limited</strong> ("Papa Ego", "we", "us", or "our"), a company incorporated in Nigeria with CAC Registration No. 9463271, having its registered office at No. 474, Ikwere Road, Rumuigbo, Port Harcourt, Ikwerre, Rivers State, Nigeria.</p>
      <p>By creating an account, submitting a transaction, or otherwise using the Papa Ego platform or any related services, you confirm that you have read, understood, and agree to be bound by these Terms, together with our Privacy Policy, our Fee Schedule, and any other policies or guidelines incorporated by reference herein.</p>
      <p>If you are accessing the platform on behalf of a business, you represent that you have the authority to bind that business to these Terms, and references to "you" include that business.</p>
    </section>

    <hr className="section-rule" />

    
    <section id="definitions">
      <div className="section-number">Section 02</div>
      <h2>Definitions</h2>
      <table className="def-table">
        <tr><td>"Account"</td><td>The registered account created by a Customer on the Papa Ego platform.</td></tr>
        <tr><td>"Customer"</td><td>Any individual or business entity that registers for and uses Papa Ego's Services.</td></tr>
        <tr><td>"Services"</td><td>Cross-border payment facilitation, foreign exchange conversion, and related services provided by Papa Ego.</td></tr>
        <tr><td>"Transaction"</td><td>Any cross-border payment, remittance, or foreign exchange instruction submitted by a Customer through the platform.</td></tr>
        <tr><td>"Beneficiary"</td><td>The overseas supplier or recipient designated by the Customer to receive a payment.</td></tr>
        <tr><td>"KYC"</td><td>Know Your Customer — the identity verification and documentation process required by Nigerian law and CBN regulations.</td></tr>
        <tr><td>"AML/CFT"</td><td>Anti-Money Laundering and Counter-Financing of Terrorism compliance obligations.</td></tr>
        <tr><td>"Fee Schedule"</td><td>The current schedule of fees and charges published on the Papa Ego website.</td></tr>
        <tr><td>"Platform"</td><td>Papa Ego's website, web application, mobile application, and related technology infrastructure.</td></tr>
      </table>
    </section>

    <hr className="section-rule" />

    
    <section id="eligibility">
      <div className="section-number">Section 03</div>
      <h2>Eligibility</h2>
      <p>To use Papa Ego's Services, you must meet all of the following requirements:</p>
      <ul>
        <li>You are a registered business entity or a sole proprietor operating lawfully in Nigeria;</li>
        <li>You are at least 18 years of age (or the legal age of majority in your jurisdiction);</li>
        <li>You have the legal capacity to enter into a binding contract;</li>
        <li>You are not subject to any sanctions, legal proceedings, or regulatory restrictions that would prevent you from using financial services;</li>
        <li>Your intended use of the Services is for legitimate trade and business purposes only;</li>
        <li>You are not a resident of, or transacting with entities in, jurisdictions designated as high-risk or non-cooperative by the FATF, unless Papa Ego has expressly approved such transactions.</li>
      </ul>
      <p>Papa Ego reserves the right to refuse service or revoke eligibility at any time, in its sole discretion, including where it determines that continued service would create regulatory, AML/CFT, or reputational risk.</p>
    </section>

    <hr className="section-rule" />

    
    <section id="services">
      <div className="section-number">Section 04</div>
      <h2>Our Services</h2>
      <p>Papa Ego provides a cross-border payment platform that enables Nigerian businesses to make international payments to suppliers and business partners in China, the United States, and other countries. Our Services include:</p>
      <ul>
        <li>Facilitation of outbound international payments from Nigerian Naira (NGN) to foreign currencies;</li>
        <li>Foreign exchange conversion at rates disclosed at the time of transaction confirmation;</li>
        <li>Transaction tracking and settlement confirmation;</li>
        <li>Compliance-assisted onboarding and KYC support;</li>
        <li>Customer support for transaction queries and complaints.</li>
      </ul>
      <h3>Services Not Provided</h3>
      <p>Papa Ego does <strong>not</strong> provide investment advice, currency speculation, unsecured credit facilities, inbound remittance services, or cash handling services. Any use of the platform for purposes other than legitimate trade-related cross-border payments is a violation of these Terms.</p>
      <div className="callout callout-info">
        <strong>Service Levels:</strong> Customer onboarding is completed within 48 hours of receipt of complete KYC documentation. Payment settlement typically takes 2–5 business days, subject to correspondent bank processing. Transaction confirmations are issued immediately upon booking.
      </div>
    </section>

    <hr className="section-rule" />

    
    <section id="account">
      <div className="section-number">Section 05</div>
      <h2>Account Registration &amp; KYC Verification</h2>
      <p>To access our Services, you must create an Account and complete our KYC verification process as required by the Central Bank of Nigeria and applicable AML/CFT regulations.</p>

      <h3>Registration Requirements</h3>
      <ul>
        <li>Provide accurate, current, and complete information at registration and at all times thereafter;</li>
        <li>Submit all required KYC documentation for your business type (see below);</li>
        <li>Notify Papa Ego promptly of any material changes to your business, ownership, or transaction profile.</li>
      </ul>

      <h3>KYC Documentation — Corporate Customers</h3>
      <ul>
        <li>CAC Certificate of Incorporation;</li>
        <li>Memorandum and Articles of Association;</li>
        <li>Board Resolution authorising account opening and designating signatories;</li>
        <li>Valid government-issued ID for all beneficial owners (greater than 10% ownership) and authorised signatories;</li>
        <li>Proof of registered business address (not older than 3 months);</li>
        <li>Tax Identification Number (TIN);</li>
        <li>Import/Export licence (for traders, where applicable).</li>
      </ul>

      <h3>KYC Documentation — Sole Proprietors</h3>
      <ul>
        <li>CAC Business Name Registration Certificate (BN-1);</li>
        <li>Valid national ID, international passport, or driver's licence;</li>
        <li>Proof of address (not older than 3 months);</li>
        <li>Tax Identification Number (TIN).</li>
      </ul>

      <h3>Account Security</h3>
      <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately at <strong>support@papaego.com</strong> if you suspect any unauthorised access to your account.</p>
    </section>

    <hr className="section-rule" />

    
    <section id="transactions">
      <div className="section-number">Section 06</div>
      <h2>Transactions &amp; Payments</h2>
      <p>All transactions submitted through the Papa Ego platform are subject to the following conditions:</p>
      <ul>
        <li>All transactions must be for legitimate, documented trade purposes — you must provide accurate transaction details including purpose, amount, and beneficiary information;</li>
        <li>Supporting trade documentation (commercial invoice, purchase order, proforma) may be required for transaction processing and must be submitted on request;</li>
        <li>Transactions are binding upon your confirmation — once confirmed, a transaction cannot be cancelled except in accordance with our cancellation policy;</li>
        <li>Settlement timelines are estimates and may be affected by correspondent bank processing, regulatory holds, or force majeure events outside Papa Ego's control;</li>
        <li>Papa Ego reserves the right to delay, suspend, or reject any transaction where compliance concerns are identified, without liability to you.</li>
      </ul>

      <h3>Transaction Limits</h3>
      <p>Transaction limits are determined based on your customer risk profile, KYC documentation, and applicable regulatory requirements. Enhanced Due Diligence (EDD) is required for transactions exceeding USD $10,000 or ₦5,000,000 per transaction. Higher-value transactions require additional documentation and senior management approval.</p>

      <h3>Transaction Confirmation</h3>
      <p>Each accepted transaction will be confirmed by a transaction receipt containing: a unique confirmation number, transaction date and time, customer and beneficiary details, transaction amount in both local and foreign currency, the applicable exchange rate, all fees charged, and the expected settlement date.</p>
    </section>

    <hr className="section-rule" />

    
    <section id="fees">
      <div className="section-number">Section 07</div>
      <h2>Fees &amp; Exchange Rates</h2>

      <h3>Fee Transparency</h3>
      <p>Papa Ego is committed to full fee transparency. All applicable fees — including transaction fees, exchange rate margins, and any other charges — will be disclosed to you clearly before you confirm any transaction. The current Fee Schedule is published on our website and is incorporated into these Terms by reference.</p>

      <h3>Exchange Rates</h3>
      <p>Exchange rates applied to your transactions are based on prevailing interbank market rates at the time of booking, plus Papa Ego's margin as disclosed in the Fee Schedule. Rates are confirmed at the time of transaction booking and may differ from indicative rates displayed on our website. Papa Ego does not guarantee any particular exchange rate in advance of transaction confirmation.</p>

      <h3>Fee Changes</h3>
      <p>Papa Ego reserves the right to modify its fees and charges at any time. We will provide at least 14 days' notice of any material fee changes by publishing updated rates on our website and notifying registered customers by email.</p>

      <div className="callout callout-warn">
        <strong>No Hidden Fees:</strong> Papa Ego prohibits hidden fees, bait-and-switch pricing, and misleading rate disclosures. If you believe you have been charged incorrectly, please contact us immediately at <strong>support@papaego.com</strong>.
      </div>
    </section>

    <hr className="section-rule" />

    
    <section id="obligations">
      <div className="section-number">Section 08</div>
      <h2>Customer Obligations</h2>
      <p>By using our Services, you agree to:</p>
      <ul>
        <li>Provide accurate, truthful, and complete information at all times — including at registration, during KYC, and for each transaction;</li>
        <li>Use the Services only for legitimate, lawful trade and business purposes;</li>
        <li>Maintain valid and up-to-date KYC documentation and notify Papa Ego of any material changes to your business, ownership structure, or transaction profile;</li>
        <li>Comply with all applicable Nigerian laws and regulations, including the CBN Foreign Exchange Manual, the Money Laundering (Prevention and Prohibition) Act 2022, and all applicable tax obligations;</li>
        <li>Not use the Services in any manner that would expose Papa Ego to regulatory, legal, or reputational risk;</li>
        <li>Cooperate fully with any KYC, EDD, or compliance review requests from Papa Ego;</li>
        <li>Immediately notify Papa Ego if you become aware of any sanctions designation, criminal investigation, or regulatory action affecting you, your business, or any of your beneficiaries.</li>
      </ul>
    </section>

    <hr className="section-rule" />

    
    <section id="prohibited">
      <div className="section-number">Section 09</div>
      <h2>Prohibited Activities</h2>
      <p>The following activities are strictly prohibited on the Papa Ego platform and constitute a material breach of these Terms:</p>
      <ul>
        <li>Using the Services for any purpose other than legitimate cross-border trade payments;</li>
        <li>Providing false, misleading, or fraudulent information or documentation;</li>
        <li>Structuring transactions to avoid reporting thresholds or regulatory requirements;</li>
        <li>Using the platform to launder money, finance terrorism, or evade sanctions;</li>
        <li>Making payments to or on behalf of any person or entity subject to applicable sanctions;</li>
        <li>Using the platform for personal remittances, investment transactions, or speculative currency trading;</li>
        <li>Attempting to circumvent, disable, or interfere with any security or compliance feature of the platform;</li>
        <li>Using the platform on behalf of an undisclosed third party;</li>
        <li>Engaging in any activity that could expose Papa Ego to legal liability or regulatory sanction.</li>
      </ul>
      <p>Violation of any prohibited activity may result in immediate account suspension, transaction reversal, forfeiture of funds (where legally required), and referral to the NFIU, CBN, EFCC, or other relevant authorities.</p>
    </section>

    <hr className="section-rule" />

    
    <section id="aml">
      <div className="section-number">Section 10</div>
      <h2>AML/CFT Compliance</h2>
      <p>Papa Ego operates under a comprehensive Anti-Money Laundering and Counter-Financing of Terrorism (AML/CFT) programme in accordance with:</p>
      <ul>
        <li>CBN AML/CFT Regulations 2022;</li>
        <li>Money Laundering (Prevention and Prohibition) Act 2022;</li>
        <li>Terrorism (Prevention and Prohibition) Act 2022;</li>
        <li>FATF Recommendations as implemented in Nigerian law.</li>
      </ul>

      <h3>Sanctions Screening</h3>
      <p>All customers and their transactions are screened against applicable sanctions lists including the OFAC SDN List, UN Security Council Consolidated List, EU Sanctions List, UK HM Treasury List, and Nigerian designations. Papa Ego will reject any transaction involving a sanctioned person or entity without liability.</p>

      <h3>Transaction Monitoring</h3>
      <p>All transactions are subject to automated and manual monitoring. Papa Ego reserves the right to delay, block, or reverse any transaction where it has reasonable grounds to suspect financial crime, regardless of whether the transaction has been confirmed.</p>

      <h3>Reporting Obligations</h3>
      <p>Papa Ego is legally required to file Suspicious Transaction Reports (STRs) with the Nigerian Financial Intelligence Unit (NFIU) where it identifies or suspects financial crime. Papa Ego may not inform you if such a report has been filed in connection with your account ("tipping-off prohibition").</p>

      <p>You acknowledge and consent to Papa Ego sharing your information with regulatory authorities, law enforcement, and correspondent banking partners as required by law and in the performance of its compliance obligations.</p>
    </section>

    <hr className="section-rule" />

    
    <section id="liability">
      <div className="section-number">Section 11</div>
      <h2>Limitation of Liability &amp; Disclaimers</h2>

      <h3>Service Availability</h3>
      <p>Papa Ego provides its platform on an "as available" basis and does not warrant uninterrupted or error-free service. We will not be liable for any loss or damage arising from service downtime, technical failures, or interruptions outside our reasonable control.</p>

      <h3>Limitation of Liability</h3>
      <p>To the maximum extent permitted by Nigerian law, Papa Ego's total aggregate liability to you for any claims arising from or in connection with these Terms or the Services shall not exceed the total fees paid by you to Papa Ego in the three (3) months immediately preceding the event giving rise to the claim.</p>
      <p>Papa Ego shall not be liable for any indirect, consequential, special, or punitive losses or damages, including loss of profit, loss of business, or loss of data, howsoever arising.</p>

      <h3>Force Majeure</h3>
      <p>Papa Ego shall not be liable for any failure or delay in performance of its obligations arising from events beyond its reasonable control, including acts of God, government restrictions, regulatory interventions, correspondent bank failures, or telecommunications outages.</p>

      <h3>Customer Indemnity</h3>
      <p>You agree to indemnify and hold harmless Papa Ego, its directors, officers, employees, and agents from and against any claims, losses, fines, or penalties arising from your breach of these Terms, your misrepresentation, your misuse of the Services, or any violation of applicable law.</p>
    </section>

    <hr className="section-rule" />

    
    <section id="ip">
      <div className="section-number">Section 12</div>
      <h2>Intellectual Property</h2>
      <p>All content, technology, trademarks, logos, and materials on the Papa Ego platform — including the "Papa Ego" brand name and logo — are the exclusive property of Papa Ego Technologies Limited and are protected by Nigerian intellectual property law.</p>
      <p>You are granted a limited, non-exclusive, non-transferable licence to access and use the platform solely for the purposes of availing yourself of our Services. You may not copy, reproduce, distribute, or create derivative works from any Papa Ego content without our prior written consent.</p>
    </section>

    <hr className="section-rule" />

    
    <section id="termination">
      <div className="section-number">Section 13</div>
      <h2>Account Suspension &amp; Termination</h2>

      <h3>Termination by You</h3>
      <p>You may close your account at any time by contacting us at <strong>support@papaego.com</strong>. Termination does not affect any rights or obligations that arose prior to termination, including any outstanding transactions or fee obligations.</p>

      <h3>Suspension or Termination by Papa Ego</h3>
      <p>Papa Ego may immediately suspend or terminate your account, with or without notice, in the following circumstances:</p>
      <ul>
        <li>You breach any material provision of these Terms;</li>
        <li>We identify or reasonably suspect financial crime, fraud, or sanctions evasion;</li>
        <li>We are required to do so by regulatory directive, court order, or law enforcement request;</li>
        <li>Continued operation of your account would expose Papa Ego to unacceptable regulatory, legal, or reputational risk;</li>
        <li>You provide false or materially misleading information;</li>
        <li>You fail to complete required KYC updates within the notified timeframe.</li>
      </ul>

      <h3>Effect of Termination</h3>
      <p>Upon termination, your access to the platform will be disabled. Pending transactions may be reversed or held subject to applicable regulatory requirements. Papa Ego will retain your data in accordance with its record-keeping obligations (minimum 5 years) even after account closure.</p>
    </section>

    <hr className="section-rule" />

    
    <section id="disputes">
      <div className="section-number">Section 14</div>
      <h2>Dispute Resolution &amp; Governing Law</h2>

      <h3>Internal Complaints Process</h3>
      <p>If you have a complaint, please contact us through the following channels. We will acknowledge your complaint within 24 hours and aim to provide a full response within 7–14 business days:</p>
      <ul>
        <li>Email: <strong>complaints@papaego.com</strong></li>
        <li>Phone: <strong>[Insert Phone Number]</strong></li>
        <li>Website: via the complaints form on our website</li>
      </ul>
      <p>If your complaint is not resolved to your satisfaction, you may escalate to the Consumer Protection Council (CPC) of Nigeria.</p>

      <h3>Governing Law</h3>
      <p>These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.</p>

      <h3>Arbitration</h3>
      <p>Any dispute arising from or in connection with these Terms that cannot be resolved through our internal complaints process shall be referred to binding arbitration in Lagos, Nigeria, under the Arbitration and Conciliation Act. The arbitration shall be conducted in English before a sole arbitrator agreed by the parties, or, failing agreement, appointed by the Lagos Court of Arbitration.</p>
    </section>

    <hr className="section-rule" />

    
    <section id="changes">
      <div className="section-number">Section 15</div>
      <h2>Changes to These Terms</h2>
      <p>Papa Ego reserves the right to update or modify these Terms at any time. We will notify registered customers of material changes by email and by posting the updated Terms on our website, with a minimum of 14 days' notice before the changes take effect.</p>
      <p>Your continued use of the Services after the effective date of any changes constitutes your acceptance of the updated Terms. If you do not agree to the updated Terms, you must stop using the Services and close your account before the effective date.</p>
    </section>

    <hr className="section-rule" />

    
    <section id="contact">
      <div className="section-number">Section 16</div>
      <h2>Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us:</p>
      <div className="contact-card">
        <h4>Papa Ego Technologies Limited</h4>
        <div className="contact-row"><span className="contact-key">Address</span><span className="contact-val">No. 474, Ikwere Road, Rumuigbo, Port Harcourt, Ikwerre, Rivers State, Nigeria</span></div>
        <div className="contact-row"><span className="contact-key">RC Number</span><span className="contact-val">9463271</span></div>
        <div className="contact-row"><span className="contact-key">Email</span><span className="contact-val">legal@papaego.com</span></div>
        <div className="contact-row"><span className="contact-key">Support</span><span className="contact-val">support@papaego.com</span></div>
        <div className="contact-row"><span className="contact-key">Compliance</span><span className="contact-val">compliance@papaego.com</span></div>
      </div>
    </section>

  
      </div>
    </div>
  );
}