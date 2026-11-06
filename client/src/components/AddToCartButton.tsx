import { Check, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useMe } from '@/api/auth';
import { useAddToCart } from '@/api/cart';
import { errorMessage } from '@/lib/api';
import { Button, type ButtonProps } from './ui/button';

/** Adds to cart, or sends guests to the login page and back. */
export function AddToCartButton({
  productId,
  productName,
  quantity = 1,
  label = 'Dodaj u korpu',
  ...props
}: { productId: number; productName: string; quantity?: number; label?: string } & Omit<ButtonProps, 'onClick'>) {
  const { data: user } = useMe();
  const add = useAddToCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [added, setAdded] = useState(false);

  const onClick = () => {
    if (!user) {
      toast.info('Prijavite se da biste dodali proizvode u korpu.');
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    add.mutate(
      { productId, quantity },
      {
        onSuccess: () => {
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
          toast.success(`${productName} je dodan u korpu.`, {
            action: { label: 'Korpa', onClick: () => navigate('/cart') },
          });
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <Button onClick={onClick} loading={add.isPending} {...props}>
      {!add.isPending && (added ? <Check /> : <ShoppingCart />)}
      {added ? 'Dodano' : label}
    </Button>
  );
}
