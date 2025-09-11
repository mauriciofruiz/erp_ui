import {
  getUserInDocument,
  lockDocument,
  unlockDocument,
  validateAccessDocument,
} from '@/backend/tba';
import { DocumentTypeEnum } from '@/enums';
import { getDocumentNameByEnum } from '@/functions';
import { RootState } from '@/store';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';

export interface OpenDocumentParams {
  id: number;
  navigation: (path?: string, args?: any) => void;
  documentType: DocumentTypeEnum;
}

export interface CloseDocumentParams {
  id: number;
  documentType: DocumentTypeEnum;
}

export const useAccessDocument = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useSelector((state: RootState) => state.auth);

  // ? * * * * * * * * * * *  CONTROL DOCUMENT ACCESS
  const openDocument = async ({
    id,
    navigation,
    documentType,
  }: OpenDocumentParams) => {
    const apiCall = async (
      endpoint: (args: any) => Promise<any>,
      args: any
    ) => {
      try {
        const response = await endpoint(args);
        if (response && response.status === 200) {
          return response.message;
        }
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        return false;
      }
    };

    const validated = await apiCall(validateAccessDocument, {
      accessDocumentId: null,
      documentTypeId: documentType,
      documentId: id,
      userName: user?.userNick ?? 'unknown',
    });
    if (validated.statusCodeValue === 200) {
      const allowOpen = await apiCall(lockDocument, {
        accessDocumentId: null,
        documentTypeId: documentType,
        documentId: id,
        userName: user?.userNick ?? 'unknown',
      });
      if (allowOpen.statusCodeValue === 200) {
        navigation();
      }
    } else {
      const userInDocument = await apiCall(getUserInDocument, {
        accessDocumentId: null,
        documentTypeId: documentType,
        documentId: id,
        userName: user?.userNick ?? 'unknown',
      });
      enqueueSnackbar(
        `Este documento N° ${
          userInDocument.body.documentId
        }, de tipo ${getDocumentNameByEnum(
          userInDocument.body.documentTypeId
        )}, se encuentra abierto por ${userInDocument.body.userName}`,
        { variant: 'error' }
      );
    }
  };

  const closeDocument = async ({ id, documentType }: CloseDocumentParams) => {
    const apiCall = async (
      endpoint: (args: any) => Promise<any>,
      args: any
    ) => {
      try {
        await endpoint(args);
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    };

    await apiCall(unlockDocument, {
      accessDocumentId: null,
      documentTypeId: documentType,
      documentId: id,
      userName: user?.userNick ?? 'unknown',
    });
  };

  const openExternalDocument = async (props: {
    id: number;
    documentType: DocumentTypeEnum;
    options: any;
    target: string;
  }) => {
    const { id, documentType, options, target } = props;
    const apiCall = async (
      endpoint: (args: any) => Promise<any>,
      args: any
    ) => {
      try {
        const response = await endpoint(args);
        if (response && response.status === 200) {
          return response.message;
        }
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        return false;
      }
    };

    const validated = await apiCall(validateAccessDocument, {
      accessDocumentId: null,
      documentTypeId: documentType,
      documentId: id,
      userName: user?.userNick ?? 'unknown',
    });
    if (validated.statusCodeValue === 200) {
      const allowOpen = await apiCall(lockDocument, {
        accessDocumentId: null,
        documentTypeId: documentType,
        documentId: id,
        userName: user?.userNick ?? 'unknown',
      });
      if (allowOpen.statusCodeValue === 200) {
        if (options.state) {
          localStorage.setItem('state', JSON.stringify(options.state));
        }
        window.open(target, '_blank', 'noreferrer');
      }
    } else {
      const userInDocument = await apiCall(getUserInDocument, {
        accessDocumentId: null,
        documentTypeId: documentType,
        documentId: id,
        userName: user?.userNick ?? 'unknown',
      });
      enqueueSnackbar(
        `Este documento N° ${
          userInDocument.body.documentId
        }, de tipo ${getDocumentNameByEnum(
          userInDocument.body.documentTypeId
        )}, se encuentra abierto por ${userInDocument.body.userName}`,
        { variant: 'error' }
      );
    }
  };

  return {
    openDocument,
    closeDocument,
    openExternalDocument,
  };
};
