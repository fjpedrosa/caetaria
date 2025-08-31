import React from 'react';
import { type LucideIcon } from 'lucide-react';

import { iconAnimations, iconConfig, iconWrapperStyles } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  size?: keyof typeof iconConfig;
  animation?: keyof typeof iconAnimations;
  wrapper?: keyof typeof iconWrapperStyles | false;
  wrapperClassName?: string;
  iconClassName?: string;
  strokeWidth?: number;
  'aria-label'?: string;
}

export const Icon = React.forwardRef<HTMLDivElement, IconProps>(
  ({
    icon: IconComponent,
    size = 'default',
    animation = 'none',
    wrapper = false,
    wrapperClassName,
    iconClassName,
    strokeWidth,
    className,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    const config = iconConfig[size];
    const animationClass = iconAnimations[animation];

    const iconElement = (
      <IconComponent
        size={config.size}
        strokeWidth={strokeWidth || config.strokeWidth}
        className={cn(
          config.className,
          animationClass,
          iconClassName
        )}
        aria-label={ariaLabel}
        aria-hidden={!ariaLabel}
      />
    );

    if (wrapper === false) {
      return iconElement;
    }

    const wrapperStyle = iconWrapperStyles[wrapper];

    return (
      <div
        ref={ref}
        className={cn(
          wrapperStyle,
          wrapperClassName,
          className
        )}
        {...props}
      >
        {iconElement}
      </div>
    );
  }
);

Icon.displayName = 'Icon';

// Feature Icon Component with enhanced styling
interface FeatureIconProps extends Omit<IconProps, 'wrapper'> {
  variant?: 'primary' | 'secondary' | 'gradient' | 'outline';
  glowing?: boolean;
}

export const FeatureIcon = React.forwardRef<HTMLDivElement, FeatureIconProps>(
  ({
    variant = 'primary',
    glowing = false,
    className,
    ...props
  }, ref) => {
    return (
      <Icon
        ref={ref}
        wrapper={variant as keyof typeof iconWrapperStyles}
        wrapperClassName={cn(
          glowing && 'animate-glow',
          className
        )}
        size="large"
        {...props}
      />
    );
  }
);

FeatureIcon.displayName = 'FeatureIcon';

// Animated Icon Component
interface AnimatedIconProps extends Omit<IconProps, 'animation'> {
  hover?: boolean;
  animationType?: keyof typeof iconAnimations;
}

export const AnimatedIcon = React.forwardRef<HTMLDivElement, AnimatedIconProps>(
  ({
    hover = false,
    animationType = 'pulse',
    className,
    iconClassName,
    ...props
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn('inline-flex', className)}
        onMouseEnter={() => hover && setIsHovered(true)}
        onMouseLeave={() => hover && setIsHovered(false)}
      >
        <Icon
          animation={hover ? (isHovered ? animationType : 'none') : animationType}
          iconClassName={iconClassName}
          {...props}
        />
      </div>
    );
  }
);

AnimatedIcon.displayName = 'AnimatedIcon';

// Icon Button Component
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: keyof typeof iconConfig;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  animation?: keyof typeof iconAnimations;
  'aria-label': string; // Required for accessibility
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    icon: IconComponent,
    size = 'default',
    variant = 'ghost',
    animation = 'none',
    className,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    const variantStyles = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline: 'border border-input hover:bg-accent hover:text-accent-foreground'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg p-2 transition-colors duration-250',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          className
        )}
        aria-label={ariaLabel}
        {...props}
      >
        <Icon
          icon={IconComponent}
          size={size}
          animation={animation}
          wrapper={false}
        />
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Icon with Text Component
interface IconWithTextProps extends Omit<IconProps, 'wrapper'> {
  text: string;
  position?: 'left' | 'right';
  gap?: 'sm' | 'md' | 'lg';
}

export const IconWithText = React.forwardRef<HTMLDivElement, IconWithTextProps>(
  ({
    text,
    position = 'left',
    gap = 'md',
    className,
    ...props
  }, ref) => {
    const gapStyles = {
      sm: 'gap-1',
      md: 'gap-2',
      lg: 'gap-3'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center',
          gapStyles[gap],
          position === 'right' && 'flex-row-reverse',
          className
        )}
      >
        <Icon wrapper={false} {...props} />
        <span>{text}</span>
      </div>
    );
  }
);

IconWithText.displayName = 'IconWithText';

export default Icon;