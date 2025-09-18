import { Card, CardContent, Input } from '@prodgenie/libs/ui';

export const SearchBanner = ({
  searchTerm,
  setSearchTerm,
  banner,
}: {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  banner: string;
}) => {
  return (
    <Card className="bg-primary-foreground rounded-xl w-full">
      <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4 md:h-[150px]">
        {/* Left Section: Search Bar with Subheading */}
        <div className="w-full md:max-w-md">
          <h2 className="text-xl font-semibold mb-2">Find Your Files</h2>
          <Input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Right Section: Banner Image */}
        <div className="flex-shrink-0">
          <img
            src={banner}
            alt="banner"
            className="object-contain h-[100px] md:h-[150px] w-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchBanner;
