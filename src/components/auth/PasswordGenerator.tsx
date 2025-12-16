import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, RefreshCw, KeyRound } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PasswordGeneratorProps {
  onAccept: (password: string) => void;
}

const generateStrongPassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  // Ensure at least one of each required type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill remaining characters (16 total for extra security)
  for (let i = 0; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onAccept }) => {
  const { language } = useLanguage();
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleGenerate = () => {
    const newPassword = generateStrongPassword();
    setGeneratedPassword(newPassword);
    setIsVisible(true);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAccept = () => {
    if (generatedPassword) {
      onAccept(generatedPassword);
      setGeneratedPassword('');
      setIsVisible(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        className="w-full text-xs"
      >
        <KeyRound className="w-3.5 h-3.5 mr-1.5" />
        {language === 'hu' ? 'Erős jelszó generálása' : 'Generate strong password'}
      </Button>

      {isVisible && generatedPassword && (
        <div className="p-3 bg-muted rounded-lg border border-border space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-background px-2 py-1 rounded break-all">
              {generatedPassword}
            </code>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleGenerate}
              title={language === 'hu' ? 'Új generálás' : 'Regenerate'}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn("flex-1", copied && "text-green-600")}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  {language === 'hu' ? 'Másolva!' : 'Copied!'}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {language === 'hu' ? 'Másolás' : 'Copy'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handleAccept}
            >
              {language === 'hu' ? 'Elfogad' : 'Accept'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
