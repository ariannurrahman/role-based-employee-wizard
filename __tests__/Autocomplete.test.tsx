import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Autocomplete } from '@/components/autocomplete';

describe('Autocomplete', () => {
    it('renders and fetches suggestions correctly', async () => {
      const fetchOptions = jest.fn().mockResolvedValue([
        {
            id: "1",
            name: "Lending"
        },
        {
            id: "2",
            name: "Funding"
        },
        {
            id: "3",
            name: "Operations"
        },
        {
            id: "4",
            name: "Engineering"
        }
      ]);
  
      render(
        <Autocomplete
          label="Department"
          fetchOptions={fetchOptions}
          onSelect={() => {}}
          id='department'
          value=''
          placeholder='Search department'
        />
      );
  
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'e' },
      });
  
      await waitFor(() => {
        expect(fetchOptions).toHaveBeenCalledWith('e');
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('Lending')).toBeInTheDocument();
      });
    });
  });
  