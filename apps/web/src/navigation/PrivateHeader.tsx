import { Globe, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@prodgenie/libs/ui/select';
import { Button } from '@prodgenie/libs/ui/button';
import { ModeToggle } from '@prodgenie/libs/ui/components/mode-toggle';
import logo from '../assets/logo.png';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useModalStore } from '@prodgenie/libs/store';

import api from '../utils/api';

const Header = () => {
  const navigate = useNavigate();
  const { openModal } = useModalStore();

  const handleChangePlan = () => {
    openModal('workspace:pricing');
  };
  return (
    <header className="bg-background flex justify-between border-b  p-4">
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
        <Button onClick={handleChangePlan}>
          <Sparkles />
          Upgrade to Pro
        </Button>
        <Button
          onClick={() => {
            // localStorage.clear();
            api.post(`${apiRoutes.auth.base}${apiRoutes.auth.logout}`);
            navigate('/');
          }}
          variant="outline"
        >
          Log Out
        </Button>
      </div>
    </header>
  );
};

export default Header;
