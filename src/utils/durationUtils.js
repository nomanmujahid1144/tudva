// src/utils/durationUtils.js

/**
 * Format seconds into human-readable duration
 * @param {number} seconds - Duration in seconds
 * @param {object} options - Formatting options
 * @param {number} options.defaultDuration - Default duration if seconds is 0 or invalid (default: 60)
 * @param {boolean} options.showSeconds - Whether to show seconds in the output (default: false)
 * @param {string} options.format - Format style: 'short' (1 min) or 'long' (1 minute) (default: 'short')
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (seconds, options = {}) => {
  const {
    defaultDuration = 60,
    showSeconds = false,
    format = 'short'
  } = options;

  // Handle invalid or zero duration
  if (!seconds || isNaN(seconds) || seconds <= 0) {
    return format === 'short' ? `${Math.floor(defaultDuration / 60)} min` : `${Math.floor(defaultDuration / 60)} minute`;
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(format === 'short' ? `${hours} hr` : `${hours} hour${hours !== 1 ? 's' : ''}`);
  }

  if (minutes > 0) {
    parts.push(format === 'short' ? `${minutes} min` : `${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }

  if (showSeconds && remainingSeconds > 0) {
    parts.push(format === 'short' ? `${remainingSeconds} sec` : `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`);
  }

  // If no parts, return default
  if (parts.length === 0) {
    return format === 'short' ? '1 min' : '1 minute';
  }

  return parts.join(' ');
};

/**
 * Format time in mm:ss format for video players
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string (e.g., "1:23", "12:45")
 */
export const formatVideoTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' + secs : secs}`;
};

/**
 * Calculate total duration of modules and videos
 * @param {Array} modules - Array of module objects
 * @param {number} defaultVideoDuration - Default duration for videos without duration (default: 60)
 * @param {number} defaultModuleDuration - Default duration for modules without videos (default: 60)
 * @returns {object} - Object containing total duration and breakdown
 */
export const calculateCourseDuration = (modules = [], defaultVideoDuration = 60, defaultModuleDuration = 60) => {
  if (!Array.isArray(modules) || modules.length === 0) {
    return {
      totalDuration: defaultModuleDuration,
      moduleCount: 0,
      videoCount: 0,
      formattedDuration: formatDuration(defaultModuleDuration)
    };
  }

  let totalDuration = 0;
  let totalVideos = 0;

  const modulesWithDuration = modules.map(module => {
    let moduleDuration = 0;
    const moduleVideoCount = module.videos?.length || 0;

    if (module.videos && module.videos.length > 0) {
      // Sum up video durations, use default for videos without duration
      moduleDuration = module.videos.reduce((sum, video) => {
        const videoDuration = video.duration && video.duration > 0 ? video.duration : defaultVideoDuration;
        return sum + videoDuration;
      }, 0);
      
      totalVideos += moduleVideoCount;
    } else {
      // Module without videos gets default duration
      moduleDuration = defaultModuleDuration;
    }

    // Ensure each module has at least the default duration
    const effectiveDuration = Math.max(moduleDuration, defaultModuleDuration);
    totalDuration += effectiveDuration;

    return {
      ...module,
      duration: effectiveDuration,
      videoCount: moduleVideoCount
    };
  });

  return {
    totalDuration,
    moduleCount: modules.length,
    videoCount: totalVideos,
    formattedDuration: formatDuration(totalDuration),
    modulesWithDuration
  };
};

/**
 * Calculate duration for a single module
 * @param {object} module - Module object with videos array
 * @param {number} defaultVideoDuration - Default duration for videos without duration (default: 60)
 * @param {number} defaultModuleDuration - Minimum duration for a module (default: 60)
 * @returns {object} - Object containing module duration info
 */
export const calculateModuleDuration = (module, defaultVideoDuration = 60, defaultModuleDuration = 60) => {
  if (!module) {
    return {
      duration: defaultModuleDuration,
      videoCount: 0,
      formattedDuration: formatDuration(defaultModuleDuration)
    };
  }

  let moduleDuration = 0;
  const videoCount = module.videos?.length || 0;

  if (module.videos && module.videos.length > 0) {
    moduleDuration = module.videos.reduce((sum, video) => {
      const videoDuration = video.duration && video.duration > 0 ? video.duration : defaultVideoDuration;
      return sum + videoDuration;
    }, 0);
  }

  // Ensure module has at least the minimum duration
  const effectiveDuration = Math.max(moduleDuration, defaultModuleDuration);

  return {
    duration: effectiveDuration,
    videoCount,
    formattedDuration: formatDuration(effectiveDuration)
  };
};

/**
 * Parse duration string and convert to seconds
 * @param {string} durationString - Duration string like "1h 30m" or "45 min"
 * @returns {number} - Duration in seconds
 */
export const parseDurationToSeconds = (durationString) => {
  if (!durationString || typeof durationString !== 'string') return 0;

  let totalSeconds = 0;
  
  // Match hours (1h, 2hr, 3 hours)
  const hourMatch = durationString.match(/(\d+)\s*(?:h|hr|hour|hours)/i);
  if (hourMatch) {
    totalSeconds += parseInt(hourMatch[1]) * 3600;
  }

  // Match minutes (30m, 45min, 60 minutes)
  const minuteMatch = durationString.match(/(\d+)\s*(?:m|min|minute|minutes)/i);
  if (minuteMatch) {
    totalSeconds += parseInt(minuteMatch[1]) * 60;
  }

  // Match seconds (30s, 45sec, 60 seconds)
  const secondMatch = durationString.match(/(\d+)\s*(?:s|sec|second|seconds)/i);
  if (secondMatch) {
    totalSeconds += parseInt(secondMatch[1]);
  }

  return totalSeconds;
};

/**
 * Get duration statistics for display
 * @param {Array} modules - Array of modules
 * @returns {object} - Statistics object
 */
export const getDurationStats = (modules = []) => {
  const courseData = calculateCourseDuration(modules);
  
  return {
    totalModules: courseData.moduleCount,
    totalVideos: courseData.videoCount,
    totalDuration: courseData.totalDuration,
    formattedTotalDuration: courseData.formattedDuration,
    averageModuleDuration: courseData.moduleCount > 0 
      ? formatDuration(courseData.totalDuration / courseData.moduleCount)
      : '0 min',
    averageVideoDuration: courseData.videoCount > 0
      ? formatDuration(courseData.totalDuration / courseData.videoCount)
      : '0 min'
  };
};

// Backward compatibility - keep the original function name
export const formatTotalDuration = formatDuration;

export default {
  formatDuration,
  formatVideoTime,
  calculateCourseDuration,
  calculateModuleDuration,
  parseDurationToSeconds,
  getDurationStats,
  formatTotalDuration // For backward compatibility
};