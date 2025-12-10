import { z } from "zod";

// Strong password requirements
export const passwordRequirements = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

export const strongPasswordSchema = z
  .string()
  .min(passwordRequirements.minLength, {
    message: `Minimum ${passwordRequirements.minLength} karakter szükséges`,
  })
  .refine((val) => passwordRequirements.hasUppercase.test(val), {
    message: "Legalább egy nagybetű szükséges",
  })
  .refine((val) => passwordRequirements.hasLowercase.test(val), {
    message: "Legalább egy kisbetű szükséges",
  })
  .refine((val) => passwordRequirements.hasNumber.test(val), {
    message: "Legalább egy szám szükséges",
  })
  .refine((val) => passwordRequirements.hasSpecial.test(val), {
    message: "Legalább egy speciális karakter szükséges (!@#$%^&*...)",
  });

export interface PasswordStrength {
  score: number; // 0-5
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
  isStrong: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= passwordRequirements.minLength,
    hasUppercase: passwordRequirements.hasUppercase.test(password),
    hasLowercase: passwordRequirements.hasLowercase.test(password),
    hasNumber: passwordRequirements.hasNumber.test(password),
    hasSpecial: passwordRequirements.hasSpecial.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const isStrong = score === 5;

  return { score, checks, isStrong };
}

export function getPasswordStrengthLabel(score: number): string {
  if (score === 0) return "Nagyon gyenge";
  if (score === 1) return "Gyenge";
  if (score === 2) return "Közepes";
  if (score === 3) return "Jó";
  if (score === 4) return "Erős";
  return "Nagyon erős";
}

export function getPasswordStrengthColor(score: number): string {
  if (score <= 1) return "bg-destructive";
  if (score === 2) return "bg-orange-500";
  if (score === 3) return "bg-yellow-500";
  if (score === 4) return "bg-lime-500";
  return "bg-green-500";
}
