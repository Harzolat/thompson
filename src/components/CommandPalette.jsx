import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { site } from '../data/site.js';
import copyText from '../utils/copyText.js';

// Command palette: global navigation + real actions, no new dependencies.
// Opens with Cmd/Ctrl+K or the header button. Full keyboard support
// (arrows + Enter + Esc), live filtering, focus restore on close.
// Destinations come from site.js — nothing is hardcoded here.

// Theme lives in Navbar; the palette asks it to toggle via event so
// there is still exactly one owner of the theme state.
const TOGGLE_THEME_EVENT = 'th-portfolio:toggle-theme';

function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [copyFlash, setCopyFlash] = useState(null); // 'copied' | 'failed' | null
  const inputRef = useRef(null);
  const itemRefs = useRef([]);
  const openerRef = useRef(null);

  const navigate = useNavigate();
  const groups = useMemo(() => {
    // Route items navigate directly; anchors route home first and the
    // central ScrollManager performs the glide on location change.
    function goTo(item) {
      return () => {
        if (item.route) {
          navigate(item.href);
        } else {
          navigate({ pathname: '/', hash: item.href });
        }
        onClose();
      };
    }

    async function copyEmail() {
      const ok = await copyText(site.email);
      setCopyFlash(ok ? 'copied' : 'failed');
      window.setTimeout(onClose, 750);
    }

    function downloadResume() {
      const link = document.createElement('a');
      link.href = site.resume.href;
      link.download = site.resume.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      onClose();
    }

    return [
      {
        heading: 'Navigate',
        items: site.nav.map((item) => ({
          id: `nav-${item.href}`,
          label: item.label,
          hint: item.route ? 'page' : item.href.replace('#', '§ '),
          run: goTo(item),
        })),
      },
      {
        heading: 'Actions',
        items: [
          {
            id: 'action-theme',
            label: 'Toggle theme',
            hint: 'light / dark',
            run: () => {
              window.dispatchEvent(new CustomEvent(TOGGLE_THEME_EVENT));
              onClose();
            },
          },
          {
            id: 'action-resume',
            label: 'Download resume',
            hint: 'PDF',
            run: downloadResume,
          },
          {
            id: 'action-copy',
            label: copyFlash === 'copied' ? 'Copied ✓' : copyFlash === 'failed' ? 'Copy failed' : 'Copy email',
            hint: site.email,
            run: copyEmail,
          },
        ],
      },
      {
        heading: 'Socials',
        items: site.socials.map((social) => ({
          id: `social-${social.label}`,
          label: social.label,
          hint: '↗',
          run: () => {
            window.open(social.href, '_blank', 'noopener');
            onClose();
          },
        })),
      },
    ];
  }, [onClose, copyFlash, navigate]);

  const flat = useMemo(
    () =>
      groups.flatMap((group) =>
        group.items
          .filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
          .map((item) => ({ ...item, group: group.heading })),
      ),
    [groups, query],
  );

  // Clamp during render (never in an effect): the list shrinks as
  // the query filters, and the index must stay inside it.
  const safeIndex = Math.min(activeIndex, Math.max(flat.length - 1, 0));

  // Reset query + selection whenever the palette (re)opens, and focus
  // the input, restore the opener and lock scroll as side effects.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setCopyFlash(null);
    }
  }

  useEffect(() => {
    if (!open) return undefined;
    openerRef.current = document.activeElement;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      if (openerRef.current?.focus) openerRef.current.focus();
    };
  }, [open ]);

  // Keep the active row visible while arrowing through a long list.
  useEffect(() => {
    itemRefs.current[safeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [safeIndex]);

  if (!open) return null;

  function onKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(flat.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(
        (index) => (index - 1 + flat.length) % Math.max(flat.length, 1),
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      flat[safeIndex]?.run();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  }

  let cursor = 0;
  const rows = [];
  groups.forEach((group) => {
    const items = group.items.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase()),
    );
    if (items.length === 0) return;
    rows.push(
      <p className="palette-group-label" key={group.heading} aria-hidden="true">
        {group.heading}
      </p>,
    );
    items.forEach((item) => {
      const index = cursor;
      cursor += 1;
      rows.push(
        <button
          key={item.id}
          ref={(node) => {
            itemRefs.current[index] = node;
          }}
          type="button"
          role="option"
          aria-selected={index === safeIndex}
          className={`palette-item${index === safeIndex ? ' is-active' : ''}`}
          onClick={() => item.run()}
          onMouseMove={() => setActiveIndex(index)}
        >
          <span className="palette-item-label">{item.label}</span>
          {item.hint && (
            <span className="palette-hint" aria-hidden="true">
              {item.hint}
            </span>
          )}
        </button>,
      );
    });
  });

  return (
    <div
      className="palette-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="palette-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        onKeyDown={onKeyDown}
      >
        <div className="palette-input-row">
          <Search size={18} strokeWidth={2} aria-hidden="true" />
          <input
            ref={inputRef}
            className="palette-input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-label="Type a command or search"
            placeholder="Type a command or search…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
          />
          <kbd className="palette-kbd" aria-hidden="true">
            ESC
          </kbd>
        </div>
        <div
          id="palette-list"
          className="palette-list"
          role="listbox"
          aria-label="Commands"
        >
          {rows.length > 0 ? (
            rows
          ) : (
            <p className="palette-empty">No commands match “{query}”.</p>
          )}
        </div>
        <div className="palette-foot" aria-hidden="true">
          <span>
            <kbd className="palette-kbd">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="palette-kbd">↵</kbd> select
          </span>
          <span>
            <kbd className="palette-kbd">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}

export { TOGGLE_THEME_EVENT };
export default CommandPalette;
