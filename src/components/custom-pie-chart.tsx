import type React from 'react';
import { PieChart, Pie, Cell, Sector } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { AmountDisplay } from '@/components/amount-display';
import { useBalancePrivacy } from '@/context/privacy-context';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatPercent } from '@/lib/utils';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
  'hsl(var(--chart-9))',
];

const renderActiveShape = (props: any) => {
  const { isBalanceHidden } = useBalancePrivacy();
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } =
    props;

  const amountToDisplay = isBalanceHidden
    ? '••••••'
    : value.toLocaleString('en-US', { style: 'currency', currency: payload.currency || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <g style={{ cursor: 'pointer' }}>
      {/* Main sector */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={6}
      />

      {/* Subtle highlight ring */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle - 1}
        endAngle={endAngle + 1}
        innerRadius={outerRadius + 2}
        outerRadius={outerRadius + 4}
        cornerRadius={6}
        fill={fill}
        opacity={0.7}
      />

      <text
        x={cx}
        y={cy - 35}
        fill="hsl(var(--muted-foreground))"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {payload.name}
      </text>

      <text
        x={cx}
        y={cy - 20}
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        dominantBaseline="central"
        className="text-xs font-bold "
      >
        {isBalanceHidden ? '••••••' : amountToDisplay}
      </text>

      <text
        x={cx}
        y={cy - 5}
        fill="hsl(var(--muted-foreground))"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs"
      >
        ({formatPercent(percent)})
      </text>
    </g>
  );
};

const renderInactiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g style={{ cursor: 'pointer' }}>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={6}
      />
    </g>
  );
};

interface CustomPieChartProps {
  data: { name: string; value: number; currency: string }[];
  activeIndex: number;
  onPieEnter: (event: React.MouseEvent, index: number) => void;
  onPieLeave?: (event: React.MouseEvent, index: number) => void;
  onSectionClick?: (data: { name: string; value: number; currency: string }, index: number) => void;
  startAngle?: number;
  endAngle?: number;
  displayTooltip?: boolean;
}

export const CustomPieChart: React.FC<CustomPieChartProps> = ({
  data,
  activeIndex,
  onPieEnter,
  onPieLeave,
  onSectionClick,
  startAngle = 180,
  endAngle = 0,
  displayTooltip = false,
}) => {
  const { isBalanceHidden } = useBalancePrivacy();

  const tooltipFormatter = (
    value: ValueType,
    name: NameType,
    entry: any,
  ) => {
    return (
      <div className="flex flex-col">
        <span className="text-[0.70rem] uppercase text-muted-foreground">{name}</span>
        <span className="font-bold">
          <AmountDisplay value={Number(value)} currency={entry.payload.currency} isHidden={isBalanceHidden} />
        </span>
      </div>
    );
  };

  return (
    <ChartContainer config={{}} className="h-[160px] w-full p-0">
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        {displayTooltip && (
          <ChartTooltip
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
            content={<ChartTooltipContent formatter={tooltipFormatter} hideLabel hideIndicator />}
            position={{ y: 0 }}
          />
        )}
        <Pie
          data={data}
          cy="80%"
          innerRadius="110%"
          outerRadius="140%"
          paddingAngle={4}
          cornerRadius={6}
          animationDuration={100}
          dataKey="value"
          nameKey="name"
          activeIndex={activeIndex !== -1 ? activeIndex : undefined}
          activeShape={renderActiveShape}
          inactiveShape={renderInactiveShape}
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
          onClick={(_event, index) => {
            if (onSectionClick && data[index]) {
              onSectionClick(data[index], index);
            }
          }}
          startAngle={startAngle}
          endAngle={endAngle}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
};
