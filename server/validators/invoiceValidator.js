import { z } from 'zod';

const invoiceSchema = z.object({
    amount: z
        .number({ required_error: "Amount is required", invalid_type_error: "Amount must be a number" })
        .positive("Amount must be greater than 0"),

    dueDate: z.coerce
        .date({ required_error: "Due date is required", invalid_type_error: "Invalid date format" })
        .refine((date) => date > new Date(), {
            message: "Due date must be in the future",
        }),

    buyerGSTIN: z
        .string({ required_error: "Buyer GSTIN is required" })
        .length(15, "GSTIN must be exactly 15 characters")
        .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format"),

    invoiceNumber: z.string().optional(),
});

export const validateInvoice = (data) => {
    const result = invoiceSchema.safeParse(data);

    if (!result.success) {
        const errorMessages = (result.error.issues || []).map((err) => err.message);
        return {
            success: false,
            errors: errorMessages,
        };
    }

    return {
        success: true,
        data: result.data,
    };
};
