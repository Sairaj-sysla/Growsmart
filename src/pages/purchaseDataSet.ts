import { BasePage } from "./basePage";
import { Page, Locator, expect } from "@playwright/test";
import { Runtime } from "@utils/runtimeStore";

// ============================================================================
//  TEST DATA INTERFACE — matches JSON structure
// ============================================================================
export interface PurchaseOrderData {
    setName:           string;
    description?:      string;           // optional — shown in test logs
    enabled:           boolean;
    supplier:          string;
    deliveryAddress:   string;
    purchaseExecutive: string;
    item1:             string;
    quantity:          number | string;  // JSON has numbers, String() used on input
    price:             number | string;  // JSON has numbers, String() used on input
}

// ✅ str() — safely converts number | string | undefined → string
// Use instead of String() to handle undefined gracefully
export function str(value: number | string | undefined): string {
    if (value === undefined || value === null) return "";
    return String(value);
}

// ✅ num() — safely converts number | string → number
// Use for calculations like expectedAmount
export function num(value: number | string | undefined): number {
    if (value === undefined || value === null) return 0;
    return Number(value);
}

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

    // ── Close Button ──────────────────────────────────────────────────────────
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

        // Close Button
        this.closeButton               = this.getLocator('(//*[text()="Close"])[last()-1]');

        // Final Status
        this.approved1Status           = this.page.getByText("Approved");
        this.fullyReceived1Status      = this.getLocator('//td[text()[normalize-space() = "Fully received"]]');
        this.fullyInvoicedStatus       = this.getLocator('//td[text()[normalize-space() = "Fully invoiced"]]');
    }

    // =========================================================================
    //  PRIVATE HELPERS
    // =========================================================================

    private async clickAction(option: Locator) {
        await this.click(this.actionsButton);
        await this.click(option);
    }

    private async handleSubmitPopups() {
        await this.ifVisible(this.interstatePartnerAlert, async () => {
            await this.click(this.noContinueLocalGST);
            console.log("Interstate alert → clicked");
        });
        await this.ifVisible(this.yesSubmitButton, async () => {
            await this.click(this.yesSubmitButton);
            console.log("Yes, submit → clicked");
        });
    }

    private async handleApprovePopups() {
        await this.ifVisible(this.yesApproveButton, async () => {
            await this.click(this.yesApproveButton);
            console.log("Yes, approve it → clicked");
        });
        await this.ifVisible(this.interstatePartnerAlert, async () => {
            await this.click(this.noContinueLocalGST);
            console.log("Interstate alert → clicked");
        });
    }

    private async approveUntilGone(maxApprovals = 10) {
        const firstVisible = await this.approveThisDocumentButton
            .waitFor({ state: "visible", timeout: 15000 })
            .then(() => true).catch(() => false);

        if (!firstVisible) {
            console.log(" Approve button not visible — skipping");
            return;
        }

        let count = 0;
        while (count < maxApprovals) {
            const isVisible = await this.approveThisDocumentButton
                .waitFor({ state: "visible", timeout: 5000 })
                .then(() => true).catch(() => false);

            if (!isVisible) {
                console.log(`Approve done (${count} click(s))`);
                break;
            }

            console.log(` Approve click ${count + 1}`);
            await this.click(this.approveThisDocumentButton);
            await this.handleApprovePopups();
            await this.waitForLoadState("domcontentloaded");
            count++;
        }
    }

    private get todayDate(): string {
        return new Date().toLocaleDateString("en-GB");
    }

    private get randomInvoiceNo(): string {
        return String(Math.floor(Math.random() * 9000) + 1000);
    }

    // =========================================================================
    //  MASTER METHOD — accepts full data object from JSON
    //   No hardcoded set index — pure data driven
    // =========================================================================

    async createPurchaseOrder(data: PurchaseOrderData) {

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
        await this.waitForElementIsVisible(this.supplierDropdown);
        await this.pause(300);
        await this.type(this.supplierDropdown, String(data.supplier));
        await this.click(this.getLocator(`//*[@role='option' and contains(normalize-space(),'${String(data.supplier)}')]`));

        // ── Steps 15–18: Select Delivery Address ─────────────────────────────
        await this.scrollIntoView(this.deliveryAddressLabel);
        await this.click(this.deliveryAddressDropdown);
        await this.waitForElementIsVisible(this.deliveryAddressDropdown);
        await this.pause(300);
        await this.type(this.deliveryAddressDropdown, String(data.deliveryAddress));
        await this.click(this.getLocator(`//*[@role='option' and contains(normalize-space(),'${String(data.deliveryAddress)}')]`));

        // ── Steps 19–21: Select Purchase Executive ───────────────────────────
        await this.click(this.purchaseExecutiveDropdown);
        await this.waitForElementIsVisible(this.purchaseExecutiveDropdown);
        await this.pause(300);
        await this.type(this.purchaseExecutiveDropdown, String(data.purchaseExecutive));
        await this.click(this.getLocator(`//*[@role='option' and contains(normalize-space(),'${String(data.purchaseExecutive)}')]`));

        // ── Steps 22–27: Add Item ─────────────────────────────────────────────
        await this.click(this.addItemsButton);

        
        // Without this, first 2-3 chars are lost because input not ready yet
        await this.waitForElementIsVisible(this.itemTextbox);
        await this.click(this.itemTextbox);

        
        await this.pause(300);

        await this.type(this.itemTextbox, String(data.item1));

        // wait for dropdown to populate then click first match
        await this.click(this.getLocator(`//*[@role='listbox']//*[contains(normalize-space(),'${String(data.item1)}')][1]`));

        // ── Steps 28–29: Enter Quantity ───────────────────────────────────────
        await this.click(this.quantityTextbox);
        await this.pause(200);
        await this.clear(this.quantityTextbox);
        await this.type(this.quantityTextbox, String(data.quantity));
        await this.pressKey("Tab");

        // ── Step 30: Enter Rate ───────────────────────────────────────────────
        await this.click(this.rateTextbox);
        await this.pause(200);
        await this.clear(this.rateTextbox);
        await this.type(this.rateTextbox, String(data.price));
        await this.pressKey("Tab");

        // ── Steps 31–32: Verify Amount ────────────────────────────────────────
        const expectedAmount = num(data.quantity) * num(data.price);
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
        console.log(`  Amount → Expected: ${expectedAmount} | Actual: ${actualAmount}`);
        // ── Steps 33–36: Select Order Brand ──────────────────────────────────
        await this.click(this.orderBrandDropdown);
        await this.click(this.orderBrandOption);
        await this.click(this.doneButton);

        // ── Steps 37–40: Save → Store Order Name → Verify Draft ──────────────
        await this.clickAction(this.saveOption);
        await this.handleSubmitPopups();

        const url     = this.page.url();
        const poMatch = url.match(/PO-[\w]+/);
        const poName  = poMatch ? poMatch[0] : "";
        Runtime.set(`OrderName_${data.setName}`, poName);
        console.log(`[${data.setName}] PO created → ${poName}`);
        console.log(`Order Name: ${poName}`);
        await this.assertElementVisible(this.draftStatus);

        // ── Steps 41–47: Submit → Approve PO ─────────────────────────────────
        await this.clickAction(this.submitOption);
        await this.handleSubmitPopups();
        await this.approveUntilGone(5);
        await this.assertElementVisible(this.approvedStatus);

        // ── Steps 48–56: Related Docs → GRN ──────────────────────────────────
        await this.click(this.relatedDocs);
        await this.click(this.receiptNoteGRNButton);
        await this.click(this.selectItemsButtonGRN);
        await this.click(this.poNo);
        await this.click(this.doneButtonGRN);
        await this.clickAction(this.submitOption);
        await this.handleSubmitPopups();
        await this.approveUntilGone(5);
        console.log(" GRN Approved");

        // ── Steps 57–75: Purchase Invoice ────────────────────────────────────
        await this.click(this.relatedDocs1);
        await this.click(this.purchaseInvoiceButton);

        await this.ifVisible(this.supplierInvoiceDate, async () => {
            await this.fillDatePicker(this.supplierInvoiceDate, this.todayDate);
        }, undefined, 5000);

        await this.fillDatePicker(this.documentDate, this.todayDate);
        await this.fillDatePicker(this.dueDate, this.todayDate);
        await this.type(this.supplierInvoiceNo, this.randomInvoiceNo);

        await this.click(this.selectItemsButtonPI);
        await this.click(this.receiptNo);
        await this.click(this.doneButton3);

        await this.clickAction(this.submitOption);
        await this.handleSubmitPopups();
        await this.approveUntilGone(3);
        await this.whileVisible(this.closeButton, async () => {

            await this.click(this.closeButton);
            console.log("Clicked Close button, waiting for it to disappear...");

            await this.page.waitForTimeout(2000);
        
        }, undefined,);

        

        // ── Steps 79–81: Verify Final Statuses ───────────────────────────────
        await this.assertElementVisible(this.approved1Status);
        console.log(` [${data.setName}] Approved`);

        await this.assertElementVisible(this.fullyReceived1Status);
        console.log(` [${data.setName}] Fully Received`);

        await this.assertElementVisible(this.fullyInvoicedStatus);
        console.log(`[${data.setName}] Fully Invoiced`);
    }
}