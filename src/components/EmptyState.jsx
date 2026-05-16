import React from 'react';
import { STRINGS } from '../strings';

const EmptyState = ({
  title = STRINGS.common.emptyStateTitle,
  body = STRINGS.common.emptyStateBody,
  action,
  icon = 'inbox'
}) => {
  return (
    <div className="empty-state" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      textAlign: 'center',
      animation: 'fadeInUp 0.6s ease-out'
    }}>
      <div className="illustration-container" style={{
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--primary-glow)',
        width: '160px',
        height: '160px',
        borderRadius: '40px'
      }}>
        <span className="material-icons-outlined" style={{ fontSize: '80px', color: 'var(--primary)' }}>
          {icon}
        </span>
      </div>

      <h3 style={{
        color: 'var(--primary)',
        marginBottom: '0.5rem',
        fontSize: '1.25rem'
      }}>
        {title}
      </h3>

      <p style={{
        color: 'var(--text-muted)',
        maxWidth: '300px',
        lineHeight: '1.5',
        fontSize: '0.95rem',
        marginBottom: '1.5rem'
      }}>
        {body}
      </p>

      {action && (
        <button className="btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
