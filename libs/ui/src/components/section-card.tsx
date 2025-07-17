import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Badge,
} from '../';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

type SectionCardProps = {
  title: string;
  value: string;
  description: string;
  trend: string;
  trendDirection: 'up' | 'down';
  subtext: string;
  button?: React.ReactNode;
};

export function SectionCard({
  title,
  value,
  description,
  trend,
  trendDirection,
  subtext,
  button,
}: SectionCardProps) {
  const TrendIcon = trendDirection === 'up' ? TrendingUpIcon : TrendingDownIcon;
  const trendColor =
    trendDirection === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        <div className="absolute right-4 top-4 ">
          <Badge
            variant="outline"
            className={`flex gap-1 rounded-lg text-xs ${trendColor}`}
          >
            <TrendIcon className="size-3" />
            {trend}
          </Badge>
          {button && <div className="mt-2">{button}</div>}
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {description} <TrendIcon className="size-4" />
        </div>
        <div className="text-muted-foreground">{subtext}</div>
      </CardFooter>
    </Card>
  );
}
