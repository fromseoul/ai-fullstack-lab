import type { Request, Response, NextFunction } from "express";

interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "object";
  maxLength?: number;
  minLength?: number;
}

export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      if (rule.required && (value === undefined || value === null || value === "")) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (rule.type && typeof value !== rule.type) {
          errors.push(`${rule.field} must be type ${rule.type}`);
        }
        if (rule.type === "string" && typeof value === "string") {
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
          }
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
          }
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ success: false, error: errors.join(", ") });
      return;
    }

    next();
  };
};
