import React from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface TimelineEvent {
  label: string;
  dateTime: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-(--border-light)">
      <h2 className="text-lg font-bold text-(--text-primary) mb-6">Transaction Timeline</h2>
      
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex justify-between items-center py-2">
            <span className="text-sm text-(--text-secondary)">{event.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-(--text-primary)">{event.dateTime}</span>
              <StatusBadge variant={event.status}>
                {event.status === 'completed' ? 'Completed' : event.status === 'in-progress' ? 'In Progress' : 'Pending'}
              </StatusBadge>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
