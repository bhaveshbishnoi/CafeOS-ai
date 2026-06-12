const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Pre-hashed bcrypt hash for "password123"
const PASSWORD_HASH = "$2b$10$X87lT9c45a7F4LymFfB6I.D5R/C4vFmZ.a1XoD9p6x5X6jZ2XjXFq";

async function main() {
  console.log("Starting seed process...");

  // Clear existing database records
  await prisma.auditLog.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.wasteRecord.deleteMany();
  await prisma.splitPayment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.recipeItem.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.table.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.cafe.deleteMany();

  console.log("Database cleared.");

  // 1. Create Cafe Chain
  const cafe = await prisma.cafe.create({
    data: {
      name: "CafeOS Premium",
    }
  });

  // 2. Create Branches
  const branchHSR = await prisma.branch.create({
    data: {
      name: "HSR Layout Branch",
      address: "102, 19th Main Rd, Sector 4, HSR Layout, Bengaluru",
      cafeId: cafe.id,
    }
  });

  const branchIndira = await prisma.branch.create({
    data: {
      name: "Indiranagar Branch",
      address: "450, 100 Feet Rd, Indiranagar, Bengaluru",
      cafeId: cafe.id,
    }
  });

  console.log("Created cafe and branches.");

  // 3. Create Users (RBAC)
  const usersData = [
    {
      email: "owner@CafeOS.ai",
      passwordHash: PASSWORD_HASH,
      name: "Vikram Malhotra",
      role: "CAFE_OWNER",
      cafeId: cafe.id,
    },
    {
      email: "manager.hsr@CafeOS.ai",
      passwordHash: PASSWORD_HASH,
      name: "Anjali Sharma",
      role: "MANAGER",
      cafeId: cafe.id,
      branchId: branchHSR.id,
    },
    {
      email: "manager.indira@CafeOS.ai",
      passwordHash: PASSWORD_HASH,
      name: "Rohan Das",
      role: "MANAGER",
      cafeId: cafe.id,
      branchId: branchIndira.id,
    },
    {
      email: "cashier.hsr@CafeOS.ai",
      passwordHash: PASSWORD_HASH,
      name: "Priya Patel",
      role: "CASHIER",
      cafeId: cafe.id,
      branchId: branchHSR.id,
    },
    {
      email: "cashier.indira@CafeOS.ai",
      passwordHash: PASSWORD_HASH,
      name: "Amit Sen",
      role: "CASHIER",
      cafeId: cafe.id,
      branchId: branchIndira.id,
    },
    {
      email: "kitchen.hsr@CafeOS.ai",
      passwordHash: PASSWORD_HASH,
      name: "Chef Suresh Kumar",
      role: "KITCHEN_STAFF",
      cafeId: cafe.id,
      branchId: branchHSR.id,
    },
    {
      email: "kitchen.indira@CafeOS.ai",
      passwordHash: PASSWORD_HASH,
      name: "Chef Nina Rao",
      role: "KITCHEN_STAFF",
      cafeId: cafe.id,
      branchId: branchIndira.id,
    }
  ];

  const users = {};
  for (const u of usersData) {
    const createdUser = await prisma.user.create({ data: u });
    users[u.email] = createdUser;
  }
  console.log("Created RBAC users.");

  // 4. Create Tables
  const tables = [];
  const hsrTables = [
    { name: "Table 1 (2 Pax)", capacity: 2 },
    { name: "Table 2 (4 Pax)", capacity: 4 },
    { name: "Table 3 (4 Pax)", capacity: 4 },
    { name: "Table 4 (6 Pax)", capacity: 6 },
    { name: "Bar Stand 1", capacity: 1 },
  ];
  for (const t of hsrTables) {
    const table = await prisma.table.create({
      data: {
        name: t.name,
        capacity: t.capacity,
        status: "AVAILABLE",
        branchId: branchHSR.id
      }
    });
    tables.push(table);
  }

  const indiraTables = [
    { name: "Table A (2 Pax)", capacity: 2 },
    { name: "Table B (4 Pax)", capacity: 4 },
    { name: "Table C (4 Pax)", capacity: 4 },
    { name: "Table D (6 Pax)", capacity: 6 },
  ];
  for (const t of indiraTables) {
    const table = await prisma.table.create({
      data: {
        name: t.name,
        capacity: t.capacity,
        status: "AVAILABLE",
        branchId: branchIndira.id
      }
    });
    tables.push(table);
  }
  console.log("Created tables.");

  // 5. Create Suppliers
  const suppliers = [
    { name: "Gourmet Dairy Co", contactName: "Karan Johar", phone: "9876543210", email: "orders@gourmetdairy.com", address: "Whitefield, Bengaluru", paymentTerms: "Net 15" },
    { name: "Beans & Brews Import", contactName: "Sara Ali", phone: "9876543211", email: "sales@beansandbrews.in", address: "Chikmagalur, KA", paymentTerms: "Cash on Delivery" },
    { name: "Sweetener Industries", contactName: "Rahul Mehta", phone: "9876543212", email: "info@sweeteners.com", address: "Peenya, Bengaluru", paymentTerms: "Net 30" },
    { name: "Eco Packaging Co", contactName: "Diya Roy", phone: "9876543213", email: "support@ecopack.co", address: "Bommanahalli, Bengaluru", paymentTerms: "Net 15" },
  ];
  const suppliersMap = {};
  for (const s of suppliers) {
    const created = await prisma.supplier.create({ data: s });
    suppliersMap[s.name] = created;
  }
  console.log("Created suppliers.");

  // 6. Create Ingredients
  const ingredientsHSR = [
    { name: "Milk", unit: "ml", quantity: 80000, minStockAlert: 20000, costPerUnit: 0.065, supplierId: suppliersMap["Gourmet Dairy Co"].id },
    { name: "Coffee Beans", unit: "g", quantity: 15000, minStockAlert: 5000, costPerUnit: 1.2, supplierId: suppliersMap["Beans & Brews Import"].id },
    { name: "Sugar", unit: "g", quantity: 20000, minStockAlert: 4000, costPerUnit: 0.05, supplierId: suppliersMap["Sweetener Industries"].id },
    { name: "Chocolate Syrup", unit: "ml", quantity: 5000, minStockAlert: 1000, costPerUnit: 0.35, supplierId: suppliersMap["Sweetener Industries"].id },
    { name: "Bread", unit: "pcs", quantity: 80, minStockAlert: 20, costPerUnit: 5.0, supplierId: suppliersMap["Gourmet Dairy Co"].id, expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { name: "Cheese", unit: "g", quantity: 4000, minStockAlert: 1000, costPerUnit: 0.8, supplierId: suppliersMap["Gourmet Dairy Co"].id },
    { name: "Paper Cups", unit: "pcs", quantity: 1000, minStockAlert: 200, costPerUnit: 2.5, supplierId: suppliersMap["Eco Packaging Co"].id },
  ];

  const ingredientsIndira = [
    { name: "Milk", unit: "ml", quantity: 60000, minStockAlert: 20000, costPerUnit: 0.065, supplierId: suppliersMap["Gourmet Dairy Co"].id },
    { name: "Coffee Beans", unit: "g", quantity: 12000, minStockAlert: 5000, costPerUnit: 1.2, supplierId: suppliersMap["Beans & Brews Import"].id },
    { name: "Sugar", unit: "g", quantity: 15000, minStockAlert: 4000, costPerUnit: 0.05, supplierId: suppliersMap["Sweetener Industries"].id },
    { name: "Chocolate Syrup", unit: "ml", quantity: 1500, minStockAlert: 1000, costPerUnit: 0.35, supplierId: suppliersMap["Sweetener Industries"].id }, // Low Chocolate Syrup
    { name: "Bread", unit: "pcs", quantity: 15, minStockAlert: 20, costPerUnit: 5.0, supplierId: suppliersMap["Gourmet Dairy Co"].id, expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) }, // Expiring & Low Bread
    { name: "Cheese", unit: "g", quantity: 3000, minStockAlert: 1000, costPerUnit: 0.8, supplierId: suppliersMap["Gourmet Dairy Co"].id },
    { name: "Paper Cups", unit: "pcs", quantity: 800, minStockAlert: 200, costPerUnit: 2.5, supplierId: suppliersMap["Eco Packaging Co"].id },
  ];

  const ingredientsMap = { hsr: {}, indira: {} };

  for (const ing of ingredientsHSR) {
    const created = await prisma.ingredient.create({ data: { ...ing, branchId: branchHSR.id } });
    ingredientsMap.hsr[ing.name] = created;
  }
  for (const ing of ingredientsIndira) {
    const created = await prisma.ingredient.create({ data: { ...ing, branchId: branchIndira.id } });
    ingredientsMap.indira[ing.name] = created;
  }
  console.log("Created ingredients for both branches.");

  // 7. Create Menu Items
  const menuItemsData = [
    { name: "Cold Coffee", category: "Coffee", price: 180, imageUrl: "cold-coffee.jpg" },
    { name: "Espresso", category: "Coffee", price: 120, imageUrl: "espresso.jpg" },
    { name: "Cheese Sandwich", category: "Bakery", price: 150, imageUrl: "cheese-sandwich.jpg" },
    { name: "Hot Chocolate", category: "Coffee", price: 200, imageUrl: "hot-chocolate.jpg" },
  ];

  const menuItemsMap = { hsr: {}, indira: {} };

  for (const item of menuItemsData) {
    const hsrItem = await prisma.menuItem.create({ data: { ...item, branchId: branchHSR.id } });
    menuItemsMap.hsr[item.name] = hsrItem;

    const indiraItem = await prisma.menuItem.create({ data: { ...item, branchId: branchIndira.id } });
    menuItemsMap.indira[item.name] = indiraItem;
  }
  console.log("Created menu items.");

  // 8. Create Recipe Mappings
  const recipes = [
    {
      itemName: "Cold Coffee",
      ingredients: [
        { name: "Milk", quantity: 250 },
        { name: "Coffee Beans", quantity: 15 },
        { name: "Sugar", quantity: 10 },
        { name: "Paper Cups", quantity: 1 }
      ]
    },
    {
      itemName: "Espresso",
      ingredients: [
        { name: "Coffee Beans", quantity: 18 },
        { name: "Paper Cups", quantity: 1 }
      ]
    },
    {
      itemName: "Cheese Sandwich",
      ingredients: [
        { name: "Bread", quantity: 2 },
        { name: "Cheese", quantity: 50 }
      ]
    },
    {
      itemName: "Hot Chocolate",
      ingredients: [
        { name: "Milk", quantity: 200 },
        { name: "Chocolate Syrup", quantity: 30 },
        { name: "Sugar", quantity: 5 },
        { name: "Paper Cups", quantity: 1 }
      ]
    }
  ];

  for (const recipe of recipes) {
    // Write for HSR
    const hsrMenuItem = menuItemsMap.hsr[recipe.itemName];
    for (const ingReq of recipe.ingredients) {
      await prisma.recipeItem.create({
        data: {
          menuItemId: hsrMenuItem.id,
          ingredientId: ingredientsMap.hsr[ingReq.name].id,
          quantity: ingReq.quantity
        }
      });
    }

    // Write for Indira
    const indiraMenuItem = menuItemsMap.indira[recipe.itemName];
    for (const ingReq of recipe.ingredients) {
      await prisma.recipeItem.create({
        data: {
          menuItemId: indiraMenuItem.id,
          ingredientId: ingredientsMap.indira[ingReq.name].id,
          quantity: ingReq.quantity
        }
      });
    }
  }
  console.log("Created recipe mappings.");

  // 9. Create Customers (CRM)
  const customersData = [
    { name: "Kunal Shah", phone: "+919900000001", email: "kunal@cred.club", points: 850, cashback: 420.0, membershipTier: "PLATINUM", visitCount: 24, totalSpend: 15400, lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { name: "Nikhil Kamath", phone: "+919900000002", email: "nikhil@zerodha.com", points: 480, cashback: 120.0, membershipTier: "GOLD", visitCount: 15, totalSpend: 8200, lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { name: "Shradha Sharma", phone: "+919900000003", email: "shradha@yourstory.com", points: 150, cashback: 30.0, membershipTier: "SILVER", visitCount: 6, totalSpend: 3100, lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { name: "Vijay Sharma", phone: "+919900000004", email: "vijay@paytm.com", points: 280, cashback: 90.0, membershipTier: "GOLD", visitCount: 18, totalSpend: 9800, lastVisit: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) }, // At Risk
    { name: "Ritesh Agarwal", phone: "+919900000005", email: "ritesh@oyorooms.com", points: 40, cashback: 10.0, membershipTier: "SILVER", visitCount: 2, totalSpend: 1100, lastVisit: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000) }, // Inactive
  ];

  const customers = [];
  for (const c of customersData) {
    const created = await prisma.customer.create({
      data: { ...c, branchId: branchHSR.id }
    });
    customers.push(created);
  }
  console.log("Created customer profiles.");

  // 10. Generate 30 Days of Historical Data (Sales, Waste, Expenses, Staff)
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  // Let's create orders and details
  let orderCounter = 1001;

  console.log("Generating 30 days of sales, waste, and expenses...");

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * oneDay);
    const dateStr = date.toISOString().split('T')[0];

    // Daily Sales Volume Factors:
    // Weekend multiplier (Saturday, Sunday) = 1.6
    // Weekday = 1.0
    // Event/Holiday (e.g., June 5 - Environment Day / Friday night) = 1.3
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const multiplier = isWeekend ? 1.6 : 1.0;

    // HSR Daily Orders count (30 - 50 on weekdays, 50 - 80 on weekends)
    const hsrOrderCount = Math.floor((30 + Math.random() * 20) * multiplier);
    // Indiranagar Daily Orders count (20 - 40 on weekdays, 40 - 65 on weekends)
    const indiraOrderCount = Math.floor((20 + Math.random() * 20) * multiplier);

    // Generate orders for HSR
    await createDailyOrders(branchHSR.id, hsrOrderCount, date, users["cashier.hsr@CafeOS.ai"].id, "hsr");

    // Generate orders for Indiranagar
    await createDailyOrders(branchIndira.id, indiraOrderCount, date, users["cashier.indira@CafeOS.ai"].id, "indira");

    // Generate Waste (occasional waste occurrences)
    if (Math.random() < 0.3) {
      // HSR Waste - Bread or Milk
      const ing = Math.random() > 0.5 ? ingredientsMap.hsr["Bread"] : ingredientsMap.hsr["Milk"];
      const wasteQty = ing.name === "Bread" ? Math.floor(1 + Math.random() * 4) : Math.floor(500 + Math.random() * 1500);
      await prisma.wasteRecord.create({
        data: {
          ingredientId: ing.id,
          quantity: wasteQty,
          cost: wasteQty * ing.costPerUnit,
          reason: Math.random() > 0.5 ? "EXPIRED" : "SPOILED",
          branchId: branchHSR.id,
          recordedAt: date
        }
      });
    }

    if (Math.random() < 0.4) {
      // Indiranagar Waste (simulating a known waste issue: higher chocolate syrup waste)
      const ing = Math.random() > 0.4 ? ingredientsMap.indira["Chocolate Syrup"] : ingredientsMap.indira["Bread"];
      const wasteQty = ing.name === "Chocolate Syrup" ? Math.floor(100 + Math.random() * 300) : Math.floor(1 + Math.random() * 5);
      await prisma.wasteRecord.create({
        data: {
          ingredientId: ing.id,
          quantity: wasteQty,
          cost: wasteQty * ing.costPerUnit,
          reason: "UNSOLD",
          branchId: branchIndira.id,
          recordedAt: date
        }
      });
    }

    // Daily Expenses (Utilities, Rent amortized, Raw Material procurement)
    // Rent: ₹60,000/month = ₹2,000/day
    // Utilities: ₹10,000/month = ₹333/day
    await prisma.expense.create({
      data: {
        category: "RENT",
        amount: 2000,
        date: date,
        description: "Amortized Daily Rent",
        branchId: branchHSR.id
      }
    });
    await prisma.expense.create({
      data: {
        category: "RENT",
        amount: 2000,
        date: date,
        description: "Amortized Daily Rent",
        branchId: branchIndira.id
      }
    });

    await prisma.expense.create({
      data: {
        category: "UTILITIES",
        amount: 333,
        date: date,
        description: "Daily Electricity & Water share",
        branchId: branchHSR.id
      }
    });
    await prisma.expense.create({
      data: {
        category: "UTILITIES",
        amount: 333,
        date: date,
        description: "Daily Electricity & Water share",
        branchId: branchIndira.id
      }
    });

    // Materials procurement (every Tuesday / Friday)
    if (dayOfWeek === 2 || dayOfWeek === 5) {
      await prisma.expense.create({
        data: {
          category: "INVENTORY",
          amount: Math.floor(5000 + Math.random() * 5000),
          date: date,
          description: "Weekly Ingredient Refill",
          branchId: branchHSR.id
        }
      });
      await prisma.expense.create({
        data: {
          category: "INVENTORY",
          amount: Math.floor(4000 + Math.random() * 4000),
          date: date,
          description: "Weekly Ingredient Refill",
          branchId: branchIndira.id
        }
      });
    }

    // Weekly Salaries (Saturdays)
    if (dayOfWeek === 6) {
      // HSR staff payroll share
      await prisma.expense.create({
        data: {
          category: "PAYROLL",
          amount: 8000,
          date: date,
          description: "Staff Weekly Salary",
          branchId: branchHSR.id
        }
      });
      // Indiranagar staff payroll share
      await prisma.expense.create({
        data: {
          category: "PAYROLL",
          amount: 7500,
          date: date,
          description: "Staff Weekly Salary",
          branchId: branchIndira.id
        }
      });
    }

    // Create Staff Shifts & Attendance
    const staffHSR = [users["cashier.hsr@CafeOS.ai"].id, users["kitchen.hsr@CafeOS.ai"].id];
    const staffIndira = [users["cashier.indira@CafeOS.ai"].id, users["kitchen.indira@CafeOS.ai"].id];

    for (const userId of staffHSR) {
      const shiftStart = new Date(date);
      shiftStart.setHours(9, 0, 0);
      const shiftEnd = new Date(date);
      shiftEnd.setHours(17, 0, 0);

      await prisma.shift.create({
        data: { userId, startTime: shiftStart, endTime: shiftEnd, branchId: branchHSR.id }
      });

      // Attendance check-in (sometimes late)
      const checkIn = new Date(shiftStart);
      checkIn.setMinutes(Math.floor(Math.random() * 20)); // Up to 20 mins late

      const checkOut = new Date(shiftEnd);
      checkOut.setMinutes(Math.floor(-10 + Math.random() * 20));

      await prisma.attendance.create({
        data: {
          userId,
          date: date,
          checkIn,
          checkOut,
          status: "PRESENT",
          branchId: branchHSR.id
        }
      });
    }

    for (const userId of staffIndira) {
      const shiftStart = new Date(date);
      shiftStart.setHours(11, 0, 0);
      const shiftEnd = new Date(date);
      shiftEnd.setHours(19, 0, 0);

      await prisma.shift.create({
        data: { userId, startTime: shiftStart, endTime: shiftEnd, branchId: branchIndira.id }
      });

      // Indiranagar staff is sometimes late, Amit Sen is particularly late to test workforce dashboard
      const delay = userId === users["cashier.indira@CafeOS.ai"].id ? Math.floor(15 + Math.random() * 30) : Math.floor(Math.random() * 10);
      const checkIn = new Date(shiftStart);
      checkIn.setMinutes(delay);

      const checkOut = new Date(shiftEnd);
      await prisma.attendance.create({
        data: {
          userId,
          date: date,
          checkIn,
          checkOut,
          status: "PRESENT",
          branchId: branchIndira.id
        }
      });
    }
  }

  // Create active marketing campaigns
  await prisma.campaign.create({
    data: {
      name: "Weekend Cappuccino Combo WhatsApp Campaign",
      channel: "WHATSAPP",
      content: "Hi [Name]! Enjoy 15% OFF on our best-selling cheese sandwich + hot chocolate combo this Saturday. Flash this at checkout!",
      triggerEvent: "INACTIVE_30_DAYS",
      status: "ACTIVE",
      branchId: branchHSR.id
    }
  });

  await prisma.campaign.create({
    data: {
      name: "VIP Birthday SMS",
      channel: "SMS",
      content: "Happy Birthday! Claim your complimentary Cold Coffee at CafeOS Premium. We can't wait to celebrate with you!",
      triggerEvent: "BIRTHDAY",
      status: "ACTIVE",
      branchId: branchHSR.id
    }
  });

  // Create Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: users["owner@CafeOS.ai"].id,
      action: "CAMPAIGN_CREATE",
      details: JSON.stringify({ campaignName: "Weekend Combo", channel: "WHATSAPP" }),
      branchId: branchHSR.id
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: users["manager.hsr@CafeOS.ai"].id,
      action: "PRICE_UPDATE",
      details: JSON.stringify({ menuItem: "Cold Coffee", oldPrice: 170, newPrice: 180 }),
      branchId: branchHSR.id
    }
  });

  console.log("Seeding complete. Verification metrics:");
  const ordersCount = await prisma.order.count();
  const expensesCount = await prisma.expense.count();
  const wasteCount = await prisma.wasteRecord.count();
  console.log(`- Orders Generated: ${ordersCount}`);
  console.log(`- Expenses Logged: ${expensesCount}`);
  console.log(`- Waste Records: ${wasteCount}`);
}

async function createDailyOrders(branchId, count, date, cashierId, branchName) {
  const isHSR = branchName === "hsr";

  // Choose menu items available for this branch
  // HSR: items Cold Coffee, Espresso, Cheese Sandwich, Hot Chocolate
  const menuItems = ["Cold Coffee", "Espresso", "Cheese Sandwich", "Hot Chocolate"];

  for (let c = 0; c < count; c++) {
    // Generate order timestamps throughout the day (9 AM to 9 PM)
    const orderTime = new Date(date);
    orderTime.setHours(9 + Math.floor(Math.random() * 12));
    orderTime.setMinutes(Math.floor(Math.random() * 60));

    // Choose random items
    const orderItems = [];
    const itemsCount = Math.floor(1 + Math.random() * 3); // 1-3 items
    let subtotal = 0;

    for (let o = 0; o < itemsCount; o++) {
      const idx = Math.floor(Math.random() * menuItems.length);
      const itemName = menuItems[idx];
      const quantity = Math.floor(1 + Math.random() * 2); // 1-2
      const itemPrice = itemName === "Cold Coffee" ? 180 :
        itemName === "Espresso" ? 120 :
          itemName === "Cheese Sandwich" ? 150 : 200; // Hot chocolate

      orderItems.push({
        name: itemName,
        quantity,
        price: itemPrice
      });
      subtotal += itemPrice * quantity;
    }

    // Apply occasional loyalty discount
    const customer = Math.random() > 0.7 ? customersData[Math.floor(Math.random() * customersData.length)] : null;
    let discount = 0;
    if (customer && Math.random() > 0.5) {
      discount = Math.floor(subtotal * 0.1); // 10% loyalty discount
    }

    const tax = Math.floor((subtotal - discount) * 0.05); // 5% VAT/GST
    const total = subtotal - discount + tax;

    const paymentMethods = ["UPI", "CASH", "CARD", "WALLET", "SPLIT"];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const types = ["DINE_IN", "TAKEAWAY", "DELIVERY", "QR_ORDER"];
    const orderType = types[Math.floor(Math.random() * types.length)];

    const oNumber = `FC-${branchName.toUpperCase()}-${date.getTime()}-${c}-${Math.floor(Math.random() * 1000)}`;

    // Get real DB menu item IDs
    // HSR Menu items map or Indira Menu items map
    const itemsDb = [];

    // Check customer ID mapping
    let customerDbId = null;
    if (customer) {
      const dbCust = await prisma.customer.findFirst({
        where: { phone: customer.phone }
      });
      if (dbCust) {
        customerDbId = dbCust.id;

        // Update customer cumulative stats
        await prisma.customer.update({
          where: { id: dbCust.id },
          data: {
            visitCount: { increment: 1 },
            totalSpend: { increment: total },
            points: { increment: Math.floor(total / 100) },
            cashback: { increment: total * 0.02 },
            lastVisit: orderTime
          }
        });
      }
    }

    const createdOrder = await prisma.order.create({
      data: {
        orderNumber: oNumber,
        type: orderType,
        status: "COMPLETED",
        paymentStatus: "PAID",
        paymentMethod: paymentMethod,
        subtotal,
        discount,
        tax,
        total,
        branchId,
        userId: cashierId,
        customerId: customerDbId,
        createdAt: orderTime,
        updatedAt: orderTime
      }
    });

    // Create order items
    // Since we seed menu items, search by name
    for (const item of orderItems) {
      const dbMenuItem = await prisma.menuItem.findFirst({
        where: { name: item.name, branchId }
      });
      if (dbMenuItem) {
        await prisma.orderItem.create({
          data: {
            orderId: createdOrder.id,
            menuItemId: dbMenuItem.id,
            quantity: item.quantity,
            price: item.price
          }
        });
      }
    }

    // Split Payments
    if (paymentMethod === "SPLIT") {
      const splitAmount1 = Math.floor(total * 0.6);
      const splitAmount2 = total - splitAmount1;
      await prisma.splitPayment.create({
        data: { orderId: createdOrder.id, method: "UPI", amount: splitAmount1, createdAt: orderTime }
      });
      await prisma.splitPayment.create({
        data: { orderId: createdOrder.id, method: "CASH", amount: splitAmount2, createdAt: orderTime }
      });
    }
  }
}

// Fixed static customer list for reference
const customersData = [
  { name: "Kunal Shah", phone: "+919900000001" },
  { name: "Nikhil Kamath", phone: "+919900000002" },
  { name: "Shradha Sharma", phone: "+919900000003" },
  { name: "Vijay Sharma", phone: "+919900000004" },
  { name: "Ritesh Agarwal", phone: "+919900000005" },
];

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
