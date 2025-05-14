import { CardContent, Input } from '@prodgenie/libs/ui';

import { Card } from '@prodgenie/libs/ui';

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
    <div className="mb-4">
      <Card className="bg-gray-100 rounded-xl">
        <CardContent className="flex flex-row items-center justify-between p-4">
          {/* Left Section: Search Bar with Subheading */}
          <div className="w-full max-w-md">
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
          <div className="w-1/2 ml-4">
            <img src={banner} alt="banner" className="w-full h-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchBanner;
