import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AdminBazaars = () => {
  const { user } = useAuth();

  const isAdmin = useMemo(() => user && (user.role === 'admin' || user.userType === 'Admin'), [user]);

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '',
    location: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    registrationDeadline: ''
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createMessage, setCreateMessage] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    location: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    registrationDeadline: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editMessage, setEditMessage] = useState(null);

  const validateCreate = () => {
    const { name, location, startDateTime, endDateTime, registrationDeadline } = createForm;
    if (!name.trim() || !location.trim() || !startDateTime || !endDateTime || !registrationDeadline) {
      return 'Please fill all required fields.';
    }
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const reg = new Date(registrationDeadline);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || isNaN(reg.getTime())) {
      return 'Invalid dates provided.';
    }
    if (end <= start) return 'End date/time must be after start date/time.';
    if (reg >= start) return 'Registration deadline must be before start date/time.';
    return null;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateMessage(null);
    const validationError = validateCreate();
    if (validationError) {
      setCreateMessage({ type: 'error', text: validationError });
      return;
    }
    setCreateSubmitting(true);
    try {
      const payload = {
        name: createForm.name.trim(),
        location: createForm.location.trim(),
        description: createForm.description.trim(),
        startDate: new Date(createForm.startDateTime).toISOString(),
        endDate: new Date(createForm.endDateTime).toISOString(),
        registrationDeadline: new Date(createForm.registrationDeadline).toISOString()
      };
      const res = await axios.post('/api/bazaars', payload);
      setCreateMessage({ type: 'success', text: res.data?.message || 'Bazaar created successfully.' });
      setCreateForm({ name: '', location: '', description: '', startDateTime: '', endDateTime: '', registrationDeadline: '' });
    } catch (error) {
      const text = error?.response?.data?.message || 'Failed to create bazaar.';
      setCreateMessage({ type: 'error', text });
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditMessage(null);
    if (!editForm.id.trim()) {
      setEditMessage({ type: 'error', text: 'Please provide the Bazaar ID to edit.' });
      return;
    }

    const updates = {};
    if (editForm.name.trim()) updates.name = editForm.name.trim();
    if (editForm.location.trim()) updates.location = editForm.location.trim();
    if (editForm.description.trim()) updates.description = editForm.description.trim();
    if (editForm.startDateTime) updates.startDate = new Date(editForm.startDateTime).toISOString();
    if (editForm.endDateTime) updates.endDate = new Date(editForm.endDateTime).toISOString();
    if (editForm.registrationDeadline) updates.registrationDeadline = new Date(editForm.registrationDeadline).toISOString();

    if (Object.keys(updates).length === 0) {
      setEditMessage({ type: 'error', text: 'Provide at least one field to update.' });
      return;
    }

    if (updates.startDate && updates.endDate) {
      if (new Date(updates.endDate) <= new Date(updates.startDate)) {
        setEditMessage({ type: 'error', text: 'End date/time must be after start date/time.' });
        return;
      }
    }
    if (updates.registrationDeadline && updates.startDate) {
      if (new Date(updates.registrationDeadline) >= new Date(updates.startDate)) {
        setEditMessage({ type: 'error', text: 'Registration deadline must be before start date/time.' });
        return;
      }
    }

    setEditSubmitting(true);
    try {
      const res = await axios.put(`/api/bazaars/${encodeURIComponent(editForm.id.trim())}`, updates);
      setEditMessage({ type: 'success', text: res.data?.message || 'Bazaar updated successfully.' });
      setEditForm({ id: '', name: '', location: '', description: '', startDateTime: '', endDateTime: '', registrationDeadline: '' });
    } catch (error) {
      const text = error?.response?.data?.message || 'Failed to update bazaar.';
      setEditMessage({ type: 'error', text });
    } finally {
      setEditSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="container">
          <div className="card">
            <div className="card-header">
              <h1 className="card-title">Unauthorized</h1>
              <p className="card-subtitle">You do not have access to this page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Manage Bazaars</h1>
            <p className="card-subtitle">Create new bazaars and edit existing ones</p>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--light-gray)', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ color: 'var(--charcoal-black)', marginBottom: '1rem' }}>Create Bazaar</h3>

              {createMessage && (
                <div className={`alert ${createMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                  {createMessage.text}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-input"
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="GUC Winter Bazaar"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    className="form-input"
                    type="text"
                    value={createForm.location}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Student Plaza"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Vendors, music, and food trucks for the winter season."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date & Time</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={createForm.startDateTime}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, startDateTime: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date & Time</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={createForm.endDateTime}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, endDateTime: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Registration Deadline</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={createForm.registrationDeadline}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <button className="btn btn-primary" type="submit" disabled={createSubmitting}>
                    {createSubmitting ? 'Creating…' : 'Create Bazaar'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--light-gray)' }}>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ color: 'var(--charcoal-black)', marginBottom: '1rem' }}>Edit Bazaar</h3>

              <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
                You can edit a bazaar only if it has not started yet. Provide the Bazaar ID and any fields you want to update.
              </div>

              {editMessage && (
                <div className={`alert ${editMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                  {editMessage.text}
                </div>
              )}

              <form onSubmit={handleEditSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Bazaar ID</label>
                  <input
                    className="form-input"
                    type="text"
                    value={editForm.id}
                    onChange={(e) => setEditForm(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="e.g., 66f8c8b1e4a2d1..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-input"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Leave blank to keep current"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    className="form-input"
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Leave blank to keep current"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Leave blank to keep current"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date & Time</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={editForm.startDateTime}
                      onChange={(e) => setEditForm(prev => ({ ...prev, startDateTime: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date & Time</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={editForm.endDateTime}
                      onChange={(e) => setEditForm(prev => ({ ...prev, endDateTime: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Registration Deadline</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={editForm.registrationDeadline}
                      onChange={(e) => setEditForm(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <button className="btn btn-primary" type="submit" disabled={editSubmitting}>
                    {editSubmitting ? 'Updating…' : 'Update Bazaar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBazaars;
