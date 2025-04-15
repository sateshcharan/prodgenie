import { Plus, Trash } from 'lucide-react';
import { Button } from '../';
import { useLocation } from 'react-router-dom';
import FolderDropZone from './FolderDropZone';

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
    <div className="w-screen flex flex-col items-center justify-between">
      <div className="flex items-center gap-2">
        {utilityOptions.map((option, index) => (
          <Button key={index} onClick={handleClick}>
            <option.icon className="mr-2 h-4 w-4" />
            {option.label}
          </Button>
        ))}
      </div>
      <FolderDropZone />
    </div>
  );
};

export { UtilityBar };
