import { BasePage }      from "./basePage";
import { Page, Locator, expect } from "@playwright/test";
import { formatToday, formatDateAfterDays, cleanAndConvertToDDMMYYYY } from "../utils/commonUtils";
import { configManager } from "../config/env.index";
import { Runtime }       from "@utils/runtimeStore";

export class EasyMyTripPageForFlight extends BasePage {

  // ==========================================================================
  //  LOCATORS
  // ==========================================================================
  readonly flightTab:            Locator;
  readonly RoundTrip:            Locator;
  readonly departureAirport:     Locator;
  readonly fromAirportInput:     Locator;
  readonly DestinationAirport:   Locator;
  readonly toAirportInput:       Locator;
  readonly TravelDate:           Locator;
  readonly retrunTravelDate:     Locator;
  readonly adultcount:           Locator;
  readonly adultplus:            Locator;
  readonly childplus:            Locator;
  readonly DoneButton:           Locator;
  readonly searchButton:         Locator;
  readonly loader:               Locator;
  readonly chennaiOption:        Locator;
  readonly bangaloreOption:      Locator;
  readonly guest:                Locator;
  readonly businessClassOption:  Locator;
  readonly hotelname:            Locator;
  readonly hotelpriceText:       Locator;
  readonly ViewDetails:          Locator;
  readonly selecteddate:         Locator;
  readonly ContinueTocheckout:   Locator;
  readonly FlightDetails:        Locator;
  readonly flightId:             Locator;
  readonly fromField:            Locator;

  // Runtime values
  SelectedFlightDate: string = "";
  SelectedReturnDate: string = "";

  // ==========================================================================
  //  CONSTRUCTOR
  // ==========================================================================
  constructor(page: Page) {
    super(page);

    this.flightTab           = this.getLocator('//*[text()="FLIGHTS"]');
    this.departureAirport    = this.getLocator('(//*[text()="Departure"])[1]');
    this.fromAirportInput    = this.getLocator('(//div[@id="fromautoFill_in"]//input[@type="text"])[1]');
    this.DestinationAirport  = this.getLocator('(//*[text()="Destination"])[1]');
    this.toAirportInput      = this.getLocator('(//div[@id="toautoFill_in"]//input[@type="text"])[1]');
    this.TravelDate          = this.getLocator('//*[text()="  Traveller & Class "]');
    this.retrunTravelDate    = this.getLocator('//*[contains(text(),"Return Date")]');
    this.RoundTrip           = this.getLocator('//*[text()=" Round Trip "]');
    this.adultcount          = this.getLocator('//*[@name="quantity"]');
    this.adultplus           = this.getLocator('//*[@class="add plus_box1"]');
    this.childplus           = this.getLocator('(//*[@field="quantity1"])[2]');
    this.DoneButton          = this.getLocator('//*[text()="Done"]');
    this.searchButton        = this.getLocator('//button[@type="submit"]');
    this.loader              = this.getLocator('//*[@id="Loader"]');
    this.chennaiOption       = this.getLocator('//*[text()="Chennai(MAA)"]');
    this.bangaloreOption     = this.getLocator('//*[text()="Bengaluru(BLR)"]');
    this.guest               = this.getLocator('//*[text()="Guests & Class "]');
    this.businessClassOption = this.getLocator('//*[text()=" Business "]');
    this.hotelname           = this.getLocator('//div[contains(@class,"htl_")]');
    this.hotelpriceText      = this.getLocator('//div[contains(@class,"act_price")]');
    this.ViewDetails         = this.getLocator('//*[text()="View Details"]');
    this.selecteddate        = this.getLocator('//div[@class="fare-cal day availabledt"]/..//span[@class="date-b"]');
    this.ContinueTocheckout  = this.getLocator('//*[text()="Continue To checkout"]');
    this.FlightDetails       = this.getLocator('//div[@class="air-nme"]');
    this.flightId            = this.getLocator('//div[@class="aircode"]');
    this.fromField             = this.getLocator('//*[contains(text(),"From")]');
    
  }

  // ==========================================================================
  //  easyMyTripFlightBookingPage — accepts from/to from test data
  // ==========================================================================
  async easyMyTripFlightBookingPage(
    from: string = "chennai",
    to:   string = "bangalore"
  ): Promise<void> {
    await this.navigateTo(configManager.geteasyURL());

    await this.waitForElementIsVisible(this.flightTab);
    await this.click(this.flightTab);
    await this.click(this.RoundTrip);
    await this.waitForElementIsVisible(this.fromField);
    await this.click(this.fromField);

    // From airport
    
    await this.type(this.fromAirportInput, from);
    await this.click(this.chennaiOption);

    // To airport
   
    await this.type(this.toAirportInput, to);
    await this.click(this.bangaloreOption);
  }

  // ==========================================================================
  //  selectFlightDates — accepts departDays and returnDays from test data
  // ==========================================================================
  async selectFlightDates(
    departDays: number = 0,
    returnDays: number = 5
  ): Promise<void> {
    // Depart date
    await this.click(this.departureAirport);
    this.SelectedFlightDate = departDays === 0
      ? await formatToday("dd")
      : await formatDateAfterDays(departDays, "dd");

    await this.click(
      this.page.locator(
        `(//span[contains(text(),"${this.SelectedFlightDate}") and contains(@class,"mat-calendar-body-cell-content mat-focus-indicator mat-calendar-body")])[1]`
      )
    );
    Runtime.set("SelectedFlightDate", this.SelectedFlightDate);
    console.log("Depart Date: ", this.SelectedFlightDate);

    // Return date
    await this.click(this.retrunTravelDate);
    this.SelectedReturnDate = await formatDateAfterDays(returnDays, "dd");

    await this.click(
      this.page.locator(
        `(//span[contains(text(),"${this.SelectedReturnDate}") and contains(@class,"mat-calendar-body-cell-content mat-focus-indicator")])[1]`
      )
    );
    Runtime.set("SelectedReturnDate", this.SelectedReturnDate);
    console.log("Return Date: ", this.SelectedReturnDate);
  }

  // ==========================================================================
  //  selectPassengers — accepts adults, children, travelClass from test data
  // ==========================================================================
  async selectPassengers(
    adults:      number = 2,
    children:    number = 1,
    travelClass: string = "Business"
  ): Promise<void> {
    await this.click(this.TravelDate);

    // Set adults
    const currentAdults = parseInt(await this.getInputValue(this.adultcount) || "1");
    if (currentAdults < adults) {
      for (let i = 0; i < adults - currentAdults; i++) {
        await this.click(this.adultplus);
      }
    }
    await this.storeInputValue(this.adultcount, "AdultCounts");
    console.log("Adult Count: ", $("AdultCounts"));

    // Set children
    if (children > 0) {
      for (let i = 0; i < children; i++) {
        await this.click(this.childplus);
      }
    }
    console.log("Children added: ", children);

    // Select travel class
    if (travelClass === "Business") {
      await this.click(this.businessClassOption);
    }

    await this.click(this.DoneButton);
    await this.click(this.searchButton);
    await this.waitForElementToDisappear(this.loader);
  }

  // ==========================================================================
  //  getHighestHotelAndClick — get highest priced hotel and click View Details
  // ==========================================================================
  async getHighestHotelAndClick(): Promise<{ name: string; price: number }[]> {
    const count = await this.getElementCount(this.hotelname);
    console.log("Total Hotels Found: ", count);

    const hotelList: { name: string; price: number }[] = [];

    for (let i = 0; i < count; i++) {
      const hotelNames     = (await this.hotelname.nth(i).textContent())?.trim()     || "";
      const hotelPriceText = (await this.hotelpriceText.nth(i).textContent())?.trim() || "0";
      const hotelPrice     = parseInt(hotelPriceText.replace(/[^0-9]/g, ""))          || 0;

      hotelList.push({ name: hotelNames, price: hotelPrice });
    }

    hotelList.sort((a, b) => b.price - a.price);
    const highestHotel = hotelList[0];
    console.log("Highest Hotel: ", highestHotel);

    // Click View Details for highest hotel
    await this.click(
      this.page.locator(
        `//div[contains(text(),"${highestHotel.name}")]/../../..//*[text()="View Details"]`
      )
    );

    return hotelList;
  }

  // ==========================================================================
  //  checkout — validates dates and collects flight details
  // ==========================================================================
  async checkout(): Promise<{ flight: string; flightId: string }[]> {
    await this.waitForElementToDisappear(this.loader);
    await this.waitForElementIsVisible(this.ContinueTocheckout);

    // Verify selected date
    await this.storeTextContent(this.selecteddate, "checkout");
    console.log("Checkout Date: ", $("checkout"));
    console.log("Selected Flight Date: ", $("SelectedFlightDate"));

    // Collect flight details
    const counts = await this.getElementCount(this.FlightDetails);
    const flightList: { flight: string; flightId: string }[] = [];

    for (let i = 0; i < counts; i++) {
      const flightName = (await this.FlightDetails.nth(i).textContent())?.trim() || "";
      const flightCode = (await this.flightId.nth(i).textContent())?.trim()      || "";

      flightList.push({ flight: flightName, flightId: flightCode });
    }

    console.log("Flight List: ", flightList);

    await this.click(this.ContinueTocheckout);
    await this.waitForElementToDisappear(this.loader);

    return flightList;
  }
}