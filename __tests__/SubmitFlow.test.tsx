import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WizardPage from '@/app/wizard/page';
import * as api from '@/services/api/basicInfo';
import * as apiDetails from '@/services/api/detailsInfo';

jest.mock('@/services/api/basicInfo', () => ({
  submitBasicInfo: jest.fn(),
}));

jest.mock('@/services/api/detailsInfo', () => ({
  submitDetails: jest.fn(),
}));

describe('Wizard submit flow', () => {
  it('submits step 1 then step 2 sequentially', async () => {
    const submitBasicInfo = api.submitBasicInfo as jest.Mock;
    const submitDetails = apiDetails.submitDetails as jest.Mock;

    submitBasicInfo.mockResolvedValue(undefined);
    submitDetails.mockResolvedValue(undefined);

    render(<WizardPage />);

    /* 
      IMPORTANT:
      This assumes you have a submit button with accessible text.
      Example: <button>Submit</button>
    */
    fireEvent.click(
      screen.getByRole('button', { name: /submit/i })
    );

    await waitFor(() => {
      expect(submitBasicInfo).toHaveBeenCalled();
      expect(submitDetails).toHaveBeenCalled();
    });

    /* ✅ Verify order: step 1 before step 2 */
    expect(
      submitBasicInfo.mock.invocationCallOrder[0]
    ).toBeLessThan(
      submitDetails.mock.invocationCallOrder[0]
    );
  });
});
