import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from '@prodgenie/libs/ui';
import { ModeToggle } from '@prodgenie/libs/ui';

import { Globe } from 'lucide-react';

import logo from '@prodgenie/libs/ui/assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useAuthModalStore } from '@prodgenie/libs/store';

import { NavigationMenuDemo } from './NavigationMenuDemo';

const PublicHeader = () => {
  const navigate = useNavigate();
  const { openModal } = useAuthModalStore();
  const handleLoginClick = () => {
    openModal('login');
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
        <Button className="rounded-sm" onClick={handleLoginClick}>
          Log in
        </Button>
      </div>
    </header>
  );
};

export default PublicHeader;
