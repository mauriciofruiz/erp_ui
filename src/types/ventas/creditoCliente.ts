export type CreditoClienteType = {
    creditClientId?: number | null;
    clientId?: number | null;
    authorizedCreditLimit?: number | null;
    availableCreditLimit?: number | null;
    usedCreditLimit?: number | null;
    guaranteeAmount?: number | null;
    guaranteeDate?: Date | null;
    creditDays?: number | null;
    creditObservation: string;
    overlimit?: number | null;
    overlimitExpirationDate?: Date | null;
}