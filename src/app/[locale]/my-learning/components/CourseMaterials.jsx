'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Dropdown, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaEllipsisV, FaEye, FaDownload, FaFileAlt, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileVideo, FaFileAudio, FaFileArchive } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import learningService from '@/services/learningService';

const CourseMaterials = () => {
    const t = useTranslations('student.learning.materials');
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Load materials from the API
    const loadMaterials = async () => {
        try {
            setLoading(true);
            const result = await learningService.getNextLearningDay();
            
            if (result.success) {
                // Extract materials from all scheduled courses
                const allMaterials = [];
                
                result.data.slots.forEach(slot => {
                    if (slot.course && slot.course.videoData && slot.course.videoData.materials) {
                        slot.course.videoData.materials.forEach(material => {
                            allMaterials.push({
                                ...material,
                                courseTitle: slot.course.courseInfo.title,
                                moduleTitle: slot.course.moduleTitle,
                                lessonTitle: slot.course.title,
                                courseBgColor: slot.course.courseInfo.backgroundColorHex
                            });
                        });
                    }
                });
                
                setMaterials(allMaterials);
                setFilteredMaterials(allMaterials);
            } else {
                setError(result.error || 'Failed to load materials');
            }
        } catch (error) {
            console.error('Error loading materials:', error);
            setError('Failed to load materials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Filter materials based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredMaterials(materials);
        } else {
            const filtered = materials.filter(material =>
                material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                material.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                material.moduleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                material.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredMaterials(filtered);
        }
    }, [searchTerm, materials]);

    // Load materials on component mount
    useEffect(() => {
        loadMaterials();
    }, []);

    // Get file type icon based on file extension or type
    const getFileIcon = (fileName, type) => {
        const extension = fileName.split('.').pop().toLowerCase();
        const iconProps = { size: 24, className: 'text-primary' };

        if (type.includes('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
            return <FaFileImage {...iconProps} style={{ color: '#28a745' }} />;
        } else if (type.includes('application/pdf') || extension === 'pdf') {
            return <FaFilePdf {...iconProps} style={{ color: '#dc3545' }} />;
        } else if (type.includes('application/msword') || type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml') || ['doc', 'docx'].includes(extension)) {
            return <FaFileWord {...iconProps} style={{ color: '#007bff' }} />;
        } else if (type.includes('application/vnd.ms-excel') || type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml') || ['xls', 'xlsx'].includes(extension)) {
            return <FaFileExcel {...iconProps} style={{ color: '#28a745' }} />;
        } else if (type.includes('application/vnd.ms-powerpoint') || type.includes('application/vnd.openxmlformats-officedocument.presentationml') || ['ppt', 'pptx'].includes(extension)) {
            return <FaFilePowerpoint {...iconProps} style={{ color: '#fd7e14' }} />;
        } else if (type.includes('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
            return <FaFileVideo {...iconProps} style={{ color: '#6610f2' }} />;
        } else if (type.includes('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension)) {
            return <FaFileAudio {...iconProps} style={{ color: '#e83e8c' }} />;
        } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
            return <FaFileArchive {...iconProps} style={{ color: '#6c757d' }} />;
        } else {
            return <FaFileAlt {...iconProps} />;
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Handle view file
    const handleViewFile = (material) => {
        window.open(material.url, '_blank');
    };

    // Handle download file
    const handleDownloadFile = (material) => {
        const link = document.createElement('a');
        link.href = material.url;
        link.download = material.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">{t('loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="m-4">
                {error}
            </Alert>
        );
    }

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col md={8}>
                    <h4 className="text-primary mb-0">{t('title')}</h4>
                    <p className="text-muted">{t('subtitle')}</p>
                </Col>
                <Col md={4}>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                    </InputGroup>
                </Col>
            </Row>

            {filteredMaterials.length === 0 ? (
                <div className="text-center py-5">
                    <FaFileAlt size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">
                        {searchTerm ? t('noMatchingMaterials') : t('noMaterials')}
                    </h5>
                    {searchTerm && (
                        <p className="text-muted">{t('tryAdjusting')}</p>
                    )}
                </div>
            ) : (
                <Row>
                    {filteredMaterials.map((material) => (
                        <Col xs={12} key={material._id} className="mb-3">
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Body className="py-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        {/* File type icon */}
                                        <div className="d-flex align-items-center me-3">
                                            {getFileIcon(material.name, material.type)}
                                        </div>

                                        {/* File info */}
                                        <div className="flex-grow-1 me-3">
                                            <h6 className="mb-1 fw-bold">{material.name}</h6>
                                            <div className="d-flex flex-wrap align-items-center">
                                                <small className="text-muted me-3">
                                                    <strong>{t('course')}:</strong> {material.courseTitle}
                                                </small>
                                                <small className="text-muted me-3">
                                                    <strong>{t('module')}:</strong> {material.moduleTitle}
                                                </small>
                                                <small className="text-muted me-3">
                                                    <strong>{t('lesson')}:</strong> {material.lessonTitle}
                                                </small>
                                                <small className="text-muted">
                                                    <strong>{t('size')}:</strong> {formatFileSize(material.size)}
                                                </small>
                                            </div>
                                        </div>

                                        {/* Actions dropdown */}
                                        <Dropdown align="end">
                                            <Dropdown.Toggle 
                                                variant="outline-secondary" 
                                                size="sm" 
                                                className="border-0"
                                                id={`dropdown-${material._id}`}
                                            >
                                                <FaEllipsisV />
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item 
                                                    onClick={() => handleViewFile(material)}
                                                    className="d-flex align-items-center"
                                                >
                                                    <FaEye className="me-2" />
                                                    {t('viewFile')}
                                                </Dropdown.Item>
                                                <Dropdown.Item 
                                                    onClick={() => handleDownloadFile(material)}
                                                    className="d-flex align-items-center"
                                                >
                                                    <FaDownload className="me-2" />
                                                    {t('download')}
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Summary */}
            {filteredMaterials.length > 0 && (
                <Row className="mt-4">
                    <Col xs={12}>
                        <div className="bg-light rounded p-3">
                            <small className="text-muted">
                                {t('showing')} {filteredMaterials.length} {t('of')} {materials.length} {t('materials')}
                                {searchTerm && ` ${t('matching')} "${searchTerm}"`}
                            </small>
                        </div>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default CourseMaterials;