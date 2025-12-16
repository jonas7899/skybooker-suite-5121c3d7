import { z } from "zod";

// Common weak passwords and patterns to block
const commonWeakPatterns = [
  "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "0000",
  "1234", "2345", "3456", "4567", "5678", "6789", "7890",
  "4321", "5432", "6543", "7654", "8765", "9876", "0987",
  "qwert", "werty", "ertyu", "rtyui", "tyuio", "yuiop",
  "asdf", "sdfg", "dfgh", "fghj", "ghjk", "hjkl",
  "zxcv", "xcvb", "cvbn", "vbnm",
  "qazw", "wsxe", "edcr", "rfvt", "tgby", "yhnu", "ujmi",
  "password", "passwd", "jelszo", "titok", "secret",
  "admin", "user", "login", "welcome",
  "letmein", "master", "dragon", "monkey", "shadow",
  "sunshine", "princess", "football", "baseball", "soccer",
  "abc123", "123abc", "pass123", "test123",
  "aaaaaa", "bbbbbb", "cccccc",
];

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
  score: number; // 0-6 (added noWeakPattern check)
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    noWeakPattern: boolean;
  };
  isStrong: boolean;
  weakPatternFound?: string;
}

// Check if password contains weak patterns
function containsWeakPattern(password: string): string | null {
  const lowerPassword = password.toLowerCase();
  for (const pattern of commonWeakPatterns) {
    if (lowerPassword.includes(pattern)) {
      return pattern;
    }
  }
  return null;
}

// Check if password contains parts of name/username (min 3 chars)
function containsNamePart(password: string, name: string | undefined): boolean {
  if (!name || name.length < 3) return false;
  
  const lowerPassword = password.toLowerCase();
  const lowerName = name.toLowerCase();
  
  // Split name into parts (by spaces, dots, underscores, etc.)
  const nameParts = lowerName.split(/[\s._@-]+/).filter(part => part.length >= 3);
  
  for (const part of nameParts) {
    if (lowerPassword.includes(part)) {
      return true;
    }
  }
  
  // Also check if the full name (without spaces) is in password
  const fullNameNoSpaces = lowerName.replace(/[\s._@-]+/g, '');
  if (fullNameNoSpaces.length >= 3 && lowerPassword.includes(fullNameNoSpaces)) {
    return true;
  }
  
  return false;
}

export function validatePasswordStrength(
  password: string,
  userName?: string,
  fullName?: string
): PasswordStrength {
  const weakPattern = containsWeakPattern(password);
  const containsUserName = containsNamePart(password, userName);
  const containsFullName = containsNamePart(password, fullName);
  
  const checks = {
    minLength: password.length >= passwordRequirements.minLength,
    hasUppercase: passwordRequirements.hasUppercase.test(password),
    hasLowercase: passwordRequirements.hasLowercase.test(password),
    hasNumber: passwordRequirements.hasNumber.test(password),
    hasSpecial: passwordRequirements.hasSpecial.test(password),
    noWeakPattern: !weakPattern && !containsUserName && !containsFullName,
  };

  const score = Object.values(checks).filter(Boolean).length;
  const isStrong = score === 6;

  return { 
    score, 
    checks, 
    isStrong,
    weakPatternFound: weakPattern || (containsUserName ? 'felhasználónév' : containsFullName ? 'név' : undefined)
  };
}

export function getPasswordStrengthLabel(score: number): string {
  if (score === 0) return "Nagyon gyenge";
  if (score === 1) return "Gyenge";
  if (score === 2) return "Gyenge";
  if (score === 3) return "Közepes";
  if (score === 4) return "Jó";
  if (score === 5) return "Erős";
  return "Nagyon erős";
}

export function getPasswordStrengthColor(score: number): string {
  if (score <= 2) return "bg-destructive";
  if (score === 3) return "bg-orange-500";
  if (score === 4) return "bg-yellow-500";
  if (score === 5) return "bg-lime-500";
  return "bg-green-500";
}
