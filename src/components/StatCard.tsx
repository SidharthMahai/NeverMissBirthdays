import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
}

export const StatCard = ({ title, value, subtitle, icon }: StatCardProps) => {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <span className="icon-wrap">{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{subtitle}</small>
    </article>
  );
};
