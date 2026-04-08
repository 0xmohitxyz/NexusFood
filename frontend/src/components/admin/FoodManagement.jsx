import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../../styles/admin.css';

const FoodManagement = () => {
    const [partners, setPartners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', category: '', foodPartnerId: '' });
    const [videoFile, setVideoFile] = useState(null);
    const [videoURL, setVideoURL] = useState('');
    const [fileError, setFileError] = useState('');
    const [err, setErr] = useState('');
    const [msg, setMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/food-partners`, { withCredentials: true })
            .then(res => setPartners(res.data.partners))
            .catch(() => {});
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/categories`)
            .then(res => setCategories(res.data.categories))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!videoFile) { setVideoURL(''); return; }
        const url = URL.createObjectURL(videoFile);
        setVideoURL(url);
        return () => URL.revokeObjectURL(url);
    }, [videoFile]);

    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) { setVideoFile(null); setFileError(''); return; }
        if (!file.type.startsWith('video/')) { setFileError('Please select a valid video file.'); return; }
        setFileError('');
        setVideoFile(file);
    };

    const onDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('video/')) { setFileError('Please drop a valid video file.'); return; }
        setFileError('');
        setVideoFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr(''); setMsg('');
        if (!videoFile) { setFileError('Please upload a video.'); return; }

        setIsSubmitting(true);
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('description', form.description);
        fd.append('category', form.category);
        fd.append('foodPartnerId', form.foodPartnerId);
        fd.append('mama', videoFile);

        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/foods`, fd, { withCredentials: true });
            setMsg('Food created successfully!');
            setForm({ name: '', description: '', category: '', foodPartnerId: '' });
            setVideoFile(null);
        } catch (error) {
            setErr(error.response?.data?.message || 'Error creating food');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDisabled = !form.name.trim() || !form.category || !form.foodPartnerId || !videoFile || isSubmitting;

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2>Create Food</h2>
            </div>

            {msg && <p className="admin-success">{msg}</p>}
            {err && <p className="admin-error">{err}</p>}

            <form className="admin-form" onSubmit={handleSubmit}>
                {/* Video Upload */}
                <div className="admin-field-group">
                    <label>Food Video</label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        style={{ display: 'none' }}
                        onChange={onFileChange}
                    />
                    <div
                        className="admin-dropzone"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={onDrop}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        {videoFile ? (
                            <div className="admin-dropzone-file">
                                <span className="admin-dropzone-icon">🎬</span>
                                <span>{videoFile.name}</span>
                                <span className="admin-text-muted">({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                                <button type="button" className="admin-btn-ghost sm" style={{ marginLeft: 'auto' }}
                                    onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}>Remove</button>
                            </div>
                        ) : (
                            <div className="admin-dropzone-empty">
                                <span style={{ fontSize: '2rem' }}>📹</span>
                                <p><strong>Tap to upload</strong> or drag & drop</p>
                                <p className="admin-text-muted">MP4, WebM, MOV</p>
                            </div>
                        )}
                    </div>
                    {fileError && <p className="admin-error">{fileError}</p>}
                </div>

                {videoURL && (
                    <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                        <video src={videoURL} controls style={{ width: '100%', maxHeight: '300px', display: 'block', background: '#000' }} />
                    </div>
                )}

                {/* Fields Row */}
                <div className="admin-form-row">
                    <div className="admin-field-group">
                        <label>Food Name</label>
                        <input type="text" placeholder="e.g., Spicy Paneer Wrap"
                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="admin-field-group">
                        <label>Category</label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                            <option value="" disabled>Choose category</option>
                            {categories.map(c => (
                                <option key={c._id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="admin-field-group">
                        <label>Food Partner</label>
                        <select value={form.foodPartnerId} onChange={e => setForm({ ...form, foodPartnerId: e.target.value })} required>
                            <option value="" disabled>Select food partner</option>
                            {partners.map(p => (
                                <option key={p._id} value={p._id}>{p.name} — {p.email}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="admin-field-group">
                    <label>Description (optional)</label>
                    <input type="text" placeholder="Ingredients, taste, spice level..."
                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>

                <button className="admin-btn-primary" type="submit" disabled={isDisabled} style={{ width: 'auto' }}>
                    {isSubmitting ? 'Uploading…' : 'Create Food'}
                </button>
            </form>
        </div>
    );
};

export default FoodManagement;
