import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Issue from '../models/Issue.js';

const sampleIssues = [
  {
    title: "Massive pothole on main road",
    description: "A very large pothole has formed near the junction causing severe traffic slowdowns and damage to vehicles.",
    category: "Roads",
    address: "Andheri West, Mumbai",
    latitude: 19.1136,
    longitude: 72.8697,
    priority: "HIGH"
  },
  {
    title: "Streetlight pole bent and wires exposed",
    description: "An old streetlight pole is heavily bent and live wires are hanging dangerously low near the sidewalk.",
    category: "Electricity",
    address: "Koramangala, Bangalore",
    latitude: 12.9279,
    longitude: 77.6271,
    priority: "HIGH"
  },
  {
    title: "Garbage overflowing from public bins",
    description: "The local garbage bins have not been cleared for 3 days and there is waste spreading onto the street.",
    category: "Waste",
    address: "Connaught Place, New Delhi",
    latitude: 28.6304,
    longitude: 77.2177,
    priority: "MEDIUM"
  },
  {
    title: "Water leaking from main supply pipe",
    description: "Clean drinking water is gushing out of a cracked pipe under the bridge.",
    category: "Water",
    address: "Bandra Tali, Mumbai",
    latitude: 19.0596,
    longitude: 72.8295,
    priority: "HIGH"
  },
  {
    title: "Broken swings in children's park",
    description: "The swings in the local park have rusted chains that snapped recently. Dangerous for kids.",
    category: "Parks",
    address: "Jayanagar, Bangalore",
    latitude: 12.9250,
    longitude: 77.5938,
    priority: "LOW"
  },
  {
    title: "Traffic signal completely off",
    description: "The 4-way traffic signal at the intersection is completely dead causing near-misses.",
    category: "Traffic",
    address: "T Nagar, Chennai",
    latitude: 13.0418,
    longitude: 80.2341,
    priority: "HIGH"
  }
];

export const seedDatabase = async () => {
  try {
    const salt = await bcrypt.genSalt(10);

    const adminEmail = 'admin@publiceye.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const password_hash = await bcrypt.hash('admin123', salt);
      admin = new User({
        name: 'System Admin',
        email: adminEmail,
        password_hash,
        role: 'admin',
      });
      await admin.save();
      console.log('Seeded default Admin.');
    }

    const roadsEmail = 'roads@publiceye.com';
    let roadsDept = await User.findOne({ email: roadsEmail });
    if (!roadsDept) {
      const password_hash = await bcrypt.hash('dept123', salt);
      roadsDept = new User({
        name: 'Roads & Transport Dept',
        email: roadsEmail,
        password_hash,
        role: 'department',
      });
      await roadsDept.save();
      console.log('Seeded Roads Department.');
    }

    const waterEmail = 'water@publiceye.com';
    let waterDept = await User.findOne({ email: waterEmail });
    if (!waterDept) {
      const password_hash = await bcrypt.hash('dept123', salt);
      waterDept = new User({
        name: 'Water & Sanitation Dept',
        email: waterEmail,
        password_hash,
        role: 'department',
      });
      await waterDept.save();
      console.log('Seeded Water Department.');
    }

    const seniorEmail = 'senior@publiceye.com';
    let seniorAuth = await User.findOne({ email: seniorEmail });
    if (!seniorAuth) {
      const password_hash = await bcrypt.hash('senior123', salt);
      seniorAuth = new User({
        name: 'Director / Senior Authority',
        email: seniorEmail,
        password_hash,
        role: 'senior_authority',
      });
      await seniorAuth.save();
      console.log('Seeded Senior Authority.');
    }

    const citizenEmail = 'citizen1@publiceye.com';
    let citizen = await User.findOne({ email: citizenEmail });
    if (!citizen) {
      const password_hash = await bcrypt.hash('password123', salt);
      citizen = new User({
        name: 'Test Citizen',
        email: citizenEmail,
        password_hash,
        role: 'citizen',
        phone: '1234567890',
      });
      await citizen.save();
      console.log('Seeded Test Citizen.');
    }

    const issueCount = await Issue.countDocuments();
    if (issueCount === 0) {
      const createdIssues = [];
      for (const issueData of sampleIssues) {
        const issue = new Issue({
          title: issueData.title,
          description: issueData.description,
          category: issueData.category,
          address: issueData.address,
          latitude: issueData.latitude,
          longitude: issueData.longitude,
          priority: issueData.priority,
          status: 'PENDING',
          created_by: citizen.id,
        });
        await issue.save();
        createdIssues.push(issue);
      }
      console.log(`Seeded ${createdIssues.length} sample issues.`);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
