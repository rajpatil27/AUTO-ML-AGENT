import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { Crown, Check, Zap, Infinity, Rocket } from 'lucide-react';

interface PremiumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PremiumModal = ({ open, onOpenChange }: PremiumModalProps) => {
  const { upgradeToPremium } = useUser();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    upgradeToPremium();
    setIsUpgrading(false);
    onOpenChange(false);
  };

  const features = [
    { icon: Infinity, text: 'Unlimited model runs' },
    { icon: Zap, text: 'Priority processing' },
    { icon: Rocket, text: 'Advanced deployment options' },
    { icon: Crown, text: 'Premium support' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center space-x-2">
            <Crown className="w-6 h-6 text-premium" />
            <span className="gradient-premium-text">Upgrade to Premium</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-premium rounded-full flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-premium-foreground" />
                </div>
                <span className="text-foreground font-medium">{feature.text}</span>
                <Check className="w-5 h-5 text-success ml-auto" />
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold gradient-premium-text">$29/month</div>
            <div className="text-sm text-muted-foreground">Cancel anytime</div>
          </div>

          {/* CTA */}
          <Button
            onClick={handleUpgrade}
            variant="premium"
            size="lg"
            className="w-full"
            disabled={isUpgrading}
          >
            {isUpgrading ? (
              <>
                <div className="w-4 h-4 border-2 border-premium-foreground border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5" />
                Upgrade Now
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Mock upgrade - this will enable premium features immediately
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumModal;