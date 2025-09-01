'use client';

import { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

interface TableOfContentsItem {
  id: string;
  title: string;
  subsections?: { id: string; title: string; }[];
}

interface SmoothScrollNavProps {
  items: TableOfContentsItem[];
  title?: string;
}

export function SmoothScrollNav({ items, title = 'Table of Contents' }: SmoothScrollNavProps) {
  useEffect(() => {
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.hash) {
        e.preventDefault();
        const targetId = target.hash.slice(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Update URL hash
          window.history.pushState(null, '', `#${targetId}`);
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);
    return () => document.removeEventListener('click', handleSmoothScroll);
  }, []);

  return (
    <div className="sticky top-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h2>
      <nav className="space-y-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              'flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200 py-1',
              'hover:translate-x-1 transform transition-transform duration-200'
            )}
          >
            <ChevronRight className="w-3 h-3 mr-2 opacity-50" />
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
