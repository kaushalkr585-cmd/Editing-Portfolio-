import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  Clock,
  Mail,
  Film,
  UploadCloud,
  Settings,
  Search,
  ExternalLink,
  AlertCircle,
  Save,
  X,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'SaaS & Product',
  'Real Estate',
  'AMVs',
  'Movie Edits',
  'Podcasts',
  'YouTube',
  'Reels & Shorts',
  'Gaming',
  'Commercials',
  'Motion Graphics & VFX',
  'Travel & Cinematic',
  'Other',
];

export const AdminPage = () => {
  const [authStatus, setAuthStatus] = useState({ loading: true, initialized: true });
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [currentUser, setCurrentUser] = useState(null);

  // Setup / Login form state
  const [setupForm, setSetupForm] = useState({ username: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'inquiries' | 'cloudinary' | 'settings'
  const [projects, setProjects] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [cloudinaryConfig, setCloudinaryConfig] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Project Editing / Creation Modal
  const [editingProject, setEditingProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [previewModalProject, setPreviewModalProject] = useState(null);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [token]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setAuthStatus({ loading: false, initialized: data.initialized });

      if (token) {
        // Verify current token
        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
          loadDashboardData();
        } else {
          // Token expired or invalid
          setToken('');
          localStorage.removeItem('admin_token');
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.warn('Auth status check error:', err);
      setAuthStatus({ loading: false, initialized: true });
    }
  };

  const loadDashboardData = async () => {
    if (!token) return;
    try {
      // Load all projects
      const pRes = await fetch('/api/projects/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pData = await pRes.json();
      if (pData.success) setProjects(pData.data);

      // Load inquiries
      const iRes = await fetch('/api/inquiries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const iData = await iRes.json();
      if (iData.success) setInquiries(iData.data);

      // Load Cloudinary config
      const cRes = await fetch('/api/cloudinary/config');
      const cData = await cRes.json();
      if (cData.success) setCloudinaryConfig(cData.data);

      // Load site settings
      const sRes = await fetch('/api/settings');
      const sData = await sRes.json();
      if (sData.success) setSiteSettings(sData.data);
    } catch (err) {
      console.warn('Error loading dashboard data:', err);
    }
  };

  // Handle Initial Admin Setup
  const handleSetup = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        setAuthStatus({ loading: false, initialized: true });
        loadDashboardData();
      } else {
        setAuthError(data.message || 'Setup failed');
      }
    } catch (err) {
      setAuthError('Connection error during setup');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        loadDashboardData();
      } else {
        setAuthError(data.message || 'Login failed');
      }
    } catch (err) {
      setAuthError('Connection error during login');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setCurrentUser(null);
  };

  // Project CRUD Actions
  const handleOpenAddProject = () => {
    setEditingProject({
      title: '',
      category: 'SaaS & Product',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      cloudinaryPublicId: '',
      duration: '0:30',
      aspectRatio: '16:9',
      featured: false,
      published: true,
      client: '',
      tags: '',
    });
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (proj) => {
    setEditingProject({
      ...proj,
      tags: Array.isArray(proj.tags) ? proj.tags.join(', ') : proj.tags,
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    const isEdit = Boolean(editingProject._id || editingProject.id && projects.some(p => p.id === editingProject.id));
    const targetId = editingProject._id || editingProject.id;
    const url = isEdit ? `/api/projects/${targetId}` : '/api/projects';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingProject),
      });
      const data = await res.json();
      if (data.success) {
        setIsProjectModalOpen(false);
        setStatusMsg({ type: 'success', text: `Project ${isEdit ? 'updated' : 'created'} successfully!` });
        loadDashboardData();
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      } else {
        alert(data.message || 'Save failed');
      }
    } catch (err) {
      alert('Network error while saving project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Project deleted successfully' });
        loadDashboardData();
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleToggleProjectStatus = async (proj, field) => {
    const targetId = proj._id || proj.id;
    try {
      await fetch(`/api/projects/${targetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: !proj[field] }),
      });
      loadDashboardData();
    } catch (err) {
      console.warn('Update failed:', err);
    }
  };

  // Inquiry Status Update
  const handleUpdateInquiryStatus = async (inqId, nextStatus) => {
    try {
      await fetch(`/api/inquiries/${inqId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      loadDashboardData();
    } catch (err) {
      console.warn('Inquiry status update failed:', err);
    }
  };

  // Save Site Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteSettings),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Site settings updated successfully!' });
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  // 1. Initial Setup Screen (when no admin user exists)
  if (!authStatus.initialized && !currentUser) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#141414] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B600A8] to-[#BE4C00] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-center text-white">Initialize Admin Account</h2>
          <p className="text-xs text-[#A6A6A6] text-center mt-1 mb-6">
            Welcome, Kaushal. Create your primary secure administrator credentials for this portfolio.
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {authError}
            </div>
          )}

          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">Username</label>
              <input
                type="text"
                required
                value={setupForm.username}
                onChange={(e) => setSetupForm({ ...setupForm, username: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B600A8]"
                placeholder="kaushal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={setupForm.email}
                onChange={(e) => setSetupForm({ ...setupForm, email: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B600A8]"
                placeholder="contact@kaushalkumar.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">Password (min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={setupForm.password}
                onChange={(e) => setSetupForm({ ...setupForm, password: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B600A8]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-full btn-contact-gradient text-white text-sm font-semibold shadow-lg disabled:opacity-50"
            >
              {authLoading ? 'Creating Account...' : 'Create Admin Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Login Screen (when unauthenticated)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#141414] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B600A8] to-[#7621B0] flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-center text-white">Studio Admin Portal</h2>
          <p className="text-xs text-[#A6A6A6] text-center mt-1 mb-6">
            Enter your credentials to manage videos, inquiries, and site configuration.
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={loginForm.identifier}
                onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B600A8]"
                placeholder="kaushal or email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">Password</label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B600A8]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-full btn-contact-gradient text-white text-sm font-semibold shadow-lg disabled:opacity-50"
            >
              {authLoading ? 'Verifying...' : 'Log In to Studio'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-[#A6A6A6] hover:text-white transition-colors">
              ← Return to Public Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#F5F5F5] font-kanit">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#141414]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#B600A8] to-[#BE4C00] flex items-center justify-center p-0.5">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm sm:text-base tracking-wide block">
              KAUSHAL KUMAR
            </span>
            <span className="text-[10px] text-[#BBCCD7] uppercase tracking-wider">
              Studio Admin Dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-[#A6A6A6] hover:text-white border border-white/5 transition-colors"
          >
            <span>Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2 pl-3 border-l border-white/10">
            <span className="text-xs text-[#BBCCD7] font-medium hidden md:inline">
              {currentUser.username}
            </span>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Status toast */}
      {statusMsg.text && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-white/[0.08] mb-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white shadow-md'
                : 'bg-[#141414] text-[#A6A6A6] hover:text-white border border-white/5'
            }`}
          >
            <Film className="w-4 h-4" />
            Projects ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'inquiries'
                ? 'bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white shadow-md'
                : 'bg-[#141414] text-[#A6A6A6] hover:text-white border border-white/5'
            }`}
          >
            <Mail className="w-4 h-4" />
            Inquiries ({inquiries.filter((i) => i.status === 'new').length} New)
          </button>

          <button
            onClick={() => setActiveTab('cloudinary')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'cloudinary'
                ? 'bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white shadow-md'
                : 'bg-[#141414] text-[#A6A6A6] hover:text-white border border-white/5'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Cloudinary Setup
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white shadow-md'
                : 'bg-[#141414] text-[#A6A6A6] hover:text-white border border-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            Site Settings
          </button>
        </div>

        {/* Tab 1: Projects Management */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Portfolio Video Catalog</h3>
                <p className="text-xs text-[#A6A6A6]">
                  Add, edit, reorder, or publish videos across all 12 categories.
                </p>
              </div>

              <button
                onClick={handleOpenAddProject}
                className="btn-contact-gradient px-5 py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add New Project
              </button>
            </div>

            <div className="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1A1A1A] text-[#BBCCD7] uppercase font-semibold border-b border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Video / Thumbnail</th>
                      <th className="py-3 px-4">Title & Client</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Ratio</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {projects.map((proj) => {
                      const projId = proj._id || proj.id;
                      return (
                        <tr key={projId} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4">
                            <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-black border border-white/10 shrink-0">
                              <img
                                src={proj.thumbnailUrl}
                                alt={proj.title}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => setPreviewModalProject(proj)}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                              >
                                <Eye className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <span className="font-bold text-white block truncate">{proj.title}</span>
                            <span className="text-[11px] text-[#A6A6A6]">{proj.client || 'Client Work'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-white/5 text-[#BBCCD7] px-2.5 py-0.5 rounded-full font-medium">
                              {proj.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#A6A6A6]">{proj.aspectRatio || '16:9'}</td>
                          <td className="py-3 px-4 font-mono text-[#A6A6A6]">{proj.duration || '0:30'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleProjectStatus(proj, 'published')}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  proj.published
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-neutral-800 text-neutral-400'
                                }`}
                              >
                                {proj.published ? 'Published' : 'Draft'}
                              </button>
                              <button
                                onClick={() => handleToggleProjectStatus(proj, 'featured')}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  proj.featured
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-neutral-800 text-neutral-500'
                                }`}
                              >
                                {proj.featured ? 'Featured' : 'Regular'}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditProject(proj)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#BBCCD7] hover:text-white"
                                title="Edit Project"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(projId)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                title="Delete Project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Inquiries Inbox */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white">Client Inquiry Pipeline</h3>
              <span className="text-xs text-[#A6A6A6]">
                Total: {inquiries.length} inquiries received
              </span>
            </div>

            {inquiries.length === 0 ? (
              <div className="text-center py-16 bg-[#141414] rounded-2xl border border-white/5">
                <Mail className="w-10 h-10 text-[#6E6E6E] mx-auto mb-2" />
                <p className="text-sm text-[#A6A6A6]">No client inquiries received yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inq) => {
                  const inqId = inq._id || inq.id;
                  return (
                    <div
                      key={inqId}
                      className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6 shadow-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div>
                          <span className="text-base font-bold text-white mr-3">{inq.name}</span>
                          <a
                            href={`mailto:${inq.email}`}
                            className="text-xs text-[#B600A8] hover:underline mr-3"
                          >
                            {inq.email}
                          </a>
                          <span className="text-[10px] font-mono text-[#6E6E6E]">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Status Switcher */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#6E6E6E]">Status:</span>
                          <select
                            value={inq.status}
                            onChange={(e) => handleUpdateInquiryStatus(inqId, e.target.value)}
                            className="bg-[#1A1A1A] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                          >
                            <option value="new">New</option>
                            <option value="in_review">In Review</option>
                            <option value="responded">Responded</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-[#1A1A1A] p-3 rounded-xl border border-white/5 mb-3">
                        <div>
                          <span className="text-[#6E6E6E] block">Type</span>
                          <span className="text-[#BBCCD7] font-medium">{inq.projectType}</span>
                        </div>
                        <div>
                          <span className="text-[#6E6E6E] block">Budget</span>
                          <span className="text-white font-medium">{inq.budget || 'Flexible'}</span>
                        </div>
                        <div>
                          <span className="text-[#6E6E6E] block">Deadline</span>
                          <span className="text-white font-medium">{inq.deadline || 'Flexible'}</span>
                        </div>
                        <div>
                          <span className="text-[#6E6E6E] block">References</span>
                          <span className="text-white font-medium truncate block">
                            {inq.referenceLinks ? (
                              <a
                                href={inq.referenceLinks}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#B600A8] hover:underline"
                              >
                                View Link
                              </a>
                            ) : (
                              'None'
                            )}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#E5E5E5] leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        {inq.description}
                      </p>

                      {inq.aiBrief && (
                        <div className="mt-3 p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs">
                          <span className="font-semibold text-purple-300 block mb-1">
                            Attached AI Brief: {inq.aiBrief.briefTitle}
                          </span>
                          <p className="text-[#A6A6A6] text-[11px]">
                            Recommended: {inq.aiBrief.recommendedService} ({inq.aiBrief.aspectRatio})
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Cloudinary Setup */}
        {activeTab === 'cloudinary' && (
          <div className="max-w-3xl bg-[#141414] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#B600A8]" />
                Cloudinary Video Delivery & Upload Architecture
              </h3>
              <p className="text-xs text-[#A6A6A6] mt-1">
                Cloudinary provides edge CDN video delivery, adaptive bitrate streaming, automatic poster frame generation, and fast streaming.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#1A1A1A] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Integration Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    cloudinaryConfig?.isConfigured
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}
                >
                  {cloudinaryConfig?.isConfigured ? 'Active & Connected' : 'Demo / CDN Fallback Mode'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Configured Cloud Name:</span>
                <span className="text-xs font-mono text-[#BBCCD7]">
                  {cloudinaryConfig?.cloudName || 'Not Set (Set in server/.env)'}
                </span>
              </div>
            </div>

            <div className="text-xs text-[#A6A6A6] space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                How to connect your Cloudinary account:
              </h4>
              <p>
                1. Open <code className="text-[#B600A8]">server/.env</code> in your editor.
              </p>
              <p>
                2. Supply your credentials obtained from your Cloudinary Console:
              </p>
              <pre className="bg-black/60 p-3 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto">
{`CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret`}
              </pre>
              <p>
                3. Once saved, you can paste Cloudinary Public IDs (e.g. <code>my_video_1</code>) directly into any project card, and our backend will automatically generate optimized MP4/WebM video streams, posters, and thumbnails!
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Site Settings */}
        {activeTab === 'settings' && siteSettings && (
          <div className="max-w-3xl bg-[#141414] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-6">Site Configuration & Copy</h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">
                  Hero Headline
                </label>
                <input
                  type="text"
                  value={siteSettings.heroHeadline || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroHeadline: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">
                  Featured Showreel Video URL
                </label>
                <input
                  type="text"
                  value={siteSettings.showreelUrl || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, showreelUrl: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">
                  Featured Showreel Poster Image URL
                </label>
                <input
                  type="text"
                  value={siteSettings.showreelPoster || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, showreelPoster: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">
                  Contact Studio Email
                </label>
                <input
                  type="email"
                  value={siteSettings.contactEmail || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">
                  About Me Paragraph Bio
                </label>
                <textarea
                  rows={4}
                  value={siteSettings.aboutBio || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, aboutBio: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                />
              </div>

              <button
                type="submit"
                className="btn-contact-gradient px-7 py-3 rounded-full text-white text-xs font-semibold shadow-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Site Settings
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Project Create / Edit Modal */}
      {isProjectModalOpen && editingProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setIsProjectModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingProject._id || (editingProject.id && projects.some(p => p.id === editingProject.id)) ? 'Edit Project' : 'Add New Portfolio Project'}
              </h3>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1 rounded-full text-[#A6A6A6] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                    placeholder="Project Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Category</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                  placeholder="Summary of video pacing, tools, and visual style..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Video MP4 / WebM URL</label>
                  <input
                    type="text"
                    required
                    value={editingProject.videoUrl}
                    onChange={(e) => setEditingProject({ ...editingProject, videoUrl: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                    placeholder="https://...mp4"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Thumbnail Poster URL</label>
                  <input
                    type="text"
                    required
                    value={editingProject.thumbnailUrl}
                    onChange={(e) => setEditingProject({ ...editingProject, thumbnailUrl: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                    placeholder="https://...jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Aspect Ratio</label>
                  <select
                    value={editingProject.aspectRatio}
                    onChange={(e) => setEditingProject({ ...editingProject, aspectRatio: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                  >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Vertical Reel/Short)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:5">4:5 (Social Feed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Duration</label>
                  <input
                    type="text"
                    value={editingProject.duration}
                    onChange={(e) => setEditingProject({ ...editingProject, duration: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                    placeholder="0:45"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Client Name</label>
                  <input
                    type="text"
                    value={editingProject.client}
                    onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                    placeholder="Brand / Creator"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Cloudinary Public ID (Optional)</label>
                  <input
                    type="text"
                    value={editingProject.cloudinaryPublicId || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, cloudinaryPublicId: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                    placeholder="e.g. video_reel_01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editingProject.tags || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, tags: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                    placeholder="SaaS, 3D, Premiere, 4K"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editingProject.featured}
                    onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                    className="rounded bg-[#1A1A1A] border-white/10 text-[#B600A8] focus:ring-0"
                  />
                  <span>Mark as Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editingProject.published}
                    onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                    className="rounded bg-[#1A1A1A] border-white/10 text-[#B600A8] focus:ring-0"
                  />
                  <span>Publish to Public Gallery</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-contact-gradient px-6 py-2.5 rounded-full text-white text-xs font-semibold shadow-md"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewModalProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewModalProject(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#141414] rounded-2xl overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalProject(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
            <video
              src={previewModalProject.videoUrl}
              poster={previewModalProject.thumbnailUrl}
              controls
              autoPlay
              className="w-full aspect-video object-contain bg-black"
            />
            <div className="p-4 bg-[#141414]">
              <h4 className="text-base font-bold text-white">{previewModalProject.title}</h4>
              <p className="text-xs text-[#A6A6A6]">{previewModalProject.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
