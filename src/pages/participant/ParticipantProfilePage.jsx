import React, { useState } from 'react';
import { User, Mail, Shield } from 'lucide-react';
import { Alert, Button, Card, CardContent, CardHeader, Input, Textarea } from '../../components/common';
import { ProtectedPage } from '../../components/common/ProtectedPage';
import { MainLayout } from '../../layouts/MainLayout';
import { authApi } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { formatDate, initials } from '../../utils/format';

export const ParticipantProfilePage = () => (
  <ProtectedPage>
    <Profile />
  </ProtectedPage>
);

const Profile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ display_name: user.display_name, bio: user.bio || '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSave = async () => {
    if (!formData.display_name.trim()) {
      setErrors({ display_name: 'Name is required' });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const updated = await authApi.updateProfile({ display_name: formData.display_name, bio: formData.bio });
      setUser(updated);
      setEditing(false);
      setNotice({ type: 'success', message: 'Profile updated' });
    } catch (err) {
      setErrors(err.fields || {});
      setNotice({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ display_name: user.display_name, bio: user.bio || '' });
    setErrors({});
    setEditing(false);
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Profile</h1>
        <p className="text-lg text-brand-600">How you appear to teammates and in the project gallery</p>
      </div>

      {notice && <Alert type={notice.type} message={notice.message} onClose={() => setNotice(null)} className="mb-6" />}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Account Details" />
            <CardContent className="space-y-6">
              {editing ? (
                <>
                  <Input
                    label="Display name"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    error={errors.display_name}
                    maxLength={100}
                  />
                  <Textarea
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    error={errors.bio}
                    maxLength={500}
                    placeholder="A sentence or two about what you build"
                  />
                  <div className="flex gap-3">
                    <Button variant="primary" onClick={handleSave} isLoading={saving}>
                      Save Changes
                    </Button>
                    <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <ProfileRow icon={User} label="Display name" value={user.display_name} />
                  <ProfileRow icon={Mail} label="Email" value={user.email} />
                  <ProfileRow icon={Shield} label="Role" value={user.role} capitalize />
                  <div>
                    <p className="text-sm text-brand-600 font-medium mb-1">Bio</p>
                    <p className="text-brand-900 whitespace-pre-line">{user.bio || 'No bio yet.'}</p>
                  </div>
                  <Button variant="primary" onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-8 text-center">
            <span className="w-20 h-20 mx-auto rounded-full bg-accent-100 text-accent-700 text-2xl font-bold flex items-center justify-center mb-4">
              {initials(user.display_name)}
            </span>
            <p className="text-lg font-semibold text-brand-900">{user.display_name}</p>
            <p className="text-sm text-brand-600 capitalize">{user.role}</p>
            <p className="text-xs text-brand-500 mt-4">Member since {formatDate(user.created_at)}</p>
            <p className="text-xs text-brand-500 mt-2">Your email is only visible to your teammates and event organizers.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

const ProfileRow = ({ icon: Icon, label, value, capitalize }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-accent-600 mt-0.5" />
    <div>
      <p className="text-sm text-brand-600 font-medium">{label}</p>
      <p className={`text-brand-900 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  </div>
);
