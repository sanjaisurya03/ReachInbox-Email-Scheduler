import prisma from "./config/database.js";

async function seedTestData() {
  try {
    console.log("Creating development test data...");

    // Create or find a test user
    const user = await prisma.user.upsert({
      where: {
        email: "demo@reachinbox.test",
      },
      update: {},
      create: {
        name: "ReachInbox Demo User",
        email: "demo@reachinbox.test",
      },
    });

    // Create or find a test sender
    const sender = await prisma.sender.upsert({
      where: {
        userId_email: {
          userId: user.id,
          email: "sender@ethereal.email",
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: "Demo Sender",
        email: "sender@ethereal.email",
        smtpHost: "smtp.ethereal.email",
        smtpPort: 587,
        smtpUser: "temporary",
        smtpPass: "temporary",
      },
    });

    // Create a test campaign
    const campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        name: "Development Test Campaign",
        subject: "ReachInbox Scheduler Test",
        body: "This is a test scheduled email.",
        startTime: new Date(),
        delayMs: 2000,
        hourlyLimit: 200,
      },
    });

    console.log("\n========================================");
    console.log("TEST DATA CREATED SUCCESSFULLY");
    console.log("========================================\n");

    console.log("USER ID:");
    console.log(user.id);

    console.log("\nSENDER ID:");
    console.log(sender.id);

    console.log("\nCAMPAIGN ID:");
    console.log(campaign.id);

    console.log("\n========================================");
    console.log("Keep these IDs for the API test.");
    console.log("========================================\n");
  } catch (error) {
    console.error("\nFailed to create test data:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();