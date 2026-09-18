'use client';

import { useEffect, useState } from 'react';
import { AnnouncementsTicker } from './announcements-ticker';

export function AnnouncementsBar() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/announcements', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(() => {});
  }, []);

  return <AnnouncementsTicker messages={messages} />;
}
