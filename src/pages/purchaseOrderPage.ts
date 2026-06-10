import { BasePage } from "./basePage";
import { Page, Locator, expect } from "@playwright/test";
import { Runtime } from "@utils/runtimeStore";
import { set } from "@utils/set";

const set2 = set("purchaseOrderData", 2);

export class PurchaseOrderPage extends BasePage {

    // ── Navigation ────────────────────────────────────────────────────────────
    typeToSearchField: Locator;
    searchField: Locator;
    purchaseOrdersDropdown: Locator;
    createPurchaseOrderButton: Locator;

    // ── Warehouse ─────────────────────────────────────────────────────────────
    forStockRadio: Locator;
    warehouseDropdown: Locator;
    warehouseSelect: Locator;
    taxUnit: Locator;
    selectBranch: Locator;
    doneButton: Locator;

    // ── Supplier Details ──────────────────────────────────────────────────────
    supplierDropdown: Locator;
    deliveryAddressLabel: Locator;
    deliveryAddressDropdown: Locator;
    purchaseExecutiveDropdown: Locator;

    // ── Item Details ──────────────────────────────────────────────────────────
    addItemsButton: Locator;
    itemTextbox: Locator;
    itemOption: Locator;
    quantityTextbox: Locator;
    rateTextbox: Locator;
    amountTextbox: Locator;

    // ── Order Brand ───────────────────────────────────────────────────────────
    orderBrandDropdown: Locator;
    orderBrandOption: Locator;

    // ── Actions ───────────────────────────────────────────────────────────────
    actionsButton: Locator;
    saveOption: Locator;
    submitOption: Locator;

    // ── Status & Alerts ───────────────────────────────────────────────────────
    draftStatus: Locator;
    interstatePartnerAlert: Locator;
    noContinueLocalGST: Locator;

    // ── Popups ────────────────────────────────────────────────────────────────
    yesSubmitButton: Locator;
    yesApproveButton: Locator;
    yesButton: Locator;

    // ── Approval ──────────────────────────────────────────────────────────────
    approveThisDocumentButton: Locator;
    approvedStatus: Locator;

    // ── Receipt Note (GRN) ────────────────────────────────────────────────────
    relatedDocs: Locator;
    receiptNoteGRNButton: Locator;
    selectItemsButtonGRN: Locator;
    poNo: Locator;
    doneButtonGRN: Locator;

    // ── Purchase Invoice ──────────────────────────────────────────────────────
    relatedDocs1: Locator;
    purchaseInvoiceButton: Locator;
    supplierInvoiceDate: Locator;
    documentDate: Locator;
    dueDate: Locator;
    supplierInvoiceNo: Locator;
    selectItemsButtonPI: Locator;
    receiptNo: Locator;
    doneButton3: Locator;

    // ── Close Buttons ─────────────────────────────────────────────────────────
    closeButton: Locator;
   

    // ── Final Status ──────────────────────────────────────────────────────────
    approved1Status: Locator;
    fullyReceived1Status: Locator;
    fullyInvoicedStatus: Locator;

    constructor(page: Page) {
        super(page);

        // Navigation
        this.typeToSearchField         = this.getLocator("(//*[@class='select-control__input'])[last()]");
        this.searchField               = this.getLocator("//div[contains(@class,'main-container')]//input[@type='text']");
        this.purchaseOrdersDropdown    = this.getLocator("//div[@role='option']");
        this.createPurchaseOrderButton = this.getLocator("//span[normalize-space()='Create Purchase Order']");

        // Warehouse
        this.forStockRadio             = this.getLocator("//label[.//div[normalize-space()='For stock']]//div[contains(@class,'radio-icon-inner-circle')]");
        this.warehouseDropdown         = this.getLocator("(//*[@class='select-control__input'])[last()-1]");
        this.warehouseSelect           = this.getLocator("//div[@role='listbox']/div[3]");
        this.taxUnit                   = this.getLocator("(//*[@class='select-control__input'])[last()]");
        this.selectBranch              = this.getLocator("//div[normalize-space()='Chennai Branch']");
        this.doneButton                = this.getLocator("//span[normalize-space()='Done']");

        // Supplier Details
        this.supplierDropdown          = this.getLocator(`//*[text()='Supplier']/../..//*[text()='Select']/..//input`);
        this.deliveryAddressLabel      = this.getLocator(`//*[text()='Delivery Address']`);
        this.deliveryAddressDropdown   = this.getLocator(`//*[text()='Delivery Address']/../..//*[text()='Select']/..//input`);
        this.purchaseExecutiveDropdown = this.getLocator(`//*[text()='Purchase Executive']/../..//*[text()='Select']/..//input`);

        // Item Details
        this.addItemsButton            = this.getLocator("//span[normalize-space()='Add items']");
        this.itemTextbox               = this.getLocator("//label[text()='Item']/../following-sibling::div//input");
        this.itemOption                = this.getLocator("//div[@role='listbox']/div[1]");
        this.quantityTextbox           = this.getLocator('//*[text()="Quantity"]/../..//*[@type="number"]');
        this.rateTextbox               = this.getLocator("//*[text()='Rate']/../..//*[@type='number']");
        this.amountTextbox             = this.getLocator('(//*[text()="Amount"]/../..//*[@type="number"])[last()]');

        // Order Brand
        this.orderBrandDropdown        = this.getLocator('(//*[text()="Order Brand"]/../..//input)[3]');
        this.orderBrandOption          = this.getLocator("//div[@role='listbox']/div[1]");

        // Actions
        this.actionsButton             = this.getLocator('(//*[text()="Action"])[last()]');
        this.saveOption                = this.getLocator("//div[normalize-space()='Save']");
        this.submitOption              = this.getLocator("//span[normalize-space()='Submit'] | //div[normalize-space()='Submit']");

        // Status & Alerts
        this.draftStatus               = this.getLocator("//span[normalize-space()='Draft']");
        this.interstatePartnerAlert    = this.getLocator("//h1[normalize-space()='Interstate partner alert']");
        this.noContinueLocalGST        = this.getLocator("//button//span[normalize-space()='No, continue with local GST']");

        // Popups
        this.yesSubmitButton           = this.getLocator("//*[contains(text(),'Yes, submit')]");
        this.yesApproveButton          = this.getLocator("//*[contains(text(),'Yes, approve it')]");
        this.yesButton                 = this.getLocator("//*[contains(text(),'Yes')]");

        // Approval
        this.approveThisDocumentButton = this.getLocator("//*[text()='Approve this document']");
        this.approvedStatus            = this.page.getByText("Approved");

        // Receipt Note (GRN)
        this.relatedDocs               = this.getLocator('//*[text()[normalize-space() = "Related Docs"]]');
        this.receiptNoteGRNButton      = this.getLocator("//span[text()[normalize-space() = 'Receipt Note (GRN)']]");
        this.selectItemsButtonGRN      = this.getLocator("//span[normalize-space()='Select items']");
        this.poNo                      = this.getLocator('//div[contains(@class, "picking-tbl-row") and contains(@class, "undefined") and .//span[text()[normalize-space() = "PO No."]]]//*[local-name() = "svg"]');
        this.doneButtonGRN             = this.getLocator("//span[normalize-space()='Done']");

        // Purchase Invoice
        this.relatedDocs1              = this.getLocator('//*[text()[normalize-space() = "Related Docs"]]');
        this.purchaseInvoiceButton     = this.getLocator("//span[normalize-space()='Purchase Invoice']");
        this.supplierInvoiceDate       = this.getLocator("//label[contains(normalize-space(),'Supplier Invoice Date')]/../following-sibling::div//input");
        this.documentDate              = this.getLocator('//label[text()="Document Date"]/../following-sibling::div//input');
        this.dueDate                   = this.getLocator("//label[contains(normalize-space(),'Due Date')]/../following-sibling::div//input");
        this.supplierInvoiceNo         = this.page.getByPlaceholder("Type here");
        this.selectItemsButtonPI       = this.getLocator("//span[text()[normalize-space() = 'Select Items']]");
        this.receiptNo                 = this.getLocator('//div[contains(@class, "picking-tbl-row") and contains(@class, "undefined") and .//span[text()[normalize-space() = "Receipt No."]]]//*[local-name() = "svg"]');
        this.doneButton3               = this.getLocator("//span[normalize-space()='Done']");

        // Close Buttons
       
         this.closeButton            = this.getLocator('(//*[text()="Close"])[last()-1]');
        // Final Status
        this.approved1Status           = this.page.getByText("Approved");
        this.fullyReceived1Status      = this.getLocator('//td[text()[normalize-space() = "Fully received"]]')
        this.fullyInvoicedStatus       = this.getLocator('//td[text()[normalize-space() = "Fully invoiced"]]')
    }

    // =========================================================================
    //  PRIVATE HELPERS
    // =========================================================================

    private async clickAction(option: Locator) {
        await this.click(this.actionsButton);
        await this.click(option);
    }

    private async handleAllPopups() {
        await this.ifVisible(this.interstatePartnerAlert, async () => {
            await this.click(this.noContinueLocalGST);
            console.log("✅ Interstate alert → No, continue with local GST");
        }, undefined, 3000);

        await this.ifVisible(this.yesSubmitButton, async () => {
            await this.click(this.yesSubmitButton);
            console.log("✅ Yes, submit → clicked");
        }, undefined, 3000);

        await this.ifVisible(this.yesApproveButton, async () => {
            await this.click(this.yesApproveButton);
            console.log("✅ Yes, approve it → clicked");
        }, undefined, 3000);

        await this.ifVisible(this.yesButton, async () => {
            await this.click(this.yesButton);
            console.log("✅ Yes → clicked");
        }, undefined, 3000);
    }

    private async approveUntilGone(maxApprovals = 10) {
        await this.handleAllPopups();

        const firstVisible = await this.approveThisDocumentButton
            .waitFor({ state: "visible", timeout: 15000 })
            .then(() => true)
            .catch(() => false);

        if (!firstVisible) {
            console.log("⚠️ Approve button not visible — skipping");
            return;
        }

        let count = 0;
        while (count < maxApprovals) {
            const isVisible = await this.approveThisDocumentButton
                .waitFor({ state: "visible", timeout: 5000 })
                .then(() => true)
                .catch(() => false);

            if (!isVisible) {
                console.log(`✅ Approve button gone — approval complete (${count} click(s))`);
                break;
            }

            console.log(`🔄 Approve click ${count + 1}`);
            await this.click(this.approveThisDocumentButton);
            await this.handleAllPopups();
            await this.waitForLoadState("domcontentloaded");
            count++;
        }
    }

    // ✅ todayDate — returns today in en-GB format (DD/MM/YYYY)
    private get todayDate(): string {
        return new Date().toLocaleDateString("en-GB");
    }

    private get randomInvoiceNo(): string {
        return String(Math.floor(Math.random() * 9000) + 1000);
    }

    // =========================================================================
    //  MASTER METHOD — Full E2E Flow (Steps 2–81)
    // =========================================================================

    async createPurchaseOrder() {

        // ── Steps 2–5: Open Purchase Order ───────────────────────────────────
        await this.click(this.typeToSearchField);
        await this.type(this.searchField, "Purchase Order");
        await this.click(this.purchaseOrdersDropdown);
        await this.click(this.createPurchaseOrderButton);

        // ── Steps 6–11: Select Warehouse ─────────────────────────────────────
        await this.click(this.forStockRadio);
        await this.click(this.warehouseDropdown);
        await this.click(this.warehouseSelect);
        await this.click(this.taxUnit);
        await this.click(this.selectBranch);
        await this.click(this.doneButton);

        // ── Steps 12–14: Select Supplier ─────────────────────────────────────
        await this.click(this.supplierDropdown);
        
        await this.click(this.getLocator(`//*[text()='${set2.supplier}']`));

        // ── Steps 15–18: Select Delivery Address ─────────────────────────────
        await this.scrollIntoView(this.deliveryAddressLabel);
        await this.click(this.deliveryAddressDropdown);
        await this.click(this.getLocator(`//*[text()='${set2.deliveryAddress}']`));

        // ── Steps 19–21: Select Purchase Executive ───────────────────────────
        await this.click(this.purchaseExecutiveDropdown);
        await this.click(this.getLocator(`//*[text()='${set2.purchaseExecutive}']`));

        // ── Steps 22–27: Add Item ─────────────────────────────────────────────
        await this.click(this.addItemsButton);
        await this.pause(200);
        await this.type(this.itemTextbox, String(set2.item1));
        await this.click(this.itemOption);

        // ── Steps 28–29: Enter Quantity ───────────────────────────────────────
        await this.clear(this.quantityTextbox);
        await this.pause(200);
        await this.type(this.quantityTextbox, String(set2.quantity));

        // ── Step 30: Enter Rate ───────────────────────────────────────────────
        await this.clear(this.rateTextbox);
        await this.pause(200);
        await this.type(this.rateTextbox, String(set2.price));

        // ── Steps 31–32: Verify Amount ────────────────────────────────────────
        const expectedAmount = Number(set2.quantity) * Number(set2.price);
        await this.page.waitForFunction(
            (selector) => {
                const el = document.evaluate(
                    selector, document, null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE, null
                ).singleNodeValue as HTMLInputElement;
                return el && el.value !== "" && el.value !== "0";
            },
            '(//*[text()="Amount"]/../..//*[@type="number"])[last()]',
            { timeout: 10000 }
        );
        const rawValue     = await this.amountTextbox.first().evaluate((el) => (el as HTMLInputElement).value);
        const actualAmount = Number(rawValue.replace(/,/g, ""));
        expect(actualAmount).toBe(expectedAmount);
        console.log(`✅ Amount → Expected: ${expectedAmount} | Actual: ${actualAmount}`);

        // ── Steps 33–36: Select Order Brand ──────────────────────────────────
        await this.click(this.orderBrandDropdown);
        await this.click(this.orderBrandOption);
        await this.click(this.doneButton);

        // ── Steps 37–40: Save → Store Order Name → Verify Draft ──────────────
        await this.clickAction(this.saveOption);
        await this.handleAllPopups();

        const url     = this.page.url();
        const poMatch = url.match(/PO-[\w]+/);
        Runtime.set("OrderName", poMatch ? poMatch[0] : "");
        console.log(`Order Name: ${Runtime.get("OrderName")}`);
        await this.assertElementVisible(this.draftStatus);

        // ── Steps 41–47: Submit → Approve PO ─────────────────────────────────
        await this.clickAction(this.submitOption);
        await this.handleAllPopups();
        await this.approveUntilGone(5);
        await this.assertElementVisible(this.approvedStatus);

        // ── Steps 48–56: Related Docs → GRN ──────────────────────────────────
        await this.click(this.relatedDocs);
        await this.click(this.receiptNoteGRNButton);

        // GRN flow — select items → PO No → Done → Submit → Approve
        await this.click(this.selectItemsButtonGRN);
        await this.click(this.poNo);
        await this.click(this.doneButtonGRN);
        await this.clickAction(this.submitOption);
        await this.handleAllPopups();
        await this.approveUntilGone(5);
        console.log(" GRN Approved");

        // Navigate to Purchase Invoice via Related Docs
        await this.click(this.relatedDocs1);
        await this.click(this.purchaseInvoiceButton);

        // ── Steps 57–75: Purchase Invoice ────────────────────────────────────

        // Supplier Invoice Date — from BasePage.fillDatePicker
        // Calendar popup → clicks today's circled date automatically
        await this.ifVisible(this.supplierInvoiceDate, async () => {
         await this.fillDatePicker(this.supplierInvoiceDate, this.todayDate);
        }, undefined, 5000);

        // Document Date — from BasePage.fillDatePicker
        // Text input → fill() + Tab
        await this.fillDatePicker(this.documentDate, this.todayDate);

        // Due Date — from BasePage.fillDatePicker
        // Calendar popup → clicks today's circled date automatically
        await this.fillDatePicker(this.dueDate, this.todayDate);

        // Supplier Invoice No
        await this.type(this.supplierInvoiceNo, this.randomInvoiceNo);

        // Select Items → Receipt No → Done
        await this.click(this.selectItemsButtonPI);
        await this.click(this.receiptNo);
        await this.click(this.doneButton3);

        // Submit PI
        await this.clickAction(this.submitOption);
        await this.handleAllPopups();

        // Approve PI
        await this.approveUntilGone(3);
        await this.whileVisible(this.closeButton, async () => {

            await this.click(this.closeButton);
            console.log("Clicked Close button, waiting for it to disappear...");

            await this.page.waitForTimeout(2000);
        
        }, undefined,);
    

        // ── Steps 79–81: Verify Final Statuses ───────────────────────────────
        await this.assertElementVisible(this.approved1Status);
        console.log(`Approved`);

        await this.assertElementVisible(this.fullyReceived1Status);
        console.log(` Fully Received`);

        await this.assertElementVisible(this.fullyInvoicedStatus);
        console.log(` Fully Invoiced`);
    }
}