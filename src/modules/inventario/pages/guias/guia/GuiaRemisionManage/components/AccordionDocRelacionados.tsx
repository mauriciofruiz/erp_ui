import { formatDateBackEnd } from '@/functions';
import { FormState, useGuiaRemisionAsync } from '@/hooks';
import { RelatedDocumentsGuiaType } from '@/types';
import { ExpandMore, OpenInNew } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { ClassNameMap } from '@mui/styles';
import { useEffect, useState } from 'react';

interface AccordionDocRelacionadossProps {
  styles: ClassNameMap;
  formState: FormState;
  createMode: boolean;
  setSelectedDocument: React.Dispatch<
    React.SetStateAction<RelatedDocumentsGuiaType | null>
  >;
}

export const AccordionDocRelacionados = (
  props: AccordionDocRelacionadossProps
) => {
  const { styles, formState, createMode, setSelectedDocument } = props;

  const { fetchRelatedDocuments } = useGuiaRemisionAsync();

  const [relatedDocumentsList, setRelatedDocumentsList] = useState<
    RelatedDocumentsGuiaType[]
  >([]);

  useEffect(() => {
    if (!createMode) return;

    const formEffect = {
      branchId: formState.branchId,
      isTransfer: formState.isTransfer,
      startDate: formState.startDate,
      endDate: formState.endDate,
    };

    const therisANullValue = Object.values(formEffect).some(
      (value) => value === null
    );

    if (therisANullValue) return;
    fetchRelatedDocuments(
      formEffect.branchId,
      formEffect.isTransfer,
      formEffect.startDate,
      formEffect.endDate
    ).then((data) => {
      if (!data) return;
      setRelatedDocumentsList(data as RelatedDocumentsGuiaType[]);
    });
  }, [
    formState.isTransfer,
    formState.branchId,
    formState.startDate,
    formState.endDate,
    createMode,
  ]);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <div
          style={{
            display: 'width',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Typography sx={{ fontWeight: 'bold' }}>Documentos Origen</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        {relatedDocumentsList.length === 0 ? (
          <Typography>No existen documentos de origen disponibles</Typography>
        ) : (
          <div className={styles.tableContainer}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Número De Documento</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relatedDocumentsList.map(
                    (documento: RelatedDocumentsGuiaType, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          {formatDateBackEnd(documento.issueDate)}
                        </TableCell>
                        <TableCell>{documento.documentNumber}</TableCell>
                        <TableCell>{documento.clientName}</TableCell>
                        <TableCell>{documento.value}</TableCell>
                        <TableCell>
                          <div className={styles.iconContainer}>
                            <Tooltip title="Asignar">
                              <IconButton
                                onClick={() => setSelectedDocument(documento)}
                              >
                                <OpenInNew />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
