import { TipoIdetificacionFiscalEnum } from '@/enums';

export function validateCedulaRuc(param: string): boolean {
  let esValida = false;
  let digitosRuc = '0';

  if (param.length === 13 || !/^\d+$/.test(param)) {
    digitosRuc = param.slice(10, 13);
  }

  // Verificar que la cédula tenga 10 dígitos
  if (param.length === 10 || digitosRuc === '001') {
    const digitos = param.slice(0, 9).split('').map(Number);
    const ultimoDigito = Number(param[9]);

    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = digitos[i] * (i % 2 === 0 ? 2 : 1);
      suma += valor > 9 ? valor - 9 : valor;
    }

    const siguienteMultiploDe10 = Math.ceil(suma / 10) * 10;
    const digitoCalculado = siguienteMultiploDe10 - suma;

    if (digitoCalculado === 10) {
      ultimoDigito === 0;
    }

    if (digitoCalculado === ultimoDigito) {
      esValida = true;
    }
  } else {
    esValida;
  }
  return esValida;
}

export const validateEmail = (email: string) => {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (emailPattern.test(email)) return true;
  else return false;
};

export const validateCellphone = (cellphone: string | null) => {
  return cellphone === null || cellphone.length === 10 || cellphone === '';
};

export const validarNumeroIdentificacion = (
  identificationNumber: string,
  tipoIdentificacionId: string
) => {
  // Expresión regular que solo permite letras y números
  const ciRuc = /^[0-9\s]*$/;
  const passport = /^[a-zA-z0-9\s]*$/;
  let maxLength = 0;

  if (
    tipoIdentificacionId === TipoIdetificacionFiscalEnum.RUC_COMPRA ||
    tipoIdentificacionId === TipoIdetificacionFiscalEnum.RUC_VENTA
  ) {
    maxLength = 13;
    if (ciRuc.test(identificationNumber)) {
      if (identificationNumber.length === maxLength) {
        if (validateCedulaRuc(identificationNumber)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  } else if (
    tipoIdentificacionId === TipoIdetificacionFiscalEnum.CEDULA_COMPRA ||
    tipoIdentificacionId === TipoIdetificacionFiscalEnum.CEDULA_VENTA
  ) {
    maxLength = 10;
    if (ciRuc.test(identificationNumber)) {
      if (identificationNumber.length === 10) {
        if (validateCedulaRuc(identificationNumber)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  } else if (
    tipoIdentificacionId === TipoIdetificacionFiscalEnum.PASSPORT_COMPRA ||
    tipoIdentificacionId === TipoIdetificacionFiscalEnum.PASSPORT_VENTA
  ) {
    if (passport.test(identificationNumber)) {
      maxLength = 13;
      if (identificationNumber.length === maxLength) {
        return true;
      } else {
        return false;
      }
    }
  }
  return false;
};
