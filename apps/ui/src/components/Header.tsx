import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from '../';

import { NavigationMenuDemo } from './NavigationMenuDemo';

import { Globe } from 'lucide-react';

import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-while flex justify-between border-b  p-4">
      <div className=" flex items-center gap-2">
        <img src={logo} alt="Website Logo" className="h-8 w-auto" />
        <NavigationMenuDemo />
      </div>
      <div className=" flex items-center gap-2">
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
        <Button onClick={() => navigate('/login')}>Log in</Button>
      </div>
    </header>
  );
};

export default Header;
