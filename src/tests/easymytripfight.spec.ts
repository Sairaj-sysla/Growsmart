import { test }                    from "@playwright/test";
import { EasyMyTripPageForFlight } from "../pages/easyMyTripForFlight";
import { FileUtils }               from "@utils/fileUtils";
import { set }                     from "@utils/set";

// ── Load data at file level ──────────────────────────────────────────────────
const set1 = set("flightData", 1);  // Chennai to Bangalore Business
const set2 = set("flightData", 2);  // Mumbai to Delhi Economy

// ============================================================================
//  TEST 1 — Set 1 (Chennai to Bangalore, Business)
// ============================================================================
test("Flight Booking — Set 1 (Chennai to Bangalore)", async ({ page }, testInfo) => {
  const flightPage = new EasyMyTripPageForFlight(page);

  await flightPage.easyMyTripFlightBookingPage(set1.from, set1.to);
  await flightPage.selectFlightDates(set1.departDays, set1.returnDays);
  await flightPage.selectPassengers(set1.adults, set1.children, set1.travelClass);

  const hotelList  = await flightPage.getHighestHotelAndClick();
  await FileUtils.writeExcelAuto(testInfo, hotelList);

  const flightList = await flightPage.checkout();
  await FileUtils.writeExcelAuto(testInfo, flightList);
});

// ============================================================================
//  TEST 2 — Set 2 (Mumbai to Delhi, Economy)
// ============================================================================
test("Flight Booking — Set 2 (Mumbai to Delhi)", async ({ page }, testInfo) => {
  const flightPage = new EasyMyTripPageForFlight(page);

  await flightPage.easyMyTripFlightBookingPage(set2.from, set2.to);
  await flightPage.selectFlightDates(set2.departDays, set2.returnDays);
  await flightPage.selectPassengers(set2.adults, set2.children, set2.travelClass);

  const hotelList  = await flightPage.getHighestHotelAndClick();
  await FileUtils.writeExcelAuto(testInfo, hotelList);

  const flightList = await flightPage.checkout();
  await FileUtils.writeExcelAuto(testInfo, flightList);
});