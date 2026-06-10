import { test } from '../fixtures/baseFixture';
import{ LoginPage } from '../pages/growsSmartLogin';    

test.describe('GrowSmart Login', () => {

  test('Verify User Can Login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigateTo();

    await loginPage.login();

    await loginPage.verifyLoginSuccessful();

  });

});