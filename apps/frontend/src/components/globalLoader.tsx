import { useLoadingStore } from '@prodgenie/libs/store';

const GlobalLoader = () => {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/30 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow text-center flex flex-col items-center">
        <div className="animate-spin h-6 w-6 mb-2 border-4 border-foreground border-t-transparent rounded-full"></div>
        <span className="text-gray-700 text-sm font-medium">Loading...</span>
      </div>
    </div>
  );
};

export default GlobalLoader;
