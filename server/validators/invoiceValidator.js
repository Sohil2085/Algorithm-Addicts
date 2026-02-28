import { z } from "zod";

/*
  Valid Indian GST State Codes (01–38)
*/
const validStateCodes = [
    "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
    "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
    "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
    "31", "32", "33", "34", "35", "36", "37", "38"
];

/*
  GSTIN Format:
  1-2   : State Code
  3-12  : PAN (5 letters + 4 digits + 1 letter)
  13    : Entity Code (alphanumeric except 0)
  14    : Always Z
  15    : Checksum (alphanumeric)
*/

const invoiceSchema = z.object({
    amount: z
        .number({
            required_error: "Amount is required",
            invalid_type_error: "Amount must be a number",
        })
        .positive("Amount must be greater than 0"),

    dueDate: z.coerce
        .date({
            required_error: "Due date is required",
            invalid_type_error: "Invalid date format",
        })
        .refine((date) => date > new Date(), {
            message: "Due date must be in the future",
        }),

    buyerGSTIN: z
        .string({
            required_error: "Buyer GSTIN is required",
        })
        .trim()
        .toUpperCase()
        .length(15, { message: "GSTIN must be exactly 15 characters" })
        .regex(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
            "Invalid GSTIN format"
        )
        .refine((val) => validStateCodes.includes(val.substring(0, 2)), {
            message: "Invalid GST state code",
        }),

    invoiceNumber: z.string().optional(),
});

/*
  Validation Wrapper
*/
export const validateInvoice = (data) => {
    const result = invoiceSchema.safeParse(data);

    if (!result.success) {
        const errorMessages = (result.error.issues || []).map(
            (err) => err.message
        );

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