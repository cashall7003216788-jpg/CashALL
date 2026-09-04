async function main() {
  const baseUrl = "http://localhost:3000";

  console.log("1. Testing Agent Login for SANGEET SHAW...");
  const loginRes = await fetch(`${baseUrl}/api/v1/agent/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "SANGEET SHAW",
      password: "Ank933967@",
    }),
  });
  const loginData = await loginRes.json();
  console.log("Login Status:", loginRes.status, loginData);

  console.log("\n2. Testing Agent Orders for SANGEET SHAW...");
  const ordersRes = await fetch(`${baseUrl}/api/v1/agent/orders?phone=6289477287&name=SANGEET+SHAW`);
  const ordersData = await ordersRes.json();
  console.log("Orders Status:", ordersRes.status, "Count:", ordersData.orders?.length);
  if (ordersData.orders) {
    ordersData.orders.forEach((o: any) => console.log(` - ${o.orderNumber} | ${o.status} | ₹${o.payoutAmount || o.finalPrice}`));
  }

  console.log("\n3. Testing POST /api/v1/quotes/calculate with Flawless Screen...");
  const calcRes = await fetch(`${baseUrl}/api/v1/quotes/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      variantId: "550e8400-e29b-41d4-a716-446655440021",
      answers: [
        {
          questionId: "550e8400-e29b-41d4-a716-446655440032",
          questionTitle: "Screen Condition",
          group: "SCREEN",
          optionId: "550e8400-e29b-41d4-a716-446655440043",
          optionLabel: "Flawless / Like New",
        },
      ],
    }),
  });
  const calcData = await calcRes.json();
  console.log("Calc Status:", calcRes.status, "Quote:", {
    basePrice: calcData.data?.basePrice,
    deductions: calcData.data?.totalDeductions,
    estimated: calcData.data?.estimatedPrice,
  });
}

main().catch(console.error);
