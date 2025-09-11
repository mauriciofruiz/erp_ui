import { GridRenderEditCellParams } from '@mui/x-data-grid';

export interface AutocompleteEditInputCellProps {
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  params: GridRenderEditCellParams;
  options: any[];
  freeSolo?: boolean;
  multiple?: boolean;
  getOptionLabel?: (option: any) => string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    newValue: any,
    params: GridRenderEditCellParams
  ) => void;
}
