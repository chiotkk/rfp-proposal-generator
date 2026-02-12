import { BuildingBlock } from './types';

export const BUILDING_BLOCKS: BuildingBlock[] = [
  // --- Company Profile (Intro) ---
  {
    id: 'intro-std',
    name: 'Standard Corporate Profile',
    description: 'Our established history and general capabilities.',
    category: 'intro',
    tags: ['standard', 'corporate'],
    content: `## About Us
We are a premier digital transformation agency with over 10 years of experience delivering high-impact solutions. Our team of 200+ experts specializes in scalable architecture, intuitive UX design, and robust engineering. We have successfully partnered with Fortune 500 companies to modernize their infrastructure and engage their customers.`,
  },
  {
    id: 'intro-innovation',
    name: 'Innovation & Agility Focus',
    description: 'Highlights our cutting-edge tech and rapid delivery.',
    category: 'intro',
    tags: ['innovative', 'agile'],
    content: `## Who We Are
We are a next-gen technology partner focused on speed, innovation, and disrupting status quo. Born in the cloud, our agile squads leverage the latest AI and reactive frameworks to build products that don't just work—they wow. If you're looking to move fast and break boundaries, we are your engine.`,
  },

  // --- Scope Options ---
  {
    id: 'scope-mvp',
    name: 'Essential MVP Scope',
    description: 'Focus on core features for rapid launch.',
    category: 'scope',
    tags: ['mvp', 'lean', 'low-cost'],
    content: `## Proposed Scope: Phase 1 MVP
Our approach focuses on launching the "Critical Path" features first to gather user feedback immediately.
*   **Core Authentication**: Standard email/password & Google Auth.
*   **Primary User Flow**: The essential "Happy Path" for general users.
*   **Admin Dashboard**: Basic CRUD operations for data management.
*   **Platform**: Responsive Web Application (Mobile-friendly).`,
  },
  {
    id: 'scope-std',
    name: 'Standard Professional Scope',
    description: 'Full feature set with standard integrations.',
    category: 'scope',
    tags: ['standard', 'comprehensive'],
    content: `## Proposed Scope: Comprehensive Solution
We propose a complete end-to-end solution that addresses all requirements outlined in the RFP.
*   **Advanced Auth**: SSO (SAML/OIDC) integration + MFA.
*   **Role-Based Access Control**: Granular permissions for 5+ user roles.
*   **Analytics Dashboard**: Real-time reporting with export capabilities.
*   **Integrations**: CRM sync (Salesforce/HubSpot) and Payment Gateway (Stripe).
*   **Platforms**: Web App + PWA for offline capabilities.`,
  },
  {
    id: 'scope-ent',
    name: 'Enterprise Transformation',
    description: 'High availability, custom SLAs, and legacy migration.',
    category: 'scope',
    tags: ['enterprise', 'complex', 'high-availability'],
    content: `## Proposed Scope: Enterprise Grade
Designed for scale, security, and complex organizational needs.
*   **Infrastructure**: Kubernetes-based microservices architecture.
*   **Security**: SOC2 compliant auditing, dedicated VPC, and penetration testing.
*   **Legacy Migration**: Direct data migration from existing [Legacy System].
*   **24/7 Support**: Dedicated success manager and 99.99% Uptime SLA.
*   **Custom AI Modules**: Bespoke machine learning models for predictive analytics.`,
  },

  // --- Timelines ---
  {
    id: 'time-agg',
    name: 'Aggressive (Sprint Mode)',
    description: '4-6 Weeks delivery. Best for tight deadlines.',
    category: 'timeline',
    tags: ['fast', 'urgent'],
    content: `## Project Timeline: Accelerated Delivery (6 Weeks)
*   **Week 1**: Discovery & Design Sprint.
*   **Week 2-3**: Core Development (Sprints 1-2).
*   **Week 4**: QA & User Acceptance Testing.
*   **Week 5**: Refinement & Deployment.
*   **Week 6**: Post-Launch Hypercare.`,
  },
  {
    id: 'time-std',
    name: 'Standard Phased Approach',
    description: '12 Weeks. Balanced pace for quality assurance.',
    category: 'timeline',
    tags: ['standard', 'balanced'],
    content: `## Project Timeline: Standard Delivery (12 Weeks)
*   **Weeks 1-2**: Discovery, Requirements Gathering, and Wireframing.
*   **Weeks 3-4**: UI/UX Design & Architecture Setup.
*   **Weeks 5-9**: Development Sprints (Frontend & Backend).
*   **Weeks 10-11**: QA, Security Audit, and UAT.
*   **Week 12**: Final Polish, Training, and Go-Live.`,
  },
  {
    id: 'time-rel',
    name: 'Extended Enterprise Rollout',
    description: '6 Months. Includes pilots and gradual rollout.',
    category: 'timeline',
    tags: ['long', 'careful', 'enterprise'],
    content: `## Project Timeline: Enterprise Rollout (6 Months)
*   **Month 1**: Deep Dive Discovery & Stakeholder Alignment.
*   **Month 2**: Prototyping & Technical Proof of Concept.
*   **Month 3-4**: Core System Development.
*   **Month 5**: Pilot Program with Beta User Group.
*   **Month 6**: Feedback Incorporation & Global Rollout.`,
  },

  // --- Pricing ---
  {
    id: 'price-fix',
    name: 'Fixed Price Bundle',
    description: 'Best for well-defined scopes.',
    category: 'pricing',
    tags: ['fixed', 'simple'],
    content: `## Investment: Fixed Price
Based on the defined scope, the total investment is **$75,000**.
*   **Payment Schedule**: 40% Upfront, 30% Beta Release, 30% Final Delivery.
*   **Inclusions**: All design, development, and deployment activities.
*   **Exclusions**: 3rd party license fees (hosting, APIs).`,
  },
  {
    id: 'price-tm',
    name: 'Time & Materials',
    description: 'Flexible engagement model.',
    category: 'pricing',
    tags: ['flexible', 'hourly'],
    content: `## Investment: Time & Materials
We estimate the project will require approximately **800 hours** at a blended rate of **$150/hr**.
*   **Estimated Total**: ~$120,000.
*   **Billing**: Bi-weekly invoices based on actual hours logged.
*   **Transparency**: Full access to Jira/Time-logs provided.`,
  },

   // --- Deliverables ---
   {
    id: 'del-std',
    name: 'Standard Deliverables',
    description: 'Code, Design files, Documentation.',
    category: 'deliverables',
    tags: ['standard'],
    content: `## Key Deliverables
1.  **Source Code**: Full repository ownership (GitHub/GitLab).
2.  **Design Assets**: Figma files and style guides.
3.  **Documentation**: API docs (Swagger) and User Manual (PDF).
4.  **Deployed Application**: Live production environment.`,
  },
  
  // --- T&Cs ---
  {
    id: 'terms-std',
    name: 'Standard MSA',
    description: 'Standard terms for services.',
    category: 'terms',
    tags: ['standard'],
    content: `## Terms & Conditions
*   **IP Ownership**: Work-for-hire; Client owns IP upon full payment.
*   **Warranty**: 30-day bug-fix warranty period post-launch.
*   **Confidentiality**: Mutual NDA applies to all shared data.
*   **Payment**: Net 15 days from invoice date.`,
  },

  // --- Team & Personnel ---
  {
    id: 'team-std',
    name: 'Standard Squad',
    description: 'Balanced team of mid-to-senior engineers.',
    category: 'team',
    tags: ['standard', 'cost-effective'],
    content: `## Proposed Team Structure
We will dedicate a cross-functional "pod" to this project to ensure continuity.
*   **Project Manager (Part-time)**: Single point of contact.
*   **Senior Lead Developer**: Architecture and code review.
*   **2x Full Stack Developers**: Feature implementation.
*   **UI/UX Designer (Part-time)**: Interface design and prototyping.
*   **QA Engineer (Shared)**: Testing cycles.`,
  },
  {
    id: 'team-exp',
    name: 'Expert/Senior Only',
    description: 'Senior staff for high-complexity tasks.',
    category: 'team',
    tags: ['expert', 'premium'],
    content: `## Elite Engineering Team
For this mission-critical initiative, we are deploying our Senior Principal staff.
*   **Technical Director**: Strategic oversight and architecture.
*   **Principal Engineer**: Hands-on complex problem solving.
*   **Senior Product Designer**: User journey mapping and high-fidelity UI.
*   **DevOps Specialist**: Pipeline automation and security hardening.`,
  },

  // --- Case Studies (10 Options) ---
  {
    id: 'case-fintech',
    name: 'Fintech Modernization',
    description: 'Legacy migration with PCI-DSS compliance.',
    category: 'case_studies',
    tags: ['fintech', 'compliance'],
    content: `## Case Study: Global Fintech Modernization
**Challenge:** Client needed to migrate a legacy monolith to microservices while maintaining PCI-DSS compliance.
**Solution:** We architected a Kubernetes-based solution on AWS, implementing zero-trust security.
**Outcome:** Reduced deployment time by 80% and passed all security audits with zero critical findings.`,
  },
  {
    id: 'case-retail',
    name: 'High-Scale Retail',
    description: 'E-commerce platform handling Black Friday loads.',
    category: 'case_studies',
    tags: ['retail', 'scale'],
    content: `## Case Study: Omni-channel Retail Platform
**Challenge:** Client's platform crashed during Black Friday traffic spikes.
**Solution:** Rebuilt the frontend using React/Next.js with edge caching and optimized database queries.
**Outcome:** Successfully handled 10x traffic load during peak season with sub-200ms load times.`,
  },
  {
    id: 'case-healthcare',
    name: 'Telehealth Mobile App',
    description: 'HIPAA compliant patient portal.',
    category: 'case_studies',
    tags: ['healthcare', 'mobile'],
    content: `## Case Study: Telehealth Mobile Application
**Challenge:** Securely connect patients with doctors for video consultations.
**Solution:** Native iOS/Android apps with WebRTC video and end-to-end encryption.
**Outcome:** Facilitated 50,000+ consultations in the first quarter; 4.8 star App Store rating.`,
  },
  {
    id: 'case-logistics',
    name: 'Logistics Fleet Dashboard',
    description: 'Real-time tracking and route optimization.',
    category: 'case_studies',
    tags: ['logistics', 'iot'],
    content: `## Case Study: Logistics Fleet Management
**Challenge:** Client lacked real-time visibility into their trucking fleet.
**Solution:** IoT sensor integration feeding a React-based dashboard with Mapbox visualization.
**Outcome:** Reduced fuel costs by 12% through route optimization algorithms.`,
  },
  {
    id: 'case-edtech',
    name: 'EdTech Learning Platform',
    description: 'Interactive LMS for universities.',
    category: 'case_studies',
    tags: ['education', 'video'],
    content: `## Case Study: University Learning Management System
**Challenge:** Enabling remote learning for 30,000 students during lockdowns.
**Solution:** Scalable cloud video streaming platform with interactive quizzes.
**Outcome:** 99.9% uptime during finals week; adopted by 3 major universities.`,
  },
  {
    id: 'case-realestate',
    name: 'Real Estate Marketplace',
    description: 'Property listings with virtual tours.',
    category: 'case_studies',
    tags: ['real-estate', 'marketplace'],
    content: `## Case Study: Luxury Real Estate Marketplace
**Challenge:** Providing immersive property viewing experiences online.
**Solution:** High-fidelity 3D tour integration and AI-driven property recommendations.
**Outcome:** Increased lead generation by 45% and reduced time-on-market by 20%.`,
  },
  {
    id: 'case-energy',
    name: 'IoT Energy Monitor',
    description: 'Smart grid monitoring for utility firms.',
    category: 'case_studies',
    tags: ['energy', 'iot', 'big-data'],
    content: `## Case Study: Smart Grid Energy Monitoring
**Challenge:** Utility provider needed to detect grid anomalies in real-time.
**Solution:** Big Data pipeline using Kafka and Spark to process millions of sensor events.
**Outcome:** Prevented 3 major outages through predictive maintenance alerts.`,
  },
  {
    id: 'case-social',
    name: 'Social Analytics Tool',
    description: 'Marketing insights from social media APIs.',
    category: 'case_studies',
    tags: ['marketing', 'analytics'],
    content: `## Case Study: Social Sentiment Analytics
**Challenge:** Brand needed to track sentiment across Twitter, LinkedIn, and Instagram.
**Solution:** NLP-powered engine processing public API streams to gauge brand health.
**Outcome:** Provided actionable insights that improved campaign ROI by 30%.`,
  },
  {
    id: 'case-travel',
    name: 'Travel Booking Engine',
    description: 'Flight and hotel aggregation engine.',
    category: 'case_studies',
    tags: ['travel', 'consumer'],
    content: `## Case Study: Global Travel Booking Engine
**Challenge:** Aggregating inventory from 50+ airline and hotel providers.
**Solution:** Microservices aggregator pattern with aggressive caching layers.
**Outcome:** Reduced search latency to under 1 second; $20M gross booking volume in year 1.`,
  },
  {
    id: 'case-auto',
    name: 'Automotive Supply Chain',
    description: 'Blockchain-based parts tracking.',
    category: 'case_studies',
    tags: ['automotive', 'blockchain'],
    content: `## Case Study: Automotive Supply Chain Track & Trace
**Challenge:** Counterfeit parts entering the supply chain.
**Solution:** Private blockchain ledger to verify authenticity of parts from factory to dealer.
**Outcome:** Eliminated counterfeit parts in the pilot region; improved warranty claim accuracy.`,
  },

  // --- Quality Assurance (QA) ---
  {
    id: 'qa-std',
    name: 'Standard QA Process',
    description: 'Manual testing and basic unit tests.',
    category: 'qa',
    tags: ['standard', 'manual'],
    content: `## Quality Assurance Strategy
We employ a rigorous testing methodology to ensure defect-free delivery.
*   **Unit Testing**: Developers write Jest tests for critical logic.
*   **Manual QA**: Functional testing of all user stories before approval.
*   **UAT Support**: We assist your team during the User Acceptance Testing phase.`,
  },
  {
    id: 'qa-auto',
    name: 'Automated CI/CD Quality',
    description: 'Full automation suite for rapid regression.',
    category: 'qa',
    tags: ['automated', 'devops', 'enterprise'],
    content: `## Automated Quality Engineering
Quality is baked into our CI/CD pipeline.
*   **E2E Automation**: Cypress/Playwright suites run on every Pull Request.
*   **Static Analysis**: SonarQube integration for code quality gates.
*   **Load Testing**: k6 scripts to verify performance under load.
*   **Result**: 95% code coverage and immediate feedback loops.`,
  },

  // --- Security ---
  {
    id: 'sec-std',
    name: 'Standard Security Best Practices',
    description: 'OWASP Top 10 coverage.',
    category: 'security',
    tags: ['standard', 'basic'],
    content: `## Security Measures
We adhere to industry standard best practices to protect your data.
*   **OWASP Top 10**: Mitigation of common vulnerabilities (SQLi, XSS).
*   **Encryption**: TLS 1.2+ in transit and AES-256 at rest.
*   **Access Control**: Least-privilege access principles for all developers.`,
  },
  {
    id: 'sec-ent',
    name: 'Enterprise Compliance (SOC2/HIPAA)',
    description: 'Strict compliance and auditing.',
    category: 'security',
    tags: ['enterprise', 'compliance', 'strict'],
    content: `## Enterprise Security & Compliance
Our solution is designed for highly regulated environments.
*   **Compliance Ready**: Architecture supports SOC2 Type II and HIPAA requirements.
*   **Audit Logging**: Immutable logs for all system actions.
*   **Penetration Testing**: Third-party security audit prior to go-live.
*   **Data Sovereignty**: Strict region pinning for all data storage.`,
  },

  // --- Change Management ---
  {
    id: 'cm-agile',
    name: 'Agile Change Process',
    description: 'Flexible scope adjustment via backlog.',
    category: 'change_mgmt',
    tags: ['agile', 'flexible'],
    content: `## Change Management: Agile Approach
We embrace change as part of the software development lifecycle.
*   **Backlog Reprioritization**: New requirements are added to the backlog and prioritized against existing items.
*   **Sprint Planning**: Scope changes are assessed every 2 weeks.
*   **No Change Fees**: If one feature is swapped for another of equal size, no additional cost is incurred.`,
  },
  {
    id: 'cm-formal',
    name: 'Formal Change Control',
    description: 'Strict approval process for fixed scope.',
    category: 'change_mgmt',
    tags: ['formal', 'fixed-price', 'strict'],
    content: `## Change Control Procedure
To protect the project timeline and budget, we utilize a formal Change Control Board (CCB).
1.  **Request**: Change Request Form (CRF) submitted by stakeholder.
2.  **Impact Analysis**: We estimate cost/time impact within 48 hours.
3.  **Approval**: Formal signature required from Project Sponsor.
4.  **Implementation**: Change is scheduled into the project plan.`,
  },

  // --- Training ---
  {
    id: 'train-tt',
    name: 'Train the Trainer',
    description: 'Efficient knowledge transfer to leads.',
    category: 'training',
    tags: ['efficient', 'standard'],
    content: `## Training: Train-the-Trainer
We focus on empowering your internal champions.
*   **Admin Session**: 2-hour deep dive for system administrators.
*   **Super User Session**: 1-hour walkthrough for key functional leads.
*   **Materials**: Recorded video walkthroughs and PDF quick-start guides.`,
  },
  {
    id: 'train-work',
    name: 'Comprehensive Workshops',
    description: 'Hands-on sessions for all user groups.',
    category: 'training',
    tags: ['comprehensive', 'hands-on'],
    content: `## Comprehensive Training Program
We ensure full organizational adoption through extensive training.
*   **User Workshops**: 3x Interactive webinars for general staff.
*   **Technical Handover**: 2-day pair programming/knowledge transfer with your IT team.
*   **LMS Content**: SCORM-compliant modules for your Learning Management System.`,
  },
];
