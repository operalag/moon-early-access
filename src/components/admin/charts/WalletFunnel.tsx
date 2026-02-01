'use client';

import {
  FunnelChart,
  Funnel,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface FunnelStage {
  name: string;
  value: number;
  fill: string;
}

interface WalletFunnelProps {
  data: FunnelStage[];
}

/**
 * WalletFunnel - Funnel chart showing user conversion stages
 *
 * Displays conversion funnel from:
 * Total Users -> Channel Joined -> Wallet Connected
 *
 * Uses dark theme styling consistent with the app.
 */
export function WalletFunnel({ data }: WalletFunnelProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <FunnelChart>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value) => [Number(value).toLocaleString(), 'Users']}
        />
        <Funnel
          dataKey="value"
          data={data}
          isAnimationActive
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
          <LabelList
            position="right"
            fill="#fff"
            stroke="none"
            dataKey="name"
            fontSize={12}
          />
          <LabelList
            position="center"
            fill="#fff"
            stroke="none"
            dataKey="value"
            formatter={(value) => Number(value).toLocaleString()}
            fontSize={14}
            fontWeight="bold"
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
