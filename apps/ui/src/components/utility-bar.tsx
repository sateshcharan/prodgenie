import { Plus, Trash } from 'lucide-react';
import { Button } from '../button';
import { useLocation } from 'react-router-dom';

const utilityOptions = [
  {
    icon: Plus,
    label: 'Add',
  },
  {
    icon: Trash,
    label: 'Delete',
  },
];

const UtilityBar = () => {
  const location = useLocation();
  const handleClick = () => {
    console.log(location);
  };

  return (
    <div className="flex items-center gap-2">
      {utilityOptions.map((option, index) => (
        <Button key={index} onClick={handleClick}>
          <option.icon className="mr-2 h-4 w-4" />
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export { UtilityBar };
