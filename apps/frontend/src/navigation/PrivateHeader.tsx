import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from '@prodgenie/libs/ui';

import { Globe } from 'lucide-react';
import { ModeToggle } from '@prodgenie/libs/ui';

import logo from '@prodgenie/libs/ui/assets/logo.png';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-while flex justify-between border-b  p-4">
      <div className=" flex items-center gap-2">
        <img src={logo} alt="Website Logo" className="h-8 w-auto" />
      </div>
      <div className=" flex items-center gap-2">
        <ModeToggle />
        <Select defaultValue="english">
          <SelectTrigger className="w-[140px] flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="deutsch">Deutsch</SelectItem>
              <SelectItem value="indonesia">Indonesia</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            localStorage.clear();
            navigate('/');
          }}
        >
          Log Out
        </Button>
      </div>
    </header>
  );
};

export default Header;
