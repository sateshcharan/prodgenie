import { Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PrimaryNavigationMenu } from './';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  ModeToggle,
  logo,
} from '@prodgenie/libs/ui';
import { useAuthStore, useModalStore } from '@prodgenie/libs/store';

const PublicHeader = () => {
  const navigate = useNavigate();
  // const { openModal } = useAuthModalStore();
  const { openModal } = useModalStore();
  const { setAuthType } = useAuthStore();
  const handleLoginClick = () => {
    // openModal('login');
    setAuthType('login');
    openModal('auth');
  };
  return (
    <header className="relative z-10 px-6 py-6">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <div className=" flex items-center gap-2">
          <img
            src={logo}
            alt="Website Logo"
            className="h-8 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />
          <PrimaryNavigationMenu />
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
            className=" px-6 py-2  hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            onClick={handleLoginClick}
          >
            Log in
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default PublicHeader;
