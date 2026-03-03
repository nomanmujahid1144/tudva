'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/authService';
import { toast } from 'sonner';
import { FaChalkboardTeacher } from 'react-icons/fa';

const ToggleSkeleton = () => (
  <div className="d-flex align-items-start gap-3 p-3 border rounded-3 bg-light mb-2">
    <div
      className="rounded mt-1 flex-shrink-0"
      style={{
        width: '22px',
        height: '22px',
        background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
    <div className="flex-grow-1">
      <div className="d-flex align-items-center gap-3 mb-2">
        <div
          className="rounded"
          style={{
            width: '44px',
            height: '22px',
            background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
        <div
          className="rounded"
          style={{
            width: '200px',
            height: '16px',
            background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>
      <div
        className="rounded"
        style={{
          width: '100%',
          height: '12px',
          background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
    </div>

    {/* Shimmer keyframe injected inline */}
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

const SettingPage = () => {
  const { user, loading, refreshUser } = useAuth();

  const [canTeach, setCanTeach] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setCanTeach(user.canTeach || false);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await authService.updateProfile({ canTeach });

      if (response.success) {
        toast.success('Settings saved successfully', { duration: 8000 });
        await refreshUser();
      } else {
        toast.error(response.error || 'Failed to save settings', { duration: 8000 });
      }
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error('Failed to save settings. Please try again.', { duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCanTeach(user?.canTeach || false);
  };

  return (
    <div className="border rounded-3">
      <Row>
        <Col xs={12}>
          <Card className="bg-transparent">
            <CardHeader className="bg-transparent border-bottom">
              <h3 className="card-header-title">Settings</h3>
            </CardHeader>
            <CardBody>

              {/* ─── Profile Settings ─────────────────────── */}
              <h5 className="mb-4">Profile Settings</h5>
              <div className="form-check form-switch form-check-md">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="profilePublic"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="profilePublic">
                  Your profile&apos;s public visibility
                </label>
              </div>

              {/* ─── Teaching Settings ────────────────────── */}
              <hr />
              <h5 className="card-header-title mb-3">Teaching Settings</h5>

              {/* Show skeleton while user is loading, real toggle once ready */}
              {loading || !user ? (
                <ToggleSkeleton />
              ) : (
                <div className="d-flex align-items-start gap-3 p-3 border rounded-3 bg-light mb-2">
                  <FaChalkboardTeacher size={22} className="text-success mt-1 flex-shrink-0" />
                  <div className="flex-grow-1">
                    <div className="form-check form-switch form-check-md mb-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="canTeach"
                        checked={canTeach}
                        onChange={(e) => setCanTeach(e.target.checked)}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="canTeach">
                        I also want to teach on Tudva
                      </label>
                    </div>
                    <p className="text-muted small mb-0">
                      Enabling this allows you to create and manage courses as an instructor
                      while keeping your student access. You can turn this off at any time.
                    </p>
                  </div>
                </div>
              )}
              
              {/* ─── Save / Cancel ────────────────────────── */}
              <div className="d-sm-flex justify-content-end gap-2 mt-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="mb-0"
                  onClick={handleCancel}
                  disabled={saving || loading}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary mb-0"
                  onClick={handleSave}
                  disabled={saving || loading}
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>

            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingPage;