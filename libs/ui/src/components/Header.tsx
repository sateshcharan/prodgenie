import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from '../';
import { ModeToggle } from './mode-toggle';

// import { NavigationMenuDemo } from './NavigationMenuDemo';

import { Ghost, Globe } from 'lucide-react';

import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useDialogStore } from '@prodgenie/libs/store';

const Header = () => {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    useDialogStore.getState().open();
  };
  return (
    <header className="bg-while flex justify-between border-b  p-4">
      <div className=" flex items-center gap-2">
        <img
          src={logo}
          alt="Website Logo"
          className="h-8 w-auto cursor-pointer"
          onClick={() => navigate('/')}
        />
        {/* <NavigationMenuDemo /> */}
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
        {/* <Button className="rounded-sm" onClick={() => navigate('/login')}> */}
        <Button className="rounded-sm" onClick={handleLoginClick}>
          Log in
        </Button>
      </div>
    </header>
  );
};

export default Header;
