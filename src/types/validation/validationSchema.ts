import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const isBrowser = typeof window !== "undefined";
const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});
const fileValidator = z.custom<File>(
  (value) => {
    if (!isBrowser) return true;
    return value instanceof File;
  },
  {
    message: "Must be a valid file",
  }
);

export const userAddSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  tenantId: z.string().min(1, "Tenant is required"),

  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["SuperAdmin", "Admin", "OrgManager", "OrgUser"]),
  // phone: z
  //   .string()
  //   .refine(isValidPhoneNumber, { message: "Invalid phone number" }),
  picture: z
    .union([
      z.null(),
      z.undefined(),
      z.string(), // For URLs
      fileValidator, // Single File object (custom validator)
      z.array(fileValidator), // Array of File objects
    ])
    .optional()
    .superRefine((val, ctx) => {
      // Skip validation if falsy, empty string, or not in browser
      if (!val || (typeof val === "string" && !val.trim()) || !isBrowser) {
        return;
      }

      const validateFile = (file: unknown) => {
        if (
          typeof file === "object" &&
          file !== null &&
          "size" in file &&
          typeof (file as { size: unknown }).size === "number"
        ) {
          const f = file as File;

          if (f.size > MAX_FILE_SIZE) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Max file size is 5MB.",
            });
          }

          if ("type" in file && !ACCEPTED_IMAGE_TYPES.includes(f.type)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: ".jpg, .jpeg, .png and .webp files are accepted.",
            });
          }
        }
      };

      // If it's an object with appropriate properties, validate it as a File
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        validateFile(val);
      }

      // If it's an array, validate the first item
      if (Array.isArray(val) && val.length > 0) {
        validateFile(val[0]);
      }
    }),
});

export const groupAddSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  tenantId: z.string().min(1, "Tenant is required"),
  assignedUsers: z.array(optionSchema).min(1),

  phone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" }),

  picture: z
    .union([
      z.null(),
      z.undefined(),
      z.string(), // For URLs
      fileValidator, // Single File object (custom validator)
      z.array(fileValidator), // Array of File objects
    ])
    .optional()
    .superRefine((val, ctx) => {
      // Skip validation if falsy, empty string, or not in browser
      if (!val || (typeof val === "string" && !val.trim()) || !isBrowser) {
        return;
      }

      const validateFile = (file: unknown) => {
        if (
          typeof file === "object" &&
          file !== null &&
          "size" in file &&
          typeof (file as { size: unknown }).size === "number"
        ) {
          const f = file as File;

          if (f.size > MAX_FILE_SIZE) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Max file size is 5MB.",
            });
          }

          if ("type" in file && !ACCEPTED_IMAGE_TYPES.includes(f.type)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: ".jpg, .jpeg, .png and .webp files are accepted.",
            });
          }
        }
      };

      // If it's an object with appropriate properties, validate it as a File
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        validateFile(val);
      }

      // If it's an array, validate the first item
      if (Array.isArray(val) && val.length > 0) {
        validateFile(val[0]);
      }
    }),
});
export const tenantSchema = z.object({
  name: z.string().min(1, "Tenant name is required"),
  logoUrl: z
    .union([
      z.null(),
      z.undefined(),
      z.string(), // For URLs
      fileValidator, // Single File object (custom validator)
      z.array(fileValidator), // Array of File objects
    ])
    .optional()
    .superRefine((val, ctx) => {
      // Skip validation if falsy, empty string, or not in browser
      if (!val || (typeof val === "string" && !val.trim()) || !isBrowser) {
        return;
      }

      const validateFile = (file: unknown) => {
        if (
          typeof file === "object" &&
          file !== null &&
          "size" in file &&
          typeof (file as { size: unknown }).size === "number"
        ) {
          const f = file as File;

          if (f.size > MAX_FILE_SIZE) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Max file size is 5MB.",
            });
          }

          if ("type" in file && !ACCEPTED_IMAGE_TYPES.includes(f.type)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: ".jpg, .jpeg, .png and .webp files are accepted.",
            });
          }
        }
      };

      // If it's an object with appropriate properties, validate it as a File
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        validateFile(val);
      }

      // If it's an array, validate the first item
      if (Array.isArray(val) && val.length > 0) {
        validateFile(val[0]);
      }
    }),
  sinchApiKey: z.string().min(1, "Sinch API Key is required"),
  sinchApiSecret: z.string().min(1, "Sinch API Secret is required"),
  retentionPeriodYears: z.coerce.number().min(1, "Retention must be at least 1 year"),
  featureToggles: z.object({
    messages: z.boolean(),
    contacts: z.boolean(),
    voicemail: z.boolean(),
    phone: z.boolean(),
  }),
});
export type TenantFormType = z.infer<typeof tenantSchema>;
export type UserAddFormType = z.infer<typeof userAddSchema>;
export type GroupAddFormType = z.infer<typeof groupAddSchema>;

