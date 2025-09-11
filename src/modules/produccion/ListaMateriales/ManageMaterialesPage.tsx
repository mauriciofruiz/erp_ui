'use client';
import {
  getCostosIndirectos,
  getManoObra,
  getProductsReceta,
  saveReceta,
  updateReceta,
} from '@/backend/inventario/recetaServices';
import { DocumentTypeEnum, PathEnum } from '@/enums';
import { RecetaEnum } from '@/enums/RecetaEnum';
import {
  useAccessDocument,
  useAllowGlobal,
  useForm,
  useListaMaterialesAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import {
  CostosIndirectosType,
  ManoObraType,
  ProductoRecetaType,
} from '@/types';
import {
  DetailRecipeTypeId,
  RecetaGetIdType,
  RecetaPostType,
  RecipePost,
} from '@/types/inventario/receta.type';
import {
  EditNote,
  ExitToApp,
  PictureAsPdf,
  Save,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import { Box, Button, Grid, Tooltip } from '@mui/material';
import {
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { ListaMaterialesForm } from './components/ListaMaterialesForm';
import { downloadPdf } from '@/functions';

export type ManageMaterialesPageProps = {
  // types...
};

export const ManageMaterialesPage: React.FC<
  ManageMaterialesPageProps
> = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigateBetweenDocuments } = useAllowGlobal();
  const [title, setTitle] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(true);
  const { closeDocument, openDocument } = useAccessDocument();
  const { user } = useSelector((state: RootState) => state.auth);
  const { grupos } = useSelector((state: RootState) => state.common);
  const [rowsObra, setRowsObra] = React.useState<GridRowsProp>([]);
  const [rowsCostos, setRowsCostos] = React.useState<GridRowsProp>([]);
  const [rowsMateriaPrima, setRowsMateriaPrima] = React.useState<GridRowsProp>(
    []
  );
  const requestId =
    location && location.state ? location.state.requestId : undefined;
  const [requestMaterialsSelected, setRequestMaterialsSelected] =
    useState<RecetaGetIdType>();
  const [requestMaterialsDetailsSelected, setRequestMaterialsDetailsSelected] =
    useState<DetailRecipeTypeId[]>([]);
  const [productosReceta, setProductosReceta] = useState<ProductoRecetaType[]>(
    []
  );
  const [materiales, setMateriales] = useState<ProductoRecetaType[]>([]);
  const [manoObra, setManoObra] = useState<ManoObraType[]>([]);
  const [costosIndirectos, setCostosIndirectos] = useState<
    CostosIndirectosType[]
  >([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [isValidDataGrid, setIsValidDataGrid] = useState(true);

  const { fetchListaMaterialPdf, fetchById } = useListaMaterialesAsync();

  const {
    onInputChange,
    onDateChange,
    onAutocompleteChange,
    setFormState,
    formState,
  } = useForm({
    user: user?.userId,
    recipeId: '',
    groupId: '',
    product: '',
    productCode: '',
    nameProduct: '',
    productGroup: '',
    unitMesure: '',
    cost: 0,
    description: '',
    instructions: '',
  });

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 2 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          position: 'fixed',
          left: '5%',
          transform: 'translateY(-50%)',
          zIndex: 1,
        }}
      >
        <Tooltip title="Anterior">
          <Button
            variant="contained"
            color="primary"
            startIcon={<SkipPrevious />}
            onClick={() => {
              closeDocument({
                id: requestId,
                documentType: DocumentTypeEnum.LISTA_MATERIALES,
              });
              openDocument({
                id: Number(requestId) - 1,
                navigation: () =>
                  navigate(PathEnum.LISTA_MATERIALES + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.LISTA_MATERIALES,
              });
            }}
          />
        </Tooltip>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          position: 'fixed',
          right: '5%',
          transform: 'translateY(-50%)',
          zIndex: 1,
        }}
      >
        <Tooltip title="Siguiente">
          <Button
            variant="contained"
            color="primary"
            startIcon={<SkipNext />}
            onClick={() => {
              closeDocument({
                id: requestId,
                documentType: DocumentTypeEnum.LISTA_MATERIALES,
              });
              openDocument({
                id: Number(requestId) + 1,
                navigation: () =>
                  navigate(PathEnum.LISTA_MATERIALES + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.LISTA_MATERIALES,
              });
            }}
          />
        </Tooltip>
      </div>
    </Box>
  );

  const handleCancel = async () => {
    if (requestId) {
      closeDocument({
        id: requestId,
        documentType: DocumentTypeEnum.LISTA_MATERIALES,
      });
    }
    navigate(PathEnum.LISTA_MATERIALES);
  };

  useEffect(() => {
    setTitle(
      createMode
        ? 'Nueva Lista Materiales'
        : 'Lista Materiales (Modo Lectura) - N° ' + requestId
    );
  }, [createMode, requestId]);

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle('Lista Materiales (Modo Edición) - ');

      enqueueSnackbar(
        <>
          {'Modo edición habilitado'}
          <br />
          {'Modo lectura deshabilitado'}
        </>,
        {
          variant: 'info',
        }
      );
    } else {
      setEditMode(false);
      setTitle('Lista Materiales (Modo Edición) - ');
      enqueueSnackbar(
        <>
          {'Modo edición deshabilitado'}
          <br />
          {'Modo lectura habilitado'}
        </>,
        {
          variant: 'info',
        }
      );
    }
  };

  useEffect(() => {
    if (
      rowsMateriaPrima.length > 0 ||
      rowsObra.length > 0 ||
      rowsCostos.length > 0
    ) {
      const totalMateriaPrima = rowsMateriaPrima.reduce(
        (total, item) => total + parseFloat(item.totalCost),
        0
      );
      const totalManoObra = rowsObra.reduce(
        (total, item) => total + parseFloat(item.totalCost),
        0
      );
      const totalCost = rowsCostos.reduce(
        (total, item) => total + parseFloat(item.totalCost),
        0
      );
      const cost = totalMateriaPrima + totalManoObra + totalCost;
      setFormState({
        ...formState,
        cost: cost,
      });
    }
  }, [rowsMateriaPrima, rowsObra, rowsCostos]);

  useEffect(() => {
    if (requestId) {
      setCreateMode(false);
      const getRequestPurchase = async () => {
        fetchById(Number(requestId)).then((response) => {
          if (response) {
            const listaMaterialTemp: RecetaGetIdType = response;
            setRequestMaterialsSelected(listaMaterialTemp);
            setRequestMaterialsDetailsSelected(listaMaterialTemp.detailRecipe);
          }
        });
      };

      getRequestPurchase();
    }
  }, [requestId]);

  useEffect(() => {
    if (requestMaterialsSelected) {
      const grupoProd = grupos.filter(
        (s) => s.groupId === requestMaterialsSelected?.groupId
      )[0].groupName;
      setFormState({
        product: requestMaterialsSelected
          ? requestMaterialsSelected.productId
          : '',
        user: requestMaterialsSelected ? requestMaterialsSelected.userId : '',
        productCode: requestMaterialsSelected
          ? requestMaterialsSelected.productCode
          : '',
        nameProduct: requestMaterialsSelected
          ? requestMaterialsSelected.productName
          : '',
        unitMesure: requestMaterialsSelected.measurementUnitName
          ? requestMaterialsSelected.measurementUnitName
          : '',
        productGroup: grupoProd ? grupoProd : '',
        cost: requestMaterialsSelected ? requestMaterialsSelected.cost : 0,
        description: requestMaterialsSelected
          ? requestMaterialsSelected.observation
          : '',
        instructions: requestMaterialsSelected
          ? requestMaterialsSelected.instructions
          : '',
        recipeId: requestMaterialsSelected
          ? requestMaterialsSelected.recipeId
          : null,
      });
    }
  }, [requestMaterialsSelected]);

  useEffect(() => {
    if (requestMaterialsDetailsSelected.length > 0) {
      const manoObra: DetailRecipeTypeId[] = [];
      const costos: DetailRecipeTypeId[] = [];
      const materiaPrima: DetailRecipeTypeId[] = [];

      for (const item of requestMaterialsDetailsSelected) {
        switch (item.costTypeId) {
          case RecetaEnum.MATERIA_PRIMA:
            materiaPrima.push(item);
            break;
          case RecetaEnum.MANO_OBRA:
            manoObra.push(item);
            break;
          case RecetaEnum.COSTOS_INDIRECTOS:
            costos.push(item);
            break;
          default:
            break;
        }
      }
      setRowsMateriaPrima(
        materiaPrima && materiaPrima.length > 0
          ? materiaPrima.map((item) => ({
              id: randomId(),
              recipeId: item.recipeId,
              productId: item.productId,
              costTypeId: item.costTypeId,
              productCode: item.productCode,
              productName: item.productName,
              measurementUnitName: item.measurementUnitName,
              measurementUnitId: item.unitMeasureId,
              quantity: item.quantityRecipe,
              currentAverageCost: item.unitCostRecipe,
              totalCost: item.totalCostRecipe,
              recipeCode: item.recipeCode,
              stateRecipe: item.stateRecipe,
              detailRecipeId: item.detailRecipeId,
            }))
          : []
      );
      setRowsObra(
        manoObra && manoObra.length > 0
          ? manoObra.map((item) => ({
              id: randomId(),
              recipeId: item.recipeId,
              productId: item.productId,
              costTypeId: item.costTypeId,
              labourId: item.labourId,
              labourCode: item.labourCode,
              labourName: item.labourName,
              unitMeasureId: item.unitMeasureId,
              quantity: item.quantityRecipe,
              unitCostLabour: item.unitCostRecipe,
              totalCost: item.totalCostRecipe,
              recipeCode: item.recipeCode,
              stateRecipe: item.stateRecipe,
              detailRecipeId: item.detailRecipeId,
            }))
          : []
      );
      setRowsCostos(
        costos && costos.length > 0
          ? costos.map((item) => ({
              id: randomId(),
              recipeId: item.recipeId,
              productId: item.productId,
              costTypeId: item.costTypeId,
              cifId: item.cifId,
              cifCode: item.cifCode,
              cifName: item.cifName,
              unitMeasureId: item.unitMeasureId,
              quantity: item.quantityRecipe,
              unitCostCif: item.unitCostRecipe,
              totalCost: item.totalCostRecipe,
              recipeCode: item.recipeCode,
              stateRecipe: item.stateRecipe,
              detailRecipeId: item.detailRecipeId,
            }))
          : []
      );
    }
  }, [requestMaterialsDetailsSelected]);

  useEffect(() => {
    if (rowsMateriaPrima.length > 0) {
      let flag = true;
      let productosListTemporal: ProductoRecetaType[] = [];
      const fecthProductoReceta = async (productCode: string, row: any) => {
        try {
          const response: ServerResponseType | undefined =
            await getProductsReceta(productCode, null, null, true, null, null);
          if (response) {
            if (response.status === 200) {
              const producto: ProductoRecetaType = {
                ...response.message[0],
                quantity: row.quantity,
              };
              productosListTemporal.push(producto);
            } else {
              enqueueSnackbar(
                `No se pudo cargar el producto: ${response.status}`,
                {
                  variant: 'error',
                }
              );
            }
          }
        } catch (error) {
          enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        }
      };
      rowsMateriaPrima.map((row) => {
        fecthProductoReceta(row.productCode, row);
      });
      setMateriales(productosListTemporal);
      rowsMateriaPrima.forEach((row) => {
        if (row.productCode === '' && row.productName === '') {
          setRowModesModel({
            ...rowModesModel,
            [row.id]: { mode: GridRowModes.Edit },
          });
          flag = false;
        }
        if (
          row.productCode !== '' &&
          row.productName !== '' &&
          row.quantity === 0
        ) {
          enqueueSnackbar('No puede guardar productos con cantidad 0', {
            variant: 'error',
            preventDuplicate: true,
          });
          flag = false;
        }
      });
      setIsValidDataGrid(flag);
      if (!flag) {
        enqueueSnackbar('Existen campos vacios en la lista de productos', {
          variant: 'warning',
          preventDuplicate: true,
        });
      }
    } else {
      setIsValidDataGrid(false);
    }
  }, [rowsMateriaPrima]);

  useEffect(() => {
    if (rowsObra.length > 0) {
      let flag = true;
      let manoObraTemp: ManoObraType[] = [];
      const fetchManoObra = async (labourCode: string, row: any) => {
        try {
          const response: ServerResponseType | undefined = await getManoObra(
            null,
            labourCode,
            null
          );
          if (response) {
            if (response.status === 200) {
              const obra: ManoObraType = {
                ...response.message[0],
                quantity: row.quantity,
              };
              manoObraTemp.push(obra);
            } else {
              enqueueSnackbar(
                `No se pudo cargar la mano de obra: ${response.status}`,
                {
                  variant: 'error',
                }
              );
            }
          }
        } catch (error) {
          enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        }
      };
      rowsObra.map((row) => {
        fetchManoObra(row.labourCode, row);
      });
      setManoObra(manoObraTemp);
      rowsObra.forEach((row) => {
        if (row.labourCode === '' && row.labourName === '') {
          setRowModesModel({
            ...rowModesModel,
            [row.id]: { mode: GridRowModes.Edit },
          });
          flag = false;
        }
        if (
          row.labourCode !== '' &&
          row.labourName !== '' &&
          row.quantity === 0
        ) {
          enqueueSnackbar('No pueden guardar manos de obra con cantidad 0', {
            variant: 'error',
            preventDuplicate: true,
          });
          flag = false;
        }
      });
      setIsValidDataGrid(flag);
      if (!flag) {
        enqueueSnackbar('Existen campos vacios en la mano de obra', {
          variant: 'warning',
          preventDuplicate: true,
        });
      }
    } else {
      setIsValidDataGrid(false);
    }
  }, [rowsObra]);

  useEffect(() => {
    if (rowsCostos.length > 0) {
      let flag = true;
      let costosIndirectos: CostosIndirectosType[] = [];
      const fetchCostosIndirectos = async (cifCode: string, row: any) => {
        try {
          const response: ServerResponseType | undefined =
            await getCostosIndirectos(null, cifCode, null);
          if (response) {
            if (response.status === 200) {
              const costos: CostosIndirectosType = {
                ...response.message[0],
                quantity: row.quantity,
              };
              costosIndirectos.push(costos);
            } else {
              enqueueSnackbar(
                `No se pudo cargar el costo: ${response.status}`,
                {
                  variant: 'error',
                }
              );
            }
          }
        } catch (error) {
          enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        }
      };
      rowsCostos.map((row) => {
        fetchCostosIndirectos(row.cifCode, row);
      });
      setCostosIndirectos(costosIndirectos);
      rowsCostos.forEach((row) => {
        if (row.cifCode === '' && row.cifName === '') {
          setRowModesModel({
            ...rowModesModel,
            [row.id]: { mode: GridRowModes.Edit },
          });
          flag = false;
        }
        if (row.cifCode !== '' && row.cifName !== '' && row.quantity === 0) {
          enqueueSnackbar('No pueden guardar costos con cantidad 0', {
            variant: 'error',
            preventDuplicate: true,
          });
          flag = false;
        }
      });
      setIsValidDataGrid(flag);
      if (!flag) {
        enqueueSnackbar('Existen campos vacios en la lista de costos', {
          variant: 'warning',
          preventDuplicate: true,
        });
      }
    } else {
      setIsValidDataGrid(false);
    }
  }, [rowsCostos]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let valido = true;
    try {
      const recipePost: RecipePost = {
        recipeId: formState.recipeId,
        productId: formState.product,
        userId: formState.user,
        registrationDate: new Date().toISOString().slice(0, 35),
        cost: formState.cost,
        instructions: formState.instructions,
        observation: formState.description,
        state: true,
      };

      const materiaPrima = rowsMateriaPrima.map((item) => ({
        recipeId: formState.recipeId,
        productId: item.productId,
        labourId: item.labourId,
        cifId: item.cifId,
        costTypeId: item.costTypeId,
        unitMeasureId: item.measurementUnitId,
        recipeName: item.productName,
        quantityRecipe: item.quantity,
        unitCostRecipe: item.currentAverageCost,
        totalCostRecipe: item.totalCost,
        recipeCode: item.recipeCode,
        stateRecipe: item.stateRecipe,
        detailRecipeId: item.detailRecipeId,
      }));

      const manoDeObra = rowsObra.map((item) => ({
        recipeId: formState.recipeId,
        productId: item.productId,
        labourId: item.labourId,
        cifId: item.cifId,
        costTypeId: item.costTypeId,
        unitMeasureId: item.unitMeasureId,
        recipeName: item.labourName,
        quantityRecipe: item.quantity,
        unitCostRecipe: item.unitCostLabour,
        totalCostRecipe: item.totalCost,
        recipeCode: item.recipeCode,
        stateRecipe: item.stateRecipe,
        detailRecipeId: item.detailRecipeId,
      }));

      const costosIndirectos = rowsCostos.map((item) => ({
        recipeId: formState.recipeId,
        productId: item.productId,
        labourId: item.labourId,
        cifId: item.cifId,
        costTypeId: item.costTypeId,
        unitMeasureId: item.unitMeasureId,
        recipeName: item.cifName,
        quantityRecipe: item.quantity,
        unitCostRecipe: item.unitCostCif,
        totalCostRecipe: item.totalCost,
        recipeCode: item.recipeCode,
        stateRecipe: item.stateRecipe,
        detailRecipeId: item.detailRecipeId,
      }));

      const recipeFinal: RecetaPostType = {
        recipe: recipePost,
        detailRecipe: [],
      };

      if (formState.product === null || formState.product === '') {
        valido = false;
        enqueueSnackbar('Tiene queseleccionar un producto', {
          variant: 'error',
        });
      }

      if (
        materiaPrima.length > 0 &&
        manoDeObra.length > 0 &&
        costosIndirectos.length > 0
      ) {
        const detail = [...materiaPrima, ...manoDeObra, ...costosIndirectos];
        if (detail.length > 0) {
          const totalCost = detail.reduce(
            (total, item) => total + parseFloat(item.totalCostRecipe),
            0
          );
          recipeFinal.detailRecipe = detail;
          recipePost.cost = totalCost;
        } else {
          valido = false;
        }
      } else {
        valido = false;
        enqueueSnackbar('Tiene que ingresar al menos un item de cada tabla', {
          variant: 'error',
        });
      }

      if (valido) {
        const response =
          requestId !== undefined && requestId !== null
            ? await updateReceta(requestId, recipeFinal)
            : await saveReceta(recipeFinal);
        if (response) {
          if (response.status === 200) {
            enqueueSnackbar('Guardado Correctamente', {
              variant: 'success',
            });
            handleCancel();
          } else {
            enqueueSnackbar(
              `Error al guardar la receta: ${response.message.message}`,
              {
                variant: 'error',
              }
            );
          }
        }
      }
    } catch (error) {
      enqueueSnackbar(`Error al guardar la receta: ${error}`, {
        variant: 'error',
      });
    }
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
          <ListaMaterialesForm
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            onDateChange={onDateChange}
            onAutocompleteChange={onAutocompleteChange}
            onInputChange={onInputChange}
            rowsMateriaPrima={rowsMateriaPrima}
            setRowsMateriaPrima={setRowsMateriaPrima}
            rowsCostos={rowsCostos}
            setRowsCostos={setRowsCostos}
            rowsObra={rowsObra}
            setRowsObra={setRowsObra}
            productosReceta={productosReceta}
            setProductosReceta={setProductosReceta}
            materiales={materiales}
            setMateriales={setMateriales}
            manoObra={manoObra}
            setManoObra={setManoObra}
            costosIndirectos={costosIndirectos}
            setCostosIndirectos={setCostosIndirectos}
          />
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 2 }}
          >
            {!createMode && (
              <Button
                startIcon={<ExitToApp />}
                sx={{ margin: 2 }}
                onClick={handleCancel}
                style={{ width: '150px' }}
              >
                Salir
              </Button>
            )}
            <Button
              startIcon={<PictureAsPdf />}
              sx={{ margin: 2 }}
              onClick={() => {
                fetchListaMaterialPdf(formState.recipeId).then((response) => {
                  downloadPdf(
                    response,
                    `lista_materiales_${formState.recipeId}.pdf`
                  );
                });
              }}
              style={{ width: '130px' }}
            >
              {'Descargar PDF'}
            </Button>

            {!createMode && (
              <Button
                startIcon={<EditNote />}
                sx={{ margin: 2 }}
                onClick={onEditButtonClick}
                style={{ width: '150px' }}
              >
                {!editMode ? 'Editar' : 'Leer'}
              </Button>
            )}
            <Button
              startIcon={<Save />}
              disabled={!isValidDataGrid}
              sx={{ margin: 2 }}
              type="submit"
              style={{ width: '120px' }}
            >
              {'Guardar'}
            </Button>
          </Grid>
        </form>
      </CardLayout>
    </>
  );
};
