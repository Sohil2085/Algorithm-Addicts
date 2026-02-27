import { z } from 'zod';

const LenderTypeEnum = z.enum([
    'BANK',
    'NBFC',
    'REGISTERED_COMPANY',
    'INDIVIDUAL_INVESTOR',
    'OTHER_FINANCIAL_ENTITY'
]);

export const submitLenderKycSchema = z.object({
    lenderType: LenderTypeEnum,
    organizationName: z.string().optional(),
    registrationNumber: z.string().optional(),
    rbiLicenseNumber: z.string().optional(),
    gstNumber: z.string().optional(),
    panNumber: z.string().optional(),
    contactPersonName: z.string().optional(),
    contactPhone: z.string().optional(),
    officialEmail: z.string().email().optional().or(z.literal('')),
    capitalRange: z.string().optional(),
    riskPreference: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
}).superRefine((data, ctx) => {
    // If lenderType = BANK: organizationName, registrationNumber, rbiLicenseNumber required
    if (data.lenderType === 'BANK') {
        if (!data.organizationName) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Organization Name is required for Bank", path: ["organizationName"] });
        }
        if (!data.registrationNumber) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Registration Number is required for Bank", path: ["registrationNumber"] });
        }
        if (!data.rbiLicenseNumber) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "RBI License Number is required for Bank", path: ["rbiLicenseNumber"] });
        }
    }

    // If lenderType = NBFC: registrationNumber, rbiLicenseNumber required
    if (data.lenderType === 'NBFC') {
        if (!data.registrationNumber) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Registration Number is required for NBFC", path: ["registrationNumber"] });
        }
        if (!data.rbiLicenseNumber) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "RBI License Number is required for NBFC", path: ["rbiLicenseNumber"] });
        }
    }

    // If lenderType = REGISTERED_COMPANY: registrationNumber required
    if (data.lenderType === 'REGISTERED_COMPANY') {
        if (!data.registrationNumber) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Registration Number is required for Registered Company", path: ["registrationNumber"] });
        }
    }

    // If lenderType = INDIVIDUAL_INVESTOR: panNumber required
    if (data.lenderType === 'INDIVIDUAL_INVESTOR') {
        if (!data.panNumber) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "PAN Number is required for Individual Investor", path: ["panNumber"] });
        }
    }
});
