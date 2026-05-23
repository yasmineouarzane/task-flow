import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

interface Project { id: string; name: string; color: string; }
interface SidebarProps { projects: Project[]; isOpen: boolean; }

function Sidebar({ projects, isOpen }: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <h2 className={styles.title}>Mes Projets</h2>
      <ul className={styles.list}>
        {projects.map(p => (
          <li key={p.id}>
            <NavLink
              to={`/projects/${p.id}`}
              className={({ isActive }) =>
                `${styles.item} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.dot} style={{ background: p.color }} />
              {p.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default memo(Sidebar);