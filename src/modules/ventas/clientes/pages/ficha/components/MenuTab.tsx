import { Box, Divider, Tab, Tabs } from "@mui/material";
import { MenuClientEnum } from "./MenuClientEnum";

type MenuTabProps = {
  allowViewComponent: boolean;
  tabIndex: number;
  setTabIndex: React.Dispatch<React.SetStateAction<number>>;
};

export const MenuTab: React.FC<MenuTabProps> = ({
  allowViewComponent,
  tabIndex,
  setTabIndex,
}) => {

  return (
    allowViewComponent ? (
      <>
        <Divider />
        <Box sx={{ width: '100%', bgcolor: 'background.paper', mt: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabIndex} onChange={(event: React.SyntheticEvent, newValue: number) => { event ? setTabIndex(newValue) : null; }}>
              <Tab label="Información Comercial" />
              <Tab label="Crédito" />
              <Tab label="Alertas" />
              <Tab label="Impuestos" />
              <Tab label="Contabilidad" />
              <Tab label="Estado de cuenta" />
              <Tab label="Excepciones" />
              <Tab label="Gestión de documentos" />
              <Tab label="Historial" />
            </Tabs>
          </Box>
        </Box>
      </>
    ) :
      (
        <>
          <Divider />
          <Box sx={{ width: '100%', bgcolor: 'background.paper', mt: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabIndex} onChange={(event: React.SyntheticEvent) => { event ? setTabIndex(MenuClientEnum.IMPUESTOS) : null; }}>
                <Tab label="Impuestos" />
              </Tabs>
            </Box>
          </Box>
        </>
      )
  );
};
