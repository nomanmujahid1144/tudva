'use client'

import React from 'react';
import Image from 'next/image';
import { FaPlay } from 'react-icons/fa';
import styles from './CoursePreview.module.css';


const CoursesPreview = ({ title, module, imageUrl, number }) => {
    return (
        <>
            <div key={number} className='d-flex pb-2'>
                {number && (
                    <div className={styles.numberContainer + ' d-none d-md-block align-content-center'}>{number}.</div>
                )}
                <div key={number} className={`${styles.coursePreviewContainer} w-100 d-block d-md-flex align-items-center`}>
                    <div className={`${styles.imageContainer} me-3`}>
                        <Image
                            src={imageUrl}
                            alt="Course Thumbnail"
                            width={100}
                            height={100}
                            className={styles.courseImage}
                        />
                        <div className={`${styles.playButtonContainer} ms-3 d-flex d-md-none`}>
                            <button className={`${styles.playButton} btn btn-light mb-0`} aria-label="Play">
                                <FaPlay size={24} className={styles.playIcon + ' '} />
                            </button>
                        </div>
                    </div>
                    <div className={`${styles.courseInfo} flex-grow-1 text-start text-md-center`}>
                        <h2 className={`${styles.courseTitle} h5`}>{title}</h2>
                        <p className={`${styles.courseModule} mb-0`}>{module}</p>
                    </div>
                    <div className={`${styles.playButtonContainer} ms-3 d-none d-md-flex`}>
                        <button className={`${styles.playButton} btn btn-light mb-0`} aria-label="Play">
                            <FaPlay size={24} className={styles.playIcon} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
export default CoursesPreview;
