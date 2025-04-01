import { Card, CardContent, CardHeader, CardTitle } from '@prodgenie/apps/ui';

interface CardItem {
  id: number;
  title: string;
  description: string;
}

const cardData: CardItem[] = [
  { id: 1, title: 'Card One', description: 'This is the first card.' },
  { id: 2, title: 'Card Two', description: 'This is the second card.' },
  { id: 3, title: 'Card Three', description: 'This is the third card.' },
  { id: 4, title: 'Card Four', description: 'This is the fourth card.' },
];

const Templates = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {cardData.map((card) => (
        <Card key={card.id} className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Templates;
