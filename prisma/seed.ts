import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(pwd: string) {
  return bcrypt.hash(pwd, 10);
}

const DISTRICTS_DATA = [
  // Dhaka Division
  { id: 1, nameBn: "ঢাকা", nameEn: "Dhaka", division: "Dhaka" },
  { id: 2, nameBn: "গাজীপুর", nameEn: "Gazipur", division: "Dhaka" },
  { id: 3, nameBn: "নারায়ণগঞ্জ", nameEn: "Narayanganj", division: "Dhaka" },
  { id: 4, nameBn: "টাঙ্গাইল", nameEn: "Tangail", division: "Dhaka" },
  { id: 5, nameBn: "নরসিংদী", nameEn: "Narsingdi", division: "Dhaka" },
  { id: 6, nameBn: "ফরিদপুর", nameEn: "Faridpur", division: "Dhaka" },
  { id: 7, nameBn: "মুন্সীগঞ্জ", nameEn: "Munshiganj", division: "Dhaka" },
  { id: 8, nameBn: "মানিকগঞ্জ", nameEn: "Manikganj", division: "Dhaka" },
  { id: 9, nameBn: "কিশোরগঞ্জ", nameEn: "Kishoreganj", division: "Dhaka" },
  { id: 10, nameBn: "গোপালগঞ্জ", nameEn: "Gopalganj", division: "Dhaka" },
  { id: 11, nameBn: "মাদারীপুর", nameEn: "Madaripur", division: "Dhaka" },
  { id: 12, nameBn: "রাজবাড়ী", nameEn: "Rajbari", division: "Dhaka" },
  { id: 13, nameBn: "শরীয়তপুর", nameEn: "Shariatpur", division: "Dhaka" },
  // Chattogram Division
  { id: 14, nameBn: "চট্টগ্রাম", nameEn: "Chattogram", division: "Chattogram" },
  { id: 15, nameBn: "কক্সবাজার", nameEn: "Cox's Bazar", division: "Chattogram" },
  { id: 16, nameBn: "কুমিল্লা", nameEn: "Cumilla", division: "Chattogram" },
  { id: 17, nameBn: "ফেনী", nameEn: "Feni", division: "Chattogram" },
  { id: 18, nameBn: "ব্রাহ্মণবাড়িয়া", nameEn: "Brahmanbaria", division: "Chattogram" },
  { id: 19, nameBn: "নোয়াখালী", nameEn: "Noakhali", division: "Chattogram" },
  { id: 20, nameBn: "চাঁদপুর", nameEn: "Chandpur", division: "Chattogram" },
  { id: 21, nameBn: "লক্ষ্মীপুর", nameEn: "Lakshmipur", division: "Chattogram" },
  { id: 22, nameBn: "রাঙ্গামাটি", nameEn: "Rangamati", division: "Chattogram" },
  { id: 23, nameBn: "বান্দরবান", nameEn: "Bandarban", division: "Chattogram" },
  { id: 24, nameBn: "খাগড়াছড়ি", nameEn: "Khagrachhari", division: "Chattogram" },
  // Rajshahi Division
  { id: 25, nameBn: "রাজশাহী", nameEn: "Rajshahi", division: "Rajshahi" },
  { id: 26, nameBn: "বগুড়া", nameEn: "Bogura", division: "Rajshahi" },
  { id: 27, nameBn: "পাবনা", nameEn: "Pabna", division: "Rajshahi" },
  { id: 28, nameBn: "সিরাজগঞ্জ", nameEn: "Sirajganj", division: "Rajshahi" },
  { id: 29, nameBn: "নওগাঁ", nameEn: "Naogaon", division: "Rajshahi" },
  { id: 30, nameBn: "নাটোর", nameEn: "Natore", division: "Rajshahi" },
  { id: 31, nameBn: "জয়পুরহাট", nameEn: "Joypurhat", division: "Rajshahi" },
  { id: 32, nameBn: "চাঁপাইনবাবগঞ্জ", nameEn: "Chapai Nawabganj", division: "Rajshahi" },
  // Khulna Division
  { id: 33, nameBn: "খুলনা", nameEn: "Khulna", division: "Khulna" },
  { id: 34, nameBn: "যশোর", nameEn: "Jashore", division: "Khulna" },
  { id: 35, nameBn: "কুষ্টিয়া", nameEn: "Kushtia", division: "Khulna" },
  { id: 36, nameBn: "ঝিনাইদহ", nameEn: "Jhenaidah", division: "Khulna" },
  { id: 37, nameBn: "সাতক্ষীরা", nameEn: "Satkhira", division: "Khulna" },
  { id: 38, nameBn: "বাগেরহাট", nameEn: "Bagerhat", division: "Khulna" },
  { id: 39, nameBn: "চুয়াডাঙ্গা", nameEn: "Chuadanga", division: "Khulna" },
  { id: 40, nameBn: "মেহেরপুর", nameEn: "Meherpur", division: "Khulna" },
  { id: 41, nameBn: "মাগুরা", nameEn: "Magura", division: "Khulna" },
  { id: 42, nameBn: "নড়াইল", nameEn: "Narail", division: "Khulna" },
  // Sylhet Division
  { id: 43, nameBn: "সিলেট", nameEn: "Sylhet", division: "Sylhet" },
  { id: 44, nameBn: "মৌলভীবাজার", nameEn: "Moulvibazar", division: "Sylhet" },
  { id: 45, nameBn: "হবিগঞ্জ", nameEn: "Habiganj", division: "Sylhet" },
  { id: 46, nameBn: "সুনামগঞ্জ", nameEn: "Sunamganj", division: "Sylhet" },
  // Barishal Division
  { id: 47, nameBn: "বরিশাল", nameEn: "Barishal", division: "Barishal" },
  { id: 48, nameBn: "পটুয়াখালী", nameEn: "Patuakhali", division: "Barishal" },
  { id: 49, nameBn: "ভোলা", nameEn: "Bhola", division: "Barishal" },
  { id: 50, nameBn: "পিরোজপুর", nameEn: "Pirojpur", division: "Barishal" },
  { id: 51, nameBn: "বরগুনা", nameEn: "Barguna", division: "Barishal" },
  { id: 52, nameBn: "ঝালকাঠি", nameEn: "Jhalokati", division: "Barishal" },
  // Rangpur Division
  { id: 53, nameBn: "রংপুর", nameEn: "Rangpur", division: "Rangpur" },
  { id: 54, nameBn: "দিনাজপুর", nameEn: "Dinajpur", division: "Rangpur" },
  { id: 55, nameBn: "গাইবান্ধা", nameEn: "Gaibandha", division: "Rangpur" },
  { id: 56, nameBn: "নীলফামারী", nameEn: "Nilphamari", division: "Rangpur" },
  { id: 57, nameBn: "কুড়িগ্রাম", nameEn: "Kurigram", division: "Rangpur" },
  { id: 58, nameBn: "লালমনিরহাট", nameEn: "Lalmonirhat", division: "Rangpur" },
  { id: 59, nameBn: "ঠাকুরগাঁও", nameEn: "Thakurgaon", division: "Rangpur" },
  { id: 60, nameBn: "পঞ্চগড়", nameEn: "Panchagarh", division: "Rangpur" },
  // Mymensingh Division
  { id: 61, nameBn: "ময়মনসিংহ", nameEn: "Mymensingh", division: "Mymensingh" },
  { id: 62, nameBn: "জামালপুর", nameEn: "Jamalpur", division: "Mymensingh" },
  { id: 63, nameBn: "নেত্রকোণা", nameEn: "Netrokona", division: "Mymensingh" },
  { id: 64, nameBn: "শেরপুর", nameEn: "Sherpur", division: "Mymensingh" },
];

async function main() {
  console.log("Seeding Bangladesh 64 Districts...");
  for (const d of DISTRICTS_DATA) {
    await prisma.district.upsert({
      where: { id: d.id },
      create: d,
      update: d,
    });
  }

  console.log("Seeding Roles & Permissions...");
  const modules = ["jobs", "applications", "users", "agents", "channel_partners", "wallets", "quiz", "commissions", "settings", "reports"];
  const actions = ["view", "create", "edit", "delete", "approve", "impersonate"];

  for (const m of modules) {
    for (const a of actions) {
      await prisma.permission.upsert({
        where: { module_action: { module: m, action: a } },
        create: { module: m, action: a, description: `${a} on ${m}` },
        update: {},
      });
    }
  }

  // Sample Custom Roles for Staff
  const jobModeratorRole = await prisma.role.upsert({
    where: { name: "Job Moderator" },
    create: {
      name: "Job Moderator",
      description: "Can manage and approve job posts only",
    },
    update: {},
  });

  const walletOfficerRole = await prisma.role.upsert({
    where: { name: "Wallet Officer" },
    create: {
      name: "Wallet Officer",
      description: "Can review and approve cash-in / cash-out requests",
    },
    update: {},
  });

  // Assign job approval permissions to Job Moderator
  const jobPerms = await prisma.permission.findMany({
    where: { module: "jobs" },
  });
  for (const p of jobPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: jobModeratorRole.id, permissionId: p.id } },
      create: { roleId: jobModeratorRole.id, permissionId: p.id },
      update: {},
    });
  }

  // Assign wallet permissions to Wallet Officer
  const walletPerms = await prisma.permission.findMany({
    where: { module: "wallets" },
  });
  for (const p of walletPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: walletOfficerRole.id, permissionId: p.id } },
      create: { roleId: walletOfficerRole.id, permissionId: p.id },
      update: {},
    });
  }

  console.log("Seeding Test Accounts...");
  // 1. Super Admin
  const adminPassword = await hash("Admin@123456");
  const superAdmin = await prisma.user.upsert({
    where: { phone: "01700000001" },
    create: {
      name: "Super Admin",
      phone: "01700000001",
      email: "admin@jobportal.bd",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
    },
    update: { passwordHash: adminPassword },
  });
  await prisma.wallet.upsert({
    where: { userId: superAdmin.id },
    create: { userId: superAdmin.id, balance: 50000.0 },
    update: {},
  });

  // 2. Staff - Job Moderator
  const staffPassword = await hash("Staff@123456");
  const jobStaff = await prisma.user.upsert({
    where: { phone: "01700000002" },
    create: {
      name: "রাফসান হাবিব (Job Staff)",
      phone: "01700000002",
      passwordHash: staffPassword,
      role: "ADMIN_STAFF",
    },
    update: {},
  });
  await prisma.staffProfile.upsert({
    where: { userId: jobStaff.id },
    create: { userId: jobStaff.id, roleId: jobModeratorRole.id, designation: "Senior Job Moderator" },
    update: {},
  });

  // 3. Staff - Wallet Officer
  const walletStaff = await prisma.user.upsert({
    where: { phone: "01700000003" },
    create: {
      name: "আহমেদ সাদমান (Wallet Staff)",
      phone: "01700000003",
      passwordHash: staffPassword,
      role: "ADMIN_STAFF",
    },
    update: {},
  });
  await prisma.staffProfile.upsert({
    where: { userId: walletStaff.id },
    create: { userId: walletStaff.id, roleId: walletOfficerRole.id, designation: "Wallet Approver" },
    update: {},
  });

  // 4. Channel Partner (Dhaka District)
  const cpPassword = await hash("Partner@123456");
  const cpUser = await prisma.user.upsert({
    where: { phone: "01700000020" },
    create: {
      name: "ঢাকা চ্যানেল পার্টনার",
      phone: "01700000020",
      passwordHash: cpPassword,
      role: "CHANNEL_PARTNER",
    },
    update: {},
  });
  const cp = await prisma.channelPartner.upsert({
    where: { districtId: 1 }, // Dhaka
    create: {
      userId: cpUser.id,
      districtId: 1,
      commissionRate: 5.0,
    },
    update: {},
  });
  await prisma.wallet.upsert({
    where: { userId: cpUser.id },
    create: { userId: cpUser.id, balance: 1000.0 },
    update: {},
  });

  // 5. Default Agent
  const agentPassword = await hash("Agent@123456");
  const defaultAgentUser = await prisma.user.upsert({
    where: { phone: "01700000010" },
    create: {
      name: "সিস্টেম ডিফল্ট এজেন্ট",
      phone: "01700000010",
      passwordHash: agentPassword,
      role: "AGENT",
    },
    update: {},
  });
  const defaultAgent = await prisma.agent.upsert({
    where: { referralCode: "DEFAULT1" },
    create: {
      userId: defaultAgentUser.id,
      channelPartnerId: cp.id,
      referralCode: "DEFAULT1",
      isDefault: true,
      commissionRate: 10.0,
    },
    update: {},
  });
  await prisma.wallet.upsert({
    where: { userId: defaultAgentUser.id },
    create: { userId: defaultAgentUser.id, balance: 500.0 },
    update: {},
  });

  // 6. District Agent (Dhaka)
  const agentUser = await prisma.user.upsert({
    where: { phone: "01700000021" },
    create: {
      name: "মো: হাসানুর রহমান (এজেন্ট)",
      phone: "01700000021",
      passwordHash: agentPassword,
      role: "AGENT",
    },
    update: {},
  });
  const dhakaAgent = await prisma.agent.upsert({
    where: { referralCode: "REF12345" },
    create: {
      userId: agentUser.id,
      channelPartnerId: cp.id,
      districtId: 1,
      referralCode: "REF12345",
      isDefault: false,
      commissionRate: 10.0,
    },
    update: {},
  });
  await prisma.wallet.upsert({
    where: { userId: agentUser.id },
    create: { userId: agentUser.id, balance: 1500.0 },
    update: {},
  });

  // 7. Institution
  const instPassword = await hash("Inst@123456");
  const instUser = await prisma.user.upsert({
    where: { phone: "01700000030" },
    create: {
      name: "BRACNet লিমিটেড",
      phone: "01700000030",
      email: "hr@bracnet.net",
      passwordHash: instPassword,
      role: "INSTITUTION",
    },
    update: {},
  });
  const institution = await prisma.institution.upsert({
    where: { userId: instUser.id },
    create: {
      userId: instUser.id,
      nameBn: "ব্র্যাকনেট লিমিটেড",
      nameEn: "BRACNet Limited",
      type: "Private Company",
      address: "গুলশান-১, ঢাকা",
      districtId: 1,
      verified: true,
    },
    update: {},
  });
  await prisma.wallet.upsert({
    where: { userId: instUser.id },
    create: { userId: instUser.id, balance: 20000.0 },
    update: {},
  });

  // 8. Customer (রাহাতুল ইসলাম - Complete Profile matching screenshot)
  const userPassword = await hash("User@123456");
  const customerUser = await prisma.user.upsert({
    where: { phone: "01712345678" },
    create: {
      name: "রাহাতুল ইসলাম",
      phone: "01712345678",
      email: "rahat@gmail.com",
      passwordHash: userPassword,
      role: "CUSTOMER",
    },
    update: {},
  });
  await prisma.customer.upsert({
    where: { userId: customerUser.id },
    create: {
      userId: customerUser.id,
      agentId: dhakaAgent.id,
    },
    update: {},
  });
  await prisma.wallet.upsert({
    where: { userId: customerUser.id },
    create: {
      userId: customerUser.id,
      balance: 2450.0, // matches screenshot ৳ 2,450
      heldBalance: 0.0,
    },
    update: { balance: 2450.0 },
  });

  await prisma.candidateProfile.upsert({
    where: { userId: customerUser.id },
    create: {
      userId: customerUser.id,
      fatherName: "রফিকুল ইসলাম",
      motherName: "রোকেয়া বেগম",
      dob: new Date("1998-05-15"),
      gender: "Male",
      nid: "19981234567890",
      phone: "01712345678",
      email: "rahat@gmail.com",
      presentAddress: "মিরপুর-১০, ঢাকা",
      permanentAddress: "মিরপুর-১০, ঢাকা",
      districtId: 1,
      careerObjective: "চ্যালেঞ্জিং পরিবেশে কাজ করে নিজের মেধা ও দক্ষতা প্রমাণ করতে চাই।",
      expectedSalary: "৳ ৩৫,০০০ - ৫০,০০০",
      completeness: 78,
    },
    update: { completeness: 78 },
  });

  await prisma.education.deleteMany({ where: { userId: customerUser.id } });
  await prisma.education.createMany({
    data: [
      {
        userId: customerUser.id,
        exam: "এসএসসি",
        boardOrInstitution: "ঢাকা শিক্ষা বোর্ড",
        subjectOrGroup: "বিজ্ঞান",
        result: "5.00",
        passingYear: 2018,
      },
      {
        userId: customerUser.id,
        exam: "এইচএসসি",
        boardOrInstitution: "ঢাকা শিক্ষা বোর্ড",
        subjectOrGroup: "বিজ্ঞান",
        result: "4.50",
        passingYear: 2020,
      },
      {
        userId: customerUser.id,
        exam: "বিএসসি",
        boardOrInstitution: "ঢাকা বিশ্ববিদ্যালয়",
        subjectOrGroup: "কম্পিউটার সায়েন্স",
        result: "3.75",
        passingYear: 2024,
      },
    ],
  });

  // 9. Customer (Incomplete Profile)
  const incUser = await prisma.user.upsert({
    where: { phone: "01787654321" },
    create: {
      name: "নতুন ব্যবহারকারী (অসম্পূর্ণ প্রোফাইল)",
      phone: "01787654321",
      passwordHash: userPassword,
      role: "CUSTOMER",
    },
    update: {},
  });
  await prisma.customer.upsert({
    where: { userId: incUser.id },
    create: {
      userId: incUser.id,
      agentId: defaultAgent.id,
    },
    update: {},
  });
  await prisma.wallet.upsert({
    where: { userId: incUser.id },
    create: { userId: incUser.id, balance: 0.0 },
    update: {},
  });

  console.log("Seeding Job Categories...");
  const categories = [
    { slug: "govt", nameBn: "সরকারি", nameEn: "Government", icon: "Landmark" },
    { slug: "private", nameBn: "বেসরকারি", nameEn: "Private", icon: "Building2" },
    { slug: "krishi", nameBn: "কৃষি", nameEn: "Agriculture", icon: "Sprout" },
    { slug: "motso", nameBn: "মৎস্য", nameEn: "Fisheries", icon: "Fish" },
    { slug: "it", nameBn: "তথ্যপ্রযুক্তি", nameEn: "Technology & IT", icon: "Laptop" },
    { slug: "others", nameBn: "অন্যান্য", nameEn: "Others", icon: "Folder" },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const record = await prisma.jobCategory.upsert({
      where: { slug: c.slug },
      create: c,
      update: c,
    });
    catMap[c.slug] = record.id;
  }

  console.log("Seeding Sample Jobs matching design...");
  const jobsData = [
    {
      titleBn: "সহকারী পরিচালক",
      titleEn: "Assistant Director",
      organizationName: "বাংলাদেশ সরকারি কর্ম কমিশন",
      categoryId: catMap["govt"],
      jobType: "FULL_TIME",
      workplaceDistrictId: 1,
      workplaceLocation: "আগারগাঁও, ঢাকা",
      vacancy: 15,
      salaryRange: "৳ ২২,০০০ - ৫৩,০৬০",
      deadline: new Date(Date.now() + 10 * 86400000), // 10 days left
      status: "PUBLISHED",
      postedByAdmin: true,
      descriptionBn: "বাংলাদেশ সরকারি কর্ম কমিশন সচিবালয়ের অধীনে ৯ম গ্রেডের সহকারী পরিচালক পদে নিয়োগ বিজ্ঞপ্তি।",
      descriptionEn: "Recruitment circular for Assistant Director (9th grade) under BPSC Secretariat.",
    },
    {
      institutionId: institution.id,
      titleBn: "Senior UI/UX Designer",
      titleEn: "Senior UI/UX Designer",
      organizationName: "BRACNet",
      categoryId: catMap["private"],
      jobType: "FULL_TIME",
      workplaceDistrictId: 1,
      workplaceLocation: "গুলশান-১, ঢাকা",
      vacancy: 3,
      salaryRange: "৳ ৬৫,০০০ - ৯০,০০০",
      deadline: new Date(Date.now() + 15 * 86400000), // 15 days left
      status: "PUBLISHED",
      descriptionBn: "BRACNet এ অভিজ্ঞ সিনিয়র ডিজাইনার প্রয়োজন। Figma ও মডার্ন UI সিস্টেমে দক্ষ হতে হবে।",
      descriptionEn: "Looking for an experienced Senior UI/UX Designer at BRACNet with strong proficiency in Figma.",
    },
    {
      titleBn: "কৃষি সম্প্রসারণ কর্মকর্তা",
      titleEn: "Agriculture Extension Officer",
      organizationName: "কৃষি সম্প্রসারণ অধিদপ্তর (DAE)",
      categoryId: catMap["krishi"],
      jobType: "FULL_TIME",
      workplaceDistrictId: 1,
      workplaceLocation: "খামারবাড়ি, ফার্মগেট, ঢাকা",
      vacancy: 25,
      salaryRange: "৳ ৩০,০০০ - ৫০,০০০",
      deadline: new Date(Date.now() + 20 * 86400000), // 20 days left
      status: "PUBLISHED",
      postedByAdmin: true,
      descriptionBn: "কৃষি মন্ত্রণালয়াধীন মাঠ পর্যায়ে আধুনিক কৃষি প্রযুক্তি সম্প্রসারণে তরুণ কৃষিবিদ আবশ্যক।",
      descriptionEn: "Recruitment for Agriculture Extension Officer under Ministry of Agriculture.",
    },
    {
      titleBn: "মৎস্য প্রকল্প সমন্বয়কারী",
      titleEn: "Fisheries Project Coordinator",
      organizationName: "বাংলাদেশ মৎস্য গবেষণা ইনস্টিটিউট",
      categoryId: catMap["motso"],
      jobType: "CONTRACTUAL",
      workplaceDistrictId: 14,
      workplaceLocation: "চট্টগ্রাম উপকূলীয় অঞ্চল",
      vacancy: 4,
      salaryRange: "৳ ৫০,০০০ - ৭০,০০০",
      deadline: new Date(Date.now() + 25 * 86400000),
      status: "PUBLISHED",
      postedByAdmin: true,
      descriptionBn: "উপকূলীয় মৎস্য চাষ ও জীববৈচিত্র্য সংরক্ষণ প্রকল্পে প্রজেক্ট কোঅর্ডিনেটর আবশ্যক।",
      descriptionEn: "Project Coordinator required for Coastal Aquaculture and Marine Fisheries Project.",
    },
  ];

  for (const j of jobsData) {
    const existing = await prisma.job.findFirst({
      where: { titleBn: j.titleBn, organizationName: j.organizationName },
    });
    if (!existing) {
      await prisma.job.create({ data: j });
    }
  }

  console.log("Seeding Products for Commission...");
  const products = [
    {
      nameBn: "বিসিএস প্রিপারেশন মাস্টার গাইড",
      nameEn: "BCS Preparation Master Guide",
      costPrice: 300.0,
      salePrice: 450.0,
      category: "Books",
      commissionEligible: true,
      status: "ACTIVE",
      descriptionBn: "বিসিএস প্রিলিমিনারি ও লিখিত পরীক্ষার সম্পূর্ণ প্রস্তুতি সহায়িকা।",
      descriptionEn: "Complete preparation master guide for BCS exam.",
    },
    {
      nameBn: "ব্যাংক জব ম্যাথ ও ইংলিশ অনলাইন কোর্স",
      nameEn: "Bank Job Math & English Online Course",
      costPrice: 800.0,
      salePrice: 1200.0,
      category: "Courses",
      commissionEligible: true,
      status: "ACTIVE",
      descriptionBn: "সরকারি ও বেসরকারি সকল ব্যাংকের জন্য স্পেশাল ম্যাথ ও ইংলিশ কোর্স।",
      descriptionEn: "Special math and English live course for all bank recruitments.",
    },
    {
      nameBn: "প্রিমিয়াম সিভি রিভিউ ও ক্যারিয়ার কনসালটেন্সি",
      nameEn: "Premium CV Review & Career Consultation",
      costPrice: 200.0,
      salePrice: 500.0,
      category: "Services",
      commissionEligible: true,
      status: "ACTIVE",
      descriptionBn: "এইচআর এক্সপার্ট দ্বারা আপনার সিভির মান উন্নয়ন ও ওয়ান-টু-ওয়ান গাইডেন্স।",
      descriptionEn: "One-on-one professional CV review and career consultation.",
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({
      where: { nameBn: p.nameBn },
    });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  console.log("Seeding Quiz Book, Questions & Package...");
  const quizBook = await prisma.quizBook.create({
    data: {
      nameBn: "সাধারণ জ্ঞান (বাংলাদেশ বিষয়াবলী)",
      nameEn: "General Knowledge (Bangladesh Affairs)",
      subject: "General Knowledge",
      institutionId: institution.id,
    },
  });

  const sampleQuestions = [
    {
      questionBn: "মুজিবনগর সরকার কোন তারিখে শপথ গ্রহণ করে?",
      questionEn: "On which date did the Mujibnagar Government take oath?",
      optionA: "১০ এপ্রিল ১৯৭১",
      optionB: "১৭ এপ্রিল ১৯৭১",
      optionC: "২৬ মার্চ ১৯৭১",
      optionD: "১৬ ডিসেম্বর ১৯৭১",
      correctOption: "B",
      explanationBn: "১৯৭১ সালের ১৭ এপ্রিল তৎকালীন মেহেরপুরের বৈদ্যনাথতলায় (বর্তমান মুজিবনগর) প্রথম বাংলাদেশ সরকার শপথ গ্রহণ করে।",
      explanationEn: "On 17 April 1971, the Mujibnagar Government took oath.",
    },
    {
      questionBn: "বাংলাদেশের সংবিধান কবে গৃহীত হয়?",
      questionEn: "When was the Constitution of Bangladesh adopted?",
      optionA: "৪ নভেম্বর ১৯৭২",
      optionB: "১৬ ডিসেম্বর ১৯৭২",
      optionC: "২৬ মার্চ ১৯৭২",
      optionD: "১০ জানুয়ারি ১৯৭২",
      correctOption: "A",
      explanationBn: "৪ নভেম্বর ১৯৭২ সালে গণপরিষদে বাংলাদেশের সংবিধান গৃহীত হয়।",
      explanationEn: "Adopted on 4 November 1972.",
    },
    {
      questionBn: "পদ্মা সেতুর মোট দৈর্ঘ্য কত কিলোমিটার?",
      questionEn: "What is the total length of the Padma Bridge in kilometers?",
      optionA: "৬.১৫ কিমি",
      optionB: "৫.৮০ কিমি",
      optionC: "৭.২০ কিমি",
      optionD: "৬.৫০ কিমি",
      correctOption: "A",
      explanationBn: "পদ্মা সেতুর মূল দৈর্ঘ্য ৬.১৫ কিলোমিটার।",
      explanationEn: "Main length is 6.15 km.",
    },
    {
      questionBn: "জাতীয় স্মৃতিসৌধের স্থপতি কে?",
      questionEn: "Who is the architect of the National Martyrs' Memorial?",
      optionA: "সৈয়দ মাইনুল হোসেন",
      optionB: "হামিদুর রহমান",
      optionC: "মাজহারুল ইসলাম",
      optionD: "এফ আর খান",
      correctOption: "A",
      explanationBn: "জাতীয় স্মৃতিসৌধের নকশাকার সৈয়দ মাইনুল হোসেন।",
      explanationEn: "Designed by Syed Mainul Hossain.",
    },
  ];

  for (const q of sampleQuestions) {
    await prisma.question.create({
      data: {
        bookId: quizBook.id,
        ...q,
      },
    });
  }

  await prisma.quizPackage.create({
    data: {
      nameBn: "সাধারণ জ্ঞান (বাংলাদেশ) - ৫০ প্রশ্ন | ৩০ মিনিট",
      nameEn: "General Knowledge (Bangladesh) - 50 Questions | 30 Mins",
      bookId: quizBook.id,
      questionCount: 4,
      timeLimitMinutes: 10,
      price: 50.0,
      targetScore: 3.0,
      bonusAmount: 100.0, // ৳100 bonus on scoring 3 or more!
      status: "ACTIVE",
    },
  });

  console.log("Seeding SMS Templates & Settings...");
  const templates = [
    {
      slug: "APPLICATION_STATUS",
      title: "Application Status Update",
      templateBn: "প্রিয় {name}, {organization}-এ আপনার আবেদনটির স্ট্যাটাস পরিবর্তিত হয়ে '{status}' হয়েছে।",
      templateEn: "Dear {name}, your application status for {organization} is now '{status}'.",
      variables: "name,organization,status",
    },
    {
      slug: "CASH_IN_APPROVED",
      title: "Cash-In Approved",
      templateBn: "প্রিয় {name}, আপনার ৳ {amount} ক্যাশ ইন সফলভাবে অনুমোদিত হয়েছে। নতুন ব্যালেন্স: ৳ {balance}।",
      templateEn: "Dear {name}, your cash-in of ৳ {amount} has been approved. New balance: ৳ {balance}.",
      variables: "name,amount,balance",
    },
    {
      slug: "COMMISSION_EARNED",
      title: "Commission Earned",
      templateBn: "অভিনন্দন! আপনার রেফারেল থেকে ৳ {amount} কমিশন আপনার ওয়ালেটে জমা হয়েছে।",
      templateEn: "Congratulations! ৳ {amount} commission has been credited to your wallet.",
      variables: "amount",
    },
  ];

  for (const t of templates) {
    await prisma.smsTemplate.upsert({
      where: { slug: t.slug },
      create: t,
      update: t,
    });
  }

  const defaultSettings = [
    { key: "SITE_NAME", value: "JobPortal" },
    { key: "COMMISSION_ENABLED", value: "true" },
    { key: "CASH_OUT_MIN", value: "100" },
    { key: "CASH_OUT_MAX", value: "25000" },
    { key: "CASH_OUT_FEE_PERCENT", value: "2.0" },
    { key: "BKASH_NUMBER", value: "01700000000" },
    { key: "NAGAD_NUMBER", value: "01800000000" },
    { key: "ROCKET_NUMBER", value: "01900000000" },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      create: s,
      update: s,
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
