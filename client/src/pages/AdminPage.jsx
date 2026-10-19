import React, { useState, useEffect, useRef } from 'react';
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
  FolderPlus,
  Layers,
  Video,
  FileVideo,
  Check,
  AlertTriangle,
  Upload,
  UserPlus,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { VideoCoverPicker } from '../components/common/VideoCoverPicker';
import { apiUrl } from '../utils/api';
import { getOptimizedVideoUrl, getOptimizedThumbnailUrl } from '../utils/videoUtils';

export const AdminPage = () => {
  const [authStatus, setAuthStatus] = useState({ loading: true, initialized: true });
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [currentUser, setCurrentUser] = useState(null);

  // Setup / Login / Signup form state
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [signupForm, setSignupForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [setupForm, setSetupForm] = useState({ username: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ identifier: 'kaushalkr.585@gmail.com', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'categories' | 'inquiries' | 'cloudinary' | 'settings'
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [cloudinaryConfig, setCloudinaryConfig] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Cloud Name Input
  const [cloudNameInput, setCloudNameInput] = useState('');
  const [savingCloudName, setSavingCloudName] = useState(false);

  // Video Upload Modal & State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'success' | 'error'
  const [uploadError, setUploadError] = useState('');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '',
    categoryId: '',
    description: '',
    tags: '',
    aspectRatio: '16:9',
    duration: '',
    featured: false,
    published: true,
  });

  // Selected Cover State for Upload Modal (Instagram-Style)
  const [selectedCover, setSelectedCover] = useState(null); // { blob, dataUrl, file, frameTime, type }

  // Change Cover Thumbnail Modal (Edit Thumbnail Later)
  const [coverEditProject, setCoverEditProject] = useState(null);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [newCoverData, setNewCoverData] = useState(null);
  const [isSavingCover, setIsSavingCover] = useState(false);

  // Project Edit Modal State
  const [editingProject, setEditingProject] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Category Management Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', order: 0 });

  // Cloudinary Verification State
  const [testingCloudinary, setTestingCloudinary] = useState(false);
  const [cloudinaryTestResult, setCloudinaryTestResult] = useState(null);

  const handleTestCloudinary = async () => {
    setTestingCloudinary(true);
    setCloudinaryTestResult(null);
    try {
      const res = await fetch(apiUrl('/api/cloudinary/verify'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCloudinaryTestResult(data);
    } catch (err) {
      setCloudinaryTestResult({
        success: false,
        message: 'Could not connect to backend verification endpoint: ' + err.message,
      });
    } finally {
      setTestingCloudinary(false);
    }
  };

  // Sync / Restore Videos Directly from Cloudinary
  const [syncingCloudinary, setSyncingCloudinary] = useState(false);
  const handleSyncCloudinary = async () => {
    setSyncingCloudinary(true);
    try {
      const res = await fetch(apiUrl('/api/projects/sync-cloudinary'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message || 'Videos synced from Cloudinary!');
        if (Array.isArray(data.data?.projects)) {
          setProjects(data.data.projects);
        } else {
          loadDashboardData();
        }
      } else {
        showNotification('error', data.message || 'Failed to sync videos');
      }
    } catch (err) {
      showNotification('error', 'Sync request failed: ' + err.message);
    } finally {
      setSyncingCloudinary(false);
    }
  };

  // Video Preview Modal
  const [previewModalProject, setPreviewModalProject] = useState(null);

  const fileInputRef = useRef(null);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [token]);

  const showNotification = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
  };

  const checkAuthStatus = async () => {
    try {
      const res = await fetch(apiUrl('/api/auth/status'));
      const data = await res.json();
      const allowSignup = Boolean(data.allowSignup);
      setAuthStatus({
        loading: false,
        initialized: data.initialized,
        allowSignup,
      });

      if (!allowSignup) {
        setAuthMode('login');
      }

      if (token) {
        const meRes = await fetch(apiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
          loadDashboardData();
        } else {
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
      // 1. Load Categories
      const catRes = await fetch(apiUrl('/api/categories'));
      const catData = await catRes.json();
      if (catData.success && Array.isArray(catData.data)) {
        setCategories(catData.data);
        if (catData.data.length > 0 && !uploadForm.category) {
          setUploadForm((prev) => ({
            ...prev,
            category: catData.data[0].name,
            categoryId: catData.data[0].id || catData.data[0]._id,
          }));
        }
      }

      // 2. Load all Projects (including drafts)
      const pRes = await fetch(apiUrl('/api/projects/admin/all'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pData = await pRes.json();
      if (pData.success && Array.isArray(pData.data)) setProjects(pData.data);

      // 3. Load Inquiries
      const iRes = await fetch(apiUrl('/api/inquiries'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const iData = await iRes.json();
      if (iData.success && Array.isArray(iData.data)) setInquiries(iData.data);

      // 4. Load Cloudinary config
      const cRes = await fetch(apiUrl('/api/cloudinary/config'));
      const cData = await cRes.json();
      if (cData.success) {
        setCloudinaryConfig(cData.data);
        if (cData.data.cloudName) setCloudNameInput(cData.data.cloudName);
      }

      // 5. Load Site Settings
      const sRes = await fetch(apiUrl('/api/settings'));
      const sData = await sRes.json();
      if (sData.success) setSiteSettings(sData.data);
    } catch (err) {
      console.warn('Error loading dashboard data:', err);
    }
  };

  // Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (signupForm.password !== signupForm.confirmPassword) {
      setAuthError('Passwords do not match. Please re-enter.');
      return;
    }

    if (signupForm.password.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupForm.username,
          email: signupForm.email,
          password: signupForm.password,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        setAuthStatus({ loading: false, initialized: true });
        loadDashboardData();
      } else {
        setAuthError(data.message || 'Signup failed');
      }
    } catch (err) {
      setAuthError('Connection error during signup');
    } finally {
      setAuthLoading(false);
    }
  };

  // Setup First Admin
  const handleSetup = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/setup'), {
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

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginForm.identifier.trim(),
          password: loginForm.password,
        }),
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

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setCurrentUser(null);
  };

  // Save Cloudinary Cloud Name
  const handleSaveCloudName = async (e) => {
    e.preventDefault();
    if (!cloudNameInput.trim()) return;
    setSavingCloudName(true);
    try {
      const res = await fetch(apiUrl('/api/cloudinary/cloud-name'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cloudName: cloudNameInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Cloud Name saved! Cloudinary is now fully configured.');
        setCloudinaryConfig(data.data);
      } else {
        showNotification('error', data.message || 'Failed to update Cloud Name');
      }
    } catch (err) {
      showNotification('error', 'Error updating Cloud Name');
    } finally {
      setSavingCloudName(false);
    }
  };

  // ==========================================
  // CATEGORY MANAGEMENT HANDLERS
  // ==========================================
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '', order: categories.length + 1 });
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      order: cat.order || 0,
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    const isEdit = Boolean(editingCategory);
    const catId = editingCategory ? (editingCategory.id || editingCategory._id) : null;
    const url = isEdit ? `/api/categories/${catId}` : '/api/categories';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(apiUrl(url), {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsCategoryModalOpen(false);
        showNotification('success', `Category "${categoryForm.name}" ${isEdit ? 'updated' : 'created'} successfully!`);
        loadDashboardData();
      } else {
        alert(data.message || 'Failed to save category');
      }
    } catch (err) {
      alert('Error saving category');
    }
  };

  const handleDeleteCategory = async (cat) => {
    const catId = cat.id || cat._id;
    if (!window.confirm(`Are you sure you want to delete the category "${cat.name}"? Projects in this category will remain preserved.`)) {
      return;
    }

    try {
      const res = await fetch(apiUrl(`/api/categories/${catId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Category "${cat.name}" deleted.`);
        loadDashboardData();
      } else {
        alert(data.message || 'Failed to delete category');
      }
    } catch (err) {
      alert('Error deleting category');
    }
  };

  // ==========================================
  // LOCAL VIDEO FILE SELECTION & PREVIEW
  // ==========================================
  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file (MP4, WebM, MOV, etc.).');
      return;
    }

    setSelectedFile(file);
    setUploadError('');

    // Create object URL for instant local video playback
    if (previewVideoUrl) {
      URL.revokeObjectURL(previewVideoUrl);
    }
    const localUrl = URL.createObjectURL(file);
    setPreviewVideoUrl(localUrl);

    // Auto-fill title from filename if title is currently empty
    const cleanTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    setUploadForm((prev) => ({
      ...prev,
      title: prev.title ? prev.title : cleanTitle,
    }));
  };

  const handleVideoMetadataLoaded = (e) => {
    const vid = e.target;
    // Auto-detect duration
    if (vid.duration) {
      const m = Math.floor(vid.duration / 60);
      const s = Math.floor(vid.duration % 60);
      const durationStr = `${m}:${s < 10 ? '0' : ''}${s}`;
      setUploadForm((prev) => ({ ...prev, duration: durationStr }));
    }

    // Auto-detect aspect ratio
    if (vid.videoWidth && vid.videoHeight) {
      const ratio = vid.videoWidth / vid.videoHeight;
      let detected = '16:9';
      if (ratio < 0.7) detected = '9:16';
      else if (ratio >= 0.7 && ratio < 0.9) detected = '4:5';
      else if (ratio >= 0.9 && ratio < 1.15) detected = '1:1';
      else detected = '16:9';

      setUploadForm((prev) => ({ ...prev, aspectRatio: detected }));
    }
  };

  const handleOpenUploadModal = () => {
    setSelectedFile(null);
    setSelectedCover(null);
    if (previewVideoUrl) {
      URL.revokeObjectURL(previewVideoUrl);
      setPreviewVideoUrl('');
    }
    setUploadProgress(0);
    setUploadStatus('idle');
    setUploadError('');
    setUploadForm({
      title: '',
      category: categories.length > 0 ? categories[0].name : 'General',
      categoryId: categories.length > 0 ? (categories[0].id || categories[0]._id) : '',
      description: '',
      tags: '',
      aspectRatio: '16:9',
      duration: '0:30',
      featured: false,
      published: true,
    });
    setIsUploadModalOpen(true);
  };

  // ==========================================
  // DIRECT CLOUDINARY SIGNED UPLOAD HANDLER
  // ==========================================
  const handleUploadAndPublish = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a video file to upload.');
      return;
    }
    if (!uploadForm.title.trim()) {
      alert('Please provide a project title.');
      return;
    }

    // Check Cloudinary configuration
    const activeCloudName = cloudinaryConfig?.cloudName;
    if (!activeCloudName || activeCloudName === 'test-portfolio-cloud') {
      setUploadError('Valid Cloudinary Cloud Name is required. Please enter your Cloud Name below.');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadError('');

    try {
      // 1. Request secure signed upload parameters from backend
      const sigRes = await fetch(apiUrl('/api/cloudinary/signature?folder=portfolio_videos'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sigJson = await sigRes.json();

      if (!sigJson.success || !sigJson.data) {
        throw new Error(sigJson.message || 'Could not obtain Cloudinary upload signature.');
      }

      const { signature, timestamp, apiKey, cloudName, folder } = sigJson.data;

      // 2. Perform direct upload to Cloudinary with real-time XHR progress
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', cloudinaryUploadUrl);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
            if (percentComplete === 100) {
              setUploadStatus('processing');
            }
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            try {
              const errResp = JSON.parse(xhr.responseText);
              reject(new Error(errResp.error?.message || `Cloudinary returned HTTP ${xhr.status}`));
            } catch (err) {
              reject(new Error(`Cloudinary upload failed with HTTP status ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error('Network error during video upload to Cloudinary.'));
        xhr.send(formData);
      });

      const cloudinaryResult = await uploadPromise;

      // 3. Construct optimized Cloudinary video and poster URLs
      const publicId = cloudinaryResult.public_id;
      const videoDeliveryUrl = `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto,vc_auto,w_1080,c_limit/${publicId}.mp4`;
      let finalThumbnailUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_0,f_auto,q_auto,w_1200/${publicId}.jpg`;
      let finalThumbnailPublicId = '';

      // Upload selected cover frame / custom image to Cloudinary if chosen
      if (selectedCover && (selectedCover.blob || selectedCover.file)) {
        try {
          const thumbSigRes = await fetch(apiUrl('/api/cloudinary/signature?folder=portfolio_thumbnails'), {
            headers: { Authorization: `Bearer ${token}` },
          });
          const thumbSigJson = await thumbSigRes.json();
          if (thumbSigJson.success && thumbSigJson.data) {
            const { signature: tSig, timestamp: tTs, apiKey: tKey, folder: tFolder } = thumbSigJson.data;
            const thumbFormData = new FormData();
            const coverUploadFile = selectedCover.file || selectedCover.blob;
            thumbFormData.append('file', coverUploadFile, selectedCover.file?.name || 'cover.jpg');
            thumbFormData.append('api_key', tKey);
            thumbFormData.append('timestamp', tTs);
            thumbFormData.append('signature', tSig);
            thumbFormData.append('folder', tFolder);

            const thumbRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
              method: 'POST',
              body: thumbFormData,
            });
            const thumbData = await thumbRes.json();
            if (thumbData.secure_url) {
              finalThumbnailUrl = thumbData.secure_url;
              finalThumbnailPublicId = thumbData.public_id;
            }
          }
        } catch (thumbErr) {
          console.warn('[Thumbnail Upload Error]', thumbErr);
        }
      } else if (selectedCover?.frameTime !== undefined && selectedCover.frameTime !== null) {
        const soSec = Math.round(selectedCover.frameTime * 10) / 10;
        finalThumbnailUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_${soSec},q_auto,f_auto,w_1200/${publicId}.jpg`;
      }

      // 4. Create project record in backend database
      const projectPayload = {
        title: uploadForm.title.trim(),
        category: uploadForm.category,
        categoryId: uploadForm.categoryId,
        description: uploadForm.description.trim(),
        videoUrl: videoDeliveryUrl,
        thumbnailUrl: finalThumbnailUrl,
        thumbnailPublicId: finalThumbnailPublicId,
        cloudinaryPublicId: publicId,
        duration: uploadForm.duration || `${Math.floor(cloudinaryResult.duration || 30)}s`,
        aspectRatio: uploadForm.aspectRatio,
        featured: uploadForm.featured,
        published: uploadForm.published,
        tags: uploadForm.tags ? uploadForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      const saveRes = await fetch(apiUrl('/api/projects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectPayload),
      });

      const saveData = await saveRes.json();
      if (!saveData.success) {
        throw new Error(saveData.message || 'Failed to save project record to database.');
      }

      setUploadStatus('success');
      showNotification('success', `Video "${uploadForm.title}" uploaded & published successfully!`);
      loadDashboardData();

      setTimeout(() => {
        setIsUploadModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error('[Upload Error]', err);
      setUploadStatus('error');
      setUploadError(err.message || 'Upload failed. Check Cloudinary settings and file size.');
    }
  };

  // ==========================================
  // PROJECT EDIT & DELETE HANDLERS
  // ==========================================
  const handleEditProject = (proj) => {
    setEditingProject({
      ...proj,
      tags: Array.isArray(proj.tags) ? proj.tags.join(', ') : (proj.tags || ''),
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProjectEdit = async (e) => {
    e.preventDefault();
    const projId = editingProject._id || editingProject.id;
    try {
      const res = await fetch(apiUrl(`/api/projects/${projId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingProject),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        showNotification('success', 'Project updated successfully!');
        loadDashboardData();
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      alert('Error saving project edits');
    }
  };

  const handleDeleteProject = async (proj) => {
    const projId = proj._id || proj.id;
    if (!window.confirm(`Are you sure you want to delete "${proj.title}"? This will delete the database record and remove its Cloudinary video asset.`)) {
      return;
    }

    try {
      const res = await fetch(apiUrl(`/api/projects/${projId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Project "${proj.title}" and its Cloudinary media deleted.`);
        loadDashboardData();
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (err) {
      alert('Error deleting project');
    }
  };

  // ==========================================
  // CHANGE COVER THUMBNAIL (Instagram-Style)
  // ==========================================
  const handleOpenChangeCover = (proj) => {
    setCoverEditProject(proj);
    setNewCoverData(null);
    setIsCoverModalOpen(true);
  };

  const handleSaveChangedCover = async () => {
    if (!coverEditProject) return;
    if (!newCoverData || (!newCoverData.blob && !newCoverData.file)) {
      alert('Please scrub to a video frame or upload a custom image first.');
      return;
    }

    setIsSavingCover(true);
    try {
      const activeCloudName = cloudinaryConfig?.cloudName;
      const thumbSigRes = await fetch(apiUrl('/api/cloudinary/signature?folder=portfolio_thumbnails'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const thumbSigJson = await thumbSigRes.json();
      if (!thumbSigJson.success || !thumbSigJson.data) {
        throw new Error(thumbSigJson.message || 'Failed to get upload signature for cover image.');
      }

      const { signature: tSig, timestamp: tTs, apiKey: tKey, folder: tFolder } = thumbSigJson.data;
      const thumbFormData = new FormData();
      const coverUploadFile = newCoverData.file || newCoverData.blob;
      thumbFormData.append('file', coverUploadFile, newCoverData.file?.name || 'cover.jpg');
      thumbFormData.append('api_key', tKey);
      thumbFormData.append('timestamp', tTs);
      thumbFormData.append('signature', tSig);
      thumbFormData.append('folder', tFolder);

      const thumbRes = await fetch(`https://api.cloudinary.com/v1_1/${activeCloudName}/image/upload`, {
        method: 'POST',
        body: thumbFormData,
      });
      const thumbData = await thumbRes.json();
      if (!thumbData.secure_url) {
        throw new Error(thumbData.error?.message || 'Failed to upload new cover image.');
      }

      const projId = coverEditProject._id || coverEditProject.id;
      const updateRes = await fetch(apiUrl(`/api/projects/${projId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          thumbnailUrl: thumbData.secure_url,
          thumbnailPublicId: thumbData.public_id,
        }),
      });

      const updateJson = await updateRes.json();
      if (!updateJson.success) {
        throw new Error(updateJson.message || 'Failed to update project record.');
      }

      showNotification('success', `Cover thumbnail updated for "${coverEditProject.title}"!`);
      setIsCoverModalOpen(false);
      setCoverEditProject(null);
      setNewCoverData(null);
      loadDashboardData();
    } catch (err) {
      console.error('[Change Cover Error]', err);
      alert(`Error updating cover thumbnail: ${err.message}`);
    } finally {
      setIsSavingCover(false);
    }
  };

  const handleToggleProjectStatus = async (proj, field) => {
    const projId = proj._id || proj.id;
    try {
      await fetch(apiUrl(`/api/projects/${projId}`), {
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

  // Inquiry Status Handler
  const handleUpdateInquiryStatus = async (inqId, nextStatus) => {
    try {
      await fetch(apiUrl(`/api/inquiries/${inqId}/status`), {
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
      const res = await fetch(apiUrl('/api/settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteSettings),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Site settings updated successfully!');
      }
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  // ==========================================
  // RENDER: AUTHENTICATION (Log In & Sign Up)
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#141414] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto mb-4 p-2.5 shadow-lg">
            <img src="/logo.png" alt="Kaushal Kumar Logo" className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <h2 className="text-2xl font-bold text-center text-white">
            {authMode === 'signup' ? 'Create Studio Account' : 'Studio Admin Portal'}
          </h2>
          <p className="text-xs text-[#A6A6A6] text-center mt-1 mb-6">
            {authMode === 'signup'
              ? 'Register your admin credentials to manage and publish your portfolio.'
              : 'Enter your credentials to manage categories, upload videos, and publish to your portfolio.'}
          </p>

          {/* Mode Switcher Tabs - Only visible if single admin has not been created yet */}
          {authStatus.allowSignup ? (
            <div className="flex bg-[#1A1A1A] p-1 rounded-2xl border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-[#B600A8] to-[#BE4C00] text-white shadow-md'
                    : 'text-[#A6A6A6] hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-[#B600A8] to-[#BE4C00] text-white shadow-md'
                    : 'text-[#A6A6A6] hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                First-Time Setup
              </button>
            </div>
          ) : (
            <div className="mb-6 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <span className="text-[11px] font-mono text-[#BBCCD7] flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#B600A8]" />
                Single-User Protected Studio Access
              </span>
            </div>
          )}

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {authError}
            </div>
          )}

          {authMode === 'login' ? (
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
                  placeholder="kaushalkr.585@gmail.com"
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

              {authStatus.allowSignup && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError('');
                    }}
                    className="text-xs text-[#BBCCD7] hover:text-white transition-colors"
                  >
                    Need an account? <span className="text-[#FF55D2] font-semibold underline">Sign Up</span>
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">Username</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={signupForm.username}
                  onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B600A8]"
                  placeholder="kaushal"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B600A8]"
                  placeholder="kaushalkr.585@gmail.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B600A8]"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B600A8]"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-full btn-contact-gradient text-white text-sm font-semibold shadow-lg disabled:opacity-50"
              >
                {authLoading ? 'Creating Account...' : 'Create Studio Account'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                  className="text-xs text-[#BBCCD7] hover:text-white transition-colors"
                >
                  Already have an account? <span className="text-[#FF55D2] font-semibold underline">Log In</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center border-t border-white/5 pt-4">
            <Link to="/" className="text-xs text-[#A6A6A6] hover:text-white transition-colors">
              ← Return to Public Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER 3: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#F5F5F5] font-kanit">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#141414]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center p-1 shadow-md">
            <img
              src="/logo.png"
              alt="Kaushal Kumar Logo"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <div>
            <span className="font-extrabold text-white text-sm sm:text-base tracking-wide block">
              KAUSHAL KUMAR
            </span>
            <span className="text-[10px] text-[#BBCCD7] uppercase tracking-wider">
              Studio Video CMS & Admin Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-[#A6A6A6] hover:text-white border border-white/5 transition-colors"
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

      {/* Global Status Toast */}
      {statusMsg.text && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4">
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              statusMsg.type === 'error'
                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}
          >
            {statusMsg.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
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
            <Video className="w-4 h-4" />
            Videos ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white shadow-md'
                : 'bg-[#141414] text-[#A6A6A6] hover:text-white border border-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            Categories ({categories.length})
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
            Cloudinary
            {cloudinaryConfig?.isConfigured ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
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
            Settings
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: VIDEOS MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Video Portfolio Management</h3>
                <p className="text-xs text-[#A6A6A6]">
                  Upload video files directly from your computer, assign categories, and publish to your portfolio.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleSyncCloudinary}
                  disabled={syncingCloudinary}
                  className="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/10 transition-colors disabled:opacity-50"
                  title="Auto-discover & restore all videos uploaded to Cloudinary"
                >
                  <RefreshCw className={`w-4 h-4 text-[#B600A8] ${syncingCloudinary ? 'animate-spin' : ''}`} />
                  {syncingCloudinary ? 'Restoring Videos...' : 'Sync Cloudinary Videos'}
                </button>

                <button
                  onClick={handleOpenUploadModal}
                  className="btn-contact-gradient px-6 py-3 rounded-full text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                >
                  <Upload className="w-4 h-4" />
                  Upload Video from Computer
                </button>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-20 bg-[#141414] rounded-2xl border border-white/[0.08] p-8">
                <Video className="w-12 h-12 text-[#6E6E6E] mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white">No projects uploaded yet</h4>
                <p className="text-xs text-[#A6A6A6] mt-1 max-w-sm mx-auto">
                  Click the button below to select a video file from your computer and upload it to Cloudinary.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    onClick={handleSyncCloudinary}
                    disabled={syncingCloudinary}
                    className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold inline-flex items-center gap-2 border border-white/10"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#B600A8] ${syncingCloudinary ? 'animate-spin' : ''}`} />
                    {syncingCloudinary ? 'Restoring...' : 'Restore from Cloudinary'}
                  </button>
                  <button
                    onClick={handleOpenUploadModal}
                    className="btn-contact-gradient px-6 py-2.5 rounded-full text-white text-xs font-semibold inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Upload Video
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1A1A1A] text-[#BBCCD7] uppercase font-semibold border-b border-white/[0.08]">
                      <tr>
                        <th className="py-3 px-4">Preview</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Ratio</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Date</th>
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
                              <div
                                onClick={() => setPreviewModalProject(proj)}
                                className="relative w-20 h-12 rounded-lg overflow-hidden bg-black border border-white/10 shrink-0 cursor-pointer group"
                              >
                                {proj.thumbnailUrl ? (
                                  <img
                                    src={proj.thumbnailUrl}
                                    alt={proj.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-[#6E6E6E]">
                                    <Film className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Eye className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <span className="font-bold text-white block truncate">{proj.title}</span>
                              {proj.cloudinaryPublicId && (
                                <span className="text-[10px] font-mono text-[#8E8E8E] block truncate">
                                  ID: {proj.cloudinaryPublicId}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-white/5 text-[#BBCCD7] px-2.5 py-0.5 rounded-full font-medium">
                                {proj.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[#A6A6A6]">{proj.aspectRatio || '16:9'}</td>
                            <td className="py-3 px-4 font-mono text-[#A6A6A6]">{proj.duration || '0:30'}</td>
                            <td className="py-3 px-4 text-[#8E8E8E]">
                              {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : 'Recent'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleToggleProjectStatus(proj, 'published')}
                                  title="Toggle Publication Status"
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                    proj.published
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                                  }`}
                                >
                                  {proj.published ? 'Published' : 'Draft'}
                                </button>
                                <button
                                  onClick={() => handleToggleProjectStatus(proj, 'featured')}
                                  title="Toggle Featured on Home Showreel"
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                    proj.featured
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                      : 'bg-neutral-800 text-neutral-500 hover:text-white'
                                  }`}
                                >
                                  {proj.featured ? 'Featured' : 'Regular'}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenChangeCover(proj)}
                                  className="p-1.5 rounded-lg bg-[#B600A8]/10 hover:bg-[#B600A8]/20 text-[#B600A8] hover:text-white"
                                  title="Change Cover Thumbnail (Instagram-Style)"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleEditProject(proj)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#BBCCD7] hover:text-white"
                                  title="Edit Project Details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(proj)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                  title="Delete Video & Asset"
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
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: DYNAMIC CATEGORY MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Category Management</h3>
                <p className="text-xs text-[#A6A6A6]">
                  Create, reorder, edit, or delete portfolio categories dynamically without touching frontend code.
                </p>
              </div>

              <button
                onClick={handleOpenAddCategory}
                className="btn-contact-gradient px-5 py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add New Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, idx) => {
                const projectCount = projects.filter(
                  (p) => p.category?.toLowerCase() === cat.name.toLowerCase() || p.categoryId === cat.id
                ).length;

                return (
                  <div
                    key={cat.id || cat._id || idx}
                    className="bg-[#141414] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono text-[#B600A8] bg-[#B600A8]/10 px-2.5 py-0.5 rounded-full border border-[#B600A8]/20">
                          Order #{cat.order || idx + 1}
                        </span>
                        <span className="text-xs text-[#A6A6A6]">
                          {projectCount} {projectCount === 1 ? 'video' : 'videos'}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-white">{cat.name}</h4>
                      <p className="text-xs text-[#A6A6A6] mt-1 leading-relaxed">
                        {cat.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#6E6E6E]">slug: {cat.slug}</span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCategory(cat)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#BBCCD7]"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: INQUIRIES PIPELINE */}
        {/* ==================================================== */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white">Client Inquiry Pipeline</h3>
              <span className="text-xs text-[#A6A6A6]">Total: {inquiries.length} received</span>
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
                    <div key={inqId} className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6 shadow-md">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div>
                          <span className="text-base font-bold text-white mr-3">{inq.name}</span>
                          <a href={`mailto:${inq.email}`} className="text-xs text-[#B600A8] hover:underline mr-3">
                            {inq.email}
                          </a>
                          <span className="text-[10px] font-mono text-[#6E6E6E]">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        </div>

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
                              <a href={inq.referenceLinks} target="_blank" rel="noreferrer" className="text-[#B600A8] hover:underline">
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: CLOUDINARY CONFIGURATION */}
        {/* ==================================================== */}
        {activeTab === 'cloudinary' && (
          <div className="max-w-3xl bg-[#141414] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#B600A8]" />
                Cloudinary Media Storage & Delivery
              </h3>
              <p className="text-xs text-[#A6A6A6] mt-1">
                Cloudinary stores your master video files, generates optimized MP4/WebM adaptive streams, and extracts high-resolution video poster frames automatically.
              </p>
            </div>

            {/* Status Card */}
            <div className="p-5 rounded-xl bg-[#1A1A1A] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Integration Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                    cloudinaryConfig?.isConfigured
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}
                >
                  {cloudinaryConfig?.isConfigured ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Ready for Uploads
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" /> Action Required
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A6A6A6]">API Key:</span>
                <span className="font-mono text-emerald-400">
                  {cloudinaryConfig?.apiKeyConfigured ? '✓ Configured securely on server' : '✗ Missing'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A6A6A6]">API Secret:</span>
                <span className="font-mono text-emerald-400">
                  {cloudinaryConfig?.apiSecretConfigured ? '✓ Configured securely on server' : '✗ Missing'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                <span className="text-[#A6A6A6]">Active Cloud Name:</span>
                <span className="font-mono font-bold text-white">
                  {cloudinaryConfig?.cloudName || 'Not Set Yet'}
                </span>
              </div>

              <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={testingCloudinary}
                  onClick={handleTestCloudinary}
                  className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingCloudinary ? 'animate-spin' : ''}`} />
                  {testingCloudinary ? 'Testing Credentials on Server...' : 'Test Live Cloudinary Connection'}
                </button>

                {cloudinaryTestResult && (
                  <div
                    className={`p-3 rounded-lg text-xs border ${
                      cloudinaryTestResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    <p className="font-semibold flex items-center gap-1.5">
                      {cloudinaryTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                      {cloudinaryTestResult.message}
                    </p>
                    {cloudinaryTestResult.details && (
                      <div className="mt-1.5 font-mono text-[11px] space-y-0.5 opacity-90">
                        <div>Cloud Name: {cloudinaryTestResult.details.cloudName || 'N/A'}</div>
                        <div>API Key on server: {cloudinaryTestResult.details.apiKeyPreview || 'N/A'}</div>
                        <div>API Secret on server: {cloudinaryTestResult.details.apiSecretPreview || 'N/A'} ({cloudinaryTestResult.details.apiSecretLength || 0} chars)</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cloud Name Configuration Form */}
            <form onSubmit={handleSaveCloudName} className="p-5 rounded-xl bg-[#1A1A1A] border border-white/5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">
                  Cloudinary Cloud Name
                </label>
                <p className="text-[11px] text-[#A6A6A6] mb-2">
                  Enter your Cloudinary Cloud Name (from your Cloudinary Dashboard under "Cloud name"). This is public information used to build your media delivery URLs.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={cloudNameInput}
                    onChange={(e) => setCloudNameInput(e.target.value)}
                    placeholder="e.g. your_cloud_name"
                    className="flex-1 bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                  />
                  <button
                    type="submit"
                    disabled={savingCloudName}
                    className="btn-contact-gradient px-6 py-2.5 rounded-full text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingCloudName ? 'Saving...' : 'Save Cloud Name'}
                  </button>
                </div>
              </div>
            </form>

            {/* Helpful instructions */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[#A6A6A6] space-y-2">
              <span className="font-bold text-white block">Security & Upload Verification:</span>
              <p>• Your Cloudinary API Secret is protected on the server and never sent to browser clients.</p>
              <p>• All video uploads from your computer use cryptographic server signatures that authorize direct, chunked uploads to Cloudinary without memory limits.</p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: SITE SETTINGS */}
        {/* ==================================================== */}
        {activeTab === 'settings' && siteSettings && (
          <div className="max-w-3xl bg-[#141414] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-6">Site Configuration</h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">Hero Headline</label>
                <input
                  type="text"
                  value={siteSettings.heroHeadline || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroHeadline: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">
                  Featured Showreel Video URL (or Cloudinary URL)
                </label>
                <input
                  type="text"
                  value={siteSettings.showreelUrl || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, showreelUrl: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">Showreel Poster URL</label>
                <input
                  type="text"
                  value={siteSettings.showreelPoster || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, showreelPoster: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                  placeholder="https://res.cloudinary.com/.../poster.jpg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">Contact Email</label>
                <input
                  type="email"
                  value={siteSettings.contactEmail || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1">About Me Paragraph Bio</label>
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

      {/* ==================================================== */}
      {/* MODAL 1: UPLOAD VIDEO DIRECTLY FROM COMPUTER */}
      {/* ==================================================== */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={() => {
            if (uploadStatus !== 'uploading' && uploadStatus !== 'processing') {
              setIsUploadModalOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-2xl bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B600A8] to-[#BE4C00] flex items-center justify-center text-white">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Upload Video to Portfolio</h3>
                  <p className="text-[11px] text-[#A6A6A6]">
                    Select a video from your computer to upload to Cloudinary.
                  </p>
                </div>
              </div>
              {uploadStatus !== 'uploading' && uploadStatus !== 'processing' && (
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1.5 rounded-full text-[#A6A6A6] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {(!cloudinaryConfig?.cloudName || cloudinaryConfig?.cloudName === 'test-portfolio-cloud' || uploadError.toLowerCase().includes('cloud_name')) && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-sm">Cloudinary Cloud Name Required</span>
                    <p className="text-[#A6A6A6] text-xs mt-0.5 leading-relaxed">
                      Enter your Cloudinary Cloud Name (from your Cloudinary Dashboard under <strong>"Cloud name"</strong>) to enable video uploads:
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={cloudNameInput}
                    onChange={(e) => setCloudNameInput(e.target.value)}
                    placeholder="Enter your Cloud Name (e.g. dxyz123abc)"
                    className="flex-1 bg-[#141414] border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#6E6E6E] focus:outline-none focus:border-[#B600A8]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!cloudNameInput.trim()) return;
                      setSavingCloudName(true);
                      try {
                        const res = await fetch('/api/cloudinary/cloud-name', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ cloudName: cloudNameInput.trim() }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          setCloudinaryConfig(data.data);
                          setUploadError('');
                          showNotification('success', 'Cloud Name saved! Click "Upload & Publish Project" to proceed.');
                        } else {
                          setUploadError(data.message || 'Failed to save Cloud Name');
                        }
                      } catch (e) {
                        setUploadError('Failed to save Cloud Name');
                      } finally {
                        setSavingCloudName(false);
                      }
                    }}
                    disabled={savingCloudName || !cloudNameInput.trim()}
                    className="btn-contact-gradient px-4 py-2 rounded-xl text-white font-semibold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingCloudName ? 'Saving...' : 'Save Cloud Name'}
                  </button>
                </div>
              </div>
            )}

            {uploadError && !uploadError.toLowerCase().includes('cloud_name') && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadAndPublish} className="space-y-4">
              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-[#BBCCD7] mb-1.5">
                  Select Video File (MP4, WebM, MOV) <span className="text-[#B600A8]">*</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/15 hover:border-[#B600A8] rounded-2xl p-8 text-center cursor-pointer transition-colors bg-white/[0.01] hover:bg-white/[0.03]"
                  >
                    <FileVideo className="w-10 h-10 text-[#BBCCD7] mx-auto mb-2" />
                    <span className="text-sm font-semibold text-white block">
                      Click to choose video from your computer
                    </span>
                    <span className="text-xs text-[#6E6E6E] mt-1 block">
                      MP4, WebM, MOV supported (up to Cloudinary account limit)
                    </span>
                  </div>
                ) : (
                  <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileVideo className="w-5 h-5 text-[#B600A8] shrink-0" />
                        <span className="text-xs font-bold text-white truncate">{selectedFile.name}</span>
                        <span className="text-[10px] text-[#6E6E6E] shrink-0">
                          ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (previewVideoUrl) URL.revokeObjectURL(previewVideoUrl);
                          setPreviewVideoUrl('');
                        }}
                        className="text-xs text-red-400 hover:text-red-300 ml-2"
                      >
                        Change
                      </button>
                    </div>

                    {/* Local Video Player Preview */}
                    {previewVideoUrl && (
                      <div className="rounded-xl overflow-hidden bg-black aspect-video max-h-56 mx-auto border border-white/10">
                        <video
                          src={previewVideoUrl}
                          controls
                          onLoadedMetadata={handleVideoMetadataLoaded}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    {/* Instagram-Style Video Cover Selection */}
                    <div className="pt-2">
                      <VideoCoverPicker
                        videoSource={selectedFile}
                        aspectRatio={uploadForm.aspectRatio}
                        onCoverSelected={setSelectedCover}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">
                    Project Title <span className="text-[#B600A8]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                    placeholder="e.g. ApexFlow SaaS Platform Launch"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">
                    Category <span className="text-[#B600A8]">*</span>
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => {
                      const selected = categories.find((c) => c.name === e.target.value);
                      setUploadForm({
                        ...uploadForm,
                        category: e.target.value,
                        categoryId: selected ? (selected.id || selected._id) : '',
                      });
                    }}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#B600A8] resize-none"
                  placeholder="Summary of pacing, tools, sound design, and creative direction..."
                />
              </div>

              {/* Ratio & Duration */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Aspect Ratio</label>
                  <select
                    value={uploadForm.aspectRatio}
                    onChange={(e) => setUploadForm({ ...uploadForm, aspectRatio: e.target.value })}
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
                    value={uploadForm.duration}
                    onChange={(e) => setUploadForm({ ...uploadForm, duration: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                    placeholder="0:45"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                    placeholder="SaaS, 3D, Beat Sync"
                  />
                </div>
              </div>

              {/* Flags */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={uploadForm.published}
                    onChange={(e) => setUploadForm({ ...uploadForm, published: e.target.checked })}
                    className="rounded bg-[#1A1A1A] border-white/10 text-[#B600A8] focus:ring-0"
                  />
                  <span>Publish to Public Portfolio immediately</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={uploadForm.featured}
                    onChange={(e) => setUploadForm({ ...uploadForm, featured: e.target.checked })}
                    className="rounded bg-[#1A1A1A] border-white/10 text-[#B600A8] focus:ring-0"
                  />
                  <span>Set as Featured Showreel</span>
                </label>
              </div>

              {/* Upload Progress Bar */}
              {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
                <div className="p-4 rounded-xl bg-[#1A1A1A] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B600A8]" />
                      {uploadStatus === 'uploading'
                        ? `Uploading to Cloudinary... ${uploadProgress}%`
                        : 'Generating video stream & poster transformations...'}
                    </span>
                    <span className="font-mono text-[#BBCCD7]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#B600A8] to-[#BE4C00] rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Banner */}
              {uploadStatus === 'success' && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Upload complete! Video successfully added to your portfolio.</span>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'processing'}
                  className="btn-contact-gradient px-7 py-2.5 rounded-full text-white text-xs font-semibold shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {uploadStatus === 'uploading' ? `Uploading (${uploadProgress}%)...` : 'Upload & Publish to Cloudinary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: CATEGORY CREATE / EDIT */}
      {/* ==================================================== */}
      {isCategoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsCategoryModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <h3 className="text-xl font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 rounded-full text-[#A6A6A6] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. 3D Motion Graphics"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Explain what kind of video editing work belongs in this category..."
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#B600A8] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Display Order</label>
                <input
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, order: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-contact-gradient px-6 py-2.5 rounded-full text-white text-xs font-semibold shadow-md"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: PROJECT METADATA EDIT */}
      {/* ==================================================== */}
      {isEditModalOpen && editingProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <h3 className="text-xl font-bold text-white">Edit Video Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full text-[#A6A6A6] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Category</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) => {
                      const sel = categories.find((c) => c.name === e.target.value);
                      setEditingProject({
                        ...editingProject,
                        category: e.target.value,
                        categoryId: sel ? (sel.id || sel._id) : '',
                      });
                    }}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Aspect Ratio</label>
                  <select
                    value={editingProject.aspectRatio}
                    onChange={(e) => setEditingProject({ ...editingProject, aspectRatio: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                  >
                    <option value="16:9">16:9</option>
                    <option value="9:16">9:16</option>
                    <option value="1:1">1:1</option>
                    <option value="4:5">4:5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Duration</label>
                  <input
                    type="text"
                    value={editingProject.duration}
                    onChange={(e) => setEditingProject({ ...editingProject, duration: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#BBCCD7] mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editingProject.tags}
                  onChange={(e) => setEditingProject({ ...editingProject, tags: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B600A8]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editingProject.published}
                    onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                    className="rounded bg-[#1A1A1A] border-white/10 text-[#B600A8] focus:ring-0"
                  />
                  <span>Published to public website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editingProject.featured}
                    onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                    className="rounded bg-[#1A1A1A] border-white/10 text-[#B600A8] focus:ring-0"
                  />
                  <span>Featured on Home Showreel</span>
                </label>
              </div>

              {/* Cover Thumbnail Quick Action */}
              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-10 rounded-lg overflow-hidden bg-black border border-white/10 shrink-0">
                    {editingProject.thumbnailUrl ? (
                      <img
                        src={editingProject.thumbnailUrl}
                        alt="Current cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6E6E6E]">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Cover Thumbnail</span>
                    <span className="text-[11px] text-[#A6A6A6] block">
                      Choose a new frame or upload custom cover
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const proj = editingProject;
                    setIsEditModalOpen(false);
                    handleOpenChangeCover(proj);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#B600A8]/20 hover:bg-[#B600A8]/30 text-[#B600A8] text-xs font-semibold flex items-center gap-1.5 border border-[#B600A8]/30 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Change Cover
                </button>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-contact-gradient px-6 py-2.5 rounded-full text-white text-xs font-semibold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: FULL VIDEO PLAYBACK PREVIEW */}
      {/* ==================================================== */}
      {previewModalProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewModalProject(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#141414] rounded-2xl overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalProject(null)}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
            <video
              src={getOptimizedVideoUrl(previewModalProject.videoUrl)}
              poster={getOptimizedThumbnailUrl(previewModalProject.thumbnailUrl, { width: 1200 })}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="w-full aspect-video object-contain bg-black"
            />
            <div className="p-5 bg-[#141414] flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-[#B600A8]">
                  {previewModalProject.category}
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">{previewModalProject.title}</h4>
                <p className="text-xs text-[#A6A6A6] mt-1">{previewModalProject.description}</p>
              </div>
              {previewModalProject.cloudinaryPublicId && (
                <span className="text-[10px] font-mono text-[#6E6E6E]">
                  Cloudinary ID: {previewModalProject.cloudinaryPublicId}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: CHANGE COVER THUMBNAIL (Instagram-Style) */}
      {/* ==================================================== */}
      {isCoverModalOpen && coverEditProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={() => !isSavingCover && setIsCoverModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#141414] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#B600A8]" />
                  Change Project Cover Thumbnail
                </h3>
                <p className="text-xs text-[#A6A6A6] mt-0.5">
                  Pick a new frame from "{coverEditProject.title}" or upload a custom image. Saves instantly without re-uploading the video!
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isSavingCover && setIsCoverModalOpen(false)}
                className="p-1 rounded-full text-[#A6A6A6] hover:text-white"
                disabled={isSavingCover}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <VideoCoverPicker
                videoSource={coverEditProject.videoUrl}
                initialCoverUrl={coverEditProject.thumbnailUrl}
                aspectRatio={coverEditProject.aspectRatio || '16:9'}
                onCoverSelected={setNewCoverData}
              />

              <div className="pt-4 flex items-center justify-between border-t border-white/[0.08]">
                <div className="text-xs text-[#BBCCD7]">
                  {newCoverData ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> New cover frame selected
                    </span>
                  ) : (
                    <span className="text-[#A6A6A6]">Scrub the timeline or select a custom image above.</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isSavingCover}
                    onClick={() => setIsCoverModalOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSavingCover || !newCoverData}
                    onClick={handleSaveChangedCover}
                    className="btn-contact-gradient px-6 py-2.5 rounded-full text-white text-xs font-semibold shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingCover ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Uploading to Cloudinary...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Save New Cover
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
