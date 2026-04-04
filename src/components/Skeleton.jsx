import React from 'react';
import './Skeleton.css';

/** Base shimmer block */
export const Skeleton = ({ width = '100%', height = 16, borderRadius = 6, style = {} }) => (
  <div
    className="skeleton-shimmer"
    style={{ width, height, borderRadius, ...style }}
  />
);

/** One stat card worth of skeleton */
export const SkeletonStat = () => (
  <div className="skeleton-stat-card">
    <div className="skeleton-stat-header">
      <Skeleton width="50%" height={13} borderRadius={4} />
      <Skeleton width={32} height={32} borderRadius={8} />
    </div>
    <Skeleton width="60%" height={28} borderRadius={6} style={{ marginTop: 8 }} />
    <Skeleton width="40%" height={11} borderRadius={4} style={{ marginTop: 8 }} />
  </div>
);

/** One table row worth of skeleton — pass `cols` for number of cells */
const ROW_WIDTHS = ['75%', '85%', '65%', '80%', '55%', '70%', '60%'];

export const SkeletonRow = ({ cols = 5 }) => (
  <tr className="skeleton-row">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: '16px 20px' }}>
        <Skeleton
          width={i === 0 ? 24 : ROW_WIDTHS[i % ROW_WIDTHS.length]}
          height={13}
          borderRadius={4}
        />
      </td>
    ))}
  </tr>
);

/** Form field skeleton for settings */
export const SkeletonField = ({ label = true }) => (
  <div className="skeleton-field">
    {label && <Skeleton width="30%" height={12} borderRadius={4} />}
    <Skeleton width="100%" height={42} borderRadius={8} />
  </div>
);

/** Card-level skeleton (used inside a form-card body) */
export const SkeletonFormCard = () => (
  <div className="skeleton-form-card">
    <div className="skeleton-form-card-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Skeleton width={36} height={36} borderRadius={8} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Skeleton width={120} height={14} borderRadius={4} />
          <Skeleton width={200} height={11} borderRadius={4} />
        </div>
      </div>
      <Skeleton width={60} height={32} borderRadius={8} />
    </div>
    <div className="skeleton-form-card-body">
      <SkeletonField />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <SkeletonField />
        <SkeletonField />
      </div>
      <SkeletonField />
    </div>
  </div>
);

export default Skeleton;
