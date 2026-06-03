import{test ,  expect } from "@playwright/test";
import { EasyMyTripPage } from "../pages/easyMyTrip";   
import { FileUtils } from "@utils/fileUtils";




test("EasyMyTrip Hotel Booking Test  @smoke", async ({ page }, testInfo) => {

    const easyMyTripPage = new EasyMyTripPage(page);    

    await easyMyTripPage.navigateToEasyMyTrip();

    await easyMyTripPage.hotelBookingPage();

    await easyMyTripPage.selectCheckInCheckOutDate();
    await easyMyTripPage.selectRoomsAndGuests();
    await easyMyTripPage.completeHotelBooking();
    //await easyMyTripPage.sortByPriceHighToLow();
    const  hotelList = await easyMyTripPage.sortByPriceHighToLow();

    await FileUtils.writeExcelAuto( testInfo, hotelList);

   
    













});