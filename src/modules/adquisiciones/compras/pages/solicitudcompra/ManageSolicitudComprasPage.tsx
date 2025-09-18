import React, { useMemo } from 'react';
import { Divider } from '@mui/material';
import { CardLayout } from '@/modules';
import { SolicitudCompraForm } from './components/SolicitudCompraForm';
import { SolicitudCompraDataGrid } from './components/SolicitudCompraDataGrid';
import { ActionButtons } from './components/ActionButtons';
import { NavigationButtons } from './components/NavigationButtons';
import { AlertDialog } from './components/AlertDialog';
import { AnulationDialog } from './components/AnulationDialog';
import { HistoryDialog } from './components/HistoryDialog';
import { ColumnsDefinition } from './components/ColumnsDefinition';
import { useSolicitudCompraLogic } from './hooks/useSolicitudCompraLogic';
import { useSolicitudCompraDataGrid } from './hooks/useSolicitudCompraDataGrid';
import { useSolicitudCompraValidation } from './hooks/useSolicitudCompraValidation';
import { RequestPurchaseEnum } from '@/enums';

export type ManageSolicitudComprasPageProps = {};

export const ManageSolicitudComprasPage: React.FC<
  ManageSolicitudComprasPageProps
> = ({}) => {
  const {
    // State
    requestId,
    validateAnulado,
    isEditable,
    isApprovable,
    createMode,
    editMode,
    title,
    stateForRequest,
    openDialogAlert,
    openAnulation,
    openHistory,
    requestPurchaseSelected,
    requestPurchaseDetailsSelected,
    tipoAdquisicionList,
    razonesSolicitudList,
    addButtonRef,
    firstFieldFocus,
    user,
    sucursales,
    sucursalUser,
    formState,
    isFormValid,
    adquisicionPeriodo,
    navigateBetweenDocuments,
    enabledBranchs,
    fetchSave,
    fetchUpdate,

    // Actions
    setStateForRequest,
    setOpenDialogAlert,
    setOpenAnulation,
    setOpenHistory,
    handleCancel,
    onEditButtonClick,
    onInputChange,
    onDateChange,
    OnSelectChange,
    onResetForm,
    onAutocompleteChange,
    closeDocument,
    openDocument,
    navigate,
    enqueueSnackbar,
    fetchBySucursalIdAndCode,
  } = useSolicitudCompraLogic();

  const {
    rows,
    setRows,
    rowModesModel,
    setRowModesModel,
    productosToSelect,
    productosByBodegaList,
    setProductosByBodegaList,
    isValidDataGrid,
    handleAutocompleteChange,
    processRowUpdate,
    handleRowModesModelChange,
    handleRowEditStop,
    renderAlertMinMax,
  } = useSolicitudCompraDataGrid(
    requestPurchaseDetailsSelected,
    sucursalUser,
    requestPurchaseSelected,
    fetchBySucursalIdAndCode,
    formState
  );

  const { validateForm, createRequestData } = useSolicitudCompraValidation(
    formState,
    rows,
    adquisicionPeriodo,
    isValidDataGrid
  );

  const columns = useMemo(() => 
    ColumnsDefinition({
      createMode,
      editMode,
      formState,
      rows,
      setRows,
      rowModesModel,
      setRowModesModel,
      productosByBodegaList,
      setProductosByBodegaList,
      isApprovable,
      firstFieldFocus,
      addButtonRef,
      productosToSelect,
      onAutocompleteChange: handleAutocompleteChange,
      setInputValue: () => {},
      renderAlertMinMax,
    }), [
      createMode,
      editMode,
      formState,
      rows,
      rowModesModel,
      productosByBodegaList,
      isApprovable,
      productosToSelect,
      handleAutocompleteChange,
      renderAlertMinMax,
    ]
  );

  const headerComponents = useMemo(() => (
    <NavigationButtons
      requestId={requestId}
      onCloseDocument={(params) => closeDocument(params)}
      onOpenDocument={(params) => openDocument(params)}
      navigate={navigate}
    />
  ), [requestId, closeDocument, openDocument, navigate]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    const requestPurchaseState = stateForRequest;
    const userNick = user?.userNick;

    try {
      const { request, details } = await createRequestData(
        requestPurchaseState,
        userNick || '',
        requestPurchaseSelected,
        requestPurchaseDetailsSelected,
        sucursalUser,
        rows
      );

      const response = requestPurchaseSelected
        ? await fetchUpdate(
            { requestPurchase: request, requestPurchaseDetail: details },
            requestPurchaseSelected.requestPurchaseId
          )
        : await fetchSave({
            requestPurchase: request,
            requestPurchaseDetail: details,
          });

      if (
        !response ||
        (response && response.status === 400) ||
        (response && response.status === 500)
      ) {
        return;
      }
      
      enqueueSnackbar(`Se guardó correctamente la solicitud de compra.`, {
        variant: 'success',
      });
      onResetForm();
      setRows([]);
      handleCancel();
    } catch (error) {
      enqueueSnackbar('Existió un error de conexión', {
        variant: 'error',
      });
    }
  };

  const onDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenAnulation(false);
    setOpenDialogAlert(false);
    onSubmit(event);
  };

  const handleSave = () => {
    setStateForRequest(
      requestPurchaseSelected
        ? requestPurchaseSelected.stateRequestPurchaseId
        : RequestPurchaseEnum.EDICION
    );
  };

  const handleSend = () => {
    setOpenDialogAlert(true);
  };

  const handleAnulate = () => {
    setOpenAnulation(true);
  };

  const handleDeny = () => {
    setStateForRequest(RequestPurchaseEnum.NEGADO);
  };

  const handleApprove = () => {
    setStateForRequest(RequestPurchaseEnum.APROBADO);
  };

  return (
    <>
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}
        headerActions={
          !createMode && navigateBetweenDocuments() ? headerComponents : null
        }
      >
        <form
          onSubmit={onSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        >
          <SolicitudCompraForm
            formState={formState}
            onInputChange={onInputChange}
            onDateChange={onDateChange}
            OnSelectChange={OnSelectChange}
            onAutocompleteChange={onAutocompleteChange}
            sucursales={sucursales}
            tipoAdquisicionList={tipoAdquisicionList}
            razonesSolicitudList={razonesSolicitudList}
            createMode={createMode}
            editMode={editMode}
            enabledBranchs={enabledBranchs}
            requestPurchaseSelected={requestPurchaseSelected}
            onOpenHistory={() => setOpenHistory(true)}
          />
          
          <Divider sx={{ mt: 4, height: 4 }} />
          
          <SolicitudCompraDataGrid
            rows={rows}
            columns={columns}
            editMode={editMode}
            createMode={createMode}
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            setRows={setRows}
            setRowModesModel={setRowModesModel}
            firstFieldFocus={firstFieldFocus}
            sucursalUser={sucursalUser}
            addButtonRef={addButtonRef}
            productosByBodegaList={productosByBodegaList}
            setProductosByBodegaList={setProductosByBodegaList}
            renderAlertMinMax={renderAlertMinMax}
          />

          <ActionButtons
            createMode={createMode}
            isEditable={isEditable}
            validateAnulado={validateAnulado}
            editMode={editMode}
            isFormValid={isFormValid}
            isValidDataGrid={isValidDataGrid}
            isApprovable={isApprovable}
            requestPurchaseSelected={requestPurchaseSelected}
            onCancel={handleCancel}
            onEditButtonClick={onEditButtonClick}
            onSave={handleSave}
            onSend={handleSend}
            onAnulate={handleAnulate}
            onDeny={handleDeny}
            onApprove={handleApprove}
          />
        </form>
      </CardLayout>

      <AlertDialog
        open={openDialogAlert}
        onClose={() => setOpenDialogAlert(false)}
        onConfirm={(event) => onDialogConfirm(event)}
        onStateChange={setStateForRequest}
      />

      <AnulationDialog
        open={openAnulation}
        onClose={() => setOpenAnulation(false)}
        onConfirm={(event) => onDialogConfirm(event)}
        onStateChange={setStateForRequest}
        motivo={formState.motivo}
        onInputChange={onInputChange}
      />

      <HistoryDialog
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        formState={formState}
      />
    </>
  );
};