import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WizardForm } from '@/components/form/wizard-form';
import * as api from '@/services/api/basicInfo';
import * as apiDetails from '@/services/api/detailsInfo';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn((key: string) => (key === 'role' ? 'admin' : null)),
    toString: jest.fn(() => 'role=admin'),
  })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => '/wizard'),
}));

jest.mock('@/services/api/basicInfo', () => ({
  submitBasicInfo: jest.fn(),
  fetchDepartments: jest.fn(() => Promise.resolve([
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Marketing' },
  ])),
  fetchBasicInfo: jest.fn(() => Promise.resolve({ data: [] })),
}));

jest.mock('@/services/api/detailsInfo', () => ({
  submitDetails: jest.fn(),
  fetchLocations: jest.fn(() => Promise.resolve([
    { id: 1, name: 'San Francisco' },
    { id: 2, name: 'New York' },
  ])),
}));

// Mock file utility
jest.mock('@/utils/file', () => ({
  fileToBase64: jest.fn(() => Promise.resolve('data:image/png;base64,mockBase64String')),
}));

// Mock localStorage for draft functionality
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Wizard submit flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('submits step 1 then step 2 sequentially with progress state', async () => {
    const submitBasicInfo = api.submitBasicInfo as jest.Mock;
    const submitDetails = apiDetails.submitDetails as jest.Mock;

    // Mock successful responses
    submitBasicInfo.mockResolvedValue(undefined);
    submitDetails.mockResolvedValue(undefined);

    render(<WizardForm />);

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText('Employee Wizard')).toBeInTheDocument();
    });

    // Fill in Basic Info (Step 1)
    const fullNameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const departmentInput = screen.getByLabelText(/department/i);
    const allComboboxes = screen.getAllByRole('combobox');
    const roleSelect = allComboboxes[1]; // Employee role select

    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(roleSelect, { target: { value: 'Engineer' } });

    // Handle Autocomplete for department - type partial query first
    fireEvent.change(departmentInput, { target: { value: 'Eng' } });
    
    // Wait for debounce (500ms) and autocomplete options to appear
    await waitFor(() => {
      const engineeringOption = screen.getByRole('button', { name: 'Engineering' });
      expect(engineeringOption).toBeInTheDocument();
    }, { timeout: 2000 });
    
    const engineeringOption = screen.getByRole('button', { name: 'Engineering' });
    fireEvent.click(engineeringOption);

    // Wait for Next button to appear (it only shows when form is valid)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    // Move to Step 2
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Wait for Step 2 to render
    await waitFor(() => {
      expect(screen.getByText(/details & submit/i)).toBeInTheDocument();
    });

    const employmentTypeSelect = screen.getByLabelText(/employment type/i);
    fireEvent.change(employmentTypeSelect, { target: { value: 'Full-time' } });
    
    const officeLocationInput = screen.getByLabelText(/office location/i);
    fireEvent.change(officeLocationInput, { target: { value: 'San' } });
    
    await waitFor(() => {
      const sanFranciscoOption = screen.getByRole('button', { name: 'San Francisco' });
      expect(sanFranciscoOption).toBeInTheDocument();
    }, { timeout: 2000 });
    
    fireEvent.click(screen.getByRole('button', { name: 'San Francisco' }));
    
    const notesTextarea = screen.getByLabelText(/notes/i);
    fireEvent.change(notesTextarea, { target: { value: 'Test notes for employee' } });
    
    // Upload photo
    const photoInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    fireEvent.change(photoInput, { target: { files: [file] } });
    
    // Wait for photo to be processed and form to become valid
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /^submit$/i });
      expect(submitButton).not.toBeDisabled();
    }, { timeout: 3000 });

    // Click Submit button
    const submitButton = screen.getByRole('button', { name: /^submit$/i });
    fireEvent.click(submitButton);

    // Verify progress states are shown
    await waitFor(() => {
      expect(screen.getByText(/submitting\.\.\./i)).toBeInTheDocument();
    });

    // Wait for both API calls to complete
    await waitFor(() => {
      expect(submitBasicInfo).toHaveBeenCalledTimes(1);
      expect(submitDetails).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });

    // ✅ Verify order: step 1 before step 2
    expect(
      submitBasicInfo.mock.invocationCallOrder[0]
    ).toBeLessThan(
      submitDetails.mock.invocationCallOrder[0]
    );

    // ✅ Verify correct payloads
    expect(submitBasicInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        department: 'Engineering',
        role: 'Engineer',
      })
    );

    expect(submitDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'john.doe@example.com',
        employmentType: 'Full-time',
      })
    );

    // ✅ Verify progress logs are displayed
    await waitFor(() => {
      expect(screen.getByText(/✅ basicInfo saved!/i)).toBeInTheDocument();
      expect(screen.getByText(/✅ details saved!/i)).toBeInTheDocument();
      expect(screen.getByText(/🎉 All data processed successfully!/i)).toBeInTheDocument();
    });
  });

  it('handles submission errors gracefully and does not proceed to step 2', async () => {
    const submitBasicInfo = api.submitBasicInfo as jest.Mock;
    const submitDetails = apiDetails.submitDetails as jest.Mock;

    // Mock error in step 1
    submitBasicInfo.mockRejectedValue(new Error('Network error'));
    submitDetails.mockResolvedValue(undefined);

    render(<WizardForm />);

    await waitFor(() => {
      expect(screen.getByText('Employee Wizard')).toBeInTheDocument();
    });

    // Fill in forms
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    
    // Get the employee role select (second combobox)
    const allComboboxes = screen.getAllByRole('combobox');
    fireEvent.change(allComboboxes[1], { target: { value: 'Engineer' } });
    
    // Handle Autocomplete for department - type partial query
    const deptInput = screen.getByLabelText(/department/i);
    fireEvent.change(deptInput, { target: { value: 'Eng' } });
    
    // Wait for debounce and dropdown to appear
    await waitFor(() => {
      const engineeringOption = screen.getByRole('button', { name: 'Engineering' });
      expect(engineeringOption).toBeInTheDocument();
    }, { timeout: 2000 });
    
    fireEvent.click(screen.getByRole('button', { name: 'Engineering' }));

    // Wait for Next button to appear and click it
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/details & submit/i)).toBeInTheDocument();
    });

    // Fill all required fields
    fireEvent.change(screen.getByLabelText(/employment type/i), { target: { value: 'Full-time' } });
    
    // Handle office location autocomplete
    const officeInput = screen.getByLabelText(/office location/i);
    fireEvent.change(officeInput, { target: { value: 'San' } });
    
    await waitFor(() => {
      const sfOption = screen.getByRole('button', { name: 'San Francisco' });
      expect(sfOption).toBeInTheDocument();
    }, { timeout: 2000 });
    
    fireEvent.click(screen.getByRole('button', { name: 'San Francisco' }));
    
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: 'Test notes' } });
    
    // Upload photo
    const photoInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(photoInput, { target: { files: [file] } });
    
    // Wait for form to become valid
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /^submit$/i });
      expect(btn).not.toBeDisabled();
    }, { timeout: 3000 });
    
    const submitButton = screen.getByRole('button', { name: /^submit$/i });
    fireEvent.click(submitButton);

    // Wait for the submission attempt
    await waitFor(() => {
      expect(submitBasicInfo).toHaveBeenCalled();
    });

    // Give some time for the error to propagate
    await new Promise(resolve => setTimeout(resolve, 500));

    // ✅ Verify submitDetails was NOT called due to error in step 1
    expect(submitDetails).not.toHaveBeenCalled();
    
    // ✅ Verify submitBasicInfo was called (and failed)
    expect(submitBasicInfo).toHaveBeenCalledTimes(1);
  });
});
