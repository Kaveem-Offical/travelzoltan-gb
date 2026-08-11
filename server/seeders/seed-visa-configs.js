const { VisaConfiguration } = require('../models');

const required_documents_structure = {
  tourist: {
    student: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "badge", name: "Student ID card", description: "Valid student identification." },
        { icon: "school", name: "CAS Letter", description: "Confirmation of Acceptance for Studies." },
        { icon: "event_note", name: "Term/Holiday Letter", description: "Letter from your institution." },
        { icon: "flight", name: "Flight Itinerary", description: "Round trip flight reservation." },
        { icon: "hotel", name: "Hotel Booking", description: "Proof of accommodation." }
      ]
    },
    employed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "badge", name: "Employee ID card", description: "Valid employee identification." },
        { icon: "work", name: "Employment Contract Letter/ Offer Letter", description: "Valid contract from your employer." },
        { icon: "payments", name: "3 Months Pay Slips", description: "Recent salary slips." },
        { icon: "description", name: "Employment Statement", description: "Statement from your employer." },
        { icon: "flight", name: "Flight Itinerary", description: "Round trip flight reservation." },
        { icon: "hotel", name: "Hotel Booking", description: "Proof of accommodation." }
      ]
    },
    self_employed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "handshake", name: "Business Registration", description: "Proof of business registration." },
        { icon: "account_balance", name: "Business Bank Statement", description: "Last 6 months business bank statement." },
        { icon: "receipt", name: "Tax Returns", description: "Recent tax return documents." },
        { icon: "flight", name: "Flight Itinerary", description: "Round trip flight reservation." },
        { icon: "hotel", name: "Hotel Booking", description: "Proof of accommodation." }
      ]
    },
    unemployed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "person_off", name: "Sponsorship Letter", description: "Letter from your sponsor." },
        { icon: "badge", name: "Sponsor's ID Proof", description: "Passport or Resident permit of sponsor." },
        { icon: "account_balance", name: "Sponsor's Bank Statement", description: "Last 6 months bank statement." },
        { icon: "flight", name: "Flight Itinerary", description: "Round trip flight reservation." },
        { icon: "hotel", name: "Hotel Booking", description: "Proof of accommodation." }
      ]
    }
  },
  visiting: {
    student: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "badge", name: "Student ID card", description: "Valid student identification." },
        { icon: "school", name: "CAS Letter", description: "Confirmation of Acceptance for Studies." },
        { icon: "event_note", name: "Term/Holiday Letter", description: "Letter from your institution." },
        { icon: "mail", name: "Invitation Letter", description: "Letter from your friend or relative." },
        { icon: "badge", name: "Inviter's ID Proof", description: "Passport or Resident Permit of inviter." },
        { icon: "home", name: "Address proof", description: "Electricity bill, Utility bill, etc." }
      ]
    },
    employed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "badge", name: "Employee ID card", description: "Valid employee identification." },
        { icon: "work", name: "Employment Contract Letter/ Offer Letter", description: "Valid contract from your employer." },
        { icon: "payments", name: "3 Months Pay Slips", description: "Recent salary slips." },
        { icon: "description", name: "Employment Statement", description: "Statement from your employer." },
        { icon: "mail", name: "Invitation Letter", description: "Letter from your friend or relative." },
        { icon: "badge", name: "Inviter's ID Proof", description: "Passport or Resident Permit of inviter." },
        { icon: "home", name: "Address proof", description: "Electricity bill, Utility bill, etc." }
      ]
    },
    self_employed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "handshake", name: "Business Registration", description: "Proof of business registration." },
        { icon: "account_balance", name: "Business Bank Statement", description: "Last 6 months business bank statement." },
        { icon: "receipt", name: "Tax Returns", description: "Recent tax return documents." },
        { icon: "mail", name: "Invitation Letter", description: "Letter from your friend or relative." },
        { icon: "badge", name: "Inviter's ID Proof", description: "Passport or Resident Permit of inviter." },
        { icon: "home", name: "Address proof", description: "Electricity bill, Utility bill, etc." }
      ]
    },
    unemployed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "person_off", name: "Sponsorship Letter", description: "Letter from your sponsor." },
        { icon: "badge", name: "Sponsor's ID Proof", description: "Passport or Resident permit of sponsor." },
        { icon: "account_balance", name: "Sponsor's Bank Statement", description: "Last 6 months bank statement." },
        { icon: "mail", name: "Invitation Letter", description: "Letter from your friend or relative." },
        { icon: "badge", name: "Inviter's ID Proof", description: "Passport or Resident Permit of inviter." },
        { icon: "home", name: "Address proof", description: "Electricity bill, Utility bill, etc." }
      ]
    }
  },
  business: {
    student: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "badge", name: "Student ID card", description: "Valid student identification." },
        { icon: "school", name: "CAS Letter", description: "Confirmation of Acceptance for Studies." },
        { icon: "event_note", name: "Term/Holiday Letter", description: "Letter from your institution." },
        { icon: "mail", name: "Invitation Letter", description: "Letter from your friend or relative." },
        { icon: "badge", name: "Inviter's ID Proof", description: "Passport or Resident Permit of inviter." },
        { icon: "home", name: "Address proof", description: "Electricity bill, Utility bill, etc." }
      ]
    },
    employed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "badge", name: "Employee ID card", description: "Valid employee identification." },
        { icon: "work", name: "Employment Contract Letter/ Offer Letter", description: "Valid contract from your employer." },
        { icon: "payments", name: "3 Months Pay Slips", description: "Recent salary slips." },
        { icon: "description", name: "Employment Statement", description: "Statement from your employer." },
        { icon: "mail", name: "Invitation Letter", description: "Letter from your friend or relative." },
        { icon: "badge", name: "Inviter's ID Proof", description: "Passport or Resident Permit of inviter." },
        { icon: "home", name: "Address proof", description: "Electricity bill, Utility bill, etc." }
      ]
    },
    self_employed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "handshake", name: "Business Registration", description: "Proof of business registration." },
        { icon: "account_balance", name: "Business Bank Statement", description: "Last 6 months business bank statement." },
        { icon: "receipt", name: "Tax Returns", description: "Recent tax return documents." },
        { icon: "mail", name: "Invitation Letter", description: "Letter from your friend or relative." },
        { icon: "badge", name: "Inviter's ID Proof", description: "Passport or Resident Permit of inviter." },
        { icon: "home", name: "Address proof", description: "Electricity bill, Utility bill, etc." }
      ]
    },
    unemployed: {
      now: [
        { icon: "travel", name: "Passport Front and Back", description: "Valid for at least 6 months beyond intended stay." },
        { icon: "badge", name: "UK Valid Status (Online Status)", description: "Proof of current legal status or residency requirement." }
      ],
      later: [
        { icon: "person_off", name: "Sponsorship Letter", description: "Letter from your sponsor." },
        { icon: "badge", name: "Sponsor's ID Proof", description: "Passport or Resident permit of sponsor." },
        { icon: "account_balance", name: "Sponsor's Bank Statement", description: "Last 6 months bank statement." },
        { icon: "mail", name: "Invitation Letter", description: "Letter from your friend or relative." },
        { icon: "badge", name: "Inviter's ID Proof", description: "Passport or Resident Permit of inviter." },
        { icon: "home", name: "Address proof", description: "Electricity bill, Utility bill, etc." }
      ]
    }
  }
};

const form_schema_default = {
  personal_details_fields: {
    name: { visible: true, required: true, label: 'First Name' },
    surname: { visible: true, required: true, label: 'Surname' },
    email: { visible: true, required: true, label: 'Email Address' },
    phoneLocal: { visible: true, required: true, label: 'Phone Number (WhatsApp)' },
    alternativePhoneLocal: { visible: true, required: false, label: 'Alternative Phone Number' },
    passportNumber: { visible: true, required: true, label: 'Passport Number' },
    nationality: { visible: true, required: true, label: 'Nationality' },
    residentialAddress: { visible: true, required: true, label: 'Residential Address' },
    dateOfBirth: { visible: false, required: false, label: 'Date of Birth' },
    destinationAddress: { visible: false, required: false, label: 'Destination Details / Address' },
    accommodationAddress: { visible: false, required: false, label: 'Family/Friend or Hotel Address' }
  }
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
