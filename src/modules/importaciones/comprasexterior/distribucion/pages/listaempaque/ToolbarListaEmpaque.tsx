import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';

export function ToolbarListaEmpaque() {
  return (
    <GridToolbarContainer
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginRight: '10px',
      }}
    >
      <GridToolbarColumnsButton
        sx={{
          mb: 2,
          mt: 1,
          marginLeft: '10px',
          mr: 1,
          width: '100px',
          backgroundColor: 'transparent',
        }}
      />
      <GridToolbarFilterButton
        sx={{
          mb: 2,
          mt: 1,
          marginLeft: '10px',
          mr: 1,
          width: '100px',
          backgroundColor: 'transparent',
        }}
      />
      <GridToolbarDensitySelector
        sx={{
          mb: 2,
          mt: 1,
          marginLeft: '10px',
          mr: 1,
          width: '100px',
          backgroundColor: 'transparent',
        }}
      />
      <GridToolbarExport
        sx={{
          mb: 2,
          mt: 1,
          marginLeft: '10px',
          mr: 1,
          width: '100px',
          backgroundColor: 'transparent',
        }}
      />
    </GridToolbarContainer>
  );
}
