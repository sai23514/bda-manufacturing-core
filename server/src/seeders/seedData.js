import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';
import Team from '../models/Team.js';
import { generateLeadNumber } from '../utils/helpers.js';

// Load environment variables
dotenv.config();

// Sample data
const sampleUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@bda.com',
    password: 'admin123',
    role: 'super_admin',
    phone: '9876543210',
    department: 'Management',
    isActive: true
  },
  {
    firstName: 'John',
    lastName: 'Manager',
    email: 'manager@bda.com',
    password: 'manager123',
    role: 'manager',
    phone: '9876543211',
    department: 'Sales',
    isActive: true
  },
  {
    firstName: 'Sarah',
    lastName: 'Lead',
    email: 'teamlead@bda.com',
    password: 'lead123',
    role: 'team_lead',
    phone: '9876543212',
    department: 'Sales',
    isActive: true
  },
  {
    firstName: 'Mike',
    lastName: 'Smith',
    email: 'mike@bda.com',
    password: 'mike123',
    role: 'bda',
    phone: '9876543213',
    department: 'Sales',
    targets: { monthly: 500000, quarterly: 1500000, yearly: 6000000 },
    isActive: true
  },
  {
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily@bda.com',
    password: 'emily123',
    role: 'bda',
    phone: '9876543214',
    department: 'Sales',
    targets: { monthly: 500000, quarterly: 1500000, yearly: 6000000 },
    isActive: true
  }
];

const sampleLeads = [
  {
    companyName: 'Tech Innovations Pvt Ltd',
    contactPerson: 'Rajesh Kumar',
    email: 'rajesh@techinnovations.com',
    phone: '9988776655',
    industry: 'Information Technology',
    location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
    source: 'linkedin',
    status: 'qualified',
    priority: 'high',
    estimatedValue: 2500000,
    expectedCloseDate: new Date('2026-06-15'),
    requirements: 'Looking for complete CRM solution with mobile app integration',
    notes: 'Very interested, follow up next week'
  },
  {
    companyName: 'Manufacturing Solutions Inc',
    contactPerson: 'Priya Sharma',
    email: 'priya@mansol.com',
    phone: '9988776656',
    industry: 'Manufacturing',
    location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
    source: 'referral',
    status: 'proposal',
    priority: 'high',
    estimatedValue: 3500000,
    expectedCloseDate: new Date('2026-06-30'),
    requirements: 'ERP integration with existing manufacturing systems',
    notes: 'Proposal sent on May 20th, awaiting response'
  },
  {
    companyName: 'Global Trading Co',
    contactPerson: 'Amit Patel',
    email: 'amit@globaltrading.com',
    phone: '9988776657',
    industry: 'Trading',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    source: 'website',
    status: 'negotiation',
    priority: 'medium',
    estimatedValue: 1800000,
    expectedCloseDate: new Date('2026-07-15'),
    requirements: 'Lead management and reporting tools',
    notes: 'In final negotiation stage, price discussion pending'
  },
  {
    companyName: 'HealthCare Plus',
    contactPerson: 'Dr. Sunita Verma',
    email: 'sunita@healthcareplus.com',
    phone: '9988776658',
    industry: 'Healthcare',
    location: { city: 'Delhi', state: 'Delhi', country: 'India' },
    source: 'cold_call',
    status: 'contacted',
    priority: 'medium',
    estimatedValue: 1200000,
    expectedCloseDate: new Date('2026-08-01'),
    requirements: 'Patient management and appointment scheduling',
    notes: 'Initial call completed, sending brochure'
  },
  {
    companyName: 'AutoParts Express',
    contactPerson: 'Vikram Singh',
    email: 'vikram@autoparts.com',
    phone: '9988776659',
    industry: 'Automotive',
    location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
    source: 'trade_show',
    status: 'new',
    priority: 'low',
    estimatedValue: 800000,
    expectedCloseDate: new Date('2026-09-01'),
    requirements: 'Inventory management system',
    notes: 'Met at auto expo, interested in demo'
  },
  {
    companyName: 'Textile Masters Ltd',
    contactPerson: 'Lakshmi Iyer',
    email: 'lakshmi@textilemasters.com',
    phone: '9988776660',
    industry: 'Textile',
    location: { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India' },
    source: 'email_campaign',
    status: 'won',
    priority: 'high',
    estimatedValue: 4500000,
    wonDate: new Date('2026-05-15'),
    requirements: 'Complete business management suite',
    notes: 'Deal closed! Implementation starting next month'
  },
  {
    companyName: 'FoodChain Logistics',
    contactPerson: 'Arjun Reddy',
    email: 'arjun@foodchain.com',
    phone: '9988776661',
    industry: 'Logistics',
    location: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
    source: 'referral',
    status: 'lost',
    priority: 'medium',
    estimatedValue: 1500000,
    lostReason: 'Budget constraints, went with competitor',
    requirements: 'Fleet and delivery management',
    notes: 'Lost to cheaper alternative'
  },
  {
    companyName: 'Edu-Tech Solutions',
    contactPerson: 'Neha Gupta',
    email: 'neha@edutech.com',
    phone: '9988776662',
    industry: 'Education',
    location: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
    source: 'website',
    status: 'nurturing',
    priority: 'low',
    estimatedValue: 900000,
    expectedCloseDate: new Date('2026-10-01'),
    requirements: 'Student and course management platform',
    notes: 'Not ready to buy now, follow up in 2 months'
  }
];

// Connect to database and seed
const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Lead.deleteMany({});
    await Activity.deleteMany({});
    await Team.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users one by one to trigger password hashing
    console.log('👥 Creating users...');
    const createdUsers = [];

    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`   Created: ${user.email}`);
    }

    console.log(`✅ Created ${createdUsers.length} users`);
    console.log('   Note: All passwords are the username part + "123"');
    console.log('   Example: admin@bda.com -> password is "admin123"');

    // Get BDA users for lead assignment
    const bdaUsers = createdUsers.filter(u => u.role === 'bda');
    
    // Create leads and assign to BDAs
    console.log('📊 Creating leads...');
    const createdLeads = [];

    for (let i = 0; i < sampleLeads.length; i++) {
      const leadData = {
        ...sampleLeads[i],
        leadNumber: generateLeadNumber(), // Explicitly generate lead number
        assignedTo: bdaUsers[i % bdaUsers.length]._id,
        assignedBy: createdUsers[0]._id // Assigned by admin
      };

      const lead = await Lead.create(leadData);
      createdLeads.push(lead);
    }

    console.log(`✅ Created ${createdLeads.length} leads`);

    // Create sample activities
    console.log('📝 Creating activities...');
    const activities = [];
    
    createdLeads.forEach((lead, index) => {
      activities.push({
        type: 'call',
        subject: 'Initial Contact Call',
        description: `First call with ${lead.contactPerson} from ${lead.companyName}`,
        leadId: lead._id,
        userId: lead.assignedTo,
        status: 'completed',
        priority: 'medium',
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        duration: 15
      });

      if (index % 2 === 0) {
        activities.push({
          type: 'email',
          subject: 'Proposal Sent',
          description: `Sent detailed proposal to ${lead.contactPerson}`,
          leadId: lead._id,
          userId: lead.assignedTo,
          status: 'completed',
          priority: 'high',
          completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        });
      }
    });

    await Activity.insertMany(activities);
    console.log(`✅ Created ${activities.length} activities`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📧 Sample Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:     admin@bda.com / admin123');
    console.log('Manager:   manager@bda.com / manager123');
    console.log('Team Lead: teamlead@bda.com / lead123');
    console.log('BDA 1:     mike@bda.com / mike123');
    console.log('BDA 2:     emily@bda.com / emily123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
