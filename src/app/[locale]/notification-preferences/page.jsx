'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const NotificationPreferencesPage = () => {
  const { preferences, isLoading, error, updatePreference, updateMultiple, resetPreferences } = useNotificationPreferences();
  const [isResetting, setIsResetting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  if (!user) {
    router.push('/login');
    return null;
  }

  // Group preferences by type and channel
  const groupedPreferences = preferences.reduce((acc, pref) => {
    if (!acc[pref.notificationType]) {
      acc[pref.notificationType] = {};
    }
    acc[pref.notificationType][pref.channel] = pref;
    return acc;
  }, {});

  // Handle toggle for a single preference
  const handleToggle = async (preferenceId, enabled) => {
    await updatePreference(preferenceId, enabled);
  };

  // Handle toggle for all preferences of a type
  const handleToggleType = async (type, enabled) => {
    const typePrefs = preferences.filter(pref => pref.notificationType === type);
    const prefIds = typePrefs.map(pref => pref.id);
    await updateMultiple(prefIds, enabled);
  };

  // Handle toggle for all preferences of a channel
  const handleToggleChannel = async (channel, enabled) => {
    const channelPrefs = preferences.filter(pref => pref.channel === channel);
    const prefIds = channelPrefs.map(pref => pref.id);
    await updateMultiple(prefIds, enabled);
  };

  // Handle reset to defaults
  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all notification preferences to default?')) {
      setIsResetting(true);
      try {
        await resetPreferences();
      } finally {
        setIsResetting(false);
      }
    }
  };

  // Format notification type for display
  const formatType = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format channel for display
  const formatChannel = (channel) => {
    switch (channel) {
      case 'in_app':
        return 'In-App';
      case 'email':
        return 'Email';
      case 'push':
        return 'Push';
      default:
        return channel;
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1>Notification Preferences</h1>
          <p className="text-muted">
            Customize how and when you receive notifications.
          </p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Notification Settings</h5>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleReset}
            disabled={isLoading || isResetting}
          >
            {isResetting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Resetting...
              </>
            ) : (
              'Reset to Defaults'
            )}
          </Button>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Loading your notification preferences...</p>
            </div>
          ) : preferences.length === 0 ? (
            <Alert variant="info">
              No notification preferences found. Click "Reset to Defaults" to initialize your preferences.
            </Alert>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Notification Type</th>
                  <th>In-App</th>
                  <th>Email</th>
                  <th>Push</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedPreferences).map(([type, channels]) => (
                  <tr key={type}>
                    <td>{formatType(type)}</td>
                    <td>
                      {channels.in_app && (
                        <Form.Check
                          type="switch"
                          id={`in-app-${type}`}
                          checked={channels.in_app.enabled}
                          onChange={(e) => handleToggle(channels.in_app.id, e.target.checked)}
                        />
                      )}
                    </td>
                    <td>
                      {channels.email && (
                        <Form.Check
                          type="switch"
                          id={`email-${type}`}
                          checked={channels.email.enabled}
                          onChange={(e) => handleToggle(channels.email.id, e.target.checked)}
                        />
                      )}
                    </td>
                    <td>
                      {channels.push && (
                        <Form.Check
                          type="switch"
                          id={`push-${type}`}
                          checked={channels.push.enabled}
                          onChange={(e) => handleToggle(channels.push.id, e.target.checked)}
                        />
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleToggleType(type, true)}
                      >
                        Enable All
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleToggleType(type, false)}
                      >
                        Disable All
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>All Channels</strong></td>
                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleToggleChannel('in_app', true)}
                      className="p-0 me-2"
                    >
                      Enable
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleToggleChannel('in_app', false)}
                      className="p-0 text-danger"
                    >
                      Disable
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleToggleChannel('email', true)}
                      className="p-0 me-2"
                    >
                      Enable
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleToggleChannel('email', false)}
                      className="p-0 text-danger"
                    >
                      Disable
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleToggleChannel('push', true)}
                      className="p-0 me-2"
                    >
                      Enable
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleToggleChannel('push', false)}
                      className="p-0 text-danger"
                    >
                      Disable
                    </Button>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </Table>
          )}
        </Card.Body>
        <Card.Footer>
          <small className="text-muted">
            <strong>In-App:</strong> Notifications will appear in the notification dropdown in the top navigation bar.<br />
            <strong>Email:</strong> Notifications will be sent to your email address.<br />
            <strong>Push:</strong> Push notifications will be sent to your browser or mobile device (if enabled).
          </small>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default NotificationPreferencesPage;
