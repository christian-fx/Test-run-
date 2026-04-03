import React, { useState, useEffect, useRef } from 'react';
import { User, Shield, Key, History, Loader2, Camera, Upload } from 'lucide-react';
import { useAuth } from '../../../context/useAuth';
import { supabase } from '../../../api/supabase';
import { getSettings } from '../../../api/settings';

// Components
import ConfirmModal from '../../../components/ConfirmModal';

const Account = () => {
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef(null);
  
  // --- States ---
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    avatar: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState({ ...profile });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [modal, setModal] = useState({ isOpen: false, type: 'primary', onConfirm: () => {}, title: '', message: '' });

  // Sync state with auth user
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.profile?.name || user.email.split('@')[0],
        email: user.email,
        role: user.profile?.role || 'Admin',
        avatar: user.profile?.avatar || `https://ui-avatars.com/api/?name=${user.email}&background=random`
      });
    }
  }, [user]);

  const handleAvatarClick = () => {
    if (!isEditingProfile) {
      alert("Please click 'Edit Profile' below to change your avatar.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !isEditingProfile) return;

    setIsUploading(true);
    try {
      // 1. Fetch Cloudinary config from DB
      const config = await getSettings('integrations_settings');
      
      if (!config.cloudinary_cloud_name || !config.cloudinary_upload_preset) {
        alert("Please configure Cloudinary in Settings > Integrations first!");
        setIsUploading(false);
        return;
      }

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', config.cloudinary_upload_preset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudinary_cloud_name}/image/upload`,
        { method: 'POST', body: formData }
      );
      
      const data = await res.json();
      const newAvatarUrl = data.secure_url;

      // 3. Update DB
      const { error } = await supabase
        .from('team')
        .update({ avatar: newAvatarUrl })
        .eq('email', user.email);

      if (error) throw error;

      setProfile(prev => ({ ...prev, avatar: newAvatarUrl }));
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Failed to upload image. Ensure Cloudinary is configured correctly.");
    } finally {
      setIsUploading(false);
    }
  };

  const activeSessions = [
    { id: 1, device: 'Current Browser', location: 'Detected', status: 'Current Session', lastActive: 'Now' },
  ];

  // --- Handlers ---
  const handleSaveProfile = () => {
    setModal({
      isOpen: true,
      type: 'primary',
      title: 'Update Profile Details?',
      message: 'Are you sure you want to change your administrative profile information?',
      onConfirm: async () => {
        setIsSaving(true);
        try {
          const { error } = await supabase
            .from('team')
            .update({ name: draftProfile.name })
            .eq('email', user.email);

          if (error) throw error;
          
          setProfile(prev => ({ ...prev, name: draftProfile.name }));
          setIsEditingProfile(false);
          setModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Profile update failed:", error);
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handlePasswordChange = () => {
    setModal({
      isOpen: true,
      type: 'primary',
      title: 'Reset Password?',
      message: 'A password reset link will be sent to your email address. You will be logged out globally.',
      onConfirm: async () => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: window.location.origin + '/login',
          });
          if (error) throw error;
          setModal(prev => ({ ...prev, isOpen: false }));
          alert("Reset link sent!");
        } catch (error) {
          console.error("Failed to send reset link:", error);
        }
      }
    });
  };

  if (authLoading) {
    return (
      <div className="settings-content flex items-center justify-center" style={{ minHeight: '400px' }}>
         <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="settings-content">
      {/* Profile Header */}
      <div className="form-card">
        <div className="form-card-header">
           <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="icon-badge primary">
                  <User size={20} />
                </div>
                <div>
                  <div className="form-card-title">Admin Profile</div>
                  <div className="form-card-desc">Your personal admin details and identity settings.</div>
                </div>
              </div>
              {!isEditingProfile ? (
                <button className="btn btn-subtle" onClick={() => {
                  setDraftProfile({ ...profile });
                  setIsEditingProfile(true);
                }}>Edit Profile</button>
              ) : (
                <div className="flex gap-2">
                  <button className="btn btn-outline" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              )}
           </div>
        </div>
        <div className="form-card-body">
          <div className="flex items-center gap-6 mb-4">
            <div 
              className={`relative group ${isEditingProfile ? 'cursor-pointer' : ''}`} 
              onClick={handleAvatarClick}
            >
              <img 
                src={profile.avatar || null} 
                alt="Avatar" 
                className={`avatar large ${isUploading ? 'opacity-50' : ''}`} 
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary-light)' }} 
              />
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
            <div>
              <div className="font-bold text-lg">{profile.name}</div>
              <div className="flex items-center gap-2 mt-1">
                 <div className="badge badge-primary">{profile.role}</div>
                 {isEditingProfile && (
                   <button onClick={handleAvatarClick} className="text-xs text-primary underline flex items-center gap-1">
                      <Upload size={12} /> Change Photo
                   </button>
                 )}
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              {isEditingProfile ? (
                 <div className="form-input-wrapper">
                    <input value={draftProfile.name} onChange={e => setDraftProfile({...draftProfile, name: e.target.value})} />
                 </div>
              ) : (
                <div className="form-input static">{profile.name}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input static text-muted">{profile.email}</div>
              <div className="form-hint">Admin emails cannot be changed directly.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Settings */}
      <div className="grid-2">
         <div className="form-card">
            <div className="form-card-header">
              <div className="flex items-center gap-3">
                <div className="icon-badge primary">
                  <Shield size={18} />
                </div>
                <div className="form-card-title">Security Settings</div>
              </div>
            </div>
            <div className="form-card-body">
               <button className="btn btn-outline w-full flex items-center justify-center gap-2" onClick={handlePasswordChange}>
                <Key size={16} /> Request Password Reset
              </button>
              <div className="form-hint mt-2 text-center">Password changes require email verification.</div>
            </div>
         </div>

         <div className="form-card">
            <div className="form-card-header">
              <div className="flex items-center gap-3">
                <div className="icon-badge primary">
                  <History size={18} />
                </div>
                <div className="form-card-title">Active Sessions</div>
              </div>
            </div>
            <div className="form-card-body" style={{ padding: '0 24px 24px' }}>
              <div className="session-list">
                {activeSessions.map(session => (
                   <div key={session.id} className="session-item flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <div className="font-medium text-sm">{session.device}</div>
                        <div className="text-xs text-muted">{session.location} • {session.lastActive}</div>
                      </div>
                      <div className="badge badge-success text-[10px] px-2 py-0.5">Active</div>
                   </div>
                ))}
              </div>
            </div>
         </div>
      </div>

      <ConfirmModal 
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        isLoading={isSaving}
      />
    </div>
  );
};

export default Account;
