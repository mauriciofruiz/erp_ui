import {
  ComprobanteEstadoEnum,
  ComprobanteTypeEnum,
  DocumentTypeEnum,
  EstadoDepositoEnum,
  FormaPagoEnum,
  MeasurementUnitsEnum,
  TipoAdquisicionEnum,
  TipoNotaCreditoEnum,
} from '@/enums';
import { EstadoSolicitudEnum } from '@/enums/EstadoSolicitudEnum';
import { TipoDepositoEnum } from '@/enums/TipoDepositoEnum';
import { RootState, ServerResponseType } from '@/store';
import { setPosition } from '@/store/auth/authSlice';
import { DepartmentType, MenuType, UserLoginType } from '@/types';
import axios from 'axios';
import { format, parse } from 'date-fns';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';

export const getStartDateSystem = () => {
  return new Date(2021, 5, 1);
};

export const formatDate = (date: Date | null) => {
  if (!date) {
    return '';
  }
  const formattedDate = new Date(date);
  return formattedDate.toLocaleDateString();
};

export function parseDateWithMiliseconds(dateString: string): string {
  if (dateString === null || dateString === undefined) return '';
  const truncatedDate = dateString.split('.')[0]; // Truncate the date to remove microseconds
  const date = parse(truncatedDate, "yyyy-MM-dd'T'HH:mm:ss", new Date());
  return format(new Date(date), 'dd-MM-yyyy');
}

export const setCargoDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { positions } = useSelector((state: RootState) => state.common);

  const dispatch = useDispatch();
  if (positions && positions.length > 0) {
    const usuarioCargo = positions.filter(
      (c) => c.positionId === user?.position
    );
    if (usuarioCargo) {
      dispatch(setPosition(usuarioCargo[0]));
    }
  }
};
/**
 * Se usar para llamar funciones asincronas desde una función síncrona
 * Checks if the given array is null or empty and calls the provided
 * setAsyncFunc if it is.
 *
 * @param {any[] | null} array - The array to be checked.
 * @param {() => void} setAsyncFunc - The function to be called if the array is null or empty.
 */
export const checkAndSetAsync = (
  array: any[] | null,
  setAsyncFunc: () => void
) => {
  if (!array || array.length === 0) {
    setAsyncFunc();
  }
};

/**
 * Removes accents from a string.
 *
 * @param {string} str - The string to remove accents from.
 * @return {string} The string without accents.
 */
export function removeAccents(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export const formatDateBackEnd = (inputDateStr: string): string => {
  if (!inputDateStr || inputDateStr === '' || inputDateStr === null) return '';
  const inputDate = new Date(inputDateStr);

  if (isNaN(inputDate.getTime())) {
    // Invalid date string
    return 'Invalid Date';
  }

  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, '0');
  const day = String(inputDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export function getDateWithMonthName(date: Date): string {
  const month = date.toLocaleString('default', { month: 'long' });
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day} de ${month} de ${year}`;
}

export const getMenuByUrl = (url: string, user: UserLoginType): MenuType => {
  const menusbyuser = user.menuList;
  const menutoreturn =
    menusbyuser?.filter((menu) => menu.menuUrl === url) || [];
  return menutoreturn[0];
};

export function formatDateWithTime(inputDate: string): string {
  const inputDateTime = new Date(inputDate);

  const day = inputDateTime.getDate().toString().padStart(2, '0');
  const month = (inputDateTime.getMonth() + 1).toString().padStart(2, '0');
  const year = inputDateTime.getFullYear();
  const hours = inputDateTime.getHours().toString().padStart(2, '0');
  const minutes = inputDateTime.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function allowDecimalsMeaseurementUnit(
  measurementUnitId: number | null
): boolean {
  if (!measurementUnitId || measurementUnitId === null) return false;
  if (measurementUnitId === MeasurementUnitsEnum.UNIDAD) {
    return false;
  }
  return true;
}

export function getDepartmentByPosition(
  departmentPosition: number,
  departments: DepartmentType[]
): number {
  const departmentUser = departments.find(
    (d) => d.departmentId === departmentPosition
  );

  return departmentUser?.departmentId || 0;
}

export function handleDecimalsOnValue(
  identificationNumber: string,
  decimalPlaces: number = 2
) {
  const regex = new RegExp(
    `([0-9]*[\.|\,]{0,1}[0-9]{0,${decimalPlaces}})`,
    's'
  );
  const match = identificationNumber.match(regex);
  return match ? match[0] : '';
}

export function setDecimalPlaces(num: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  const number = Number(num);
  const roundedNumber = Math.round((number + Number.EPSILON) * factor) / factor;
  return Object.is(roundedNumber, -0) ? 0 : roundedNumber;
}

export function setDecimalPlacesString(
  num: number,
  decimalPlaces: number
): string {
  // Convertir el número a una cadena con el formato adecuado
  let formattedNumber = new Intl.NumberFormat('es-ES', {
    style: 'decimal',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(num as number);

  // Asegurarse de que siempre se incluya el separador de miles
  if (num < 10000) {
    let [integerPart, decimalPart] = `${formattedNumber}`.split(',');
    // Reemplazar el punto decimal con una coma
    if (decimalPart) {
      decimalPart = `,${decimalPart}`;
    } else {
      decimalPart = '';
    }

    // Añadir separadores de miles a la parte entera
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return integerPart + decimalPart;
  }

  return formattedNumber;
}

export function setCurrencyNumber(num: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(num as number);
}

export function setPercentageNumber(
  num: number,
  decimalPlaces: number
): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(num as number);
}

//! delete this function
export const navigateExternal = (target: string, options: any) => {
  if (options.state) {
    localStorage.setItem('state', JSON.stringify(options.state));
  }
  window.open(target, '_blank', 'noreferrer');
};

export function getDocumentNameByEnum(
  identificationNumber: DocumentTypeEnum
): string {
  const enumName = DocumentTypeEnum[identificationNumber];
  return enumName.replace(/_/g, ' ');
}

export const downloadPdf = async (
  pdfBlob: Blob | undefined,
  documentName: string
) => {
  if (pdfBlob) {
    const href = window.URL.createObjectURL(pdfBlob);

    const anchorElement = document.createElement('a');
    anchorElement.href = href;
    anchorElement.download = documentName;
    document.body.appendChild(anchorElement);

    anchorElement.click();

    document.body.removeChild(anchorElement);
    window.URL.revokeObjectURL(href);
  } else {
    enqueueSnackbar('No se pudo descargar el archivo', {
      variant: 'error',
    });
  }
};

/**
 * Helper function to share files.
 *
 * @param filesArray - The array of files to share.
 */
export const onShare = async (filesArray: File[] = []) => {
  // Verificar que todos los archivos tengan contenido
  const allFilesHaveContent = await Promise.all(
    filesArray.map(async (file) => {
      const content = await file.arrayBuffer();
      return content.byteLength > 0;
    })
  );

  if (!allFilesHaveContent.every((hasContent) => hasContent)) {
    enqueueSnackbar('Uno o más archivos están vacíos', { variant: 'error' });
    return;
  }

  if (navigator.canShare && navigator.canShare({ files: filesArray })) {
    navigator
      .share({
        title: 'SICON',
        text: 'Enviado Desde Sicon Suite ERP',
        url: 'https://siconecuador.com',
        files: filesArray,
      })
      .then(() => console.log('Share was successful.'))
      .catch((error) => console.log('Sharing failed', error));
  } else {
    enqueueSnackbar('No se pudo compartir el contenido', { variant: 'error' });
  }
};

export function generateRandomColors(data: any[]) {
  const randomColor = () => Math.floor(Math.random() * 256);

  return data.map(
    () => `rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, 0.5)`
  );
}

export function generatePastelColors(data: any[]) {
  const randomPastelColor = () => Math.floor(Math.random() * 156) + 100; // Adjusted range for pastel colors

  return data.map(
    () =>
      `rgba(${randomPastelColor()}, ${randomPastelColor()}, ${randomPastelColor()}, 0.5)`
  );
}

export function handleApiError(error: any): ServerResponseType {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data,
      };
    } else {
      return {
        status: 500,
        message: 'Error Del Servidor: ' + error.message,
      };
    }
  }
  // Handle other types of errors if needed
  return {
    status: 500,
    message: 'Internal Server Error',
  };
}

export function extractFacturaNumber(factura: string): string {
  if (factura.length > 39 && /^\d+$/.test(factura)) {
    const facturaNumber = factura.slice(24, 39);
    return facturaNumber;
  }
  return '';
}

export function extractDateFromAutorizacion(
  currentDate: Date,
  autorizacion: string
): Date {
  if (
    (autorizacion.length === 47 || autorizacion.length === 49) &&
    /^\d+$/.test(autorizacion)
  ) {
    const dateString = autorizacion.substring(0, 8);
    const day = parseInt(dateString.substring(0, 2));
    const month = parseInt(dateString.substring(2, 4)) - 1; // Los meses en JavaScript comienzan desde 0
    const year = parseInt(dateString.substring(4, 8));

    const currentDate = new Date();

    return new Date(
      year,
      month,
      day,
      currentDate.getHours(),
      currentDate.getMinutes(),
      currentDate.getSeconds(),
      currentDate.getMilliseconds()
    );
  }
  return currentDate;
}

export function getPercentageValue(
  identificationNumber: number,
  percentage: number
): number {
  return (identificationNumber * percentage) / 100;
}

export const estadoDocumentoList = Object.keys(DocumentTypeEnum)
  .filter((key): key is keyof typeof DocumentTypeEnum => isNaN(Number(key)))
  .map((key) => {
    const label = key.replace(/_/g, ' ');
    return { label: label, identificationNumber: DocumentTypeEnum[key] };
  });

export const getComprobanteEstadoList = () => {
  return Object.keys(ComprobanteEstadoEnum)
    .filter((key): key is keyof typeof ComprobanteEstadoEnum =>
      isNaN(Number(key))
    )
    .map((key) => {
      const label = key.replace(/_/g, ' ');
      return { label: label, identificationNumber: ComprobanteEstadoEnum[key] };
    });
};

export const getEstadoSolicitudList = () => {
  return Object.keys(EstadoSolicitudEnum)
    .filter((key): key is keyof typeof EstadoSolicitudEnum =>
      isNaN(Number(key))
    )
    .map((key) => {
      const label = key.replace(/_/g, ' ');
      return { label: label, identificationNumber: EstadoSolicitudEnum[key] };
    });
};

export const getTipoAdquisicionList = () => {
  return Object.keys(TipoAdquisicionEnum)
    .filter((key): key is keyof typeof TipoAdquisicionEnum =>
      isNaN(Number(key))
    )
    .map((key) => {
      const label = key.replace(/_/g, ' ');
      return { label: label, identificationNumber: TipoAdquisicionEnum[key] };
    });
};

export const getComprobanteTypeList = () => {
  return Object.keys(ComprobanteTypeEnum)
    .filter((key): key is keyof typeof ComprobanteTypeEnum =>
      isNaN(Number(key))
    )
    .map((key) => {
      const label = key.replace(/_/g, ' ');
      return { label: label, identificationNumber: ComprobanteTypeEnum[key] };
    });
};

export const getNCTypeList = () => {
  return Object.keys(TipoNotaCreditoEnum)
    .filter((key): key is keyof typeof TipoNotaCreditoEnum =>
      isNaN(Number(key))
    )
    .map((key) => {
      const label = key.replace(/_/g, ' ');
      return { label: label, identificationNumber: TipoNotaCreditoEnum[key] };
    });
};

export const getStatusDepositList = () => {
  return Object.keys(EstadoDepositoEnum)
    .filter((key): key is keyof typeof EstadoDepositoEnum => isNaN(Number(key)))
    .map((key) => {
      const label = key.replace(/_/g, ' ');
      return { label: label, identificationNumber: EstadoDepositoEnum[key] };
    });
};

export const getPaymentMethodList = () => {
  return Object.keys(FormaPagoEnum)
    .filter((key): key is keyof typeof FormaPagoEnum => isNaN(Number(key)))
    .map((key) => {
      const label = key.replace(/_/g, ' ');
      return { label: label, identificationNumber: FormaPagoEnum[key] };
    });
};

export const getDepositTypeList = () => {
  return Object.keys(TipoDepositoEnum)
    .filter((key): key is keyof typeof TipoDepositoEnum => isNaN(Number(key)))
    .map((key) => {
      const label = key.replace(/_/g, ' ');
      return { label: label, identificationNumber: TipoDepositoEnum[key] };
    });
};

export const getDecimalPlaces = (unitMeasureId: number) => {
  if (allowDecimalsMeaseurementUnit(unitMeasureId)) {
    return 6;
  }
  return 0;
};

export const defaultParserInputNumber = (
  identificationNumber: string | undefined,
  decimalPlaces: number
): number => {
  if (!identificationNumber) return NaN;

  const hasDecimalPlaces = decimalPlaces > 0;

  if (hasDecimalPlaces) {
    const parts = identificationNumber.split('.');
    if (parts.length > 2) {
      // Conservar el primer punto de derecha a izquierda y eliminar los demás puntos
      const integerPart = parts.slice(0, -1).join('');
      const decimalPart = parts.slice(-1);
      const strinNumber = integerPart + '.' + decimalPart;
      return setDecimalPlaces(Number(strinNumber), decimalPlaces);
    }
    return setDecimalPlaces(Number(identificationNumber), decimalPlaces);
  }

  // Eliminar separadores de miles y reemplazar coma por punto decimal
  const parsedValue = identificationNumber.replace(/\./g, '').replace(',', '.');

  return setDecimalPlaces(Number(parsedValue), decimalPlaces);
};

export const addWorkdays = (date: string, days: number): Date => {
  let result = new Date(date);
  let addedDays = 0;
  while (addedDays < days) {
    result = dayjs(result).add(1, 'day').toDate();
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      // Skip Sundays (0) and Saturdays (6)
      addedDays++;
    }
  }
  return result;
};
