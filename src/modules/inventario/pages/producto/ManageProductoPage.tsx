'use client';
import { getCuentaById } from '@/backend/contabilidad';
import {
  getAllProveedoresByProducto,
  validateExistenceByProductCode,
} from '@/backend/inventario';
import {
  downloadFileProducto,
  downloadPhotoProducto,
  uploadFileProducto,
  uploadPhotoProducto,
} from '@/backend/reportes';
import {
  AccountProductosEnum,
  DocumentTypeEnum,
  MeasurementUnitsEnum,
  ParametersEnum,
  PathEnum,
  ProductRotationEnum,
} from '@/enums';
import { PDFViewer, TabPanel, downloadPdf, handleApiError } from '@/functions';
import {
  FormState,
  VisuallyHiddenInput,
  useAccessDocument,
  useAccountAsync,
  useCommonManage,
  useForm,
  useProductoAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import { AccountType, ProductDataType, ProveedorProductoType } from '@/types';
import {
  Add,
  ArrowBack,
  Download,
  EditNote,
  PictureAsPdf,
  Save,
} from '@mui/icons-material';
import { Box, Button, Divider, Grid, Tab, Tabs } from '@mui/material';
import {
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductForm from './components/ProductForm';
import InformacionTab from './components/InformacionTab';
import CostoPrecioTab from './components/CostoPrecioTab';
import ExistenciaTab from './components/ExistenciaTab';
import DatosContablesTab from './components/DatosContablesTab';
import ProveedoresTab from './components/ProveedoresTab';
import ProduccionTab from './components/ProduccionTab';

type ManageProductoPageProps = {};

const initialFormState: FormState = {
  productId: null,
  productCode: '',
  productName: '',
  productLongName: '',
  productMeasurementUnitId: MeasurementUnitsEnum.UNIDAD,
  productRotationProductId: ProductRotationEnum.ALTA,
  productWidth: 0,
  productLarge: 0,
  productThickness: 0,
  productWeight: 0,
  productBrand: '',
  productCaracteristics: '',
  productGroupId: undefined,
  productSubGroupId: undefined,
  productCost: 0,
  productPvp: 0,
  productCheckIva: true,
  productTotalQuantity: 0,
  productTotalExistQuantity: 0,
  productKardexQuantity: 0,
  productPurchaseQuantity: 0,
  productSaleQuantity: 0,
  productCostAccountId: undefined,
  productCostAccount: '',
  productInventoryAccountId: undefined,
  productInventoryAccount: '',
  productSaleAccountId: undefined,
  productSaleAccount: '',
  productRawMaterial: false,
  productPhoto: null,
  productFile: null,
  productState: true,
  isProduction: false,
  supplierList: [],
  warehouseList: [],
  categoryList: [],
};

const ManageProductoPage: React.FC<ManageProductoPageProps> = ({}) => {
  const { enqueueSnackbar } = useSnackbar();

  const location = useLocation();

  const productId =
    location && location.state ? location.state.productId : undefined;

  const [createMode, setCreateMode] = useState(true);

  const [editMode, setEditMode] = useState(false);

  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');

  const [productData, setProductData] = useState<ProductDataType>();

  const { closeDocument } = useAccessDocument();

  const { fetchData } = useProductoAsync();

  const { grupos, subgrupos } = useSelector((state: RootState) => state.common);

  const { fetchSave, fetchUpdate } = useProductoAsync();

  const [tabIndex, setTabIndex] = React.useState(0);
  const handleCancel = () => {
    if (productId) {
      closeDocument({
        id: productId,
        documentType: DocumentTypeEnum.PRODUCTO,
      });
    }
    navigate(PathEnum.FICHA_PRODUCTO);
    onResetForm();
    setBodegaPvpRows([]);
    setBodegaStockRows([]);
    setCategoryPvpRows([]);
  };

  const unidadMedidaList = Object.keys(MeasurementUnitsEnum)
    .filter((key): key is keyof typeof MeasurementUnitsEnum =>
      isNaN(Number(key))
    )
    .map((key) => ({ label: key, value: MeasurementUnitsEnum[key] }));

  const rotacionList = Object.keys(ProductRotationEnum)
    .filter((key): key is keyof typeof ProductRotationEnum =>
      isNaN(Number(key))
    )
    .map((key) => {
      return { label: key, value: ProductRotationEnum[key] };
    });

  const [blobImage, setBlobImage] = useState<Blob | undefined>(new Blob());

  const [blobPdf, setBlobPdf] = useState<Blob | undefined>(new Blob());

  const { fetchAccountByNumber } = useAccountAsync();

  const {
    setFormState,
    formState,
    onInputChange,
    onAutocompleteChange,
    onBooleanChange,
    onBooleanChangeClick,
    onResetForm,
    onImageChange,
    onFileChange,
    onInputNumberChange,
  } = useForm({
    ...initialFormState,
    unidadMedida: null,
    rotacion: null,
    grupo: null,
    subgrupo: null,
    cuentaCosto: null,
    cuentaInventario: null,
    cuentaIngreso: null,
  });

  const { thereIsChanges, prevFormState } = useCommonManage(formState);

  const [bodegaPvpRows, setBodegaPvpRows] = React.useState<GridRowsProp>([]);

  const [categoryPvpRows, setCategoryPvpRows] = useState<GridRowsProp>([]);

  const [bodegaStockRows, setBodegaStockRows] = useState<GridRowsProp>([]);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const [rowModesModelStock, setRowModesModelStock] =
    React.useState<GridRowModesModel>({});

  const [cuentasList, setCuentasList] = useState<AccountType[]>([]);

  const [proveedoresList, setProveedoresList] = useState<
    ProveedorProductoType[]
  >([]);

  // ? * * * * * * * * * * * * * * * *  USE EFFECT * * * * * * * * * * * * * * * * * *
  useEffect(() => {
    const getProductData = async (productId: number) => {
      fetchData(productId).then(async (response) => {
        if (response) {
          const productDataTemp = response as ProductDataType;
          setProductData(productDataTemp);
          setBlobImage(
            await downloadPhotoProducto(productDataTemp.productCode as string)
          );
          setBlobPdf(
            await downloadFileProducto(productDataTemp.productCode as string)
          );
        }
      });
    };

    if (productId) {
      setCreateMode(false);
      setEditMode(false);
      getProductData(productId);
    } else {
      setCreateMode(true);
      setEditMode(true);
    }
  }, [productId]);

  useEffect(() => {
    if (blobImage && blobImage.size > 0) {
      const blobUrl = URL.createObjectURL(blobImage);
      setFormState((prevFormState: any) => ({
        ...prevFormState,
        productPhoto: blobUrl,
      }));
    }
  }, [blobImage]);

  useEffect(() => {
    if (blobPdf && blobPdf.size > 0) {
      const blobUrl = URL.createObjectURL(blobPdf);
      setFormState((prevFormState: any) => ({
        ...prevFormState,
        productFile: blobUrl,
      }));
    }
  }, [blobPdf]);

  useEffect(() => {
    setTitle(
      createMode
        ? 'Ficha De Nuevo Producto'
        : 'Ficha De Producto (Modo Lectura) - ' + productData?.productName
    );
  }, [createMode, productData]);

  /**
   * * USE EFFECT PARA CARGAR FORMDATA CON LOS DATOS DEL PRODUCTO
   */
  useEffect(() => {
    let formPrevious: any = {};
    const fetchData = async () => {
      if (productData) {
        formPrevious = {
          ...productData,
          unidadMedida: unidadMedidaList.find(
            (item) => item.value === productData.productMeasurementUnitId
          ),
          rotacion: rotacionList.find(
            (item) => item.value === productData.productRotationProductId
          ),
          grupo: grupos.find(
            (item) => item.groupId === productData.productGroupId
          ),
          subgrupo: subgrupos.find(
            (item) => item.subgroupId === productData.productSubGroupId
          ),
          cuentaCosto: await fetchAccountByNumber(
            productData.productCostAccount as string
          ).then((response) => {
            if (response) {
              return response[0];
            }
          }),
          cuentaInventario: await fetchAccountByNumber(
            productData.productInventoryAccount as string
          ).then((response) => {
            if (response) {
              return response[0];
            }
          }),
          cuentaIngreso: await fetchAccountByNumber(
            productData.productSaleAccount as string
          ).then((response) => {
            if (response) {
              return response[0];
            }
          }),
          supplierList: await getProveedoresList(
            productData.productId as number
          ).then((response) => {
            return response;
          }),
        };

        setFormState(formPrevious);

        setBodegaPvpRows(
          productData.warehouseList.length > 0
            ? productData.warehouseList.map((item) => ({
                id: randomId(),
                ...item,
              }))
            : []
        );
        setCategoryPvpRows(
          productData.categoryList.length > 0
            ? productData.categoryList.map((item) => ({
                id: randomId(),
                ...item,
              }))
            : []
        );
        setBodegaStockRows(
          productData.warehouseList.length > 0
            ? productData.warehouseList.map((item) => ({
                id: randomId(),
                ...item,
              }))
            : []
        );
      }
    };
    Promise.all([fetchData()]).then(() => {
      prevFormState.current = formPrevious;
    });
  }, [productData]);

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow };

    const updatedRows = bodegaPvpRows.map((row) => {
      if (row.id === newRow.id) {
        return updatedRow;
      }
      return row;
    });

    if (updatedRows) {
      setFormState((prevFormState: FormState) => ({
        ...prevFormState,
        warehouseList: updatedRows,
      }));
      setBodegaPvpRows(updatedRows);
      setBodegaStockRows(updatedRows);
    }
    return updatedRow;
  };

  const processRowUpdateStock = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow };

    const updatedRows = bodegaStockRows.map((row) => {
      if (row.id === newRow.id) {
        return updatedRow;
      }
      return row;
    });

    if (updatedRows) {
      setFormState((prevFormState: any) => ({
        ...prevFormState,
        warehouseList: updatedRows,
      }));
      setBodegaStockRows(updatedRows);
      setBodegaPvpRows(updatedRows);
    }
    return updatedRow;
  };

  /**
   * * VALIDAR SI EL CODIGO DEL PRODUCTO YA EXISTE
   */
  useEffect(() => {
    const validateCode = async () => {
      const response: ServerResponseType | undefined =
        await validateExistenceByProductCode(formState.productCode);

      if (response) {
        if (response.status === 200) {
          const existance = response.message as boolean;
          if (existance) {
            enqueueSnackbar(`El código ${formState.productCode} ya existe`, {
              variant: 'warning',
            });
            setFormState({
              ...formState,
              productCode: '',
            });
          } else {
            setFormState({
              ...formState,
              productCode: formState.productCode.toUpperCase(),
            });
          }
        }
      }
    };
    if (
      formState.productCode &&
      formState.productCode !== '' &&
      createMode &&
      formState.productCode.length >= 3
    ) {
      validateCode();
    }
  }, [formState.productCode]);

  useEffect(() => {
    const fetchCuentaById = async (cuentaId: number) => {
      const response: ServerResponseType | undefined = await getCuentaById(
        cuentaId
      );

      if (response) {
        if (response.status === 200) {
          return response.message as AccountType;
        }
      }
      return {} as AccountType;
    };

    const fetchData = async () => {
      if (formState.grupo && formState.grupo !== null) {
        const cuentaCosto = await fetchCuentaById(
          formState.grupo.costAccountGroupId
        );
        const cuentaInventario = await fetchCuentaById(
          formState.grupo.inventoryAccountGroupId
        );
        const cuentaIngreso = await fetchCuentaById(
          formState.grupo.incomeAccountGroupId
        );

        setFormState((prevState: FormState) => ({
          ...prevState,
          productCostAccountId: cuentaCosto.accountId,
          productCostAccount: cuentaCosto.accountName,
          productInventoryAccountId: cuentaInventario.accountId,
          productInventoryAccount: cuentaInventario.accountName,
          productSaleAccountId: cuentaIngreso.accountId,
          productSaleAccount: cuentaIngreso.accountName,
          cuentaCosto,
          cuentaInventario,
        }));
        setCuentasList([cuentaCosto, cuentaInventario, cuentaIngreso]);
      }
    };

    fetchData();
  }, [formState.grupo]);

  useEffect(() => {
    if (
      formState.productPvp !== productData?.productPvp &&
      bodegaPvpRows.length > 0
    ) {
      setFormState((prevFormState: any) => ({
        ...prevFormState,
        warehouseList: bodegaPvpRows,
      }));

      const newRows = bodegaStockRows.map((row) => {
        const matchingBodega = bodegaPvpRows.find(
          (bodPvpRow) => bodPvpRow.branchId === row.branchId
        );

        return {
          ...row,
          unitPrice: matchingBodega ? formState.productPvp : row.unitPrice,
        };
      });

      setBodegaPvpRows(newRows);
    }
  }, [formState.productPvp]);

  useEffect(() => {
    const getCuentaIngreso = async (
      numeroCuenta: string
    ): Promise<AccountType> => {
      const response = await fetchAccountByNumber(numeroCuenta);
      if (response && response.length > 0) {
        return response[0];
      }
      return {} as AccountType;
    };

    const updateFormState = (cuentaIngreso: AccountType | undefined) => {
      if (cuentaIngreso !== undefined) {
        setFormState((prevFormState: FormState) => ({
          ...prevFormState,
          productSaleAccountId: cuentaIngreso?.accountId,
          productSaleAccount: cuentaIngreso?.accountName,
          cuentaIngreso,
        }));
      }
    };

    const handleProductCheck = async (accountType: string) => {
      const cuentaIngreso = await getCuentaIngreso(accountType);
      updateFormState(cuentaIngreso);
    };

    if (formState.productCheckIva) {
      handleProductCheck(AccountProductosEnum.CUENTA_INGRESO_IVA);
      setFormState((prevFormState: FormState) => ({
        ...prevFormState,
        taxRateId: ParametersEnum.TAX_RATE_ID_DEFAULT,
      }));
    } else {
      handleProductCheck(AccountProductosEnum.CUENTA_INGRESO_SIN_IVA);
      setFormState((prevFormState: FormState) => ({
        ...prevFormState,
        taxRateId: ParametersEnum.TAX_RATE_ID_ZERO,
      }));
    }
  }, [formState.productCheckIva]);

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle(
        'Ficha De Producto (Modo Edición) - ' + productData?.productName
      );

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
      bodegaPvpRows.forEach((row) => {
        setRowModesModel({
          ...rowModesModel,
          [row.id]: { mode: GridRowModes.View },
        });
      });
      bodegaStockRows.forEach((row) => {
        setRowModesModelStock({
          ...rowModesModelStock,
          [row.id]: { mode: GridRowModes.View },
        });
      });
      setTitle(
        'Ficha De Producto (Modo Lectura) - ' + productData?.productName
      );
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

  const isFormValid = () => {
    const thereIsAProvider = formState.supplierList.length > 0;

    if (!thereIsAProvider) {
      enqueueSnackbar('Debe agregar al menos un proveedor', {
        variant: 'warning',
      });
      return false;
    }
    if (formState.productCode === '') {
      enqueueSnackbar('El código del producto no puede estar vacío', {
        variant: 'warning',
      });
      return false;
    }
    if (formState.productName === '') {
      enqueueSnackbar('El nombre del producto no puede estar vacío', {
        variant: 'warning',
      });
      return false;
    }
    // if (formState.productLongName === '') {
    //   enqueueSnackbar('El nombre largo del producto no puede estar vacío', {
    //     variant: 'warning',
    //   });
    //   return false;
    // }
    if (formState.productBrand === '' || formState.productBrand === null) {
      enqueueSnackbar('La marca del producto no puede estar vacía', {
        variant: 'warning',
      });
      return false;
    }
    if (
      formState.productCaracteristics === '' ||
      formState.productCaracteristics === null
    ) {
      enqueueSnackbar(
        'Las características del producto no pueden estar vacías',
        {
          variant: 'warning',
        }
      );
      return false;
    }
    if (formState.productGroupId === null) {
      enqueueSnackbar('El grupo del producto no puede estar vacío', {
        variant: 'warning',
      });
      return false;
    }
    if (formState.productSubGroupId === null) {
      enqueueSnackbar('El subgrupo del producto no puede estar vacío', {
        variant: 'warning',
      });
      return false;
    }
    if (formState.productMeasurementUnitId === null) {
      enqueueSnackbar('La unidad de medida no puede estar vacía', {
        variant: 'warning',
      });
      return false;
    }
    if (formState.productRotationProductId === null) {
      enqueueSnackbar('La rotación del producto no puede estar vacía', {
        variant: 'warning',
      });
      return false;
    }
    // if (formState.productWidth === null) {
    //   enqueueSnackbar('El ancho del producto no puede estar vacío', {
    //     variant: 'warning',
    //   });
    //   return false;
    // }
    // if (formState.productLarge === null) {
    //   enqueueSnackbar('El largo del producto no puede estar vacío', {
    //     variant: 'warning',
    //   });
    //   return false;
    // }
    // if (formState.productThickness === null) {
    //   enqueueSnackbar('El espesor del producto no puede estar vacío', {
    //     variant: 'warning',
    //   });
    //   return false;
    // }
    // if (formState.productWeight === null) {
    //   enqueueSnackbar('El peso del producto no puede estar vacío', {
    //     variant: 'warning',
    //   });
    //   return false;
    // }
    if (formState.productCost === null) {
      enqueueSnackbar('El costo del producto no puede estar vacío', {
        variant: 'warning',
      });
      return false;
    }
    if (formState.productPvp === null) {
      enqueueSnackbar('El PVP del producto no puede estar vacío', {
        variant: 'warning',
      });
      return false;
    }
    if (formState.taxRateId === null) {
      enqueueSnackbar('La tasa de impuesto no puede estar vacía', {
        variant: 'warning',
      });
      return false;
    }

    return true;
  };
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid()) {
      return;
    }

    const productoToSave: ProductDataType = {
      productId: formState.productId,
      productCode: formState.productCode,
      productName: formState.productName,
      productLongName: formState.productLongName,
      productMeasurementUnitId: formState.productMeasurementUnitId,
      productRotationProductId: formState.productRotationProductId,
      productWidth: formState.productWidth,
      productLarge: formState.productLarge,
      productThickness: formState.productThickness,
      productWeight: formState.productWeight,
      productBrand: formState.productBrand,
      productCaracteristics: formState.productCaracteristics,
      productGroupId: formState.productGroupId,
      productSubGroupId: formState.productSubGroupId,
      productCost: formState.productCost,
      productPvp: formState.productPvp,
      productCheckIva: formState.productCheckIva,
      productTotalQuantity: formState.productTotalQuantity,
      productTotalExistQuantity: formState.productTotalExistQuantity,
      productKardexQuantity: formState.productKardexQuantity,
      productPurchaseQuantity: formState.productPurchaseQuantity,
      productSaleQuantity: formState.productSaleQuantity,
      productCostAccountId: formState.productCostAccountId,
      productCostAccount: formState.productCostAccount,
      productInventoryAccountId: formState.productInventoryAccountId,
      productInventoryAccount: formState.productInventoryAccount,
      productSaleAccountId: formState.productSaleAccountId,
      productSaleAccount: formState.productSaleAccount,
      productRawMaterial: formState.productRawMaterial,
      isProduction: formState.isProduction,
      taxRateId: formState.taxRateId,
      productPhoto: `${PathEnum.PRODUCTO_IMAGE_REPOSITORY}${formState.productCode}.jpg`,
      productFile: `${PathEnum.PRODUCTO_FILE_REPOSITORY}${formState.productCode}.pdf`,
      productState: formState.productState,
      supplierList: formState.supplierList,
      warehouseList: formState.warehouseList,
      categoryList: formState.categoryList,
    };

    const fetchSaveData = async () => {
      if (createMode) {
        await fetchSave(productoToSave);
      } else {
        await fetchUpdate(productoToSave, formState.productId);
      }
    };

    const uploadPhoto = async (data: FormData) => {
      const response: ServerResponseType | undefined =
        await uploadPhotoProducto(data);

      if (response) {
        if (response.status !== 200) {
          enqueueSnackbar(`Error Al Subir Imagen: ${response.message}`, {
            variant: 'error',
          });
        }
      }
    };
    const uploadFile = async (data: FormData) => {
      const response: ServerResponseType | undefined = await uploadFileProducto(
        1,
        data
      );

      if (response) {
        if (response.status !== 200) {
          enqueueSnackbar(`Error Al Subir Imagen: ${response.message}`, {
            variant: 'error',
          });
        }
      }
    };
    if (
      formState.productPhoto !== null &&
      formState.productPhoto[0] &&
      formState.productPhoto[0].length > 1
    ) {
      const base64String = formState.productPhoto[0];
      // Extract content type and base64 data from the string
      const [, base64Data] = base64String.split(';base64,');

      // Convert base64 to binary
      const binaryString = atob(base64Data);

      // Create a Uint8Array to hold binary data
      const uint8Array = new Uint8Array(binaryString.length);

      // Populate the Uint8Array with binary data
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }

      // Create a Blob from Uint8Array
      const blob = new Blob([uint8Array], { type: 'image/jpeg' });

      const formData = new FormData();

      formData.append('image', blob, `${productoToSave.productCode}.jpg`);

      uploadPhoto(formData);
    }
    fetchSaveData();

    if (
      formState.productFile &&
      formState.productFile !== null &&
      typeof formState.productFile !== 'string'
    ) {
      const formDataPdf = new FormData();

      formDataPdf.append(
        'pdf',
        formState.productFile,
        `${productoToSave.productCode}.pdf`
      );

      uploadFile(formDataPdf);
    }

    handleCancel();
  };

  const getProveedoresList = async (
    productId: number
  ): Promise<ProveedorProductoType[]> => {
    try {
      return getAllProveedoresByProducto(productId)
        .then((response: ServerResponseType | undefined) => {
          if (response && response.status === 200) {
            setProveedoresList((prevProveedoresList) => [
              ...prevProveedoresList,
              ...(response.message as ProveedorProductoType[]),
            ]);
            return response.message as ProveedorProductoType[];
          }
          return [];
        })
        .catch((error) => {
          handleApiError(error);
          return [];
        });
    } catch (error) {
      handleApiError(error);
      return Promise.resolve([]);
    }
  };

  const addNewProveedor = () => {
    setFormState((prevFormState: FormState) => ({
      ...prevFormState,
      supplierList: [
        ...prevFormState.supplierList,
        {
          providerProductId: null,
          providerId: null,
          providerName: '',
          productId: prevFormState.productId,
          productName: prevFormState.productName,
          productSupplierCode: '',
          tariffItem: 0,
          releasePercentage: 0,
          feePercentage: 0,
          cost: 0,
          checkIva: true,
          isActive: true,
        },
      ],
    }));
  };

  return (
    <>
      <CardLayout title={title}>
        <form
          onSubmit={onSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        >
          <ProductForm
            formState={formState}
            onImageChange={onImageChange}
            onInputChange={onInputChange}
            createMode={createMode}
            editMode={editMode}
            onBooleanChangeClick={onBooleanChangeClick}
          />
          <Divider />
          <Box sx={{ width: '100%', bgcolor: 'background.paper', mt: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabIndex}
                onChange={(event: React.SyntheticEvent, newValue: number) => {
                  event ? setTabIndex(newValue) : null;
                }}
              >
                <Tab label="Información General" />
                <Tab label="Costo Y Precio" />
                <Tab label="Existencia" />
                <Tab label="Datos Contables" />
                <Tab label="Proveedor" />
                <Tab label="Producción" />
                <Tab label="Ficha Técnica" />
                {(editMode || createMode) && tabIndex === 4 && (
                  <div>
                    <Grid
                      container
                      direction="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Button
                        startIcon={<Add />}
                        sx={{ margin: 2 }}
                        onClick={addNewProveedor}
                        style={{ width: '100%' }}
                      >
                        {'Agregar Proveedor'}
                      </Button>
                    </Grid>
                  </div>
                )}
              </Tabs>
            </Box>
            <InformacionTab
              formState={formState}
              tabIndex={tabIndex}
              value={0}
              onInputChange={onInputChange}
              createMode={createMode}
              editMode={editMode}
              onAutocompleteChange={onAutocompleteChange}
              setFormState={setFormState}
              onInputNumberChange={onInputNumberChange}
            />
            <CostoPrecioTab
              formState={formState}
              tabIndex={tabIndex}
              value={1}
              onInputChange={onInputChange}
              createMode={createMode}
              editMode={editMode}
              onAutocompleteChange={onAutocompleteChange}
              onBooleanChange={onBooleanChange}
              bodegaPvpRows={bodegaPvpRows}
              setBodegaPvpRows={setBodegaPvpRows}
              categoryPvpRows={categoryPvpRows}
              productData={productData}
              processRowUpdate={processRowUpdate}
              onInputNumberChange={onInputNumberChange}
            />
            {!createMode && (
              <ExistenciaTab
                tabIndex={tabIndex}
                value={2}
                createMode={createMode}
                editMode={editMode}
                bodegaStockRows={bodegaStockRows}
                setBodegaStockRows={setBodegaStockRows}
                processRowUpdate={processRowUpdateStock}
              />
            )}

            <DatosContablesTab
              formState={formState}
              tabIndex={tabIndex}
              value={3}
              createMode={createMode}
              onAutocompleteChange={onAutocompleteChange}
              cuentasList={cuentasList}
              setCuentasList={setCuentasList}
              setFormState={setFormState}
            />
            <ProveedoresTab
              formState={formState}
              tabIndex={tabIndex}
              value={4}
              createMode={createMode}
              editMode={editMode}
              proveedoresList={proveedoresList}
              setProveedoresList={setProveedoresList}
              onInputChange={onInputChange}
              onAutocompleteChange={onAutocompleteChange}
              setFormState={setFormState}
              onBooleanChange={onBooleanChange}
            />
            <ProduccionTab
              formState={formState}
              tabIndex={tabIndex}
              value={5}
              createMode={createMode}
              editMode={editMode}
              onBooleanChange={onBooleanChange}
            />
            <TabPanel value={tabIndex} index={6}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  {formState.productFile instanceof Blob ? (
                    <PDFViewer
                      pdfUrl={URL.createObjectURL(formState.productFile)}
                    />
                  ) : (
                    formState.productFile !== null && (
                      <PDFViewer pdfUrl={formState.productFile} />
                    )
                  )}
                </Grid>
                <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ mt: 2 }}
                >
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<PictureAsPdf />}
                    onClick={() =>
                      enqueueSnackbar(
                        'Para visualizar el nuevo archivo debe guardar el producto',
                        { variant: 'info' }
                      )
                    }
                  >
                    {formState.productFile === null
                      ? 'Cargar Archivo'
                      : 'Actualizar Archivo'}
                    <VisuallyHiddenInput
                      type="file"
                      name="productFile"
                      accept="application/pdf"
                      onChange={onFileChange}
                    />
                  </Button>
                  {blobPdf instanceof Blob && (
                    <Button
                      component="label"
                      variant="contained"
                      sx={{ ml: 2 }}
                      startIcon={<Download />}
                      onClick={async () => {
                        downloadPdf(
                          blobPdf,
                          `ficha_tecnica_${formState.productCode}.pdf`
                        );
                      }}
                    >
                      Descargar PDF
                    </Button>
                  )}
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 2 }}
          >
            <Button
              startIcon={<ArrowBack />}
              sx={{ margin: 2 }}
              onClick={() => {
                navigate(PathEnum.FICHA_PRODUCTO);
                handleCancel();
              }}
              style={{ width: '150px' }}
            >
              {'Regresar'}
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
              sx={{ margin: 2 }}
              type="submit"
              style={{ width: '150px' }}
              disabled={!thereIsChanges}
            >
              {'Guardar'}
            </Button>
          </Grid>
        </form>
      </CardLayout>
    </>
  );
};

export default ManageProductoPage;
