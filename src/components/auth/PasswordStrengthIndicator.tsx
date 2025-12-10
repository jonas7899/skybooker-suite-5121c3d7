import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  validatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  passwordRequirements,
} from "@/lib/passwordValidation";
import { useLanguage } from "@/contexts/LanguageContext";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const { language } = useLanguage();
  const strength = validatePasswordStrength(password);

  const requirements = [
    {
      key: "minLength",
      label:
        language === "hu"
          ? `Minimum ${passwordRequirements.minLength} karakter`
          : `At least ${passwordRequirements.minLength} characters`,
      met: strength.checks.minLength,
    },
    {
      key: "hasUppercase",
      label: language === "hu" ? "Nagybetű (A-Z)" : "Uppercase letter (A-Z)",
      met: strength.checks.hasUppercase,
    },
    {
      key: "hasLowercase",
      label: language === "hu" ? "Kisbetű (a-z)" : "Lowercase letter (a-z)",
      met: strength.checks.hasLowercase,
    },
    {
      key: "hasNumber",
      label: language === "hu" ? "Szám (0-9)" : "Number (0-9)",
      met: strength.checks.hasNumber,
    },
    {
      key: "hasSpecial",
      label:
        language === "hu"
          ? "Speciális karakter (!@#$%...)"
          : "Special character (!@#$%...)",
      met: strength.checks.hasSpecial,
    },
  ];

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {language === "hu" ? "Jelszó erőssége:" : "Password strength:"}
          </span>
          <span
            className={cn(
              "font-medium",
              strength.score <= 2
                ? "text-destructive"
                : strength.score <= 3
                ? "text-yellow-600"
                : "text-green-600"
            )}
          >
            {getPasswordStrengthLabel(strength.score)}
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              getPasswordStrengthColor(strength.score)
            )}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <ul className="grid grid-cols-1 gap-1 text-xs">
          {requirements.map((req) => (
            <li
              key={req.key}
              className={cn(
                "flex items-center gap-2 transition-colors",
                req.met ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {req.met ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
              <span>{req.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
