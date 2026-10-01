import styles from './Avatar.module.css';

/** The avatar colour is derived from the name so it stays stable for a chat across re-renders. */
function hueOf(name: string) {
  let hash = 0;

  for (const ch of name) {
    hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  }

  return hash;
}

export function Avatar({ name }: { name: string }) {
  const initial = name.replace(/^\+/, '').charAt(0).toUpperCase() || '?';

  return (
    <span
      className={styles.avatar}
      style={{ background: `hsl(${hueOf(name)} 55% 50%)` }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
