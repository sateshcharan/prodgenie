import { Input, Button } from '@prodgenie/apps/ui';
import { AppSidebar } from '@prodgenie/apps/ui';

const Dashboard = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <form>
        <Input type="file" />
        <Button>Submit</Button>
      </form>
      {/* <AppSidebar /> */}
    </div>
  );
};

export default Dashboard;
