"use client";
import { FormaPagoEnum } from "@/enums";
import {
  AcquirerInterface,
  BankType,
  CardInterface,
  DetalleCobroFacturaInterface,
} from "@/types";
import { ExpandMore } from "@mui/icons-material";
import {
  AccordionDetails,
  AccordionSummary,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ClassNameMap } from "@mui/styles";
import React, { useEffect, useMemo, useState } from "react";
import { setCurrencyNumber } from "@/functions";
import {
  FormState,
  useAdquirienteAsync,
  useCatalogBankAsync,
  useTarjetaAsync,
} from "@/hooks";

export type CobroClientesDetailsProps = {
  styles: ClassNameMap;
  formState: FormState;
};

export const CobroClientesDetails: React.FC<CobroClientesDetailsProps> = ({
  formState,
  styles,
}) => {
  const [bankList, setBankList] = useState<BankType[]>([]);

  const [cardList, setCardList] = useState<CardInterface[]>([]);

  const [acquirerList, setAcquirerList] = useState<AcquirerInterface[]>([]);

  const { fetchBankList } = useCatalogBankAsync();

  const { fetchAcquirerList } = useAdquirienteAsync();

  const { fetchCardList } = useTarjetaAsync();

  // Obtener todas las formas de pago
  const formasPagoList: { label: string; value: FormaPagoEnum }[] =
    useMemo(() => {
      return Object.keys(FormaPagoEnum)
        .filter((key): key is keyof typeof FormaPagoEnum => isNaN(Number(key)))
        .map((key) => {
          const label = key.replace(/_/g, " ");
          return { label: label, value: FormaPagoEnum[key] };
        });
    }, []);

  useEffect(() => {
    if (!formState.idformState) {
      return;
    }
    const fetchDataBank = async () => {
      const response = await fetchBankList();
      setBankList(response ?? []);
    };

    const fetchDataCard = async () => {
      const response = await fetchCardList();
      setCardList(response ?? []);
    };

    const fetchDataAcquirer = async () => {
      const response = await fetchAcquirerList();
      setAcquirerList(response ?? []);
    };

    if (bankList.length === 0) fetchDataBank();
    if (cardList.length === 0) fetchDataCard();
    if (acquirerList.length === 0) fetchDataAcquirer();
  }, [JSON.stringify(formState.idformState)]);

  return (
    <>
      <Grid item xs={12}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <div
            style={{
              display: "width",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography sx={{ fontWeight: "bold" }}>
              {formState.idformState !== null
                ? `Cobro Nro. ${formState.idCobro}`
                : "Cobro"}
            </Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className={styles.tableContainer}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Banco</TableCell>
                    <TableCell>Nro. Documento</TableCell>
                    <TableCell>Nro. Cheque</TableCell>
                    <TableCell>Cupo Disponible</TableCell>
                    <TableCell>Saldo Favor</TableCell>
                    <TableCell>Tipo Tarjeta</TableCell>
                    <TableCell>Adquiriente</TableCell>
                    <TableCell>Lote</TableCell>
                    <TableCell>Plazo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formState.paymentDetails.map(
                    (
                      detalleformState: DetalleCobroFacturaInterface,
                      index: number
                    ) => (
                      <TableRow key={index}>
                        <TableCell>
                          {
                            formasPagoList.find(
                              (item) =>
                                item.value === detalleformState.paymentMethodId
                            )?.label
                          }
                        </TableCell>
                        <TableCell>
                          {setCurrencyNumber(detalleformState.amount)}
                        </TableCell>
                        <TableCell>{detalleformState.bankName}</TableCell>
                        <TableCell>{detalleformState.documentNumber}</TableCell>
                        <TableCell>{detalleformState.checkNumber}</TableCell>
                        <TableCell>{detalleformState.quotaAvailable}</TableCell>
                        <TableCell>{detalleformState.creditBalance}</TableCell>
                        <TableCell>{detalleformState.cardName}</TableCell>
                        <TableCell>{detalleformState.acquirerName}</TableCell>
                        <TableCell>{detalleformState.batch}</TableCell>
                        <TableCell>{detalleformState.term}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                      }}
                      colSpan={3}
                    >
                      TOTAL
                    </TableCell>

                    <TableCell
                      style={{
                        fontWeight: "bold",
                      }}
                      colSpan={2}
                    >
                      CAMBIO
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                      }}
                      colSpan={3}
                    >
                      ANTICIPO
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                      }}
                      colSpan={3}
                    >
                      TRANSPORTE
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3}>
                      {setCurrencyNumber(formState.amount)}
                    </TableCell>
                    <TableCell colSpan={2}>
                      {setCurrencyNumber(formState.changeValue !== null && formState.changeValue !== undefined ? formState.changeValue : 0)}
                    </TableCell>
                    <TableCell colSpan={3}>
                      {setCurrencyNumber(formState.advancePayment !== null && formState.changeValue !== undefined ? formState.changeValue : 0)}
                    </TableCell>
                    <TableCell colSpan={3}>
                      {setCurrencyNumber(formState.transportAdvancePayment !== null && formState.changeValue !== undefined ? formState.changeValue : 0)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </div>
        </AccordionDetails>
      </Grid>
    </>
  );
};
