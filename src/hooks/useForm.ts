import { validateEmail } from '@/functions';
import { SelectChangeEvent } from '@mui/material';
import { useEffect, useMemo, useState, ChangeEvent } from 'react';

export interface FormState {
  [key: string]: any;
}

interface FormHookResult extends FormState {
  formState: FormState;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  onResetForm: () => void;
  isFormValid: boolean;
  onDateChange: (value: Date, name: string) => void;
  OnSelectChange: (event: SelectChangeEvent<any>) => void;
  onBooleanChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string,
    index?: number,
    listName?: string
  ) => void;
  onBooleanChangeClick: (name: string, value: boolean) => void;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  onImageChange: (
    event: ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onNumberChange: (
    event: ChangeEvent<HTMLInputElement>,
    decimalPlaces: number
  ) => void;
  onValidacionRazonNombreComerial: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  onValidarCorreo: (event: ChangeEvent<HTMLInputElement>) => void;
  onInputJustNumber: (event: ChangeEvent<HTMLInputElement>) => void;
  onInputNumberChange: (value: number, field: string) => void;
  onGenericChange: (value: any, field: string) => void;
}

export const useForm = (initialForm: FormState = {}): FormHookResult => {
  const [formState, setFormState] = useState<FormState>(initialForm);
  const [formErrors, setFormErrors] = useState<FormState>(initialForm);

  useEffect(() => {
    setFormState(initialForm);
    setFormErrors(initialForm);
  }, []);

  const isFormValid = useMemo(() => {
    for (const formValue of Object.values(formState)) {
      if (formValue === '') {
        return false;
      }
    }
    return true;
  }, [formState]);

  const isFormValidComplete = useMemo(() => {
    for (const formValue of Object.values(formState)) {
      if (formValue === null || formValue === '') {
        return false;
      }
    }
    return true;
  }, [formState]);

  const onInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => {
    const { name, value } = event.target;
    if (index !== undefined && listName !== undefined) {
      const { value, name } = event.target;
      const list = formState[listName];
      list[index][name] = value;
      setFormState((prevFormState: FormState) => ({
        ...prevFormState,
        [listName]: list,
      }));
    } else {
      if (typeof value === 'string' && value.length > 0) {
        setFormState((prevFormState) => ({
          ...prevFormState,
          [name]: value.toUpperCase(),
        }));
      } else {
        setFormState((prevFormState) => ({
          ...prevFormState,
          [name]: value,
        }));
      }
    }
  };

  const onNumberChange = (
    event: ChangeEvent<HTMLInputElement>,
    decimalPlaces: number
  ) => {
    const { name, value } = event.target;

    const numberString = parseFloat(value).toFixed(decimalPlaces);
    setFormState((prevFormState) => ({
      ...prevFormState,
      [name]: parseFloat(numberString),
    }));
  };

  const onDateChange = (value: Date, name: string) => {
    // Paso 1: Obtener la fecha seleccionada
    const selectedDate = value as Date;

    // Paso 2: Obtener la hora actual
    const currentDate = new Date();

    // Paso 3: Combinar ambos
    const combinedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      currentDate.getHours(),
      currentDate.getMinutes(),
      currentDate.getSeconds(),
      currentDate.getMilliseconds()
    );
    setFormState((prevState: FormState) => ({
      ...prevState,
      [name]: combinedDate,
    }));
  };

  const OnSelectChange = (event: SelectChangeEvent<any>) => {
    setFormState((prevState: FormState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  const onBooleanChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string,
    index?: number,
    listName?: string
  ) => {
    if (index !== undefined && listName !== undefined) {
      const value = event.target.checked;
      const list = formState[listName];
      list[index][name] = value;
      setFormState((prevFormState: FormState) => ({
        ...prevFormState,
        [listName]: list,
      }));
    } else {
      setFormState((prevState: FormState) => ({
        ...prevState,
        [name]: event.target.checked,
      }));
    }
  };

  const onBooleanChangeClick = (name: string, value: boolean) => {
    setFormState((prevState: FormState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onAutocompleteChange = (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => {
    if (event != null && value != null) {
      if (index !== undefined) {
        setFormState((prevFormState: FormState) => {
          const updatedList = [...prevFormState[name]];

          // Update the item at the specified index
          updatedList[index] = {
            ...updatedList[index],
            ...value,
          };

          return {
            ...prevFormState,
            [name]: updatedList,
          };
        });
      } else {
        setFormState((prevState: FormState) => ({
          ...prevState,
          [name]: value,
        }));
      }
    } else {
      setFormState((prevState: FormState) => ({
        ...prevState,
        [name]: null,
      }));
    }
  };

  const onImageChange = (
    event: ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => {
    const { name, files } = event.target;
    const value = files ? files[0] : null;

    if (value !== null) {
      if (index !== undefined && listName !== undefined) {
        setFormState((prevFormState: any) => {
          const updatedList = [...prevFormState[listName]];

          updatedList[index] = {
            ...updatedList[index],
            [name]: value,
          };

          return {
            ...prevFormState,
            [listName]: updatedList,
          };
        });
      } else {
        const reader = new FileReader();

        const url = reader.readAsDataURL(value);
        reader.onloadend = function () {
          setFormState((prevFormState) => ({
            ...prevFormState,
            [name]: [reader.result],
          }));
        }.bind(this);

        console.log(url);

        setFormState((prevFormState) => ({
          ...prevFormState,
          [name]: value,
        }));
      }
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target;
    const value = files ? files[0] : null;

    if (value !== null) {
      setFormState((prevFormState) => ({
        ...prevFormState,
        [name]: value,
      }));
    }
  };
  const onResetForm = () => {
    setFormState(initialForm);
  };

  const onValidacionRazonNombreComerial = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    // Expresión regular que solo permite letras y números
    const regex = /^[a-zA-Z0-9\s]*$/;

    if (regex.test(value)) {
      if (value.length >= 5 && value.length <= 500) {
        setFormErrors({
          [name]: '',
        });
        setFormState({
          ...formState,
          [name]: value,
        });
      } else {
        setFormState({
          ...formState,
          [name]: value,
        });
        setFormErrors({
          [name]: 'El número de carácteres debe ser mayor a 5',
        });
      }
    }
  };

  const onValidarCorreo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (validateEmail(value)) {
      setFormState({
        ...formState,
        [name]: value,
      });
      setFormErrors({
        [name]: '',
      });
    } else {
      setFormState({
        ...formState,
        [name]: value,
      });
      setFormErrors({
        [name]: 'El correo ingresado es incorrecto',
      });
    }
  };

  const onInputChangeDiscountPorcentage = (event: any) => {
    const { name, value } = event.target;
    // Validar si el valor tiene hasta dos decimales
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setFormState({
        ...formState,
        [name]: value,
      });
    }

    if (value < 0 || value > 100) {
      setFormErrors({
        ...formErrors,
        [name]: 'El descuento debe estar entre 0 y 100',
      });
    } else {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const onInputChangeTwoDecimal = (event: any) => {
    const { name, value } = event.target;
    // Validar si el valor tiene hasta dos decimales
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setFormState({
        ...formState,
        [name]: value,
      });
    }
  };

  const onInputJustNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const regex = /^[0-9\s]*$/;
    if (regex.test(value)) {
      setFormState({
        ...formState,
        [name]: value,
      });
    } else {
      setFormState({
        ...formState,
        [name]: '',
      });
    }
  };

  const onInputNumberChange = (value: number, field: string) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const onGenericChange = (value: any, field: string) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  return {
    ...formState,
    formState,
    formErrors,
    setFormErrors,
    onValidacionRazonNombreComerial,
    onInputJustNumber,
    onValidarCorreo,
    onInputChange,
    onDateChange,
    OnSelectChange,
    onBooleanChange,
    onBooleanChangeClick,
    onAutocompleteChange,
    onResetForm,
    isFormValid,
    setFormState,
    onImageChange,
    onFileChange,
    onNumberChange,
    isFormValidComplete,
    onInputNumberChange,
    onInputChangeDiscountPorcentage,
    onInputChangeTwoDecimal,
    onGenericChange,
  };
};
