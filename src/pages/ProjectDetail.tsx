import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store';
import { logout } from '../features/auth/authSlice';
import { setAuthToken } from '../api/axios';
import api from '../api/axios';
import Header from '../components/Header';
import styles from './ProjectDetail.module.css';

interface Project { id: string; name: string; color: string; }

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // BUG 1 CORRIGÉ : ajout de [id] dans les dépendances
    api.get(`/projects/${id}`)
      .then(res => setProject(res.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id]); // BUG 1 CORRIGÉ

  function handleLogout() {
    setAuthToken(null);
    dispatch(logout());
  }

  if (loading) return <div className={styles.loading}>Chargement...</div>;
  if (!project) return null;

  return (
    <div className={styles.layout}>
      <Header
        title="TaskFlow"
        onMenuClick={() => navigate('/dashboard')}
        userName={user?.name} // BUG 2 CORRIGÉ : user?.name au lieu de user.name
        onLogout={handleLogout}
      />
      <main className={styles.main}>
        <div className={styles.header}>
          <span className={styles.dot} style={{ background: project.color }} />
          <h2>{project.name}</h2>
        </div>
        <p className={styles.info}>Projet ID : {project.id}</p>
      </main>
    </div>
  );
}