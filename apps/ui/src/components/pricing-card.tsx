import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  Button,
} from '../';

const PricingCard = ({
  title,
  price,
  onClick,
}: {
  title: string;
  price: number;
  onClick?: () => void;
}) => {
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
          <span className="text-sm text-gray-500">/month</span>
        </div>

        <ul className="text-gray-600 text-sm space-y-2">
          <li>✅ Unlimited projects</li>
          <li>✅ Advanced analytics</li>
          <li>✅ Priority support</li>
          <li>✅ 100GB cloud storage</li>
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
