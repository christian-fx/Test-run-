import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, ShieldAlert, MoreHorizontal, Loader2, Trash2, X, Mail, User } from 'lucide-react';
import { getAllTeamMembers, updateTeamMember, addTeamMember, deleteTeamMember } from '../../../api/team';

// Components
import ConfirmModal from '../../../components/ConfirmModal';

const Team = () => {
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'Support' });
  const [isInviting, setIsInviting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'primary', onConfirm: () => {}, title: '', message: '' });

  // --- Initial Fetch ---
  const fetchTeam = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllTeamMembers();
      setTeamMembers(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load team members:", error);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleStatusToggle = (member) => {
    const isSuspended = member.status === 'Suspended';
    const nextStatus = isSuspended ? 'Active' : 'Suspended';
    
    setModal({
      isOpen: true,
      type: isSuspended ? 'primary' : 'destructive',
      title: isSuspended ? 'Reactivate Member?' : 'Suspend Member?',
      message: `Are you sure you want to ${isSuspended ? 'reactivate' : 'suspend'} ${member.name}?`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await updateTeamMember(member.id, { status: nextStatus });
          await fetchTeam();
          setModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Status update failed:", error);
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const handleDeleteMember = (member) => {
    setModal({
      isOpen: true,
      type: 'destructive',
      title: 'Remove Team Member?',
      message: `Are you sure you want to remove ${member.name}? This action cannot be undone.`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await deleteTeamMember(member.id);
          await fetchTeam();
          setModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Delete failed:", error);
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await addTeamMember({
        ...inviteData,
        status: 'Active',
        avatar: `https://ui-avatars.com/api/?name=${inviteData.name}&background=random`
      });
      await fetchTeam();
      setIsInviteOpen(false);
      setInviteData({ name: '', email: '', role: 'Support' });
    } catch (error) {
      console.error("Invite failed:", error);
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-content flex items-center justify-center" style={{ minHeight: '400px' }}>
         <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="settings-content">
      {/* Team Members List */}
      <div className="form-card">
        <div className="form-card-header">
           <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="icon-badge primary">
                  <Users size={20} />
                </div>
                <div>
                  <div className="form-card-title">Team Members</div>
                  <div className="form-card-desc">Invite and manage administrative permissions for your staff.</div>
                </div>
              </div>
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setIsInviteOpen(true)}
              >
                <UserPlus size={16} /> Invite Admin
              </button>
           </div>
        </div>
        <div className="form-card-body" style={{ padding: 0 }}>
           <div className="table-responsive-container">
              <table className="table-w full-width">
                 <thead>
                    <tr>
                       <th style={{ paddingLeft: '24px' }}>Member</th>
                       <th>Role</th>
                       <th>Status</th>
                       <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    {teamMembers.map((member) => (
                       <tr key={member.id}>
                          <td style={{ paddingLeft: '24px' }}>
                             <div className="flex items-center gap-3">
                                <img 
                                   src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`} 
                                   alt="Avatar" 
                                   className="avatar mini" 
                                   style={{ width: '32px', height: '32px', borderRadius: '50%' }} 
                                />
                                <div>
                                   <div className="font-medium text-sm">{member.name}</div>
                                   <div className="text-xs text-muted">{member.email}</div>
                                </div>
                             </div>
                          </td>
                          <td>
                             <div className="flex items-center gap-1.5">
                                <Shield size={14} className="text-primary" />
                                <span className="text-sm font-medium">{member.role}</span>
                             </div>
                          </td>
                          <td>
                             <span className={`badge badge-${member.status === 'Active' ? 'success' : 'destructive'}`}>
                                {member.status}
                             </span>
                          </td>
                          <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                             <div className="flex items-center justify-end gap-2">
                                <button className="btn btn-subtle sm" onClick={() => handleStatusToggle(member)}>
                                   {member.status === 'Active' ? 'Suspend' : 'Reactivate'}
                                </button>
                                <button className="icon-btn sm text-destructive" onClick={() => handleDeleteMember(member)}>
                                   <Trash2 size={14} />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="modal-overlay">
           <div className="modal-content" style={{ maxWidth: '450px' }}>
              <div className="modal-header">
                 <h2 className="text-xl font-bold">Invite New Administrator</h2>
                 <button className="icon-btn" onClick={() => setIsInviteOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleInviteSubmit} className="modal-body p-6">
                 <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="form-input-wrapper">
                       <User size={16} className="text-muted" />
                       <input 
                         required
                         placeholder="e.g. John Doe"
                         value={inviteData.name}
                         onChange={e => setInviteData({...inviteData, name: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="form-input-wrapper">
                       <Mail size={16} className="text-muted" />
                       <input 
                         required
                         type="email"
                         placeholder="john@example.com"
                         value={inviteData.email}
                         onChange={e => setInviteData({...inviteData, email: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="form-group">
                    <label className="form-label">Assign Role</label>
                    <div className="select-wrapper">
                       <select 
                         value={inviteData.role}
                         onChange={e => setInviteData({...inviteData, role: e.target.value})}
                       >
                          <option value="Admin">System Admin</option>
                          <option value="Manager">Store Manager</option>
                          <option value="Support">Customer Support</option>
                          <option value="Editor">Content Editor</option>
                       </select>
                    </div>
                    <div className="form-hint">Assign specific permissions to this user.</div>
                 </div>

                 <div className="flex gap-3 mt-8">
                    <button type="button" className="btn btn-outline flex-1" onClick={() => setIsInviteOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary flex-1" disabled={isInviting}>
                       {isInviting ? <Loader2 size={16} className="animate-spin" /> : 'Send Invitation'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default Team;
