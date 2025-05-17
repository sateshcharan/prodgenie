import { Separator } from '../separator';
import { SidebarTrigger } from '../sidebar';

export function SiteHeader(fileType: { title: string }) {
  const siteTitle = fileType.title
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (str) => str.toUpperCase());

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{siteTitle}</h1>
      </div>
    </header>
  );
}
