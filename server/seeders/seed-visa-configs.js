const { VisaConfiguration } = require('../models');

const sampleConfigurations = [
  {
    citizenship: 'United Kingdom',
    destination: 'Europe (Schengen States)',
    service_fee: 133.00,
    required_documents: [
      { 
        title: 'Original Passport', 
        icon: 'travel', 
        color: 'text-primary', 
        border: 'border-primary', 
        desc: 'Must be valid for 6 months beyond departure date.' 
      },
      { 
        title: 'Biometric Photos', 
        icon: 'photo_camera', 
        color: 'text-secondary', 
        border: 'border-secondary', 
        desc: 'Two recent color photos (3.5 x 4.5 cm) on white background.' 
      },
      { 
        title: 'Travel Insurance', 
        icon: 'description', 
        color: 'text-tertiary', 
        border: 'border-tertiary', 
        desc: 'Proof of medical insurance covering €30,000 min.' 
      },
      { 
        title: 'Proof of Residency', 
        icon: 'home_work', 
        color: 'text-primary-container', 
        border: 'border-primary-container', 
        desc: 'Valid UK residence permit (BRP) or equivalent.' 
      }
    ],
    form_schema: {
      fields: [
        { name: 'fullName', type: 'text', required: true, label: 'Full Name' },
        { name: 'email', type: 'email', required: true, label: 'Email Address' },
        { name: 'phone', type: 'tel', required: true, label: 'Phone Number' },
        { name: 'passportNumber', type: 'text', required: true, label: 'Passport Number' }
      ]
    }
  },
  {
    citizenship: 'United Kingdom',
    destination: 'USA',
    service_fee: 185.00,
    required_documents: [
      { 
        title: 'Valid Passport', 
        icon: 'travel', 
        color: 'text-primary', 
        border: 'border-primary', 
        desc: 'Must be valid for at least 6 months beyond your planned stay.' 
      },
      { 
        title: 'DS-160 Form', 
        icon: 'description', 
        color: 'text-secondary', 
        border: 'border-secondary', 
        desc: 'Completed online nonimmigrant visa application.' 
      },
      { 
        title: 'Passport Photo', 
        icon: 'photo_camera', 
        color: 'text-tertiary', 
        border: 'border-tertiary', 
        desc: 'Recent photograph meeting US visa photo requirements.' 
      },
      { 
        title: 'Interview Appointment', 
        icon: 'event', 
        color: 'text-primary-container', 
        border: 'border-primary-container', 
        desc: 'Confirmation of visa interview appointment.' 
      },
      { 
        title: 'Financial Proof', 
        icon: 'account_balance', 
        color: 'text-secondary', 
        border: 'border-secondary', 
        desc: 'Bank statements or proof of financial support.' 
      }
    ],
    form_schema: {
      fields: [
        { name: 'fullName', type: 'text', required: true, label: 'Full Name' },
        { name: 'email', type: 'email', required: true, label: 'Email Address' },
        { name: 'phone', type: 'tel', required: true, label: 'Phone Number' },
        { name: 'passportNumber', type: 'text', required: true, label: 'Passport Number' },
        { name: 'travelPurpose', type: 'select', required: true, label: 'Purpose of Travel', options: ['Tourism', 'Business', 'Education', 'Other'] }
      ]
    }
  },
  {
    citizenship: 'United Kingdom',
    destination: 'Canada',
    service_fee: 150.00,
    required_documents: [
      { 
        title: 'Valid Passport', 
        icon: 'travel', 
        color: 'text-primary', 
        border: 'border-primary', 
        desc: 'Must be valid for the duration of your stay.' 
      },
      { 
        title: 'Biometric Photos', 
        icon: 'photo_camera', 
        color: 'text-secondary', 
        border: 'border-secondary', 
        desc: 'Two identical photos meeting Canadian specifications.' 
      },
      { 
        title: 'Travel History', 
        icon: 'flight_takeoff', 
        color: 'text-tertiary', 
        border: 'border-tertiary', 
        desc: 'Documentation of previous international travel.' 
      },
      { 
        title: 'Financial Documents', 
        icon: 'account_balance', 
        color: 'text-primary-container', 
        border: 'border-primary-container', 
        desc: 'Proof of sufficient funds for your stay.' 
      }
    ],
    form_schema: {
      fields: [
        { name: 'fullName', type: 'text', required: true, label: 'Full Name' },
        { name: 'email', type: 'email', required: true, label: 'Email Address' },
        { name: 'phone', type: 'tel', required: true, label: 'Phone Number' },
        { name: 'passportNumber', type: 'text', required: true, label: 'Passport Number' }
      ]
    }
  },
  {
    citizenship: 'United Kingdom',
    destination: 'Australia',
    service_fee: 165.00,
    required_documents: [
      { 
        title: 'Valid Passport', 
        icon: 'travel', 
        color: 'text-primary', 
        border: 'border-primary', 
        desc: 'Must be valid for at least 6 months.' 
      },
      { 
        title: 'Passport Photo', 
        icon: 'photo_camera', 
        color: 'text-secondary', 
        border: 'border-secondary', 
        desc: 'Recent passport-sized photograph.' 
      },
      { 
        title: 'Health Insurance', 
        icon: 'health_and_safety', 
        color: 'text-tertiary', 
        border: 'border-tertiary', 
        desc: 'Proof of adequate health insurance coverage.' 
      },
      { 
        title: 'Character Documents', 
        icon: 'verified_user', 
        color: 'text-primary-container', 
        border: 'border-primary-container', 
        desc: 'Police clearance certificate if required.' 
      }
    ],
    form_schema: {
      fields: [
        { name: 'fullName', type: 'text', required: true, label: 'Full Name' },
        { name: 'email', type: 'email', required: true, label: 'Email Address' },
        { name: 'phone', type: 'tel', required: true, label: 'Phone Number' },
        { name: 'passportNumber', type: 'text', required: true, label: 'Passport Number' }
      ]
    }
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
