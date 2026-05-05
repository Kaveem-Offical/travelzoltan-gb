const { VisaConfiguration } = require('../models');

const required_documents_structure = {
  core_documents: [
    { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
    { icon: "badge", name: "Biometric Residence Permit", description: "If applicable, from your current country of residence." },
    { icon: "account_balance", name: "Bank Statement latest (of atleast 3 months)", description: "Showing sufficient funds for your stay." }
  ],
  category_specific: {
    student: [
      { icon: "badge", name: "Student ID card", description: "Valid student identification." },
      { icon: "school", name: "CAS Letter", description: "Confirmation of Acceptance for Studies." },
      { icon: "event_note", name: "Term/Holiday Letter", description: "Letter from your institution." }
    ],
    employed: [
      { icon: "badge", name: "Employee ID card", description: "Valid employee identification." },
      { icon: "work", name: "Employment Contract Letter/ Offer Letter", description: "Valid contract from your employer." },
      { icon: "payments", name: "3 Months Pay Slips", description: "Recent salary slips." },
      { icon: "description", name: "Employment Statement", description: "Statement from your employer." }
    ],
    visiting: [
      { icon: "mail", name: "Invitation Letter", description: "Letter from your friend or relative." },
      { icon: "badge", name: "Inviter's ID Proof", description: "Passport or Resident Permit of inviter." },
      { icon: "home", name: "Address proof", description: "Electricity bill, Utility bill, etc." }
    ],
    sponsored: [
      { icon: "handshake", name: "Sponsorship letter", description: "Letter from your sponsor." },
      { icon: "badge", name: "Sponsor's national ID proof", description: "Passport or Resident permit." },
      { icon: "account_balance", name: "Updated bank statement of last 6 months", description: "Sponsor's bank statement." }
    ]
  }
};

const form_schema_default = {
  fields: [
    { name: 'fullName', type: 'text', required: true, label: 'Full Name' },
    { name: 'email', type: 'email', required: true, label: 'Email Address' },
    { name: 'phone', type: 'tel', required: true, label: 'Phone Number' },
    { name: 'passportNumber', type: 'text', required: true, label: 'Passport Number' }
  ]
};

const sampleConfigurations = [
  {
    citizenship: 'United Kingdom',
    destination: 'Europe (Schengen States)',
    service_fee: 133.00,
    required_documents: required_documents_structure,
    form_schema: form_schema_default
  },
  {
    citizenship: 'United Kingdom',
    destination: 'USA',
    service_fee: 185.00,
    required_documents: required_documents_structure,
    form_schema: form_schema_default
  },
  {
    citizenship: 'United Kingdom',
    destination: 'Canada',
    service_fee: 150.00,
    required_documents: required_documents_structure,
    form_schema: form_schema_default
  },
  {
    citizenship: 'United Kingdom',
    destination: 'Australia',
    service_fee: 165.00,
    required_documents: required_documents_structure,
    form_schema: form_schema_default
  }
];

const seedVisaConfigurations = async () => {
  try {
    console.log('Starting to seed visa configurations...');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    await VisaConfiguration.destroy({ where: {} });
    console.log('Cleared existing configurations');
    
    // Insert sample data
    await VisaConfiguration.bulkCreate(sampleConfigurations);
    
    console.log('✅ Successfully seeded', sampleConfigurations.length, 'visa configurations!');
    console.log('\nSeeded configurations:');
    sampleConfigurations.forEach((config, index) => {
      console.log(`${index + 1}. ${config.citizenship} → ${config.destination} (£${config.service_fee})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding visa configurations:', error);
    process.exit(1);
  }
};

// Run the seeder
seedVisaConfigurations();
