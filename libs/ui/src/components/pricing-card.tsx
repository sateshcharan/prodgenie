import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  Button,
} from '../';

type PricingCardProps = {
  title: string;
  price: number;
  cycle?: 'monthly' | 'annual';
  features?: string[];
  onClick?: () => void;
};

const PricingCard = ({
  title,
  price,
  cycle = 'monthly',
  features = [],
  onClick,
}: PricingCardProps) => {
  const cycleLabel = cycle === 'annual' ? '/year' : '/month';

  return (
    <Card className="w-[350px] border border-gray-200 shadow-md">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Everything you need to scale your business.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center space-y-4">
        <div className="text-3xl font-bold">
          ${price}
          <span className="text-sm text-gray-500">{cycleLabel}</span>
        </div>

        <ul className="text-gray-600 text-sm space-y-2 text-left">
          {features.map((feature, idx) => (
            <li key={idx}>✅ {feature}</li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button className="w-full" onClick={onClick}>
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
};

export { PricingCard };
