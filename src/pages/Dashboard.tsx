import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {type RootState } from '../store';
import { logout } from '../features/auth/authSlice';
import { setAuthToken } from '../api/axios';
import useProjects from '../hooks/useProjects';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import ProjectForm from '../components/ProjectForm';
import styles from './Dashboard.module.css';

interface Project { id: string; name: string; color: string; }

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const { projects, columns, loading, error, addProject, renameProject, deleteProject } = useProjects();

  const handleRename = useCallback((project: Project) => {
    renameProject(project);
  }, [renameProject]);

  const handleDelete = useCallback((id: string) => {
    deleteProject(id);
  }, [deleteProject]);

  function handleLogout() {
    setAuthToken(null);
    dispatch(logout());
  }

  if (loading) return <div className={styles.loading}>Chargement...</div>;

  return (
    <div className={styles.layout}>
      <Header
        title="TaskFlow"
        onMenuClick={() => setSidebarOpen(p => !p)}
        userName={user?.name}
        onLogout={handleLogout}
      />
      <div className={styles.body}>
        <Sidebar projects={projects} isOpen={sidebarOpen} />
        <div className={styles.content}>
          <div className={styles.toolbar}>
            {error && <div className={styles.error}>{error}</div>}
            {!showForm ? (
              <button className={styles.addBtn} onClick={() => setShowForm(true)}>
                + Nouveau projet
              </button>
            ) : (
              <ProjectForm
                submitLabel="Créer"
                onSubmit={(name, color) => {
                  addProject(name, color);
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            )}
          </div>
          <MainContent columns={columns} />
        </div>
      </div>
    </div>
  );
}