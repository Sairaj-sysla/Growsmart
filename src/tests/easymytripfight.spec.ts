// ============================================================================
//  HOW TAGS WORK IN PLAYWRIGHT
// ----------------------------------------------------------------------------


import { expect }                   from "@playwright/test";
import { test }                      from "../fixtures/preReqFixture";
import { EasyMyTripPageForFlight }   from "../pages/easyMyTripForFlight";
import { FileUtils }                 from "@utils/fileUtils";
import { set }                       from "@utils/set";

// ── Load data at file level ───────────────────────────────────────────────────
const set1 = set("flightData", 1);  // Chennai to Bangalore Business
const set2 = set("flightData", 2);  // Mumbai to Delhi Economy

// ============================================================================
//  TEST 1 — @smoke @regression
//  Tags added directly inside the title string with @
// ============================================================================
test("Flight Booking — Set 1 (Chennai to Bangalore) @smoke",
  async ({ page }, testInfo) => {

    const flightPage = new EasyMyTripPageForFlight(page);

    await flightPage.easyMyTripFlightBookingPage(set1.from, set1.to);
    await flightPage.selectFlightDates(set1.departDays, set1.returnDays);
    await flightPage.selectPassengers(set1.adults, set1.children, set1.travelClass);

    const hotelList  = await flightPage.getHighestHotelAndClick();
    await FileUtils.writeExcelAuto(testInfo, hotelList);

    const flightList = await flightPage.checkout();
    await FileUtils.writeExcelAuto(testInfo, flightList);
  }
);

// ============================================================================
//  TEST 2 — @regression only (not smoke — slower test)
//  Pre-requisite: Test 1 must pass
// ============================================================================
test("Flight Booking — Set 2 (Mumbai to Delhi) @regression",
  {
    annotation: [{
      type:        "preRequisite",
      description: "Flight Booking — Set 1 (Chennai to Bangalore) @smoke @regression"
    }]
  },
  async ({ page }, testInfo) => {

    const flightPage = new EasyMyTripPageForFlight(page);

    await flightPage.easyMyTripFlightBookingPage(set1.from, set1.to);
    await flightPage.selectFlightDates(set2.departDays, set2.returnDays);
    await flightPage.selectPassengers(set2.adults, set2.children, set2.travelClass);

    const hotelList  = await flightPage.getHighestHotelAndClick();
    await FileUtils.writeExcelAuto(testInfo, hotelList);

    const flightList = await flightPage.checkout();
    await FileUtils.writeExcelAuto(testInfo, flightList);
  }
);