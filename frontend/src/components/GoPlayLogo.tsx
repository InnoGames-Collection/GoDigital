import React from 'react';
import { GoDigitalLogo } from './GoDigitalLogo';

interface GoPlayLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
}

/**
 * Re-routes legacy GoPlayLogo invocations to the unified GoDigital brand identity.
 */
export const GoPlayLogo: React.FC<GoPlayLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  return <GoDigitalLogo className={className} size={size} />;
};

export default GoPlayLogo;
