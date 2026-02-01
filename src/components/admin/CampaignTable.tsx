'use client';

import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';

interface CampaignData {
  campaign_id: string;
  users: number;
  first_attribution: string;
  last_attribution: string;
}

interface CampaignTableProps {
  data: CampaignData[];
}

type SortField = 'campaign_id' | 'users' | 'first_attribution' | 'last_attribution';
type SortDirection = 'asc' | 'desc';

/**
 * CampaignTable - Sortable table showing campaign attribution performance
 *
 * Displays campaigns with user counts and date ranges.
 * Click column headers to sort.
 */
export function CampaignTable({ data }: CampaignTableProps) {
  const [sortField, setSortField] = useState<SortField>('users');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'campaign_id':
          comparison = a.campaign_id.localeCompare(b.campaign_id);
          break;
        case 'users':
          comparison = a.users - b.users;
          break;
        case 'first_attribution':
          comparison = new Date(a.first_attribution).getTime() - new Date(b.first_attribution).getTime();
          break;
        case 'last_attribution':
          comparison = new Date(a.last_attribution).getTime() - new Date(b.last_attribution).getTime();
          break;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' \u2191' : ' \u2193';
  };

  if (data.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-8">
        No campaigns yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-800 text-zinc-400 uppercase text-xs">
            <th
              className="text-left py-3 px-4 cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('campaign_id')}
            >
              Campaign ID{getSortIndicator('campaign_id')}
            </th>
            <th
              className="text-right py-3 px-4 cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('users')}
            >
              Users{getSortIndicator('users')}
            </th>
            <th
              className="text-right py-3 px-4 cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('first_attribution')}
            >
              First Seen{getSortIndicator('first_attribution')}
            </th>
            <th
              className="text-right py-3 px-4 cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('last_attribution')}
            >
              Last Seen{getSortIndicator('last_attribution')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((campaign) => (
            <tr
              key={campaign.campaign_id}
              className="bg-zinc-900 border-b border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              <td className="py-3 px-4 text-white font-mono text-sm">
                {campaign.campaign_id}
              </td>
              <td className="py-3 px-4 text-right text-white">
                {campaign.users.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right text-zinc-400">
                {formatDate(campaign.first_attribution)}
              </td>
              <td className="py-3 px-4 text-right text-zinc-400">
                {formatDate(campaign.last_attribution)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
