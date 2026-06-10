import { test } from "../fixtures/baseFixture";
import { LoginPage } from "../pages/growsSmartLogin";
import { PurchaseOrderPage } from "../pages/purchaseOrderPage";

test.describe("Purchase Order — Full E2E Flow", () => {

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login();
    });

    test("Create Purchase Order - Set 2 - Mohamed Supplier @smoke @regression", async ({ page }) => {

        const purchase = new PurchaseOrderPage(page);

        await purchase.createPurchaseOrder();
    });

});
