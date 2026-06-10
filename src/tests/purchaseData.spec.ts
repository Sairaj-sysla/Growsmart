import { test }                                 from "@playwright/test";
import { LoginPage }                            from "../pages/growsSmartLogin";
import { PurchaseOrderPage, PurchaseOrderData } from "../pages/purchaseDataSet";
import { loadTestData }                         from "../utils/dataFilter";

// ============================================================================
//  DATA-DRIVEN CONFIG — mirrors Testsigma UI settings
// ============================================================================
//
//  ┌─────────────────────────────────────┐
//  │ Test Data Profile  : Purchase Order │
//  │ Data Driven        : ✅ ON          │
//  │ Filter Type        : Set Name       │
//  │ Comparison Metric  : Between        │
//  │ Data iterates from : Set 2          │
//  │ Data iterates to   : Set 3          │
//  │ ETF enabled steps  : All enabled    │
//  └─────────────────────────────────────┘
//
//  ✅ ENV override (CI/CD):
//     TEST_SETS="Set 1,Set 2" npx playwright test
//     TEST_SETS="Set 3"       npx playwright test --grep "@smoke"

const testSets: PurchaseOrderData[] = loadTestData<PurchaseOrderData>("purchaseOrderData", {
    filterType:  "setName",
    comparison:  "between",
    from:        "Set 1",
    to:          "Set 2",
    onlyEnabled: true,
});

// ============================================================================
//  GENERATED TESTS — one per matching enabled set
// ============================================================================

test.describe(`Purchase Order — Data Driven E2E | ${testSets.length} set(s)`, () => {

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login();
    });

    for (const data of testSets) {

        test(
            // ✅ Test name includes set info — easy to identify in reports
            `[${data.setName}] ${data.supplier} | Qty:${data.quantity} × ₹${data.price} @smoke @regression`,
            async ({ page }) => {

                // ✅ Log test data at start of each test for traceability
                console.log(`\n${"─".repeat(60)}`);
                console.log(`📋 ${data.setName}: ${data.description ?? ""}`);
                console.log(`   Supplier         : ${data.supplier}`);
                console.log(`   Delivery Address : ${data.deliveryAddress}`);
                console.log(`   Purchase Exec    : ${data.purchaseExecutive}`);
                console.log(`   Item             : ${data.item1}`);
                console.log(`   Qty * Price      : ${data.quantity} × ₹${data.price}`);
                console.log(`   Expected Amount  : ₹${Number(data.quantity) * Number(data.price)}`);
                console.log(`${"─".repeat(60)}\n`);

                const purchase = new PurchaseOrderPage(page);
                await purchase.createPurchaseOrder(data);
            }
        );
    }
});